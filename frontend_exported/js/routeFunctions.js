    let EC2_URL = "http://ec2-34-221-65-162.us-west-2.compute.amazonaws.com:5000";
    let LOCAL_URL = "http://0.0.0.0:5000";
    let EC2_bucket_URL = "http://s3.fumblr.club/feed";
    let SERVER_URL = LOCAL_URL;


    function getCurrentUser(){
        console.log($.post(SERVER_URL + "/get_current_user"));
    }

    function createUser(username, birthday, firstName, lastName, bio, pictureFile) {
    	console.log(
	    	$.post(SERVER_URL + "/create_user",
	    	{
		        username: username,
		        birthday: birthday,
		        firstName: firstName,
		        lastName: lastName,
		        bio: bio,
		        //pictureFile: pictureFile
     		})
     	);
    }

//for signup.html
    $( document ).ready(function(e) {
        $(".createUserButton").click(function(){
            createUserTest(document.getElementById('createUser').value, document.getElementById('createUserBirthday').value, document.getElementById('createUserFirstName').value, document.getElementById('createUserLastName').value)
        });
    });

    function viewUserProfile(user) {

    		$.post(SERVER_URL + "/user/" + user, function(user_data){
                console.log(user_data);
                var profile_html_to_append = '';

profile_html_to_append +=   '<div class="col-xs-12 column-1 col-xl-6 offset-xl-3">' +
                              '<div class="subgrid">' +
                                '<div class="row">' +
                                  '<div class="col-xs-4">' +
                                    '<div class="responsive-picture">' +
                                      '<picture><img alt="Placeholder Picture" src="img/picture.svg">' +
                                      '</picture>' +
                                    '</div>' +
                                  '</div>' +
                                  '<div class="col-xs-8 custom-380-col-xs-6">' +
                                    '<h4>' + user_data.username + '</h4>' +
                                  '</div>' +
                                  '<div class="col-xs-4"><a class="link-button btn follow" href="" title="" id="followButton">Follow</a>' +
                                  '</div>' +
                                  '<div class="col-xs-4"><a class="link-button btn follow" href="editProfile.html" title="" id="editProfileButton">Edit Profile</a>' +
                                  '</div>' +
                                '</div>' +
                                '<div class="row">' +
                                  '<div class="col-xs-12"></div>' +
                                '</div>' +
                                '<div class="row">' +
                                  '<div class="col-xs-6">' +
                                    '<h4>FOLLOWERS</h4>' +
                                  '</div>' +
                                  '<div class="col-xs-6">' +
                                    '<h4>FOLLOWING</h4>' +
                                  '</div>' +
                                  '<div class="col-xs-6">' +
                                    '<h4 id="followerCount">#</h4>' +
                                  '</div>' +
                                  '<div class="col-xs-6">' +
                                    '<h4 id="followingCount">#</h4>' +
                                  '</div>' +
                                '</div>' +
                              '</div>' +
                            '</div>'
                $(".userProfileInformation").html(profile_html_to_append);
                viewFeed(user);
            });

    }

    function editProfile(user, firstName, lastName, bio, profilePicture){

    	console.log(
	    	$.post(SERVER_URL + "/edit_profile",
	    	{
		        currentUser: user,
		        firstName: firstName,
		        lastName: lastName,
		        bio: bio
		        //profilePicture
     		})
     	);
    }
//for profilepage.html
    $( document ).ready(function(e) {
        $(".editProfileButton").click(function(){
            editProfile(document.getElementById('editFirstName').value, document.getElementById('editLastName').value, document.getElementById('editBio').value)
        });
    });

    function createPost(user, text) {

    	//text = testPostText;
    	console.log(
    		$.post(EC2_URL + "/create_post",
    		{
    			currentUser: user,
    			text: text
    		})
    	);

    }

//for uploadpost.html not yet
    $( document ).ready(function(e) {
        $(".createPostButton").click(function(){
            createPost(document.getElementById('createUserPost').value, document.getElementById('createPostText').value)
        });
    });

//for viewpost.html
    function viewPost(user, postId) {

    		$.post(SERVER_URL + "/post/" + postId, function(post_data){
                console.log(post_data);
                var html_to_append = '';

                $.post(SERVER_URL + "/user/" + user, function(user_data){

html_to_append +=   '<div class="col-xs-12 offset-xl-1 col-xl-10 column-3">' +
                      '<div class="subgrid">' +
                        '<div class="row subgrid-row-2">' +
                          '<div class="col-xs-3 offset-xs-1 col-md-2">' +
                            '<div class="responsive-picture picture-2">' +
                              '<picture><img alt="Placeholder Picture" src="' + user_data.profilePicture + '">' +
                              '</picture>' +
                            '</div>' +
                          '</div>' +
                          '<div class="col-xs-6">' +
                            '<a class="link-text text-link-1" href="profilepage.html">' + user_data.username + '</a>';
                
html_to_append +=        '</div>' +
                        '</div>' + 
                      '</div>' +
                      '<div class="subgrid">' +
                        '<div class="row subgrid-row-1">' +
                          '<div class="col-xs-10 push-xs-0 offset-xs-1">' +
                            '<div class="responsive-picture picture-1">' +
                              '<picture><img alt="Placeholder Picture" src="' + post_data.picture + '">' +
                              '</picture>' +
                            '</div>' +
                          '</div>' +
                        '</div>' +
                        '<div class="row subgrid-row-2">' +
                          '<div class="col-xs-12 col-xl-12">' +
                            '<p class="paragraph paragraph-2">' + post_data.text + '</p>' +
                          '</div>' +
                          '<div class="col-xs-2 custom-1260-pull-xl-0 push-xs-2 custom-1260-col-xl-4 custom-1260-push-xl-1"><a class="link-button btn viewbtn" href="viewpost.html" title="">View Post</a><a class="link-button btn viewbtn deletePostButton" href="" title="">Delete Post</a>' +
                          '</div>' +
                        '</div>' +
                      '</div>' +
                    '</div>';
                    $(".postRow").html(html_to_append);
                });
            });
    };

        

    function editPost(user, postId, text){

  
    	console.log(
    		$.post(SERVER_URL + "/edit_post/" + postId,
    		{
    			currentUser: user,
    			text: text
    			//text: text
    			//picturefile
    		})
    	);

    }

    function deletePost(postId){
        console.log(postId);
        $.post(EC2_URL + "/delete_post/" + postId);
    }

//for index.html
    function viewFeed(user){

    	//user = testUser;

 
    		$.post(SERVER_URL + "/feed",
    		{
    			currentUser: user,
    		}, function(data){
                console.log(data);
                var html_to_append = '';

                $.each(data, function(i, item)
                {
 
html_to_append +=   '<div class="col-xs-12 offset-xl-1 col-xl-10 column-3">' +
                      '<div class="subgrid">' +
                        '<div class="row subgrid-row-2">' +
                          '<div class="col-xs-3 offset-xs-1 col-md-2">' +
                            '<div class="responsive-picture picture-2">' +
                              '<picture><img alt="Placeholder Picture" src="img/picture.svg">' +
                              '</picture>' +
                            '</div>' +
                          '</div>' +
                          '<div class="col-xs-3">' +
                            '<a class="link-text text-link-1 profileUsername">' + item.username + '</a>' +
                          '</div>' +
                          '<div class="col-xs-2"><a class="link-button btn viewbtn" title="">Follow</a>' +
                          '</div>' +
                        '</div>' +
                      '</div>' +
                      '<div class="subgrid">' +
                        '<div class="row subgrid-row-1">' +
                          '<div class="col-xs-10 push-xs-0 offset-xs-1">' +
                            '<div class="responsive-picture picture-1">' +
                              '<picture><img alt="Placeholder Picture" src="img/picture.svg">' +
                              '</picture>' +
                            '</div>' +
                          '</div>' +
                        '</div>' +
                        '<div class="row subgrid-row-2">' +
                          '<div class="col-xs-12 col-xl-12">' +
                            '<p class="paragraph paragraph-2">' + item.text + '</p>' +
                          '</div>' +
                          '<div class="col-xs-8 push-xs-2"><a class="link-button btn viewbtn deletePostButton" value="' + item.id + '" title="">Delete Post</a><a class="link-button btn viewbtn viewPostButton" name="' + item.username +  '" value="' + item.id + '" title="">View Post</a>' +
                          '</div>' +
                        '</div>' +
                      '</div>' +
                    '</div>'
                });
                $(".postRow").html(html_to_append);
                //$('.profileUsername').click(function() {
                //    alert($(this).text());
                //});
                $('.profileUsername').click(function() {
                    window.location = "profilepage.html#" + $(this).text();
                });

                $('.viewPostButton').click(function() {
                    console.log($(this)[0].getAttribute("value"));
                    window.location = "viewpost.html#" + $(this)[0].getAttribute("name") + '&' + $(this)[0].getAttribute("value") ;
                });

                $('.deletePostButton').click(function() {
                    console.log($(this)[0].getAttribute("value"));
                    deletePost($(this)[0].getAttribute("value"));
                });

            });

    	
    }

    function redirect(){
            $('.profileUsername').click(function() {
            alert($(this).text());
        });
    }

    function search(query){
    	console.log(
    		$.post(SERVER_URL + "/search/" + query,
    		{
    		})
    	);    	
    }

    function follow(user, userToFollow){

    	console.log(
    		$.post(SERVER_URL + "/follow/" + userToFollow,
    		{
    			currentUser: user,
    		})
    	);
    }    

//for followButton
    $( document ).ready(function(e) {
        $(".followButton").click(function(){
            follow(document.getElementById)
        });
    });    

    function following(user){

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
  <script> viewFeed("db_test2") </script>
  <script> getCurrentUser() </script>
*/ 

/* signup.html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  <script src="js/routeFunctions.js"></script>
  <script>
      $( document ).ready(function() {

        var createUserButton = document.getElementById("createUserButton");

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

        var editProfileButton = document.getElementById("editProfileButton");
        editProfileButton.onclick = function(){
          editProfile("davidkhuynh", document.getElementById('editFirstName').value, document.getElementById('editLastName').value, document.getElementById('editBio').value);
          alert("success! check db, select * from Users");
        }

    });
  </script>
*/

/* viewpost.html
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  <script src="js/routeFunctions.js"></script>
  <script> 
    var queryString = window.location.hash.substring(1);
    var splitString = queryString.split("&");
    var user = splitString[0];
    var id = splitString[1];
    
    viewPost(user,id);
  </script>
*/

/* profilepage.html
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  <script src="js/routeFunctions.js"></script>
  <script> 
  var userProfile = window.location.hash.substring(1);
  viewUserProfile(userProfile); 
  </script>
*/




/* signup.html do not use, still trying to figure out how to upload pictures
  <script>
      $( document ).ready(function() {

        var createUserButton = document.getElementById("createUserButton");
        createUserButton.onclick = function(){

          //var fd = new FormData();
          //var files = $('#createProfilePicture')[0].files[0];
          //fd.append('file', files);

          //console.log(fd);
          //createUser(document.getElementById('createUserName').value, document.getElementById('createBirthday').value,document.getElementById('createFirstName').value, document.getElementById('createLastName').value, document.getElementById('createBio').value);
          //createUser("dan", "1996-12-11", "tsk", "toe", "til");
          alert("success! check db, select * from Users");
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

        var confirmationButton = document.getElementById("confirmationButton");
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

        var loginButton = document.getElementById("loginButton");
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