 




    let EC2_URL = "http://ec2-34-221-65-162.us-west-2.compute.amazonaws.com:5000";
    let LOCAL_URL = "http://0.0.0.0:5000";
    let SERVER_URL = EC2_URL;


    function createUser(username, birthday, firstName, lastName, bio) {
    	console.log(
	    	$.post(EC2_URL + "/create_user",
	    	{
		        username: username,
		        birthday: birthday,
		        firstName: firstName,
		        lastName: lastName,
		        bio: bio
		        //profilePicture
     		})
     	);
    }

//for signup.html
    $( document ).ready(function(e) {
        $(".createUserButton").click(function(){
            createUserTest(document.getElementById('createUser').value, document.getElementById('createUserBirthday').value, document.getElementById('createUserFirstName').value, document.getElementById('createUserLastName').value)
        });
    });

    function viewUserData(user) {

    		$.post(EC2_URL + "/user/" + user)

    }

    function editProfile(user, firstName, lastName, bio, profilePicture){

    	console.log(
	    	$.post(EC2_URL + "/edit_profile",
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

//for uploadpost.html
    $( document ).ready(function(e) {
        $(".createPostButton").click(function(){
            createPost(document.getElementById('createUserPost').value, document.getElementById('createPostText').value)
        });
    });

//for viewpost.html
    function viewPost(user, postId) {

    		$.post(EC2_URL + "/post/" + postId, function(post_data){
                console.log(data);
                var html_to_append = '';

                $.post(EC2_URL + "/user/" + user, function(user_data){

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
                            '<a class="link-text text-link-1" href="profilepage.html">' + user_data.username + '</a>'
                });
 
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
                          '<div class="col-xs-2 custom-1260-pull-xl-0 push-xs-2 custom-1260-col-xl-4 custom-1260-push-xl-1"><a class="link-button btn viewbtn" href="viewpost.html" title="">View Post</a>' +
                          '</div>' +
                        '</div>' +
                      '</div>' +
                    '</div>'
            });
                $(".postRow").html(html_to_append);
    };

        

    function editPost(user, postId, text){

  
    	console.log(
    		$.post(EC2_URL + "/edit_post/" + postId,
    		{
    			currentUser: user,
    			text: text
    			//text: text
    			//picturefile
    		})
    	);

    }

//for index.html
    function viewFeed(user){

    	//user = testUser;
 
    		$.post(EC2_URL + "/feed",
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
                              '<picture><img alt="Placeholder Picture" src="' + item.profilePicture + '">' +
                              '</picture>' +
                            '</div>' +
                          '</div>' +
                          '<div class="col-xs-6">' +
                            '<a class="link-text text-link-1" href="profilepage.html">' + item.username + '</a>' +
                          '</div>' +
                        '</div>' + 
                      '</div>' +
                      '<div class="subgrid">' +
                        '<div class="row subgrid-row-1">' +
                          '<div class="col-xs-10 push-xs-0 offset-xs-1">' +
                            '<div class="responsive-picture picture-1">' +
                              '<picture><img alt="Placeholder Picture" src="' + item.picture + '">' +
                              '</picture>' +
                            '</div>' +
                          '</div>' +
                        '</div>' +
                        '<div class="row subgrid-row-2">' +
                          '<div class="col-xs-12 col-xl-12">' +
                            '<p class="paragraph paragraph-2">' + item.text + '</p>' +
                          '</div>' +
                          '<div class="col-xs-2 custom-1260-pull-xl-0 push-xs-2 custom-1260-col-xl-4 custom-1260-push-xl-1"><a class="link-button btn viewbtn" href="viewpost.html" title="">View Post</a>' +
                          '</div>' +
                        '</div>' +
                      '</div>' +
                    '</div>'
                });
                $(".postRow").html(html_to_append);
            });
    	
    }

    function search(query){
    	console.log(
    		$.post(EC2_URL + "/search/" + query,
    		{
    		})
    	);    	
    }

    function follow(user, userToFollow){

    	console.log(
    		$.post(EC2_URL + "/follow/" + userToFollow,
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
    		$.post(EC2_URL + "/following/" + user,
    		{
    			currentUser: user,
    		})
    	);
    }      




/* index.html
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  <script src="js/routeFunctions.js"></script>
  <script> viewFeed("davidkhuynh") </script>
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
