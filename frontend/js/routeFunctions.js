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
        callback(err ,null);
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
        if (response.profilePicture === null){
          $("#profilePicture").attr("src", "img/user-icon.svg");
        }

        else {
          $("#profilePicture").attr("src", response.profilePicture);
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

        //if (response.profilePicture === null){
          //$("#fileField").attr("src", "img/user-icon.svg");
        //}

        //else {
          //$("#fileField").attr("src", response.profilePicture);
        //}
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

        $("#postUser").text(postData.username);
        $("#postUser").attr("href", "profilepage.html#" + postData.username);
        $("#postText").text(postData.text);
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

  deletePost: (postId) => {
    Authentication.authAjax({
      url: SERVER_URL + "/delete_post/" + postId,
      type: "POST",
      onSuccess: (response) => {
        // update all of the fields
        console.log(response);
      },
      onFailure: (errorData) => {
        console.log(errorData)
      }
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

function viewUserProfile(user) {

  $.post(SERVER_URL + "/user/" + user, function (user_data) {
    console.log(user_data);
    let profile_html_to_append = '';
    profile_html_to_append += `'<div class="col-xs-12 column-1 col-xl-6 offset-xl-3">
                              '<div class="subgrid">
                                '<div class="row">
                                  '<div class="col-xs-4">
                                    '<div class="responsive-picture">
                                      '<picture><img alt="Placeholder Picture" src="img/picture.svg">
                                      '</picture>
                                    '</div>
                                  '</div>
                                  '<div class="col-xs-8 custom-380-col-xs-6">
                                    '<h4> user_data.username + '</h4>
                                  '</div>
                                  '<div class="col-xs-4"><a class="link-button btn follow" href="" title="" id="followButton">Follow</a>
                                  '</div>
                                  '<div class="col-xs-4"><a class="link-button btn follow" href="editProfile.html" title="" id="editProfileButton">Edit Profile</a>
                                  '</div>
                                '</div>
                                '<div class="row">
                                  '<div class="col-xs-12"></div>
                                '</div>
                                '<div class="row">
                                  '<div class="col-xs-6">
                                    '<h4>FOLLOWERS</h4>
                                  '</div>
                                  '<div class="col-xs-6">
                                    '<h4>FOLLOWING</h4>
                                  '</div>
                                  '<div class="col-xs-6">
                                    '<h4 id="followerCount">#</h4>
                                  '</div>
                                  '<div class="col-xs-6">
                                    '<h4 id="followingCount">#</h4>
                                  '</div>
                                '</div>
                              '</div>
                            '</div>'`;
    $(".userProfileInformation").html(profile_html_to_append);
    loadExplorePosts(user);
  });

}

function editProfile(user, displayName, bio, profilePicture) {

  console.log(
    $.post(SERVER_URL + "/edit_profile",
      {
        currentUser: user,
        displayName: displayName,
        bio: bio
        //profilePicture
      })
  );
}

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

function createPostWithPicture(user, picture, text) {
  postWithFile(
    SERVER_URL + "/create_post",
    picture,
    "pictureFile",
    {
      currentUser: user,
      text: text
    },
    (postData) => {
      handleViewPost(postData.id);
    }
  );
}

function editPost(postId, text) {
  console.log(
    $.post(SERVER_URL + "/edit_post/" + postId,
      {
        text: text,
      })
  );
}

function editPostWithPicture(user, postId, picture, text) {
  postWithFile(`${SERVER_URL}/edit_post/${postId}`, picture, "pictureFile",
    {
      currentUser: user,
      text: text
    });
}

function deletePost(postId) {
  console.log(postId);
  $.post(SERVER_URL + "/delete_post/" + postId);
}

// options: {insertDelete: true, insertView: true}
function postNode(postId, username, picture, profilePicture, text, options) {
  console.log("picture");
  console.log(picture);
  let userPart =
    `<div class="subgrid">
        <div class="row subgrid-row-2">
          <div class="col-xs-1 col-m-1 col-lg-1 col-xl-1 offset-xs-1 offset-m-1 offset-lg-1 offset-xl-1">
            <div class="responsive-picture picture-2">
              <picture>
                <img alt="${username}" src="${profilePicture != null ? profilePicture : "img/user-icon.svg"}">
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
        <div class="row subgrid-row-1">
          <div class="col-xs-11 col-m-11 col-lg-11 col-xl-10 offset-xs-1 offset-m-1 offset-lg-1 offset-xl-1">
            <div class="responsive-picture picture-1">
              <picture>
                <img alt="${text}" src=" ${picture != null ? IMAGE_HOST_URL + picture : ""}">
              </picture>
            </div>
          </div>
        </div>
        <div class="row subgrid-row-2">
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


//for explore.html
function loadExplorePosts(username) {
  $.ajax(
    {
      url: SERVER_URL + "/explore",
      type: "GET",
      contentType: "application/json; charset=utf-8",
    }
  ).done(
    (data) => {
      console.log("got explore posts")
      console.log(data);
      let html_to_append = '';

      $.each(data, function (i, item) {

        let insertViewEditDelete = {insertDelete: false, insertView: true};
        if (item.username == username) {
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
    });
}

function loadUserPosts(username) {
  $.ajax(
    {
      url: SERVER_URL + "/user_posts/" + username,
      type: "GET",
      contentType: "application/json; charset=utf-8",
    }
  ).done(
    (data) => {
      console.log("got explore posts")
      console.log(data);
      let html_to_append = '';

      $.each(data, function (i, item) {

        let insertViewEditDelete = {insertDelete: false, insertView: true};
        if (item.username == username) {
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
    });
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

function redirect() {
  $('.profileUsername').click(function () {
    alert($(this).text());
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


/* index.html
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  <script src="js/routeFunctions.js"></script>
  <script> loadExplorePosts("db_test2") </script>
  <script> getCurrentUser() </script>
*/

/* signup.html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  <script src="js/routeFunctions.js"></script>
  <script>
      $( document ).ready(function() {

        let createUserButton = document.getElementById("createUserButton");

        createUserButton.onclick = function(){


          signUpUser(document.getElementById('createUserName').value, document.getElementById('createEmail').value, document.getElementById('createPassword').value, (err, response) => {
              if (err) {
                console.log(err);
              }
          });


        };
    });
  </script>

      <!-- Bootstrap's JavaScript dependencies -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>

    <!-- Cognito User Pool related code -->
    <script type="text/javascript" src="js/amazon-cognito-identity.min.js"></script>
    <script type="text/javascript" src="js/authentication.js"></script>
    <script type="text/javascript" src="js/user-interface.js"></script>
  <script src="js/jquery.min.js"></script>
  <script src="js/outofview.js"></script>
  <script src="js/tether.min.js"></script>
  <script src="js/bootstrap.min.js"></script>
*/

/* editprofile.html
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  <script src="js/routeFunctions.js"></script>
  <script>
    $( document ).ready(function() {

        let editProfileButton = document.getElementById("editProfileButton");
        editProfileButton.onclick = function(){
          editProfile("davidkhuynh", document.getElementById('editFirstName').value, document.getElementById('editLastName').value, document.getElementById('editBio').value);
        }

    });
  </script>
*/

/* viewpost.html
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  <script src="js/routeFunctions.js"></script>
  <script>
    let queryString = window.location.hash.substring(1);
    let splitString = queryString.split("&");
    let user = splitString[0];
    let id = splitString[1];

    viewPost(user,id);
  </script>
*/

/* profilepage.html
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  <script src="js/routeFunctions.js"></script>
  <script>
  let userProfile = window.location.hash.substring(1);
  viewUserProfile(userProfile);
  </script>
*/


/* signup.html do not use, still trying to figure out how to upload pictures
<script>
    $( document ).ready(function() {

      let createUserButton = document.getElementById("createUserButton");
      createUserButton.onclick = function(){

        //let fd = new FormData();
        //let files = $('#createProfilePicture')[0].files[0];
        //fd.append('file', files);

        //console.log(fd);
        //createUser(document.getElementById('createUserName').value, document.getElementById('createBirthday').value,document.getElementById('createFirstName').value, document.getElementById('createLastName').value, document.getElementById('createBio').value);
        //createUser("dan", "1996-12-11", "tsk", "toe", "til");
      }
  });
</script>
*/

/* confirmation.html
<script src="js/jquery.min.js"></script>
<script src="js/outofview.js"></script>
<script src="js/tether.min.js"></script>
<script src="js/bootstrap.min.js"></script>

<script>

      $( document ).ready(function() {

      let confirmationButton = document.getElementById("confirmationButton");
      confirmationButton.onclick = function(){
            getUser(document.getElementById("confirmUser").value).confirmRegistration(document.getElementById("confirmCode").value, true,  (err, response) => {if (err) {
              console.log(err);
            }});

      };

  });

</script>

      <!-- Bootstrap's JavaScript dependencies -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>

  <!-- Cognito User Pool related code -->
  <script type="text/javascript" src="js/amazon-cognito-identity.min.js"></script>
  <script type="text/javascript" src="js/authentication.js"></script>
  <script type="text/javascript" src="js/user-interface.js"></script>

*/

/*
  <!-- Cognito User Pool related code -->
  <script type="text/javascript" src="js/amazon-cognito-identity.min.js"></script>
  <script type="text/javascript" src="js/authentication.js"></script>
  <script type="text/javascript" src="js/user-interface.js"></script>

  <script>

      $( document ).ready(function() {

      let loginButton = document.getElementById("loginButton");
      loginButton.onclick = function(){
            console.log(
              signInUser(
                document.getElementById("loginUser").value,
                document.getElementById("loginPassword").value,
                (err, response) =>
                {
                  if (err) {
                    console.log(err);
                  }
                }
              )
            );
      };

  });

</script>
*/