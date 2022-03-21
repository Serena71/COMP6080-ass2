import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

console.log('Let\'s go!');

let nav_bar = document.getElementsByTagName('nav')[0];
let login_form = document.getElementById('login-form');
let submit_login = login_form.submit;
let register_btn = document.getElementById('register-btn');

let register_form = document.getElementById('register-form');
let submit_register = register_form.submit;

let error_popup = document.getElementById('error-popup');
let popup_close = document.getElementById('popup-close');

let welcome_page = document.getElementById('welcome');
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
                create_job_box(body);
            }
        })

}

function create_job_box(feeds){
    let content_screen = document.getElementById('content_screen');
    const job_panel = document.createElement('div');
    job_panel.style.border = '1px solid black';
    job_panel.style.backgroundColor='lightgrey';
    feeds.forEach(feed => {
        let job_box = document.createElement('div');
        job_box.setAttribute('class', 'job_boxes');
        let img = document.createElement('img');
        img.src = feed.image;
        let title = document.createTextNode(feed.title);
        let description = document.createTextNode(feed.description);
        
        job_box.appendChild(img);
        job_box.appendChild(title);
        job_box.appendChild(description);
        job_panel.appendChild(job_box);
    });
    content_screen.appendChild(job_panel);

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
        if (token === userToken){
            const update_btn = document.createElement('button');
            update_btn.setAttribute('id', 'update_btn');
            update_btn.innerText = 'Update Profile';
            profile_page.appendChild(update_btn);
            update_btn.addEventListener('click', (event) =>{
                // update user profile 
                event.preventDefault()
            })
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
                welcome_page.style.display = 'block';
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
let profile = document.getElementById('own_profile')
profile.addEventListener('click', (event) => {
    // let update_btn = user_profile.elements.update;
    welcome_page.style.display = 'none';
    profile_page.style.display = 'block';
    get_profile(userToken, userID);
})