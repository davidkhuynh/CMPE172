from server import app
from server.s3 import upload_picture
from server.db import users, posts
from server.import *

from flask import request, abort

@app.route("/create_post", methods=["GET","POST"])
def create_post():
    """
        1. add new post to request.database
        2. upload image to s3
    """

    request_data = request.get_json()
    post = posts.create_post(request_data)

    if "picture_file" in request.files:
        picture_file = request.files["picture_file"]
        if not update_picture(picture_file, post["id"]):
            return failure("file is not an image or is too big")

    return success(post)

@app.route("/post/<id>", methods=["GET","POST"])
def post(id: str):
    """
        1. get post from db and format to json to return
    """
    post = posts.get_post(id)
    return success(post) if post else failure("post id %s does not exist" % id)


@app.route("/edit_post/<id>", methods=["GET","POST"])
def edit_post(id: str):
    """
        1. check if user owns post
        2. get post 
        3. update request.data in post (see create_post)
    """
    # check if user owns post
    request_data = request.get_json()
    post = posts.get_post(id)
    if not post or request_data["username"] != post["username"]:
        return 

    # if picture is updated, update picture
    if "picture_file" in request.files:
        picture_file = request.files["picture_file"]
        if not update_picture(picture_file, id):
            return failure("file is not an image or is too big")

    # update db
    post = posts.edit_post(id, request_data)

    return success(post)


@app.route("/feed", methods=["GET","POST"])
def feed():
    """
        1. list n most recent posts from people user follows
    """
    request_data = request.get_json()
    queried_posts = grab_range_from_db(request_data, posts.feed_posts, username=username)

    return queried_posts

@app.route("/search/<query>", methods=["GET","POST"])
def search(query: str):
    """
        1. search users and posts by tag and text        
    """
    request_data = request.get_json()
    queried_posts = grab_range_from_db(request_data, posts.search_posts, search_string=query)
    queried_users = grab_range_from_db(request_data, users.search_users, username=query)
    response_data = {
            "queriedPosts" : queried_posts,
            "queriedUsers" : queried_users
    }
    
    return success(response_data)

@app.route("/user/<username>", methods=["GET","POST"])
def user(username: str):
    """
        1. list user data
    """
    user = users.get_user(username)
    return success(user) if user else failure("user %s does not exist" % username)


@app.route("/user_posts/<username>", methods=["GET","POST"])
def user_posts(username: str):
    """
        1. list n of user's posts
    """
    request_data = request.get_json()
    queried_posts = grab_range_from_db(request_data, posts.user_posts, username=username)

    return success(queried_posts)

@app.route("/edit_user/<username>"), methods=["GET", "POST"])
def edit_user(username: str):
    request_data = request.get_json()
    if request_data["current_user"] != username:
        failure("you can only edit your own profile!")

    # TODO code for editing user profile data
    return success("edit user")

@app.route("/following/<username>", methods=["GET","POST"])
def following(username: str):
    """
        1. list n of user's follows
    """
    request_data = request.get_json()
    queried_followings = grab_range_from_db(request_data, users.following, username=usernam)

    return success(queried_followings)

@app.route("/followers/<username>", methods=["GET","POST"])
def followers(username: str):
    """
        1. list n of user's followers
    """
    request_data = request.get_json()
    queried_followers = grab_range_from_db(request_data, users.followers, username=usernam)

    return success(queried_followers)
