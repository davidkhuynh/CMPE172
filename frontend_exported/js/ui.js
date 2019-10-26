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

    //.append navbar functions
    $("#nav").append(`<a class="link-text nav-link" href="gallery.html" title="Explore">EXPLORE</a>`);
    if (authState === AUTH_STATE.none) {
        $("#nav").append(`<a class="link-text nav-link" href="signup.html" title="Signup">SIGNUP</a>`);
        $("#nav").append(`<a class="link-text nav-link" href="login.html" title="Login">LOGIN</a>`);
    } else if (authState === AUTH_STATE.notConfirmed) {
        $("#nav").append(`<a class="link-text nav-link" href="confirmation.html" title="Confirm">CONFIRM</a>`);
    } else {
        $("#nav").append(` <a class="link-text nav-link" href="index.html" title="Feed">FEED</a>`);
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

    // upload/explore/search buttons

    // feed posts
}

function loginPage() {
    makeHeader("Login", AUTH_STATE.none);
}

function confirmationPage() {
    makeHeader("Confirm", AUTH_STATE.notConfirmed);
}

function uploadPostPage() {
    makeHeader("Upload Post", AUTH_STATE.authenticated);
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

function viewPostPage(descriptionPart) {
    makeHeader(descriptionPart, "none");
}

function editPostPage(descriptionPart) {
    makeHeader(`Editing Post: ${descriptionPart}`, AUTH_STATE.authenticated);
}

// util functions
