import { appendFile } from "fs";

const createJobFeed = (job) => {
  // job box root container
  const job_box = create_job_box(job);

  // mega data: auther, n_like(clickable), n_comment(clickable)
  const mega_data = document.createElement("div");
  mega_data.style.display = "flex";
  mega_data.style.justifyContent = "space-between";

  const author = document.createElement("p");
  const n_like = document.createElement("button");
  //   n_like.classList.add("btn_like");
  const n_comment = document.createElement("button");
  //   n_comment.classList.add("btn_comment");

  mega_data.appendChild(author);
  mega_data.appendChild(n_like);
  mega_data.appendChild(n_comment);

  //   liked by, leavecomment, comments
  const likedBy = document.createElement("div");
  const comment = document.createElement("textarea");
  comment.setAttribute("placeholder", "Add a comment");
  comment.style.display = "none";
  const other_comments = document.createElement("div");

  //   const username = document.createElement('div');
  //   const comment_content = document.createElement('div')
  other_comments.classList.add("comment_boxes");

  //   write into meta_data
  getAuthorName.then((name) => {
    n_like.innerText = `Likes: ${likes.length}`;
    n_comment.innerText = `Comments: ${comments.length}`;
    author.innerText = name;
  });

  // write into likedBy
  likedBy.appendChild(document.createTextNode("Liked by: "));
  job.likes.forEach((user) => {
    const username = document.createTextNode(user.name);
    likedBy.appendChild(username);
    username.addEventListener("click", (e) => {
      get_profile(user.userId);
    });
  });

  //  write into comments
  other_comments.appendChild(document.createTextNode("Comments: "));
  job.comments.forEach((comment) => {
    const one_comment = document.createElement("div");
    const username = document.createTextNode(`${comment.userName}: `);
    const comment_content = document.createTextNode(comment.comment);
    one_comment.appendChild(username);
    one_comment.appendChild(comment_content);
    other_comments.appendChild(one_comment);
    username.addEventListener("click", (e) => {
      get_profile(comment.userId);
    });
  });
  return job_box;
};

const getAuthorName = (id) => {
  return apiCall("user", "GET", {}).then((data) => data.name);
};
