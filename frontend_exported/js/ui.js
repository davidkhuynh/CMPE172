// dynamically create UI elements in js
// header
function makeHead(pageTitle) {
  $("html").append("head");
  $("head").append(`
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="description" content="">
      <meta name="keywords" content="">
      <link rel="stylesheet" href="css/bootstrap4.min.css">
      <link rel="stylesheet" href="css/wireframe-theme.min.css">
      <script>document.createElement( "picture" );</script>
      <script class="picturefill" async="async" src="js/picturefill.min.js"></script>
      <link rel="stylesheet" href="css/main.css">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Condensed%7CRoboto:300,400">
     `);
  $(document).prop("title", `${pageTitle} | Fumblr`);
}

const AUTH_STATE = {
  none: "none",
  notConfirmed: "notConfirmed",
  authenticated: "authenticated"
};

function makeNav(authState) {
  // set up navbar
  $("#navArea").append("").attr("id", "navOuter").addClass("row nav-row");
  $("#navOuter").append(`<div id="nav" class="col-xs-12 col-xl-12 column-2 navbar-sticky-top navbar">`);

  // append navbar functions
  if (authState === AUTH_STATE.authenticated) {
    $("#nav").append(` <a class="link-text nav-link" href="feed.html" title="Feed">FEED</a>`);
  }

  $("#nav").append(`<a class="link-text nav-link" href="explore.html" title="Explore">EXPLORE</a>`);
  if (authState === AUTH_STATE.none) {
    $("#nav").append(`<a class="link-text nav-link" href="signup.html" title="Signup">SIGNUP</a>`);
    $("#nav").append(`<a class="link-text nav-link" href="login.html" title="Login">LOGIN</a>`);
  } else if (authState === AUTH_STATE.notConfirmed) {
    $("#nav").append(`<a class="link-text nav-link" href="confirmation.html" title="Confirm">CONFIRM</a>`);
  } else {
    $("#nav").append(`<a class="link-text nav-link" href="profilepage.html" title="Profile">YOUR PROFILE</a>`);
  }

  if (authState === AUTH_STATE.notConfirmed || authState === AUTH_STATE.authenticated) {
    $("#nav").append(`<a class="link-text nav-link" href="" title="Logout">LOGOUT</a>`);
  }
}


function makeHeader(pageTitle, authState) {
  makeHead(pageTitle);
  makeNav(authState);
}

// page content
function indexPage() {
  makeHeader("Feed", AUTH_STATE.none);
}

function explorePage() {
  makeHeader("Explore", AUTH_STATE.none);
  loadExplorePosts();
}

function loginPage() {
  makeHeader("Login", AUTH_STATE.none);
}

function confirmationPage() {
  makeHeader("Confirm", AUTH_STATE.notConfirmed);
}

function uploadPostPage() {
  makeHeader("Upload Post", AUTH_STATE.authenticated);

  // handlers
  $("#submitPostButton").click(() => {
    let text = $("#postText").val();
    let picture = $("#pictureFile").get(0).files[0];

    if (picture) {
      createPostWithPicture("anon", picture, text);
    } else {
      createPost("anon", text);
    }
  });

  $(document).on("change", "#pictureFile", () => {
    let picture = $("#pictureFile").get(0).files[0];
    let reader = new FileReader();
    reader.onload = (e) => {
      $("#postPicture").attr("src", e.target.result);
    };
    reader.readAsDataURL(picture);
  });
}

function signupPage() {
  makeHeader("Confirm", AUTH_STATE.none);
}

function userProfilePage(user, authState) {
  makeHeader(`${user}'s Profile`, authState);
}

function myProfilePage(currentUser) {
  userProfilePage(currentUser, AUTH_STATE.authenticated);
}

function getWords(str, n) {
    return str.split(/\s+/).slice(0,n).join(" ");
}

function viewPostPage() {
  // load post content
  let postId = window.location.hash.substr(1);

  // update content
  $.post(
    SERVER_URL + "/post/" + postId,
    (postData) => {
      makeHeader(getWords(postData.text, 5), "none");
      console.log(postData);
      $("#postUser").text(postData.username);
      if (postData.picture.length > 0) {
        $("#postPicture").attr("src", IMAGE_HOST_URL + postData.picture);
      } else {
        $("#postPicture").hide();
      }
      $("#postText").text(postData.text);
      $("#editPostButton").attr("value", postData.id);
      $("#deletePostButton").attr("value", postData.id);
    }
  );

  // button handlers
  $('#editPostButton').click(() => {
    window.location.href = "editpost.html#" + postId ;
  });

  $('#deletePostButton').click(() => {
    deletePost(postId);
  });

}

function editPostPage(postId, descriptionPart) {
  makeHeader(`Editing Post: ${descriptionPart}`, AUTH_STATE.authenticated);
}

// util functions
function handleDeletePost(postId) {
  deletePost(postId);
  window.location = "explore.html";
}

function handleViewPost(postId) {
  window.location = `viewpost.html#${postId}`
}
