// dynamically create UI elements in js
// header
function makeHead(pageTitle) {
  $("head").append(`
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="description" content="">
      <meta name="keywords" content="">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">      <link rel="stylesheet" href="css/wireframe-theme.min.css">
      <script>document.createElement( "picture" );</script>
      <script class="picturefill" async="async" src="js/picturefill.min.js"></script>
      <link rel="stylesheet" href="css/main.css">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Condensed%7CRoboto:300,400">
     `);
  $(document).prop("title", `${pageTitle} | Fumblr`);
}

function makeNav(isAuthenticated) {
  // set up navbar
  $("#navArea").append("").attr("id", "navOuter").addClass("row nav-row");
  $("#navOuter").append(`<div id="nav" class="col-xs-6 col-m-6 col-lg-6 col-xl-6 offset-xs-3 offset-m-3 offset-lg-3 offset-xl-3  column-2 navbar-sticky-top navbar">`);

  // append navbar functions
  if (isAuthenticated) {
    $("#nav").append(` <a class="link-text nav-link" href="feed.html" title="Feed">FEED</a>`);
  }

  $("#nav").append(`<a class="link-text nav-link" href="explore.html" title="Explore">EXPLORE</a>`);
  if (!isAuthenticated) {
    $("#nav").append(`<a class="link-text nav-link" href="signup.html" title="Signup">SIGNUP</a>`);
    $("#nav").append(`<a class="link-text nav-link" href="login.html" title="Login">LOGIN</a>`);
    $("#nav").append(`<a class="link-text nav-link" href="confirmation.html" title="Confirm">CONFIRM</a>`);
  } else {
    var appendNav = '';
    appendNav += `<a class="link-text nav-link" href="profilepage.html#`;
    appendNav += Authentication.getCurrentUsername();
    appendNav += `" title="Profile">YOUR PROFILE</a>`;
    $("#nav").append(appendNav);
  }

  if (isAuthenticated) {
    $("#nav").append(`<a id="logoutButton" class="link-text nav-link" href="" title="Logout">LOGOUT</a>`);
    $("#logoutButton").click(() => {
      Authentication.signOutUser();
      window.location = "explore.html";
    });
  }
}

// global things
$("#searchButton").click(() => {
  let searchQuery = $("#searchQuery").val();
  window.location = "search.html#" + searchQuery;
});

//

function makeHeader(pageTitle, isAuthenticated = false) {
  makeHead(pageTitle);
  makeNav(isAuthenticated);
}

// page content
function indexPage() {
  Authentication.refreshSession();
  let isAuthenticated = Authentication.isAuthenticated();
  makeHeader("Feed", isAuthenticated);
  loadExplorePosts(Authentication.getCurrentUsername());
}

function feedPage() {
  $(window).on('hashchange', function () {
    window.location.reload(true);
  });

  let isAuthenticated = Authentication.isAuthenticated();
  // non-logged in users don't have a feed
  if (!isAuthenticated) {
    window.location = "explore.html";
    return;
  }
  makeHeader("Feed", isAuthenticated);
  RouteFunctions.loadFeedPosts();
}

function explorePage() {
  $(window).on('hashchange', function () {
    window.location.reload(true);
  });

  let isAuthenticated = Authentication.isAuthenticated();
  makeHeader("Explore", isAuthenticated);
  RouteFunctions.loadExplorePosts();
}

function searchPage() {
  $(window).on('hashchange', function () {
    window.location.reload(true);
  });

  let searchQuery = window.location.hash.substr(1);
  let isAuthenticated = Authentication.isAuthenticated();
  makeHeader("Search: " + searchQuery, isAuthenticated);
  RouteFunctions.loadSearchPosts(searchQuery);
}

function loginPage() {
  Authentication.refreshSession();
  makeHeader("Login");

  // handlers
  $("#loginButton").click(() => {
    let username = $("#loginUser").val();
    let password = $("#loginPassword").val();
    Authentication.signInUser(username, password, (err, response) => {
      if (err) {
        document.getElementById("loginFailed").style.visibility = "visible";

        return;
      }

      window.location = "feed.html";
    });
  });
}

function confirmationPage() {
  Authentication.refreshSession();
  makeHeader("Confirm");

  // handlers
  $("#confirmationButton").click(() => {
    let username = $("#confirmUser").val();
    let confirmCode = $("#confirmCode").val();

    Authentication.confirmUser(username, confirmCode, (err, response) => {
      if (err) {
        document.getElementById("confirmationFailed").style.visibility = "visible";

        return;
      }
      window.location = "login.html";
    });
  });

  $("#resendConfirmationButton").click(() => {
    let username = $("#confirmUser").val();
    console.log(username);
    if (!username) {
      console.log("please type your username in the input field");
      return;
    }

    Authentication.resendConfirmationCode(username, (err, response) => {
      if (err) {
        console.log(err);
        document.getElementById("confirmationResentFailed").style.visibility = "visible";

      }

      else {
        document.getElementById("confirmationResent").style.visibility = "visible";
        console.log(response);
      }
    });
  });
}

function uploadPostPage() {
  Authentication.refreshSession();
  let isAuthenticated = Authentication.isAuthenticated();
  if (!isAuthenticated) {
    handleUnauthorized("Log in before uploading a post!");
  }
  makeHeader("Upload Post", isAuthenticated);

  // handlers
  $("#submitPostButton").click(() => {
    let text = $("#postText").val();
    RouteFunctions.createPost(text, (err, response) => {
      if (err) {
        console.log(err);
      }

      else {
        window.location = "viewpost.html#" + response.id;
      }

    });
  });

  $(document).on("change", "#fileField", () => {
    let picture = $("#fileField").get(0).files[0];
    let reader = new FileReader();
    reader.onload = (e) => {
      $("#postPicture").attr("src", e.target.result);
    };
    reader.readAsDataURL(picture);
  });
}

function signupPage() {
  Authentication.refreshSession();
  makeHeader("Signup");

  // handlers
  $("#createUserButton").click(() => {

    let username = $("#createUserName").val();
    let email = $("#createEmail").val();
    let password = $("#createPassword").val();
    let birthday = $("#createBirthday").val();
    let displayName = $("#createDisplayName").val();
    let bio = $("#createBio").val();

    RouteFunctions.createUser(username, birthday, displayName, bio, email, password, (err, response) => {
      if (err) {
        console.log("yes");
        document.getElementById("signUpFailed").style.visibility = "visible";
      }

      else {
        window.location = "confirmation.html";
      }

    });
  });
}

function profilePage(user) {
  $(window).on('hashchange', function () {
    window.location.reload(true);
  });

  Authentication.refreshSession();
  let isAuthenticated = Authentication.isAuthenticated();
  makeHeader(`${user}'s Profile`, isAuthenticated);
  RouteFunctions.loadUserPage(user);
  RouteFunctions.followerCount(user);
  RouteFunctions.followingCount(user);

  if (user === Authentication.getCurrentUsername()) {
    document.getElementById("followButton").style.visibility = "hidden";
    document.getElementById("followedButton").style.visibility = "hidden";
  }

  else {
    document.getElementById("editProfileButton").style.visibility = "hidden";
    console.log("ok");

    isFollowing(Authentication.getCurrentUsername(), user, (err, response) => {

      if (err) {
        console.log("Is not following");
        document.getElementById("followButton").style.visibility = "visible";
        document.getElementById("followedButton").style.visibility = "hidden";

      }

      else if (response) {
        console.log("Is following");
        document.getElementById("followedButton").style.visibility = "visible";
        document.getElementById("followButton").style.visibility = "hidden";
      }

    });

  }

  $('#followButton').click(() => {
    RouteFunctions.follow(user, (err, response) => {
      if (response === null) {
        console.log("yes");
        window.location.reload();
      }
    });
    document.getElementById("followedButton").style.visibility = "visible";
    document.getElementById("followButton").style.visibility = "hidden";
  });

  $('#followedButton').click(() => {
    RouteFunctions.unfollow(user, (err, response) => {
      if (response) {
        console.log("yes");
        window.location.reload();
      }
    });
    document.getElementById("followedButton").style.visibility = "hidden";
    document.getElementById("followButton").style.visibility = "visible";

  });


  $('#followersButton').click(() => {
    window.location.href = "followers.html#" + user;
  });

  $('#followingButton').click(() => {
    window.location.href = "following.html#" + user;
  });

  $('#followerCount').click(() => {
    window.location.href = "followers.html#" + user;
  });

  $('#followingCount').click(() => {
    window.location.href = "following.html#" + user;
  });

  RouteFunctions.loadUserPosts(user);
}

function myProfilePage() {
  let isAuthenticated = Authentication.isAuthenticated();
  if (isAuthenticated) {
    let currentUsername = Authentication.getCurrentUsername();
    userProfilePage(currentUsername, isAuthenticated);
    return;
  }
  handleUnauthorized("Log in before viewing your own profile page!");
}


function editProfilePage(displayName, bio) {
  let isAuthenticated = Authentication.isAuthenticated();
  if (!isAuthenticated) {
    handleUnauthorized("Log in before editing your profile!");
  }
  // todo: check if post belongs to user before coming to edit page
  makeHeader(`Editing Profile`, isAuthenticated);
  RouteFunctions.loadUserEdit(Authentication.getCurrentUsername());
  $('#editProfileButton').click(() => {
    console.log(document.getElementById('editProfileDisplayName').value);
    RouteFunctions.editProfile(document.getElementById('editProfileDisplayName').value, document.getElementById('editProfileBio').value, (err, response) => {
      if (err) {
        console.log(err);
      }
      else {
        let profileLocation = "profilepage.html#" + Authentication.getCurrentUsername();
        window.location = profileLocation;
      }
    });
  });

  $(document).on("change", "#fileField", () => {
    let picture = $("#fileField").get(0).files[0];
    let reader = new FileReader();
    reader.onload = (e) => {
      $("#postPicture").attr("src", e.target.result);
    };
    reader.readAsDataURL(picture);
  });
}

function followerPage(user) {
  Authentication.refreshSession();
  let isAuthenticated = Authentication.isAuthenticated();
  makeHeader(`${user}'s Profile`, isAuthenticated);

  loadFollowers(user);


}

function followingPage(user) {
  Authentication.refreshSession();
  let isAuthenticated = Authentication.isAuthenticated();
  makeHeader(`${user}'s Profile`, isAuthenticated);

  loadFollowing(user);


}

function myProfilePage() {
  let isAuthenticated = Authentication.isAuthenticated();
  if (isAuthenticated) {
    let currentUsername = Authentication.getCurrentUsername();
    userProfilePage(currentUsername, isAuthenticated);
    return;
  }
  handleUnauthorized("Log in before viewing your own profile page!");
}


function getWords(str, n) {
  return str.split(/\s+/).slice(0, n).join(" ");
}

function viewPostPage() {
  Authentication.refreshSession();

  // load post content
  let postId = window.location.hash.substr(1);
  RouteFunctions.viewPost(postId, (err, response) => {
      if (err) {
        console.log(err);
      }

      else {
        // button handlers
        $('#editPostButton').click(() => {
          window.location.href = "editpost.html#" + postId;
        });

        $('#deletePostButton').click(() => {
          RouteFunctions.deletePost(postId).then(() => {
            window.location = "profilepage.html#" + Authentication.getCurrentUsername()
          });
        });
      }
    }
  );
}

function editPostPage(postId, descriptionPart) {
  let isAuthenticated = Authentication.isAuthenticated();
  if (!isAuthenticated) {
    handleUnauthorized("Log in before editing post!");
  }
  // todo: check if post belongs to user before coming to edit page
  makeHeader(`Editing Post: ${descriptionPart}`, isAuthenticated);
  postId = window.location.hash.substr(1);
  console.log(postId);

  RouteFunctions.loadPostEdit(postId);
  $('#submitPostButton').click(() => {
    console.log(postId, document.getElementById('postText').value);
    RouteFunctions.editPost(postId, document.getElementById('postText').value, (err, response) => {
      if (err) {
        console.log("unable to upload");
      }

      else {
        window.location = "viewpost.html#" + response.id;
      }
    });
  });

  $(document).on("change", "#fileField", () => {
    let picture = $("#fileField").get(0).files[0];
    let reader = new FileReader();
    reader.onload = (e) => {
      $("#postPicture").attr("src", e.target.result);
    };
    reader.readAsDataURL(picture);
  });

}

// util functions
function handleDeletePost(postId) {
  RouteFunctions.deletePost(postId).then(() => {
    window.location.reload();
  });
}

function handleViewPost(postId) {
  window.location = `viewpost.html#${postId}`
}

function handleEditPost(postId) {
  window.location = `editpost.html#${postId}`;
}

function handleUnauthorized(message) {
  console.log(message); // todo: error banner
  window.location = "login.html";
}
