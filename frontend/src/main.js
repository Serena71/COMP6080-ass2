// import { resolve } from 'path/posix';
import { BACKEND_PORT } from "./config.js";
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from "./helpers.js";

const nav_bar = document.getElementsByTagName("nav")[0];
const screen_login = document.getElementById("screen_login");
const submit_login = screen_login.submit;
const register_btn = document.getElementById("register-btn");

const screen_register = document.getElementById("screen_register");
const submit_register = screen_register.submit;
const back_to_login = screen_register.back;
const screen_registered = document.getElementById("screen_registered");
const error_popup = document.getElementById("error-popup");
const popup_close = document.getElementById("popup-close");

const undefined_profile_image =
  "https://media.istockphoto.com/vectors/user-icon-flat-isolated-on-white-background-user-symbol-vector-vector-id1300845620?k=20&m=1300845620&s=612x612&w=0&h=f4XTZDAv7NPuZbG0habSpU0sNgECM0X7nbKzTUta3n8=";

const undefined_job_image =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

const screen_profile = document.getElementById("screen_profile");
const user_profile = document.forms["profile_info"];
const btn_update_profile = document.getElementById("btn_update_profile");
btn_update_profile.style.display = "none";
const screen_profile_update = document.getElementById("screen_profile_update");

const btns_other_profile = document.getElementById("btns_other_profile");
const return_profile_btn = document.getElementById("return_own_profile");
const btn_watch = document.getElementById("watch");

const create_job_tab = document.getElementById("create_post");
const screen_create_post = document.forms["screen_create_post"];
const btn_post = document.getElementById("btn_post");
const screen_update_post = document.forms["screen_update_post"];
const btn_update_post = document.getElementById("btn_update_post");
const btn_cancel_update_post = document.getElementById("btn_cancel_update_post");

const screen_jobs = document.getElementById("screen_jobs");

const search_box = document.getElementById("search_box");
const search_btn = document.getElementById("search_btn");

let userToken = null;
let userID = null;
let startId = 0;

function apiCall(path, method, body) {
  return new Promise((resolve, reject) => {
    const init = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: path === "auth/register" || path === "auth/login" ? undefined : userToken,
      },
      body: method === "GET" ? undefined : JSON.stringify(body),
    };
    fetch(`http://localhost:${BACKEND_PORT}/${path}`, init)
      .then((res) => res.json())
      .then((body) => resolve(body));
  });
}

const processTime = (createdAt) => {
  const now = new Date();
  const time = new Date(createdAt);
  let display_time = "";
  let diff = now.getTime() - time.getTime();

  if (time.getTime() > now.getTime()) {
    diff = time.getTime() - now.getTime();
  }

  if (diff / 3600 < 24000) {
    const min = Math.round((diff / 60000) % 60);
    const hr = Math.round(Math.floor(diff / 3600000));
    display_time = `${hr} hours ${min} minutes ago`;
  } else {
    const dd = time.getDate();
    const mm = time.getMonth() + 1;
    const yyyy = time.getFullYear();
    display_time = `${dd}/${mm}/${yyyy}`;
  }
  return display_time;
};

const getAuthorName = (id) => {
  return apiCall(`user?userId=${id}`, "GET", {}).then((data) => data.name);
};

function display_error(msg) {
  error_popup.style.display = "block";
  error_popup.style.position = "absolute";
  error_popup.style.top = "0px";
  error_popup.style.left = "32%";
  error_popup.children[1].innerText = msg;
}

function sort_by_date(jobs) {
  const sorted_feeds = jobs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return sorted_feeds;
}

// ############### Search User By Email #############
search_btn.addEventListener("click", (e) => {
  e.preventDefault();
  const requestBody = {
    email: search_box.value,
    turnon: true,
  };
  apiCall("user/watch", "PUT", requestBody).then((res) => {
    if (res.error) {
      display_error(res.error);
    } else {
      search_box.value = "";
      // console.log("search watch successful");
    }
  });
});

// ############## get job feeds ###################
// ###############################################

const getFeedPage = (start) => {
  apiCall(`job/feed?start=${start}`, "GET", {}).then((feedPage) => {
    if (feedPage.length > 0) {
      startId += 5;
      console.log(feedPage);
      feedPage.forEach((feed) => {
        screen_jobs.appendChild(createJobFeed(feed));
      });
    }
  });
};

// ####################### login #########################

// back to login
let return_login_btns = document.getElementsByClassName("return-login");

const login = (email, psw) => {
  let requestBody = {
    email: email,
    password: psw,
  };
  apiCall("auth/login", "POST", requestBody).then((body) => {
    // console.log(body)
    if (body.error) {
      display_error(body.error);
    } else {
      userToken = body.token;
      userID = body.userId;
      // console.log(userToken, userID);
      screen_login.style.display = "none";
      nav_bar.style.display = "block";

      // ################ Get Job Feeds ######################
      getFeedPage(startId);
      // ############ infinite scroll #################
      window.addEventListener("scroll", () => {
        console.log("working");
        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
          console.log("reached end");
          getFeedPage(startId);
        }
      });
    }
  });
};

for (const btn of return_login_btns) {
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    let parent = event.currentTarget.parentElement;
    parent.style.display = "none";
    screen_login.style.display = "block";
  });
}

submit_login.addEventListener("click", (event) => {
  event.preventDefault();
  let email = screen_login.email.value;
  let psw = screen_login.psw.value;
  // pass to backend
  if (email && psw) {
    login(email, psw);
  } else {
    display_error("Please complete the required field");
  }
});

// #################### registration  ###################
// ##################################################

// access registration form
register_btn.addEventListener("click", (event) => {
  event.preventDefault();
  screen_register.style.display = "block";
  screen_login.style.display = "none";
});

// console.log(submit_register.type);
submit_register.addEventListener("click", (event) => {
  event.preventDefault();
  let psw1 = screen_register.psw1.value;
  let psw2 = screen_register.psw2.value;

  if (psw1 !== psw2) {
    display_error("Passwords do not match, please re-enter");
    // alert('Password does not match');
  } else {
    let requestBody = {
      email: screen_register.email.value,
      password: screen_register.psw1.value,
      name: screen_register.name.value,
    };
    let init = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    };
    fetch(`http://localhost:${BACKEND_PORT}/auth/register`, init)
      .then((response) => response.json())
      .then((body) => {
        if (body.error) {
          display_error(body.error);
        } else {
          userToken = body.token;
          userID = body.userId;
          // console.log(userToken, userID);
          screen_register.reset();
          screen_register.style.display = "none";
          screen_registered.style.display = "block";
        }
      });
  }
});
screen_registered.back.addEventListener("click", (e) => {
  console.log("registered");
  e.preventDefault();
  screen_login.style.display = "block";
  screen_registered.style.display = "none";
});

// ############# Error/Message Popup ##################
// ##################################################

popup_close.addEventListener("click", (event) => {
  error_popup.style.display = "none";
});

// ################# job delete/update ##################
// ##################################################
const apiPostUpdate = (screen_update_post, img) => {
  const requestBody = {
    title: screen_update_post.elements.title.value,
    image: img,
    start: screen_update_post.elements.start.value,
    description: screen_update_post.elements.description.value,
  };
  // console.log(requestBody);
  apiCall("job", "POST", requestBody).then((res) => {
    if (res.error) {
      display_error("error");
    } else {
      console.log("Job posted successfully");
      display_error("Job posted successfully");
      get_profile(userID);
    }
  });
};

const updateJob = (job) => {
  screen_update_post.elements.title.value = job.title;
  screen_update_post.elements.start.value = job.start;
  document.getElementById("update_post_ori_img").src = job.image;
  screen_update_post.elements.description.value = job.description;
  screen_update_post.elements.title.value = job.title;
  btn_post.textContent = "Update";
  screen_update_post.style.display = "block";
  screen_profile.style.display = "none";

  btn_update_post.addEventListener("click", (e) => {
    e.preventDefault();
    const new_job_img = screen_update_post.elements.image.files[0];
    if (new_job_img) {
      fileToDataUrl(new_job_img).then((img) => {
        apiPostUpdate(screen_update_post, img);
      });
    } else {
      apiPostUpdate(screen_update_post, undefined);
    }
  });

  btn_cancel_update_post.addEventListener("click", (e) => {
    e.preventDefault();
    screen_update_post.reset();
    display_profile();
  });
};

const job_del_upd = (job) => {
  const deleteUpdate = document.createElement("div");
  const del = document.createElement("button");
  del.classList.add("btn");
  del.classList.add("btn-outline-danger");
  const upd = document.createElement("button");
  upd.classList.add("btn");
  upd.classList.add("btn-outline-primary");
  deleteUpdate.classList.add("btn_group");

  del.textContent = "Delete";
  upd.textContent = "Update";
  deleteUpdate.appendChild(del);
  deleteUpdate.appendChild(upd);

  del.addEventListener("click", (e) => {
    e.preventDefault();
    apiCall("job", "DELETE", { id: job.id }).then((res) => {
      if (res.error) {
        display_error(res.error);
      } else {
        console.log("successfuly deleted the job ", job.id);
        get_profile(userID);
      }
    });
  });

  upd.addEventListener("click", (e) => {
    e.preventDefault();
    updateJob(job);
  });
  return deleteUpdate;
};

// ################# get profile ##################
// ##################################################

const get_profile = (id) => {
  apiCall(`user?userId=${id}`, "GET", {}).then((data) => {
    console.log("getting profile");
    // display personal info

    if (id === userID) {
      btn_update_profile.style.display = "block";
      btns_other_profile.style.display = "none";
    } else {
      btn_update_profile.style.display = "none";
      btns_other_profile.style.display = "block";
    }
    localStorage.setItem("name", data.name);
    localStorage.setItem("email", data.email);

    user_profile.elements.email.value = data.email;
    user_profile.elements.name.value = data.name;
    user_profile.elements.userId.value = data.id;
    const profile_img = document.getElementById("profile_img");
    if (data.image) {
      profile_img.style.background = `url(${data.image}) no-repeat`;
      profile_img.style.backgroundSize = "contain";
    } else {
      profile_img.style.background = `url(${undefined_profile_image}) no-repeat`;
      profile_img.style.backgroundSize = "contain";
    }

    // display jobs
    const profile_job_centent = document.getElementById("profile_job_centent");
    // clear the content for new user profile
    profile_job_centent.textContent = "";

    // sort the jobs so the newest is the first
    for (const job of sort_by_date(data.jobs)) {
      const job_box = create_job_box(job);
      const btn_del_upd = job_del_upd(job);
      profile_job_centent.appendChild(job_box);
      profile_job_centent.appendChild(btn_del_upd);
    }

    // display followers
    const profile_follower_section = document.getElementById("profile_follower");

    const n_follower = data.watcheeUserIds.length;
    profile_follower_section.children[0].textContent = `Followers : ${n_follower}`;
    const profile_follower_list = document.getElementById("profile_follower_list");
    profile_follower_list.textContent = "";

    // use promise.all to get all followers
    console.log(data);
    const followers = data.watcheeUserIds.map((id) => apiCall(`user?userId=${id}`, "GET", {}));
    Promise.all(followers).then((users) => {
      console.log("followers are", users);
      users.forEach((user) => {
        const name = user.name;
        const user_link = document.createElement("li");
        user_link.appendChild(document.createTextNode(name));
        profile_follower_list.appendChild(user_link);

        let isWatching = Object.values(user.watcheeUserIds).includes(userID);

        user_link.addEventListener("click", (e) => {
          console.log("going to profile of ", user.name);
          e.preventDefault();
          if (isWatching) {
            btn_watch.textContent = "Unwatch";
            btn_watch.classList.remove("btn-success");
            btn_watch.classList.add("btn-secondary");
          } else {
            btn_watch.textContent = "Watch";
            btn_watch.classList.remove("btn-secondary");
            btn_watch.classList.add("btn-success");
          }
          get_profile(user.id);
        });
        // btn event
      });
      display_profile();
    });
  });
  console.log("hey");
};

btn_watch.addEventListener("click", (e) => {
  e.preventDefault();
  const email = user_profile.elements.email.value;
  if (btn_watch.classList.contains("btn-secondary")) {
    const requestBody = {
      email: email,
      turnon: false,
    };
    apiCall("user/watch", "PUT", requestBody).then((res) => {
      if (res.error) {
        display_error(res.error);
      } else {
        btn_watch.textContent = "Watch";
        btn_watch.classList.remove("btn-secondary");
        btn_watch.classList.add("btn-success");
        console.log("successful unwatch", watch, email);
        get_profile(user_profile.elements.userId.value);
      }
    });
  } else {
    const requestBody = {
      email: email,
      turnon: true,
    };
    apiCall("user/watch", "PUT", requestBody).then((res) => {
      if (res.error) {
        display_error(res.error);
      } else {
        btn_watch.textContent = "Unwatch";
        btn_watch.classList.remove("btn-success");
        btn_watch.classList.add("btn-secondary");
        console.log("successful watch", email);
        get_profile(user_profile.elements.userId.value);
      }
    });
  }
});

// ################# User Profile ####################
// ####################################################

const display_profile = () => {
  screen_profile.style.display = "flex";
  screen_profile.style.justifyContent = "space-between";
  screen_create_post.style.display = "none";
  screen_profile_update.style.display = "none";
  screen_jobs.style.display = "none";
  screen_update_post.style.display = "none";
};

// go to own profile
const profile = document.getElementById("own_profile");
profile.addEventListener("click", (event) => {
  get_profile(userID);
});

// ############ Return to Own Profile ###############
return_profile_btn.addEventListener("click", (e) => {
  e.preventDefault();
  get_profile(userID);
});

// ################ Update Profile ##############
const update_form = document.forms["profile_update_form"];
btn_update_profile.addEventListener("click", (e) => {
  e.preventDefault();
  screen_profile.style.display = "none";
  screen_profile_update.style.display = "block";
});

const update_profile = (img, update_form) => {
  const requestBody = {
    email: update_form.elements.email.value,
    password: update_form.elements.password.value,
    name: update_form.elements.name.value,
    image: img,
  };
  apiCall("user", "PUT", requestBody).then((data) => {
    if (data.error) {
      display_error(data.error);
    } else {
      display_error("Profile Updated!");
      // display_profile();
      screen_profile_update.style.display = "none";
      get_profile(userID);
    }
  });
};

const confirm_update = document.getElementById("confirm_update");
confirm_update.addEventListener("click", (e) => {
  e.preventDefault();
  const profile_img = update_form.elements.upload_img.files[0];
  if (profile_img) {
    fileToDataUrl(profile_img).then((img) => {
      update_profile(img, update_form);
    });
  } else {
    update_profile(undefined, update_form);
  }
});

back_to_login.addEventListener("click", (e) => {
  e.preventDefault();
  screen_register.style.display = "none";
  screen_login.style.display = "block";
});

//############### Return Home #####################
// ###############################################
let home = document.getElementById("home");
home.addEventListener("click", () => {
  // screen_jobs.textContent = "";
  screen_profile.style.display = "none";
  screen_jobs.style.display = "block";
  screen_create_post.style.display = "none";
  screen_profile_update.style.display = "none";
  screen_update_post.style.display = "none";
  // startId = 0;
  // getFeedPage(startId);
  // // ############ infinite scroll #################
  // window.addEventListener("scroll", () => {
  //   console.log("working");
  //   if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
  //     console.log("reached end");
  //     getFeedPage(startId);
  //   }
  // });
});

// ############## Create Job ######################
// ##############################################

create_job_tab.addEventListener("click", (e) => {
  screen_create_post.style.display = "block";
  screen_update_post.style.display = "none";
  screen_profile.style.display = "none";
  screen_profile_update.style.display = "none";
  screen_jobs.style.display = "none";
});

btn_post.addEventListener("click", (e) => {
  e.preventDefault();
  const jobImage = screen_create_post.elements.image.files[0];
  if (jobImage) {
    fileToDataUrl(jobImage).then((img) => {
      apiCreateJob(screen_create_post, img);
    });
  } else {
    apiCreateJob(screen_create_post, undefined_job_image);
  }
});

const apiCreateJob = (screen_create_post, img) => {
  const startDate = screen_create_post.elements.start.value;
  if (new Date(startDate) - new Date() > 0) {
    const requestBody = {
      title: screen_create_post.elements.title.value,
      image: img,
      start: startDate,
      description: screen_create_post.elements.description.value,
    };
    // console.log(requestBody);
    apiCall("job", "POST", requestBody).then((res) => {
      if (res.error) {
        display_error("error");
      } else {
        console.log("Job posted successfully");
        display_error("Job posted successfully");
        screen_create_post.reset();
      }
    });
  } else {
    display_error("The start date can not be earlier than today!");
  }
};

// ############################ Job Feeds ####################################  ################################################################

function create_job_box(feed) {
  const job_box = document.createElement("div");
  job_box.style.border = "1px solid black";
  job_box.style.borderRadius = "5px";
  job_box.style.padding = "2rem 1rem";
  job_box.style.marginTop = "2rem";
  job_box.style.marginBottom = "1rem";
  job_box.setAttribute("class", "job_boxes");

  const title = document.createElement("h3");
  const createAt = document.createElement("div");
  const img = document.createElement("img");
  const description = document.createElement("div");
  const start = document.createElement("div");

  title.appendChild(document.createTextNode(feed.title));

  const post_time = "Posted: " + processTime(feed.createdAt);
  createAt.appendChild(document.createTextNode(post_time));
  img.src = feed.image;
  img.style.maxWidth = "100%";
  description.appendChild(document.createTextNode("Description: "));
  description.appendChild(document.createTextNode(feed.description));
  const start_date = processTime(feed.start);
  start.appendChild(document.createTextNode("Start Date: " + start_date));

  job_box.appendChild(title);
  job_box.appendChild(createAt);
  job_box.appendChild(description);
  job_box.appendChild(img);
  job_box.appendChild(start);

  return job_box;
}

const isLiked = (job) => {
  const like_useres = job.likes.map((user) => user.userId);
  if (like_useres.includes(userID)) {
    return true;
  }
  return false;
};

const createJobFeed = (job) => {
  let isliked = isLiked(job);
  // job box root container
  const job_box = create_job_box(job);

  // mega data: auther, n_like(clickable), n_comment(clickable)
  const like_comment = document.createElement("div");
  like_comment.classList.add("btn_group");

  const author = document.createElement("p");
  const n_like = document.createElement("button");
  const n_comment = document.createElement("button");
  // styling
  n_like.classList.add("btn");
  n_comment.classList.add("btn");
  if (isliked) {
    n_like.classList.add("btn-danger");
  } else {
    n_like.classList.remove("btn-danger");
  }

  n_comment.classList.add("btn");
  n_comment.classList.add("btn-outline-secondary");
  // finished styling

  like_comment.appendChild(n_like);
  like_comment.appendChild(n_comment);

  //   liked by, leavecomment, comments
  const likedBy = document.createElement("div");
  const comment = document.createElement("div");
  const comment_text = document.createElement("textarea");

  comment.classList.add("input-group");
  comment_text.classList.add("form-control");
  comment_text.setAttribute("placeholder", "Add a comment");

  const comment_btn_div = document.createElement("div");
  comment_btn_div.classList.add("input-group-append");
  const comment_btn = document.createElement("button");

  comment_btn.textContent = "Send";
  comment_btn.style.float = "right";
  comment_btn.classList.add("btn");
  comment_btn.classList.add("btn-info");
  comment_btn_div.appendChild(comment_btn);
  comment.appendChild(comment_text);
  comment.appendChild(comment_btn_div);
  comment.style.display = "none";

  const other_comments = document.createElement("div");

  //   write into meta_data
  getAuthorName(job.creatorId).then((name) => {
    n_like.innerText = `Likes: ${job.likes.length}`;
    n_comment.innerText = `Comments: ${job.comments.length}`;
    author.innerText = `Posted by: ${name}`;

    // triger a like/unlike
    n_like.addEventListener("click", (e) => {
      let requestBody = "";
      if (n_like.classList.contains("btn-danger")) {
        n_like.classList.remove("btn-danger");
        // need to unlike
        requestBody = {
          id: job.id,
          turnon: false,
        };
      } else {
        n_like.classList.add("btn-danger");
        // need to like
        requestBody = {
          id: job.id,
          turnon: true,
        };
      }
      apiCall("job/like", "PUT", requestBody);
    });

    // triger a comment
    n_comment.addEventListener("click", () => {
      if (comment.style.display === "none") {
        comment.style.display = "flex";
        comment_btn.addEventListener("click", () => {
          if (comment_text.value) {
            apiCall("job/comment", "POST", {
              id: job.id,
              comment: comment_text.value,
            });
            comment.style.display = "none";
          } else {
            display_error("Comment cannot be blank");
          }
        });
      } else {
        comment.style.display = "none";
      }
    });
  });

  // render value into likedBy
  likedBy.appendChild(document.createTextNode("Liked by: "));
  job.likes.forEach((user) => {
    const username = document.createTextNode(user.userName);
    likedBy.appendChild(username);
    username.addEventListener("click", (e) => {
      get_profile(user.userId);
    });
  });

  //  render value into comments
  other_comments.appendChild(document.createTextNode("Comments: "));
  job.comments.forEach((comment) => {
    const one_comment = document.createElement("div");
    one_comment.classList.add("comment_box");
    const username = document.createTextNode(`${comment.userName}: `);
    const comment_content = document.createTextNode(comment.comment);
    one_comment.appendChild(username);
    one_comment.appendChild(comment_content);
    other_comments.appendChild(one_comment);
    username.addEventListener("click", (e) => {
      get_profile(comment.userId);
    });
  });
  job_box.appendChild(author);
  job_box.appendChild(like_comment);
  job_box.appendChild(likedBy);
  job_box.appendChild(comment);
  job_box.appendChild(other_comments);
  return job_box;
};
// login("james@email.com", "betty");
login("betty@email.com", "cardigan");
