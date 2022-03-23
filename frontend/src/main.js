// import { resolve } from 'path/posix';
import { BACKEND_PORT } from './config.js';
// import {create_job_panel} from './job.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl} from './helpers.js';


const nav_bar = document.getElementsByTagName('nav')[0];
const login_form = document.getElementById('login-form');
const submit_login = login_form.submit;
const register_btn = document.getElementById('register-btn');

const register_form = document.getElementById('register-form');
const submit_register = register_form.submit;

const error_popup = document.getElementById('error-popup');
const popup_close = document.getElementById('popup-close');

const registered_page = document.getElementById('registered');

const undefined_image = 'https://media.istockphoto.com/vectors/user-icon-flat-isolated-on-white-background-user-symbol-vector-vector-id1300845620?k=20&m=1300845620&s=612x612&w=0&h=f4XTZDAv7NPuZbG0habSpU0sNgECM0X7nbKzTUta3n8=';

const profile_page = document.getElementById('profile_page');
const update_btn = document.getElementById('update_btn');
update_btn.style.display='none';

const return_profile_btn = document.getElementById('return_own_profile');

const btn_watch = document.getElementById('watch');

const profile_update_page = document.getElementById('profile_update_page');

const btns_other_profile = document.getElementById('btns_other_profile');

const create_post = document.getElementById('create_post');

let userToken = null;
let userID=null;


function apiCall(path, method, body){
    return new Promise((resolve, reject)=>{
        // // from stackoverflow
        // let url = new URL();
        // url.search = new URLSearchParams(params).toString();
        const init = {
            method: method,
            headers :{
                'Content-Type' : 'application/json',
                'Authorization' : (path === 'auth/register' || path === 'auth/login') ? undefined : userToken
            },
            body: method ==='GET' ? undefined : JSON.stringify(body)
        };
        fetch(`http://localhost:${BACKEND_PORT}/${path}`, init)
        .then((res) => res.json())
        .then(
            (body) => resolve(body)
            )
    });
}

function display_error(msg){
    error_popup.style.display = 'block';
    error_popup.style.position ='absolute';
    error_popup.style.top = '0px';
    error_popup.style.left = '32%';
    error_popup.children[1].innerText = msg;
}

// ############## get job feeds ###################

const getFeedPage = (start) => {
    return apiCall(`job/feed?start=${start}`, 'GET', {})
        // console.log('job feeds', body)
        // if(body.error){
        //     display_error(body.error);
        // }else{
        //     create_job_panel(body);
        // }
    // })
}

const getAllFeed = ()=>{
    const allFeeds = []
    let page = 0

    function handleThen(feedPage) {
        // This is our base case - if there are no posts on this page,
        // there definitely aren't any on the next page
        if (feedPage.length <= 0) {
            return allFeeds
        }

        // Recursive step
        allFeeds.push(...feedPage)
        page += 5
        return getFeedPage(page).then(handleThen)
    }

    return getFeedPage(page).then(handleThen)
}



// ####################### login #########################

// back to login
let return_login_btns = document.getElementsByClassName('return-login');

for (const btn of return_login_btns) {
    btn.addEventListener('click', (event)=>{
        event.preventDefault();
        let parent = event.currentTarget.parentElement;
        parent.style.display ='none';
        login_form.style.display = 'block';
    });
}

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
        apiCall('auth/login', 'POST', requestBody)
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
                // get_feed(0);
                getAllFeed().then(allFeeds => {
                    console.log(allFeeds)
                    // show job_panel
                  })
            }
        })
    }else{
        display_error("Please complete the required field");
    }
})



// #################### registration  ###################

// access registration form
register_btn.addEventListener('click', (event) =>{
    event.preventDefault()
    register_form.style.display = 'block';
    login_form.style.display='none';
})


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

// ############# Error/Message Popup ##################

popup_close.addEventListener('click', (event) =>{
    error_popup.style.display = 'none';
})


// ################# get profile ##################

const get_profile = (id) =>{
    apiCall(`user?userId=${id}`, 'GET', {})
    .then((data) => {
        console.log('profile data:', data);
        // display personal info
        const user_profile = document.forms['profile_info'];
        if (id === userID){
            update_btn.style.display='block';
            btns_other_profile.style.display='none';
        }
        else{
            update_btn.style.display='none';
            btns_other_profile.style.display='block';
        }
        localStorage.setItem("name", data.name);
        localStorage.setItem("email", data.email);
        

        user_profile.elements.email.value = data.email;
        user_profile.elements.name.value = data.name;
        user_profile.elements.userId.value = data.id;
        const profile_img = document.getElementById('profile_img')
        if(data.image){
            profile_img.style.background = `url(${data.image}) no-repeat`;
            profile_img.style.backgroundSize = 'contain';
        }
        else{
            profile_img.style.background = `url(${undefined_image}) no-repeat`;
            profile_img.style.backgroundSize = 'contain';
        }

        // display jobs
        const profile_job_centent = document.getElementById('profile_job_centent');
        profile_job_centent.textContent='';
        for (const job of data.jobs){
            const job_box = create_job_box(job);
            profile_job_centent.appendChild(job_box);
        }

        // display followers
        const profile_follower_section = document.getElementById('profile_follower');
        const n_follower = data.watcheeUserIds.length;
        console.log(n_follower)

        const profile_follower_list = document.getElementById('profile_follower_list');
        profile_follower_list.textContent='';
        for (const follower of data.watcheeUserIds){
            apiCall(`user?userId=${follower}`, 'GET', {})
            .then((user) => {
                const name = user.name;
                const user_link = document.createElement('li');
                user_link.appendChild(
                    document.createTextNode(name)
                );
                profile_follower_list.appendChild(user_link);
                
                // access other user's profile
                user_link.addEventListener('click', (e) => {
                    // job_panel.style.display = 'none';
                    if(Object.values(user.watcheeUserIds).includes(userID)){
                        btn_watch.textContent = 'Unwatch';
                        btn_watch.classList.remove('btn-success');
                        btn_watch.classList.add('btn-secondary');
                    }
                    else{
                        btn_watch.textContent = 'Watch';
                        btn_watch.classList.remove('btn-secondary');
                        btn_watch.classList.add('btn-success');
                    }
                    btn_watch.addEventListener('click',(e) =>{
                        let requestBody = '';
                        if(btn_watch.textContent == 'Unwatch'){
                            btn_watch.textContent = 'Watch';
                            btn_watch.classList.remove('btn-secondary');
                            btn_watch.classList.add('btn-success');

                            requestBody = {
                                email : user.email,
                                turnon : false
                            };
                        }else{
                            btn_watch.textContent = 'Unwatch';
                            btn_watch.classList.remove('btn-success');
                            btn_watch.classList.add('btn-secondary');
                            requestBody = {
                                email : user.email,
                                turnon : true
                            };
                        }
                        apiCall('user/watch', 'PUT', requestBody)
                        .then((res) => {
                            if(res.error){
                                display_error(res.error);
                            }
                            else{
                                console.log('watch/unwatch successful');
                            }
                        })
                    });
                    get_profile(follower);
                    display_profile();
                })
            })
        }
    })
}


// ################# User Profile ####################

const display_profile = () =>{
    profile_page.style.display = 'flex';
    profile_page.style.justifyContent ='space-between';
    profile_page.style.alignItems = 'flex-start';
}

// go to own profile
const profile = document.getElementById('own_profile');
profile.addEventListener('click', (event) => {
    display_profile();
    // job_panel.style.display = 'none';
    get_profile(userID);
});


// ############ Return to Own Profile ###############
return_profile_btn.addEventListener('click', (e)=>{
    e.preventDefault();
    display_profile();
    // job_panel.style.display = 'none';
    get_profile(userID);
} )


// ################ Update Profile ##############
const update_form = document.forms['profile_update_form'];
update_btn.addEventListener('click', (e)=>{
    e.preventDefault();
    profile_page.style.display = 'none';
    profile_update_page.style.display = 'block';

});

const confirm_update = document.getElementById('confirm_update');
confirm_update.addEventListener('click', (e)=>{
    e.preventDefault();
    fileToDataUrl(update_form.elements.upload_img.files[0]).then((img) => {
        const requestBody ={
            'email' : update_form.elements.email.value,
            'password' : update_form.elements.password.value,
            'name' : update_form.elements.name.value ,
            'image' : img
        }
        apiCall('user', 'PUT', requestBody)
        .then((data) => {
            if(data.error){
                display_error(data.error)
            }else{
                display_error('Profile Updated!')
                display_profile();
                profile_update_page.style.display = 'none';
                get_profile(userID);
            }
        });
    });
});

// ########### Return Home ##############
let home = document.getElementById('home');
home.addEventListener('click', ()=> {
    profile_page.style.display = 'none';
    job_panel.style.display = 'block';
})


// ############## Create Job ######################
// create job section




// ################################################################                                Jobs ################################################################

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

const like_user_box = (user) => {
    const user_box = document.createElement('div');
    user_box.appendChild(document.createTextNode(user.userName));
    return user_box;
}

function get_like_users(likes){
    const like_user_popup = document.createElement('div');
    like_user_popup.style.display='none';

    for(let users of likes){
        like_user_popup.appendChild(like_user_box(users));
    }
    return like_user_popup;

}


// function sort_by_date(feeds){
//     const sorted_feeds = feeds.sort((a,b) => {
//         new Date(a.createAt) - new Date(b.createAt)
//     }).reverse();
//     return sorted_feeds;
// }

const processTime = (createdAt) =>{
    const now = new Date();
    const time = new Date(createdAt);
    let display_time = '';
    const diff = now.getTime() - time.getTime();
    if( diff/3600 < 24000){
        const min = (diff/60000) % 60;
        const hr = Math.floor(diff/3600000);
        display_time = `${hr} hours ${min} minutes ago`;
    }
    else{
        const dd = time.getDate();
        const mm = time.getMonth()+1;
        const yyyy = time.getFullYear();
        display_time = `${dd}/${mm}/${yyyy}`;
    }
    return display_time;
}


function create_job_box(feed){
    const job_box = document.createElement('div');
    job_box.setAttribute('class', 'job_boxes');
    
    const title = document.createElement('h4');
    title.appendChild(document.createTextNode(feed.title));

    const createAt = document.createElement('p');
    
    const post_time = 'Posted: ' + processTime(feed.createdAt);

    createAt.appendChild(document.createTextNode(post_time));

    const img = document.createElement('div');
    img.style.width = '5rem';
    img.style.height = '5rem';
    img.style.background = `url(${feed.image}) no-repeat`;
    img.style.backgroundSize = 'contain';

    const description = document.createElement('p');
    description.appendChild(document.createTextNode(feed.description));

    const start = document.createElement('p');
    const start_date = processTime(feed.start);
    start.appendChild(document.createTextNode('Start Date: ' + start_date));
    
    job_box.appendChild(title);
    job_box.appendChild(createAt);
    job_box.appendChild(img);
    job_box.appendChild(description);
    job_box.appendChild(start);
    
    return job_box;

}

function create_mega_data_box(feed){
    let name = '';
    const likes = feed.likes;
    const comments = feed.comments;
    const mega_data = document.createElement('div');
    mega_data.style.display = 'flex';
    mega_data.style.justifyContent ='space-between';
    const n_like = document.createElement('p'); 
    n_like.appendChild(
        document.createTextNode(`Likes: ${likes.length}`)
    )
    const like_users = get_like_users(likes)

    n_like.style.textDecoration = 'underline';

    n_like.addEventListener('click', () =>{
        // display users who liked the job feed
        like_users.style.display = 'block';

    })
    
    const n_comment = document.createElement('p');
    n_comment.appendChild(
        document.createTextNode(`Comments: ${comments.length}`)
    )
    const authorName = document.createElement('p');
    authorName.appendChild(document.createTextNode('Posted by: ' + name));
    mega_data.append(authorName, n_like, like_users, n_comment);

    return mega_data;
}

function add_comment_text(){
    // create comment text area
    const comment_section = document.createElement('div');
    comment_section.classList.add('leave_comments');

    const comment_text = document.createElement('textarea');
    comment_text.setAttribute('placeholder', 'Add a comment');
    
    const comment_enter = document.createElement('button');
    comment_enter.innerText = 'Post';
    comment_enter.classList.add('btn')
    comment_enter.classList.add('btn-primary')
    comment_enter.classList.add('post_comment');

    comment_section.appendChild(comment_text);
    comment_section.appendChild(comment_enter);

    return comment_section;
}



function create_job_panel(feeds){
    // feeds = sort_by_date(feeds);
    const content_screen = document.getElementById('content_screen');
    const job_panel = document.createElement('div');
    job_panel.setAttribute('id', 'job_panel');
    let i = 0;
    feeds.forEach(feed => {
        let job_box = create_job_box(feed);
        let mega_data = create_mega_data_box(feed);
        job_panel.appendChild(job_box);
        job_panel.appendChild(mega_data);
        let comment_section = display_comment(feed.comments);
        // create button for comments
        let show_hide = document.createElement('button');
        show_hide.innerText = 'Show Comments';
        show_hide.setAttribute('class', 'show_hide_comments');
        const leave_comment = add_comment_text();

        job_panel.appendChild(leave_comment);
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
                event.currentTarget.innerText = 'Hide Comments';
                
            }
            else{
                event.currentTarget.innerText = 'Show Comments';
                comment_section.style.display = 'none';
                event.currentTarget.classList.remove('show');
            }
        })

    }
}



// post comments
const comment_submit_btn = document.getElementsByClassName('post_comment');
for (const btn of comment_submit_btn) {
    
    btn.addEventListener('click', (event)=>{
        console.log('click button')
        const comment_text = event.currentTarget.previousElementSibling.innerText;
        const requestBody = {
            "id": userID,
            "comment": comment_text
        }
        apiCall('job/comment', 'POST', requestBody)
        .then((body) =>{
            if(body.error){
                console.log(body.error);
            }
            else{
                console.log('Successful');
            }
        })
    });
}
