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
    
    const title = document.createElement('h3');
    title.appendChild(document.createTextNode(feed.title));

    const createAt = document.createElement('p');
    
    const post_time = 'Posted: ' + processTime(feed.createdAt);

    createAt.appendChild(document.createTextNode(post_time));

    const img = document.createElement('div');
    img.style.width = '100%';
    img.style.height = '180px';
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
    const createrId = feed.creatorId;
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

    mega_data.append(n_like, like_users, n_comment);
    return mega_data;
}



export function create_job_panel(feeds){
    // feeds = sort_by_date(feeds);
    let content_screen = document.getElementById('content_screen');
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