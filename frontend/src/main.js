import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';


// const d1 = new Date('2022-03-09T05:00:15.850Z');
// const d2 = new Date('2022-03-10T01:30:15.850Z');
// const diff = (d2.getTime() - d1.getTime())/1000;
// const min = diff/60 % 60;

// console.log(d1, d2, Math.floor(diff/3600) ,min);


let nav_bar = document.getElementsByTagName('nav')[0];
let login_form = document.getElementById('login-form');
let submit_login = login_form.submit;
let register_btn = document.getElementById('register-btn');

let register_form = document.getElementById('register-form');
let submit_register = register_form.submit;

let error_popup = document.getElementById('error-popup');
let popup_close = document.getElementById('popup-close');

let registered_page = document.getElementById('registered');



let userToken = null;
let userID=null;

function display_error(msg){
    error_popup.style.display = 'block';
    error_popup.style.position ='absolute';
    error_popup.style.top = '0px';
    error_popup.style.left = '32%';
    error_popup.children[1].innerText = msg;
}

function get_feed(token, start){
    const url = `http://localhost:${BACKEND_PORT}/job/feed?start=${start}}`
    let init  = {
        method: 'GET',
        headers: {'Authorization':token}
    }
    fetch(url, init)
        .then((res) => res.json())
        .then((body) => {
            console.log('Body value', body)
            if(body.error){
                display_error(body.error);
            }else{
                create_job_panel(body);
            }
        })

}
// function sort_by_date(feeds){
//     const sorted_feeds = feeds.sort((a,b) => {
//         new Date(a.createAt) - new Date(b.createAt)
//     }).reverse();
//     return sorted_feeds;
// }

function create_comment_box(comment){
    const user = document.createElement('div');
    const comment_box = document.createElement('div');
    comment_box.classList.add('comment_boxes')
    user.appendChild(
        document.createTextNode(comment.userName)
    );
    comment_box.appendChild(user);
    comment_box.appendChild(
        document.createTextNode(comment.comment)
    );
    // add user profile picture later
    return comment_box;
}

function display_comment(comments){
    const comment_section = document.createElement('div');
    comment_section.style.display = 'none';
    
    for(let c of comments){
        const comment_box = create_comment_box(c);
        comment_section.appendChild(comment_box);
    }
    return comment_section;
}

    

function create_job_panel(feeds){
    // feeds = sort_by_date(feeds);
    let content_screen = document.getElementById('content_screen');
    const job_panel = document.createElement('div');
    job_panel.setAttribute('id', 'job_panel');
    let i = 0;
    feeds.forEach(feed => {
        let [job_box, mega_data] = create_job_box(feed);
        job_panel.appendChild(job_box);
        job_panel.appendChild(mega_data);
        let comment_section = display_comment(feed.comments);
        let show_hide = document.createElement('button');
        show_hide.innerText = 'Show Comments';
        show_hide.setAttribute('class', 'show_hide_comments');
        job_panel.appendChild(show_hide);
        job_panel.appendChild(comment_section);
        i++;
    });
    content_screen.appendChild(job_panel);
    
    //  event listener for hide/show comments
    let show_hide_comment_btns = document.getElementsByClassName('show_hide_comments');
    for(const btn of show_hide_comment_btns){
        let comment_section = btn.nextElementSibling;
        btn.addEventListener('click', (event)=>{
            if(!event.currentTarget.classList.contains('show')){
                comment_section.style.display = 'block';
                event.currentTarget.classList.add('show');
                event.currentTarget.innerText = 'Hide Comment';
                
            }
            else{
                event.currentTarget.innerText = 'Show Comment';
                comment_section.style.display = 'none';
                event.currentTarget.classList.remove('show');
            }
        })

    }
}

function create_job_box(feed){
    const job_box = document.createElement('div');
    job_box.setAttribute('class', 'job_boxes');
    
    const title = document.createElement('h3');
    const title_text = document.createTextNode(feed.title);
    title.appendChild(title_text);

    const createAt = document.createElement('p');
    const now = new Date()
    const post_time = new Date(feed.createdAt);
    let display_time = '';
    const diff = now.getTime() - post_time.getTime();
    if( diff/3600 < 24000){
        const min = (diff/60000) % 60;
        const hr = Math.floor(diff/3600000);
        display_time = `Posted ${hr} hours ${min} minutes ago`;
    }
    else{
        const dd = post_time.getDate();
        const mm = post_time.getMonth()+1;
        const yyyy = post_time.getFullYear();
        display_time = `Posted on ${dd}/${mm}/${yyyy}`;
    }
    const createdAt_time = document.createTextNode(display_time);
    createAt.appendChild(createdAt_time);

    const description = document.createElement('p');
    const description_text = document.createTextNode(feed.description);
    description.appendChild(description_text);

    const img = document.createElement('img');
    img.src = feed.image;

    const likes = feed.likes;
    const comments = feed.comments;

    const mega_data = document.createElement('div');
    const n_like = document.createElement('p'); 
    n_like.appendChild(
        document.createTextNode(`Likes: ${likes.length}`)
    )
    const n_comment = document.createElement('p');
    n_comment.appendChild(
        document.createTextNode(`Comments: ${comments.length}`)
    )
    
    job_box.appendChild(title);
    job_box.appendChild(createAt);
    job_box.appendChild(description);
    job_box.appendChild(img);
    mega_data.append(n_like, n_comment);
    return [job_box, mega_data];

}


function get_profile(token, id){
    let init = {
        method: 'GET',
        headers: {'Authorization':token}
    }
    fetch(`http://localhost:${BACKEND_PORT}/user?userId=${id}`, init)
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
        let user_profile = document.forms['profile_info'];
        let profile_page = document.getElementById('profile_page');
        let update_btn = document.getElementById('update_btn');
        if (token === userToken){
            update_btn.style.display='block';
        }
        user_profile.elements.email.value = data.email;
        user_profile.elements.name.value = data.name;
        user_profile.elements.userId.value = data.id;
    })
}



// ####################### get login info #########################
submit_login.addEventListener('click', (event) =>{
    event.preventDefault();
    let email = login_form.email.value;
    let psw = login_form.psw.value;
    // pass to backend
    if(email && psw){
        let requestBody = {
            'email': email,
            'password': psw
        }
        let init = {
            method:'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)

        }
        fetch(`http://localhost:${BACKEND_PORT}/auth/login`, init)
        .then((response) => response.json())
        .then((body) => {
            // console.log(body)
            if(body.error){
                display_error(body.error);
            }
            else{
                userToken = body.token;
                userID = body.userId;
                // console.log(userToken, userID);
                login_form.style.display = 'none';
                nav_bar.style.display = 'block';
                // ################ Get Job Feeds ######################
                let job_feeds = get_feed(userToken, 0);
            }
        })
    }else{
        display_error("Please complete the required field");
    }
})

// access registration
register_btn.addEventListener('click', (event) =>{
    event.preventDefault()
    register_form.style.display = 'block';
    login_form.style.display='none';
})




// #################### get registration info ###################

// console.log(submit_register.type);
submit_register.addEventListener('click', (event)=> {
    event.preventDefault()
    let psw1 = register_form.psw1.value;
    let psw2 = register_form.psw2.value;

    if(psw1 !== psw2){
        display_error('Passwords do not match, please re-enter');
        // alert('Password does not match');
    }else{
        let requestBody = {
            'email': register_form.email.value,
            'password': register_form.psw1.value,
            'name': register_form.name.value
        }
        let init = {
            method:'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)

        }
        fetch(`http://localhost:${BACKEND_PORT}/auth/register`, init)
        .then((response) => response.json())
        .then((body) => {
            if(body.error){
                display_error(body.error)
            }else{
                userToken = body.token;
                userID = body.userId;
                // console.log(userToken, userID);
                register_form.style.display='none';
                registered_page.style.display = 'block';

            }
        }) 
    }
})

popup_close.addEventListener('click', (event) =>{
    error_popup.style.display = 'none';
})


// ################# User Profile ##############
let profile = document.getElementById('own_profile');
profile.addEventListener('click', (event) => {
    // let update_btn = user_profile.elements.update;
    profile_page.style.display = 'block';
    job_panel.style.display = 'none';
    get_profile(userToken, userID);
})


// ########### Return Home ##############
let home = document.getElementById('home');
home.addEventListener('click', ()=> {
    profile_page.style.display = 'none';
    job_panel.style.display = 'block';
})