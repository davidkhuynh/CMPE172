let LOCAL_URL = "http://0.0.0.0:5000";
let EC2_URL = "http://s3.fumblr.club";
let SERVER_URL = LOCAL_URL;
let IMAGE_HOST_URL = "http://d35f612x9d99xv.cloudfront.net/"; // this needs a slash at the end

function ajax(arg) {
  return $.ajax({
    beforeSend: (xhr) => {
      xhr.setRequestHeader("Content-Type", "application/json");
    },
    url: arg.url,
    type: arg.type,
    data: "data" in arg ? JSON.stringify(arg.data) : "",
    dataType: "json",
    contentType: "application/json; charset=utf-8",
  }).done(arg.onSuccess).fail(arg.onFailure);
}

function getCurrentUser() {
  console.log($.post(SERVER_URL + "/get_current_user"));
}

function createUserWithProfilePicture(username, birthday, displayName, bio, profilePicture, email, password) {
  postWithFile(
    SERVER_URL + "/create_user",
    profilePicture,
    "profilePicture",
    {
      username: username,
      birthday: birthday,
      displayName: displayName,
      bio: bio,
    });
}

const RouteFunctions = {
  createUser: (username, birthday, displayName, bio, email, password, callback) => {
    Authentication.signUpUser(username, email, password, (err, result) => {
      console.log(username, email, password);
      if (err) {
        console.log("error adding user to backend secrets...");
        console.log(err);
        callback(err, null);
        return;
      }
      console.log(
        Authentication.authAjax({
          url: SERVER_URL + "/create_user",
          type: "POST",
          data: {
            "username": username,
            "birthday": birthday,
            "displayName": displayName,
            "bio": bio,
          },
          onSuccess: (response) => {
            callback(null, response);
          },
          onFailure: (errorData) => {
            callback(errorData, null);

          }
        })
      );
    });
  },


  __populatePosts: (data) => {
    console.log(data);
    let html_to_append = '';

    $.each(data, function (i, item) {

      let insertViewEditDelete = {insertDelete: false, insertView: true};
      if (item.username === Authentication.getCurrentUsername()) {
        insertViewEditDelete = {insertDelete: true, insertView: true};
      }

      html_to_append += postNode(
        item.id,
        item.username,
        item.picture,
        item.profilePicture,
        item.text,
        insertViewEditDelete
      );
    });

    $(".postRow").html(html_to_append);
  },

  loadFeedPosts: () => {
    Authentication.authAjax(
      {
        url: SERVER_URL + "/feed",
        type: "GET",
        contentType: "application/json; charset=utf-8",
      }
    ).done(RouteFunctions.__populatePosts);
  },


  loadExplorePosts: () => {
    $.ajax(
      {
        url: SERVER_URL + "/explore",
        type: "GET",
        contentType: "application/json; charset=utf-8",
      }
    ).done(RouteFunctions.__populatePosts);
  },

  loadSearchPosts: (searchQuery) => {
    $.ajax(
      {
        url: SERVER_URL + "/search/" + searchQuery,
        type: "GET",
        contentType: "application/json; charset=utf-8",
      }
    ).done(RouteFunctions.__populatePosts);
  },

  loadUserPosts: (username) => {
    $.ajax(
      {
        url: SERVER_URL + "/user_posts/" + username,
        type: "GET",
        contentType: "application/json; charset=utf-8",
      }
    ).done(RouteFunctions.__populatePosts);
  },

  loadUserPage: (username) => {
    ajax({
      url: SERVER_URL + "/user/" + username,
      type: "GET",
      onSuccess: (response) => {
        // update all of the fields
        console.log(response);
        $("#profileDisplayName").html(response.displayName);
        $("#profileUserName").html("@" + response.username);
        $("#profileBio").html(response.bio);
        if (response.profilePicture === null) {
          $("#profilePicture").attr("src", "img/user-icon.svg");
        }

        else {
          $("#profilePicture").attr("src", IMAGE_HOST_URL + response.profilePicture);
        }
      },
      onFailure: (errorData) => {
        console.log(errorData)
      }
    });
  },

  loadUserEdit: (username) => {
    ajax({
      url: SERVER_URL + "/user/" + username,
      type: "GET",
      onSuccess: (response) => {
        // update all of the fields
        console.log(response);
        document.getElementById('editProfileDisplayName').value = response.displayName;
        document.getElementById('editProfileBio').value = response.bio;

        if (response.profilePicture === null){
        $("#postPicture").attr("src", "img/user-icon.svg");
        }

        else {
        $("#postPicture").attr("src", IMAGE_HOST_URL + response.profilePicture);
        }
      },
      onFailure: (errorData) => {
        console.log(errorData)
      }
    });
  },

  unfollow: (username, callback) => {
    Authentication.authAjax({
      url: SERVER_URL + "/unfollow/" + username,
      type: "GET",
      onSuccess: (response) => {
        console.log(response);
        callback(null, response);
      },
      onFailure: (errorData) => {
        console.log(errorData)
        callback(errorData, null);
      }
    });
  },

  follow: (userToFollow, callback) => {
    Authentication.authAjax({
      url: SERVER_URL + "/follow/" + userToFollow,
      type: "GET",
      onSuccess: (response) => {
        // update all of the fields
        console.log(response);
        callback(null, response);
      },
      onFailure: (errorData) => {
        console.log(errorData)
        callback(errorData, null);
      }
    });
  },

  followers: (username) => {
    ajax({
      url: SERVER_URL + "/followers/" + username,
      type: "GET",
      onSuccess: (response) => {
        $("#follower").html(response);

        console.log(response);
      },
      onFailure: (errorData) => {
        console.log(errorData)
      }
    });
  },

  following: (username) => {
    ajax({
      url: SERVER_URL + "/following/" + username,
      type: "GET",
      onSuccess: (response) => {
        $("#following").html(response);
        console.log(response);
      },
      onFailure: (errorData) => {
        console.log(errorData)
      }
    });
  },

  followerCount: (username) => {
    ajax({
      url: SERVER_URL + "/followers/" + username,
      type: "GET",
      onSuccess: (response) => {
        $("#followerCount").html(response.length);

        console.log(response);
      },
      onFailure: (errorData) => {
        console.log(errorData)
      }
    });
  },

  followingCount: (username) => {
    ajax({
      url: SERVER_URL + "/following/" + username,
      type: "GET",
      onSuccess: (response) => {
        $("#followingCount").html(response.length);
        console.log(response);
      },
      onFailure: (errorData) => {
        console.log(errorData)
      }
    });
  },

  __uploadProfilePicture: () => {
    // return if no file in upload field
    if ($("#fileField").val() === '')
      return Promise.resolve("no file");

    return Authentication.authFileUpload({
      url: SERVER_URL + "/upload_profile_picture",
      uploadForm: $("#uploadForm")
    });
  },

  editProfile: (displayName, bio, callback) => {
    Authentication.authAjax({
      url: SERVER_URL + "/edit_profile",
      type: "POST",
      data: {
        "displayName": displayName,
        "bio": bio,
      },
      onSuccess: (response) => {
        // update all of the fields
        console.log(response);
        RouteFunctions.__uploadProfilePicture()
          .then(() => {
            callback(null, response);
          });
      },
      onFailure: (errorData) => {
        console.log(errorData);
        console.log(displayName);
        console.log(bio);
        callback(errorData, null);

      }
    });
  },

  __uploadPostImage: (postId) => {
    // return if no file in upload field
    if ($("#fileField").val() === '')
      return Promise.resolve("no file");

    return Authentication.authFileUpload({
      url: SERVER_URL + "/update_post_picture/" + postId,
      uploadForm: $("#uploadForm"),
    });
  },

  createPost: (text, callback) => {
    Authentication.authAjax({
      url: SERVER_URL + "/create_post",
      type: "POST",
      data: {
        "text": text,
      },
      onSuccess: (response) => {
        // update all of the fields
        console.log(response);
        RouteFunctions.__uploadPostImage(response.id)
          .then(() => {
            callback(null, response);
          });
      },
      onFailure: (errorData) => {
        console.log(errorData);
        callback(errorData, null);
      }
    });
  },

  editPost: (postId, text, callback) => {
    Authentication.authAjax({
      url: SERVER_URL + "/edit_post/" + postId,
      type: "POST",
      data: {
        "text": text,
      },
      onSuccess: (response) => {
        console.log(response);
        RouteFunctions.__uploadPostImage(postId)
          .then(() => {
            callback(null, response);
          });
      },
      onFailure: (errorData) => {
        console.log(errorData);
        callback(errorData, null);
      }
    });
  },

  viewPost: (postId, callback) => {
    ajax({
      url: SERVER_URL + "/post/" + postId,
      type: "GET",
      onSuccess: (postData) => {
        // update all of the fields
        console.log(postData);
        makeHeader(getWords(postData.text, 5), "none");

        let profilePictureURL = postData.profilePicture != null ? IMAGE_HOST_URL+postData.profilePicture : "img/user-icon.svg";

        $("#postUser").text(postData.username);
        $("#postUser").attr("href", "profilepage.html#" + postData.username);
        $("#postText").text(postData.text);
        $("#profilePicture").attr("src", profilePictureURL);
        if (postData.username === Authentication.getCurrentUsername()) {
          $("#postAdmin").append(`
            <div class="col-xs-4 offset-xs-2 col-xl-3 offset-xl-3">
              <a class="link-button btn subscribe" id="editPostButton" title="">EDIT</a>
            </div>
            `);
          $("#postAdmin").append(`
            <div class="col-xs-4 col-xl-3">
              <a class="link-button btn subscribe" id="deletePostButton" title="">DELETE</a>
            </div>
            `);
          $("#editPostButton").attr("value", postData.id);
          $("#deletePostButton").attr("value", postData.id);
          callback(null, postData);

          if (postData.picture) {
            let pictureURL = IMAGE_HOST_URL + postData.picture;
            console.log(pictureURL);
            $("#postPicture").attr("src", pictureURL);
          } else {
            $("#postPicture").hide();
          }
        }
      },
      onFailure: (errorData) => {
        callback(errorData, null)
      }
    });
  },

  loadPostEdit: (postId) => {
    ajax({
      url: SERVER_URL + "/post/" + postId,
      type: "GET",
      onSuccess: (postData) => {
        document.getElementById('postPicture').value = postData.username;
        document.getElementById('postText').value = postData.text;


          if (postData.picture)
          {
            let pictureURL = IMAGE_HOST_URL + postData.picture;
            console.log(pictureURL);
            $("#postPicture").attr("src", pictureURL);
          } else
          {
            $("#postPicture").hide();
          }
      }
    });
  },

  deletePost: (postId) => {
    return Authentication.authAjax({
      url: SERVER_URL + "/delete_post/" + postId,
      type: "POST",
    });
  },

  search: (query) => {
    ajax({
      url: SERVER_URL + "/search/" + query,
      type: "POST",
      onSuccess: (response) => {
        // update all of the fields
        console.log(response);
      },
      onFailure: (errorData) => {
        console.log(errorData)
      }
    });
  }

};
//for uploadpost.html
function createPost(user, text) {
  console.log(
    $.post(SERVER_URL + "/create_post",
      {
        currentUser: user,
        text: text,
      },
      (postData) => {
        handleViewPost(postData.id);
      }
    )
  );
}

// options: {insertDelete: true, insertView: true}
function postNode(postId, username, picture, profilePicture, text, options) {
  console.log("picture");
  console.log(picture);
  console.log("profile picture");
  console.log(profilePicture);

  let profilePictureURL = profilePicture != null ? IMAGE_HOST_URL+profilePicture : "img/user-icon.svg";
  let userPart =
    `<div class="subgrid">
        <div class="row subgrid-row-2">
          <div class="col-xs-1 col-m-1 col-lg-1 col-xl-1 offset-xs-1 offset-m-1 offset-lg-1 offset-xl-1">
            <div class="responsive-picture picture-2">
              <picture>
                <img alt="${username}" src="${profilePictureURL}">
              </picture>
            </div>
          </div>
          <div class="col-xs-2 col-m-2 col-lg-2 col-xl-2">
            <a class="link-text text-link-1 profileUsername" href="profilepage.html#${username}"> ${username} </a>
          </div>
        </div> 
      </div>`;

  let deleteButton =
    `<a onclick="handleDeletePost('${postId}')" class="link-button btn viewbtn deletePostButton" value=" ${postId} + " title="">Delete Post</a>`;

  let viewButton =
    `<a onclick="handleViewPost('${postId}')" class="link-button btn viewbtn viewPostButton" name=" ${username} + " value=" ${postId} + " title="">View Post</a>`;

  let editButton =
    `<a onclick="handleEditPost('${postId}')" class="link-button btn viewbtn editPostButton" name=" ${username} + " value=" ${postId} + " title="">Edit Post</a>`;

  let actionsPart = "";

  if (options.insertDelete) {
    actionsPart += deleteButton;
  }
  if (options.insertView) {
    actionsPart += viewButton;
  }

  if (options.insertDelete) {
    actionsPart += editButton;
  }

  let postPart =
    `<div class="subgrid">
            ` + ((picture != null) ?
        `<div class="row subgrid-row-1">
          <div class="col-xs-11 col-m-11 col-lg-11 col-xl-10 offset-xs-1 offset-m-1 offset-lg-1 offset-xl-1">
            <div class="responsive-picture picture-1">
                <picture>
                  <img alt="${text}" src=" ${IMAGE_HOST_URL + picture}" >
                </picture>
            </div>
          </div>
        </div>` : '') +
        `<div class="row subgrid-row-2">
          <div class="col-xs-12 col-xl-12">
            <p class="paragraph paragraph-2"> ${text} </p>
          </div>
          <div class="col-xs-4 col-m-4 col-lg-4 col-xl-4 offset-xs-1 offset-m-1 offset-lg-1 offset-xl-1">
            ${actionsPart}
          </div>
        </div>
      </div>`;


  return `<div class="col-xs-12 offset-xl-1 col-xl-10 column-3"> 
        ${userPart} 
        ${postPart}
      </div>
     `;
}

function followNode(username) {
  let userPart =
    `<div class="subgrid">
        <div class="row subgrid-row-2">
          <div class="col-xs-12 offset-xs-1 col-md-2 col-lg-12">
            <div class="responsive-picture picture-2">

            </div>
          </div>
          <div class="col-xs-6 col-lg-12">
            <a class="link-text text-link-1 profileUsername" href="profilepage.html#${username}"> ${username} </a>
          </div>

        </div> 
      </div>`;

  let deleteButton =
    `<a class="link-button btn viewbtn deletePostButton" value="  + " title="">Delete Post</a>`;

  let viewButton =
    `<a class="link-button btn viewbtn viewPostButton" name=" ${username} + " value=" + " title="">View Post</a>`;

  let actionsPart = "";


  return `<div class="col-xs-12 offset-xl-1 col-xl-10 column-3"> 
        ${userPart} 
      </div>
     `;
}


function loadFollowers(username) {
  $.ajax(
    {
      url: SERVER_URL + "/followers/" + username,
      type: "GET",
    }
  ).done(
    (data) => {
      let html_to_append = '';

      $.each(data, function (i, item) {
        html_to_append += followNode(
          item,
        );
      });
      $(".postRow").html(html_to_append);
    });
}

function loadFollowing(username) {
  $.ajax(
    {
      url: SERVER_URL + "/following/" + username,
      type: "GET",
    }
  ).done(
    (data) => {
      let html_to_append = '';

      $.each(data, function (i, item) {
        html_to_append += followNode(
          item,
        );
      });
      $(".postRow").html(html_to_append);
    });
}

function isFollowing(username, following, callback) {

  $.ajax(
    {
      url: SERVER_URL + "/following/" + username,
      type: "GET",
    }
  ).done(
    (data) => {

      let isAFollower = false;

      if (data.length == 0) {
        callback(data, null);
      }

      let html_to_append = '';

      $.each(data, function (i, item) {

        if (item == following) {
          console.log("HERE");
          console.log(item);
          console.log(following);
          isAFollower = true;
        }

      });

      console.log(isAFollower);
      if (isAFollower === false) {
        console.log("Is not not following");
        callback(data, null);

      }

      else if (isAFollower === true) {
        console.log("Is is following");
        callback(null, data);
      }
    });
}

function search(query) {
  console.log(
    $.post(SERVER_URL + "/search/" + query,
      {})
  );
}

function follow(user, userToFollow) {

  console.log(
    $.post(SERVER_URL + "/follow/" + userToFollow,
      {
        currentUser: user,
      })
  );
}

function following(user) {

  //user = testUser;
  console.log(
    $.post(SERVER_URL + "/following/" + user,
      {
        currentUser: user,
      })
  );
}

