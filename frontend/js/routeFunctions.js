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
  createUser: (username, birthday, displayName, bio, email, password) => {
    Authentication.signUpUser(username, email, password, (err, result) => {
      console.log(username, email, password);
      if (err) {
        console.log("error adding user to backend secrets...");
        console.log(err);
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
            console.log(response);
          },
          onFailure: (errorData) => {
            console.log(errorData);

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

      },
      onFailure: (errorData) => {
        console.log(errorData)
      }
    });
  },

  unfollow: (username) => {
    Authentication.authAjax({
      url: SERVER_URL + "/unfollow/" + username,
      type: "GET",
      onSuccess: (response) => {
        console.log(response);
      },
      onFailure: (errorData) => {
        console.log(errorData)
      }
    });
  },

  follow: (userToFollow) => {
    Authentication.authAjax({
      url: SERVER_URL + "/follow/" + userToFollow,
      type: "GET",
      onSuccess: (response) => {
        // update all of the fields
        console.log(response);
      },
      onFailure: (errorData) => {
        console.log(errorData)
      }
    });
  },

  followers: (username) => {
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

  following: (username) => {
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

  editProfile: (displayName, bio, profilePicture) => {
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
      },
      onFailure: (errorData) => {
        console.log(errorData)
        console.log(displayName);
        console.log(bio);
      }
    });
  },

  createPost: (text) => {
    Authentication.authAjax({
      url: SERVER_URL + "/create_post",
      type: "POST",
      data: {
        "text": text,
      },
      onSuccess: (response) => {
        // update all of the fields
        console.log(response);
      },
      onFailure: (errorData) => {
        console.log(errorData)
      }
    });
  },

  deletePost: (postId) => {
    ajax({
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

function editPost(user, postId, text) {
  console.log(
    $.post(SERVER_URL + "/edit_post/" + postId,
      {
        currentUser: user,
        text: text,
      })
  );
}

function postWithFile(url, file, fileField, otherFields, callback = () => {
}) {
  let fd = new FormData();
  fd.append(fileField, file);
  let data = [];
  data.push(otherFields);
  fd.append("data", JSON.stringify(data));
  console.log(
    $.ajax(
      {
        url: url,
        type: "POST",
        processData: false,
        contentType: false,
        data: fd,
        success: callback
      }
    )
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
function postNode(postId, username, picture, text, options) {
  let userPart =
    `<div class="subgrid">
        <div class="row subgrid-row-2">
          <div class="col-xs-3 offset-xs-1 col-md-2">
            <div class="responsive-picture picture-2">
              <picture>
                <img alt="Placeholder Picture" src="img/picture.svg">
              </picture>
            </div>
          </div>
          <div class="col-xs-3">
            <a class="link-text text-link-1 profileUsername"> ${username} </a>
          </div>
          <div class="col-xs-2"><a class="link-button btn viewbtn" title="">Follow</a>
          </div>
        </div> 
      </div>`;

  let deleteButton =
    `<a onclick="handleDeletePost('${postId}')" class="link-button btn viewbtn deletePostButton" value=" ${postId} + " title="">Delete Post</a>`;

  let viewButton =
    `<a onclick="handleViewPost('${postId}')" class="link-button btn viewbtn viewPostButton" name=" ${username} + " value=" ${postId} + " title="">View Post</a>`;

  let actionsPart = "";

  if (options.insertDelete) {
    actionsPart += deleteButton;
  }
  if (options.insertDelete) {
    actionsPart += viewButton;
  }

  let postPart =
    `<div class="subgrid">
        <div class="row subgrid-row-1">
          <div class="col-xs-10 push-xs-0 offset-xs-1">
            <div class="responsive-picture picture-1">
              <picture>
                <img alt="Placeholder Picture" src=" ${IMAGE_HOST_URL + picture}">
              </picture>
            </div>
          </div>
        </div>
        <div class="row subgrid-row-2">
          <div class="col-xs-12 col-xl-12">
            <p class="paragraph paragraph-2"> ${text} </p>
          </div>
          <div class="col-xs-8 push-xs-2">
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


//for explore.html
function loadExplorePosts() {
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
        html_to_append += postNode(
          item.id,
          item.username,
          item.picture,
          item.text,
          {insertDelete: true, insertView: true}
        );
      });
      $(".postRow").html(html_to_append);
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