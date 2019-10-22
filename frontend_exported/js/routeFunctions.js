    let EC2_URL = "http://ec2-54-188-118-157.us-west-2.compute.amazonaws.com:5000";
    let LOCAL_URL = "http://0.0.0.0:5000";
    let SERVER_URL = EC2_URL;


    function createUserTest(username, birthday, firstName, lastName, bio) {
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

    $( document ).ready(function(e) {
        $(".createUserButton").click(function(){
            createUserTest(document.getElementById('createUser').value, document.getElementById('createUserBirthday').value, document.getElementById('createUserFirstName').value, document.getElementById('createUserLastName').value)
        });
    });

    function viewUserData(user) {

    	//user = testUser;
    	console.log(
    		$.post(EC2_URL + "/user/" + user)
    	);

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

    function createPost(user, text) {

    	//user = testUser;
    	//text = testPostText;
    	console.log(
    		$.post(EC2_URL + "/create_post",
    		{
    			currentUser: user,
    			text: text
    		})
    	);

    }

    $( document ).ready(function(e) {
        $(".createPostButton").click(function(){
            createPost(document.getElementById('createUserPost').value, document.getElementById('createPostText').value)
        });
    });

    function viewPost(postId) {

    	//postId = testPostId;
    	console.log(
    		$.post(EC2_URL + "/post/" + postId)
    	);

    }    

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
                $(".homeFeed").html(html_to_append);
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

    function following(user){

    	//user = testUser;
    	console.log(
    		$.post(EC2_URL + "/following/" + user,
    		{
    			currentUser: user,
    		})
    	);
    }      





