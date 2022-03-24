import { appendFileSync } from "fs";

for (const follower of data.watcheeUserIds) {
  apiCall(`user?userId=${follower}`, "GET", {}).then((user) => {
    const name = user.name;
    const user_link = document.createElement("li");
    user_link.appendChild(document.createTextNode(name));
    profile_follower_list.appendChild(user_link);
    display_profile();

    // access other user's profile
    user_link.addEventListener("click", (e) => {
      let isWatching = Object.values(user.watcheeUserIds).includes(userID);
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
      btn_watch.addEventListener("click", (e) => {
        e.preventDefault();
        if (btn_watch.textContent == "Unwatch") {
          btn_watch.textContent = "Watch";
          btn_watch.classList.remove("btn-secondary");
          btn_watch.classList.add("btn-success");

          const requestBody = {
            email: user.email,
            turnon: false,
          };
          apiCall("user/watch", "PUT", requestBody).then((res) => {
            if (res.error) {
              display_error(res.error);
            } else {
              console.log("unwatched the user");
            }
          });
        } else {
          btn_watch.textContent = "Unwatch";
          btn_watch.classList.remove("btn-success");
          btn_watch.classList.add("btn-secondary");

          const requestBody = {
            email: user.email,
            turnon: true,
          };
          apiCall("user/watch", "PUT", requestBody).then((res) => {
            if (res.error) {
              display_error(res.error);
            } else {
              console.log("watched the user");
            }
          });
        }
        // watchUser(user.email, watch);
      });
      get_profile(follower);
    });
  });
}
