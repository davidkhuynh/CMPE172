from flask import request

from server import app
from server.db import users, posts
from server.utils import pic_utils, db_utils
from server.utils.http_utils import success, failure

### home routes
@app.route("/create_post", methods=["GET", "POST"])
def create_post():
    """
        1. add new post to request.database
        2. upload image to s3
    """

    request_data = request.get_json()

    # update db with new post
    picture_filename = request.files["pictureFile"].filename if "pictureFile" in request.files else ""
    new_post = posts.create_post(request_data["current_user"], picture_filename, request_data["text"])
    if not new_post:
        failure("post creation failure (potentially db error)")

    # upload picture
    if "pictureFile" in request.files \
            and not pic_utils.upload_post_picture(request.files["pictureFile"], new_post["id"]):
        posts.delete_post(new_post["id"])
        return failure("failed to upload post picture")

    return success(new_post)


@app.route("/post/<post_id>", methods=["GET", "POST"])
def post(post_id: str):
    """
        1. get post from db and format to json to return
    """
    queried_post = posts.get_post(post_id)
    return success(queried_post) if queried_post else failure("post id %s does not exist" % post_id)


@app.route("/edit_post/<post_id>", methods=["GET", "POST"])
def edit_post(post_id: str):
    """
        1. check if user owns post
        2. get post 
        3. update request.data in post (see create_post)
    """
    # check if user owns post
    request_data = request.get_json()
    current_user = request_data["current_user"]
    queried_post = posts.get_post(post_id)
    if not queried_post or current_user != queried_post["username"]:
        return failure(f"{current_user} does not own this post")

    # if picture is updated, update picture
    picture_filename = request.files["pictureFile"].filename if "pictureFile" in request.files else queried_post["picture"]
    if "pictureFile" in request.files \
            and not pic_utils.upload_post_picture(request.files["pictureFile"], queried_post["id"]):
        return failure("failed to upload post picture")

    # update db
    edited_post = posts.edit_post(post_id, picture_filename, request_data["text"])

    return success(edited_post)


@app.route("/feed", methods=["GET", "POST"])
def feed():
    """
        1. list n most recent posts from people user follows
    """
    request_data = request.get_json()
    queried_posts = db_utils.grab_range_from_db(request_data, posts.feed_posts, username=request_data["current_user"])

    return success(queried_posts)


@app.route("/search/<query>", methods=["GET", "POST"])
def search(query: str):
    """
        1. search users and posts by tag and text        
    """
    request_data = request.get_json()
    queried_posts = db_utils.grab_range_from_db(request_data, posts.search_posts, search_string=query)
    queried_users = db_utils.grab_range_from_db(request_data, users.search_users, username=query)
    response_data = {
        "queriedPosts": queried_posts,
        "queriedUsers": queried_users
    }

    return success(response_data)


### user routes
@app.route("/user/<username>", methods=["GET", "POST"])
def user(username: str):
    """
        1. list user data
    """

    queried_user = users.get_user(username)
    return success(queried_user) if queried_user else failure("user %s does not exist" % username)


@app.route("/user_posts/<username>", methods=["GET", "POST"])
def user_posts(username: str):
    """
        1. list n of user's posts
    """
    request_data = request.get_json()
    queried_posts = db_utils.grab_range_from_db(request_data, posts.user_posts, username=username)

    return success(queried_posts)


@app.route("/create_user", methods=["GET", "POST"])
def create_user():
    request_data = request.get_json()
    if "username" not in request_data or "birthday" not in request_data:
        return failure("username and birthday required to create a new user")

    if "profilePicture" in request.files:
        profile_picture = request.files["profilePicture"]
        if not pic_utils.upload_profile_picture(profile_picture, request_data["username"]):
            return failure("file is not an image or is too big")

    # update db
    user_params = db_utils.User(
        username=request_data["username"],
        birthday=request_data["birthday"],
        first_name=request_data["firstName"],
        last_name=request_data["lastName"],
        bio=request_data["bio"]
    )
    new_user = users.create_user(user_params)

    return success(new_user)

@app.route("/follow/<user_to_follow>", methods=["GET", "POST"])
def follow(user_to_follow: str):
    request_data = request.json()
    current_user = request_data["current_user"]
    return success(users.follow(current_user, user_to_follow))

@app.route("/edit_user/<username>", methods=["GET", "POST"])
def edit_user(username: str):
    request_data = request.get_json()

    # verify that the current user matches username before editing user data
    current_user = request_data["current_user"]
    if current_user != username:
        failure("you can only edit your own profile!")

    # if profile picture is uploaded, update picture
    if "profilePicture" in request.files:
        profile_picture = request.files["profilePicture"]
        if not pic_utils.upload_profile_picture(profile_picture, username):
            return failure("profile pic file is not an image or is too big")

    # update db
    user_data = db_utils.User(
        first_name=request_data["firstName"],
        last_name=request_data["lastName"],
        bio=request_data["bio"]
    )
    edited_user = users.edit_user(username, user_data)

    return success(edited_user)


@app.route("/following/<username>", methods=["GET", "POST"])
def following(username: str):
    """
        1. list n of user's follows
    """
    request_data = request.get_json()
    queried_followings = db_utils.grab_range_from_db(request_data, users.following, username=username)

    return success(queried_followings)


@app.route("/followers/<username>", methods=["GET", "POST"])
def followers(username: str):
    """
        1. list n of user's followers
    """
    request_data = request.get_json()
    queried_followers = db_utils.grab_range_from_db(request_data, users.followers, username=username)

    return success(queried_followers)
