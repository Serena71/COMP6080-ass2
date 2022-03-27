// import { appendFileSync } from "fs";

// for (const follower of data.watcheeUserIds) {
//   apiCall(`user?userId=${follower}`, "GET", {}).then((user) => {
//     const name = user.name;
//     const user_link = document.createElement("li");
//     user_link.appendChild(document.createTextNode(name));
//     profile_follower_list.appendChild(user_link);
//     display_profile();

//     // access other user's profile
//     user_link.addEventListener("click", (e) => {
//       let isWatching = Object.values(user.watcheeUserIds).includes(userID);
//       e.preventDefault();
//       if (isWatching) {
//         btn_watch.textContent = "Unwatch";
//         btn_watch.classList.remove("btn-success");
//         btn_watch.classList.add("btn-secondary");
//       } else {
//         btn_watch.textContent = "Watch";
//         btn_watch.classList.remove("btn-secondary");
//         btn_watch.classList.add("btn-success");
//       }
//       btn_watch.addEventListener("click", (e) => {
//         e.preventDefault();
//         if (btn_watch.textContent == "Unwatch") {
//           btn_watch.textContent = "Watch";
//           btn_watch.classList.remove("btn-secondary");
//           btn_watch.classList.add("btn-success");

//           const requestBody = {
//             email: user.email,
//             turnon: false,
//           };
//           apiCall("user/watch", "PUT", requestBody).then((res) => {
//             if (res.error) {
//               display_error(res.error);
//             } else {
//               console.log("unwatched the user");
//             }
//           });
//         } else {
//           btn_watch.textContent = "Unwatch";
//           btn_watch.classList.remove("btn-success");
//           btn_watch.classList.add("btn-secondary");

//           const requestBody = {
//             email: user.email,
//             turnon: true,
//           };
//           apiCall("user/watch", "PUT", requestBody).then((res) => {
//             if (res.error) {
//               display_error(res.error);
//             } else {
//               console.log("watched the user");
//             }
//           });
//         }
//         // watchUser(user.email, watch);
//       });
//       get_profile(follower);
//     });
//   });
// }

// setInterval(poll(startId), 1000);
const polling = (polling_start, timeout) => {
  // const timeout = 1000;
  // let polling_start = 0;
  const fetch_update = () => {
    apiCall(`job/feed?start=${polling_start}`, "GET", {}).then((feedPage) => {
      if (feedPage.length > 0) {
        polling_start += 5;
        for (let i = 0; i < feedPage.length; i++) {
          const job_idx = polling_start + i;
          const current_job = screen_jobs.children[job_idx];
          const new_job = feedPage[i];
          value_update(current_job, new_job);
        }
        fetch_update(polling_start);
      } else {
        polling_start = 0;
        setTimeout(fetch_update, timeout);
      }
    });
  };
  return fetch_update();
};

const value_update = (current_job, new_job) => {
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
    const username = document.createTextNode(user.userName);
    current_job.children[7].appendChild(username);
  });
  // comments
  const comments = current_job.children[9];
  comments.textContent = "";
  comments.appendChild(document.createTextNode("Comments:"));
  for (let j = 0; j < new_job.comments.length; j++) {
    const comment = document.createElement("div");
    comment.textContent = ` ${new_job.comments[j].userName}: ${new_job.comments[j].comment}`;
  }
};
