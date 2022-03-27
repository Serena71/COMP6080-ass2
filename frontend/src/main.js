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
const btn_post_cancel = document.getElementById("btn_post_cancel");
const screen_update_post = document.forms["screen_update_post"];
const btn_update_post = document.getElementById("btn_update_post");
const btn_cancel_update_post = document.getElementById("btn_cancel_update_post");

const screen_jobs = document.getElementById("screen_jobs");

const search_box = document.getElementById("search_box");
const search_btn = document.getElementById("search_btn");

const home_page_search_btn = document.getElementById("home_page_search_btn");
const home_page_search_box = document.getElementById("search_watch_popup");
const home_page_search_form = document.forms["search_watch_popup"];

let userToken = null;
let userID = null;
let startId = 0;
let pollingId = 0;

// ########################################################
// Helper functions
// ########################################################

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
      .then((body) => resolve(body))
      .catch((e) => {
        console.log(e);
        reject();
      });
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
  error_popup.children[1].innerText = msg;
  setTimeout(() => {
    error_popup.style.display = "none";
  }, 5000);
}

function sort_by_date(jobs) {
  const sorted_feeds = jobs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return sorted_feeds;
}

// ########################################################
// Validity check
// ########################################################

const emailValid = (email) => {
  if (!RegExp("^.+@.+..+$").test(email)) {
    display_error("Please enter a valid email address");
    return false;
  }
  return true;
};
const passwordValid = (password) => {
  if (!RegExp("([A-Z]+[a-z]+[0-9]+)").test(password) || password.length < 6) {
    display_error(
      "The password must meet the following criteria:\nAt least 6-digit long\nAt Least 1 Uppercase\nAt Least 1 Lowercase\nand At Least 1 number"
    );
    return false;
  }
  return true;
};

// ########################################################
// Notification
// ########################################################
const notif_btn_1 = document.getElementById("notification-button-1");
const notif_btn_2 = document.getElementById("notification-button-2");
const notification = document.getElementById("notification-popup");
notif_btn_1.addEventListener("click", (e) => {
  e.preventDefault();
  refreshJobPage();
  notification.style.display = "none";
});
notif_btn_2.addEventListener("click", (e) => {
  e.preventDefault();
  screen_jobs.textContent = "";
  startId = 0;
  getFeedPage(startId);
  polling(1000);
  notification.style.display = "none";
});

// ########################################################
// Polling
// ########################################################
const polling = (timeout) => {
  const fetch_update = () => {
    apiCall(`job/feed?start=${pollingId}`, "GET", {})
      .then((feedPage) => {
        if (pollingId < startId) {
          for (let i = 0; i < feedPage.length; i++) {
            const job_idx = pollingId + i;
            const current_job = screen_jobs.children[job_idx];
            const new_job = feedPage[i];
            if (localStorage.getItem(new_job.id)) {
              if (current_job) {
                polling_value_update(current_job, new_job);
              }
            } else {
              notification.style.display = "block";
            }
          }
          pollingId += 5;
          fetch_update();
        } else {
          pollingId = 0;
          setTimeout(fetch_update, timeout);
        }
      })
      .catch(() => {
        console.log("fail to poll");
        console.log(screen_jobs.children.length);
        getStaticFeed();
      });
  };
  return fetch_update();
};

// update job feed contents from polling
const polling_value_update = (current_job, new_job) => {
  current_job.children[0].textContent = new_job.title;
  current_job.children[2].textContent = `Description: ${new_job.description}`;
  current_job.children[3].src = new_job.image;
  current_job.children[4].textContent = `Start Date: ${processTime(new_job.start)}`;
  // n_like, n_comment
  current_job.children[6].children[0].textContent = `Likes ${new_job.likes.length}`;
  current_job.children[6].children[1].textContent = `Comments: ${new_job.comments.length}`;
  // liked by
  current_job.children[7].textContent = "";
  current_job.children[7].appendChild(document.createTextNode("Liked by: "));
  new_job.likes.forEach((user) => {
    const username = document.createElement("p");
    username.textContent = user.userName;
    current_job.children[7].appendChild(username);
    username.addEventListener("click", (e) => {
      e.preventDefault();
      get_profile(user.userId);
    });
  });
  // comments
  const comments = current_job.children[9];
  comments.textContent = "";
  comments.appendChild(document.createTextNode("Comments:"));
  for (let j = 0; j < new_job.comments.length; j++) {
    const comment = document.createElement("div");
    comment.classList.add("comment_box");
    const comment_user = document.createElement("a");
    comment_user.textContent = `${new_job.comments[j].userName}: `;
    comment.appendChild(comment_user);
    comment.appendChild(document.createTextNode(`${new_job.comments[j].comment}`));
    comment_user.addEventListener("click", (e) => {
      e.preventDefault();
      get_profile(new_job.comments[j].userId);
    });
    comments.appendChild(comment);
  }
};

// ########################################################
// Search User By Email
// ########################################################

// nav_bar watch user button
search_btn.addEventListener("click", (e) => {
  e.preventDefault();
  const requestBody = {
    email: search_box.value,
    turnon: true,
  };
  apiCall("user/watch", "PUT", requestBody)
    .then((res) => {
      if (res.error) {
        display_error(res.error);
      } else {
        search_box.value = "";
        display_error("You've successfully watched the user");
      }
    })
    .catch(() => display_error("You are currently offline!"));
});

// home_page watch user button
home_page_search_btn.addEventListener("click", (e) => {
  e.preventDefault();
  home_page_search_box.style.display = "block";
});

home_page_search_form.elements.watch.addEventListener("click", (e) => {
  e.preventDefault();
  const requestBody = {
    email: home_page_search_form.email.value,
    turnon: true,
  };
  apiCall("user/watch", "PUT", requestBody)
    .then((res) => {
      if (res.error) {
        display_error(res.error);
      } else {
        home_page_search_form.email.value = "";
        home_page_search_box.style.display = "none";
        display_error("You've successfully watched the user");
      }
    })
    .catch(() => display_error("You are currently offline!"));
});
home_page_search_form.elements.cancel.addEventListener("click", (e) => {
  e.preventDefault();
  home_page_search_form.email.value = "";
  home_page_search_box.style.display = "none";
});

const getStaticFeed = () => {
  screen_jobs.style.display = "block";
};

// ########################################################
// get job feeds on home page
// ########################################################

const getFeedPage = (id) => {
  apiCall(`job/feed?start=${id}`, "GET", {})
    .then((feedPage) => {
      if (id === 0) {
        // fetching from the beginning
        // refresh whole page
        screen_jobs.textContent = "";
      }
      if (feedPage.length > 0) {
        startId += 5;
        feedPage.forEach((feed) => {
          localStorage.setItem(feed.id, feed);
          screen_jobs.appendChild(createJobFeed(feed));
        });
      }
    })
    .catch(() => {
      display_home();
    });
};

window.addEventListener("scroll", () => {
  if (
    window.scrollY + window.innerHeight >= document.documentElement.scrollHeight &&
    screen_jobs.style.display == "block"
  ) {
    console.log("reached end");
    getFeedPage(startId);
  }
});

// ########################################################
// ####################### login #########################
// #######################################################

// login
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
      refreshJobPage();
    }
  });
};
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

// back to login from registration page
back_to_login.addEventListener("click", (e) => {
  e.preventDefault();
  screen_register.reset();
  screen_register.style.display = "none";
  screen_login.style.display = "block";
});

// ########################################################
// #################### registration  ###################
// ##################################################

// access registration form
register_btn.addEventListener("click", (event) => {
  event.preventDefault();
  screen_register.style.display = "block";
  screen_login.style.display = "none";
});

submit_register.addEventListener("click", (event) => {
  event.preventDefault();
  let psw1 = screen_register.psw1.value;
  let psw2 = screen_register.psw2.value;

  if (psw1 !== psw2) {
    display_error("Passwords do not match, please re-enter");
    // alert('Password does not match');
  } else {
    const email = screen_register.email.value;
    const psw = screen_register.psw1.value;
    const name = screen_register.name.value;
    if (emailValid(email) && passwordValid(psw)) {
      const requestBody = {
        email: email,
        password: psw,
        name: name,
      };
      apiCall("auth/register", "POST", requestBody).then((screen_registered.style.display = "block"));
    }
  }
});

// ########## registered ############
screen_registered.back.addEventListener("click", (e) => {
  console.log("registered");
  e.preventDefault();
  screen_login.style.display = "block";
  screen_registered.style.display = "none";
});

// ########################################################
// ############# Error/Message Popup ##################
// ##################################################

popup_close.addEventListener("click", (event) => {
  error_popup.style.display = "none";
});

// ########################################################
// ################# job delete/update ##################
// ##################################################

const apiPostUpdate = (jobId, screen_update_post, img) => {
  const requestBody = {
    id: jobId,
    title: screen_update_post.elements.title.value,
    image: img,
    start: screen_update_post.elements.start.value,
    description: screen_update_post.elements.description.value,
  };
  apiCall("job", "PUT", requestBody)
    .then((res) => {
      if (res.error) {
        display_error(res.error);
      } else {
        display_error("Job updated successfully");
        get_profile(userID);
      }
    })
    .catch(() => {
      display_error("You are currently offline!");
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
        apiPostUpdate(job.id, screen_update_post, img);
      });
    } else {
      apiPostUpdate(job.id, screen_update_post, job.image);
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
    apiCall("job", "DELETE", { id: job.id })
      .then((res) => {
        if (res.error) {
          display_error(res.error);
        } else {
          console.log("successfuly deleted the job ", job.id);
          get_profile(userID);
        }
      })
      .catch(() => {
        display_error("You are currently offline!");
      });
  });

  upd.addEventListener("click", (e) => {
    e.preventDefault();
    updateJob(job);
  });
  return deleteUpdate;
};

// ########################################################
// ################# get profile ##################
// ##################################################

const get_profile = (id) => {
  apiCall(`user?userId=${id}`, "GET", {})
    .then((data) => {
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
      const followers = data.watcheeUserIds.map((id) => apiCall(`user?userId=${id}`, "GET", {}));
      Promise.all(followers).then((users) => {
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
        });
        display_profile();
      });
    })
    .catch(() => {
      display_profile();
    });
};

// ########################################################
// ####################### Watch / Unwatch ################
// #######################################################
btn_watch.addEventListener("click", (e) => {
  e.preventDefault();
  const email = user_profile.elements.email.value;
  let on = false;

  if (btn_watch.classList.contains("btn-success")) {
    on = true;
  }

  const requestBody = {
    email: email,
    turnon: on,
  };
  apiCall("user/watch", "PUT", requestBody)
    .then((res) => {
      if (res.error) {
        display_error(res.error);
      } else {
        if (!on) {
          btn_watch.textContent = "Watch";
          btn_watch.classList.remove("btn-secondary");
          btn_watch.classList.add("btn-success");
          console.log("successful unwatch", watch, email);
          get_profile(user_profile.elements.userId.value);
        } else {
          btn_watch.textContent = "Unwatch";
          btn_watch.classList.remove("btn-success");
          btn_watch.classList.add("btn-secondary");
          console.log("successful watch", email);
          get_profile(user_profile.elements.userId.value);
        }
      }
    })
    .catch(() => {
      display_error("You are currently offline!");
    });
});

// ########################################################
// ################# User Profile - update/display ########
// ####################################################

const display_profile = () => {
  home_page_search_btn.style.display = "none";
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
  event.preventDefault();
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
  const email = update_form.elements.email.value;
  const psw = update_form.elements.password.value;
  if (emailValid(email) && passwordValid(psw)) {
    const requestBody = {
      email: email,
      password: psw,
      name: update_form.elements.name.value,
      image: img,
    };
    apiCall("user", "PUT", requestBody)
      .then((data) => {
        if (data.error) {
          display_error(data.error);
        } else {
          display_error("Profile Updated!");
          screen_profile_update.style.display = "none";
          get_profile(userID);
        }
      })
      .catch(() => {
        display_error("You are currently offline!");
      });
  }
};

const confirm_update = document.getElementById("confirm_update");
const cancel_update = document.getElementById("cancel_update");
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

cancel_update.addEventListener("click", (e) => {
  e.preventDefault();
  update_form.reset();
  display_profile();
});

// ################################################
//############### Return Home #####################
// ###############################################
const refreshJobPage = () => {
  pollingId = 0;
  startId = 0;
  getFeedPage(startId);
  polling(1000);
  display_home();
};

const display_home = () => {
  screen_profile.style.display = "none";
  screen_jobs.style.display = "block";
  home_page_search_btn.style.display = "block";
  screen_create_post.style.display = "none";
  screen_profile_update.style.display = "none";
  screen_update_post.style.display = "none";
};

let home = document.getElementById("home");
home.addEventListener("click", (e) => {
  e.preventDefault();
  refreshJobPage();
});

// #################################################
// ############## Create Job ######################
// ##############################################

// cancel job post
btn_post_cancel.addEventListener("click", (e) => {
  e.preventDefault();
  screen_create_post.reset();
  refreshJobPage();
});

create_job_tab.addEventListener("click", (e) => {
  e.preventDefault();
  home_page_search_btn.style.display = "none";
  screen_create_post.style.display = "block";
  screen_update_post.style.display = "none";
  screen_profile.style.display = "none";
  screen_profile_update.style.display = "none";
  screen_jobs.style.display = "none";
});

// sumit the job post
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
    apiCall("job", "POST", requestBody)
      .then((res) => {
        if (res.error) {
          display_error("error");
        } else {
          display_error("Job posted successfully");
          screen_create_post.reset();
        }
      })
      .catch(() => {
        display_error("You are currently offline!");
      });
  } else {
    display_error("The start date can not be earlier than today!");
  }
};

// ########################################################
// ############################ Job Feeds #################
//  #######################################################

// create a box for each job - job content only
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
  try {
    const like_useres = job.likes.map((user) => user.userId);
    if (like_useres.includes(userID)) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

// include other information in the job box, (e.g. likes, comments)
const createJobFeed = (job) => {
  let isliked = isLiked(job);
  // job box root container
  const job_box = create_job_box(job);

  // mega data: auther, n_like(clickable), n_comment(clickable)
  const like_comment = document.createElement("div");
  like_comment.classList.add("btn_group");

  const author_section = document.createElement("p");
  const author = document.createElement("a");
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
    author_section.innerText = "Posted by: ";
    author.textContent = `${name}`;
    author_section.appendChild(author);
    // click on author -> profile
    author.addEventListener("click", (e) => {
      e.preventDefault();
      get_profile(job.creatorId);
    });

    // triger a like/unlike
    n_like.addEventListener("click", (e) => {
      e.preventDefault();
      let on = true;
      if (n_like.classList.contains("btn-danger")) {
        // need to unlike
        on = false;
      }
      const requestBody = {
        id: job.id,
        turnon: on,
      };
      apiCall("job/like", "PUT", requestBody)
        .then(() => {
          if (on) {
            n_like.classList.add("btn-danger");
          } else {
            n_like.classList.remove("btn-danger");
          }
        })
        .catch(() => display_error("You are currently offline!"));
    });

    // triger a comment
    n_comment.addEventListener("click", (e) => {
      e.preventDefault();
      if (comment.style.display === "none") {
        comment.style.display = "flex";
      } else {
        comment.style.display = "none";
      }
    });
    comment_btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (comment_text.value) {
        apiCall("job/comment", "POST", {
          id: job.id,
          comment: comment_text.value,
        })
          .then(() => {
            comment_text.value = "";
            comment.style.display = "none";
          })
          .catch(() => {
            display_error("You are currently offline!");
          });
      } else {
        display_error("Comment cannot be blank");
      }
    });
  });

  // render value into likedBy
  likedBy.appendChild(document.createTextNode("Liked by: "));
  job.likes.forEach((user) => {
    const username = document.createElement("a");
    username.textContent = user.userName;
    likedBy.appendChild(username);
    username.addEventListener("click", (e) => {
      console.log("clicked");
      e.preventDefault();
      get_profile(user.userId);
    });
  });

  //  render value into comments
  other_comments.appendChild(document.createTextNode("Comments: "));
  job.comments.forEach((comment) => {
    const one_comment = document.createElement("div");
    one_comment.classList.add("comment_box");
    const username = document.createElement("a");
    username.textContent = `${comment.userName}: `;
    const comment_content = document.createTextNode(comment.comment);
    one_comment.appendChild(username);
    one_comment.appendChild(comment_content);
    other_comments.appendChild(one_comment);
    username.addEventListener("click", (e) => {
      e.preventDefault();
      get_profile(comment.userId);
    });
  });
  job_box.appendChild(author_section);
  job_box.appendChild(like_comment);
  job_box.appendChild(likedBy);
  job_box.appendChild(comment);
  job_box.appendChild(other_comments);
  return job_box;
};

// login("james@gmail.com", "Betty123");
// login("betty@email.com", "cardigan");
