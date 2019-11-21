import datetime
from uuid import uuid4

from flask import request

import server.data.users
from server import app, db, cognito
from server.data.posts import Post
from server.utils import pic_utils, db_utils
from server.utils.http_utils import success, failure
from server.utils.pic_utils import UploadState


### home routes
@app.route("/post/<post_id>", methods=["GET"])
def post(post_id: str):
    """
        1. get post from secrets and format to json to return
    """
    queried_post: Post = db.posts.get_post(post_id)
    return success(queried_post) if queried_post else failure("post id %s does not exist" % post_id)

@app.route("/create_post", methods=["POST"])
@cognito.auth_required
def create_post():
    """
        request body:
            text

        1. upload image to s3
        2. add new post to request.database
    """

    # update secrets with new post
    new_post = db.posts.create_post(cognito.current_user, request.json["text"])
    return success(new_post)


@app.route("/update_post_picture/<post_id>", methods=["POST"])
@cognito.auth_required
def update_post_picture(post_id: str):
    """
    file: pictureFile
    :param post_id:
    :return:
    """
    # todo check duplicates (highly unlikely)
    upload_info = pic_utils.upload_post_picture(request, str(uuid4()))
    if upload_info.upload_state == UploadState.failure:
        failure("failed to upload image")
    if upload_info.upload_state == UploadState.no_upload:
        failure("no picture uploaded")
    db.posts.update_post_picture(post_id, upload_info.filename)
    success(f"uploaded post image for {post_id}")


@app.route("/edit_post/<post_id>", methods=["POST"])
@cognito.auth_required
def edit_post(post_id: str):
    """
        request body:
            text

        1. check if user owns post
        2. get post 
        3. update request.data in post (see create_post)
    """
    # check if user owns post
    queried_post = db.posts.get_post(post_id)
    if not queried_post or cognito.current_user != queried_post.username:
        return failure(f"{cognito.current_user} does not own this post")

    # update secrets
    edited_post = db.posts.edit_post(post_id, request.json["text"])
    return success(edited_post)


@app.route("/delete_post/<post_id>", methods=["POST"])
@cognito.auth_required
def delete_post(post_id: str):
    """
    :param post_id:
    :return:
    """

    queried_post: Post = db.posts.get_post(post_id)
    if not queried_post or cognito.current_user != queried_post.username:
        return failure(f"{cognito.current_user} does not own this post, cannot delete")

    db.posts.delete_post(post_id)
    return success({})


@app.route("/explore", methods=["GET"])
def explore():
    """
        1. list n most recent posts (todo: random)
    """
    queried_posts = db_utils.grab_range_from_db(None, db.posts.all_posts)
    return success(queried_posts)


@app.route("/feed", methods=["GET"])
@app.route("/feed/<sort_by>", methods=["GET"])
@app.route("/feed/<sort_by>/<int:first>", methods=["GET"])
@cognito.auth_required
def feed(sort_by: str="mostRecent", first: int=0):
    """
        1. list n most recent posts from people user follows
    """
    # todo: followers etc
    queried_posts = db_utils.grab_range_from_db(request.json, db.posts.all_posts)

    return success(queried_posts)


@app.route("/search/<query>", methods=["GET"])
def search(query: str):
    """
        request body:
            <none>

        1. search users and posts by tag and text        
    """
    queried_posts = db_utils.grab_range_from_db(request.json, db.posts.search_posts, search_string=query)
    queried_users = db_utils.grab_range_from_db(request.json, db.users.search_users, username=query)
    response_data = {
        "queriedPosts": queried_posts,
        "queriedUsers": queried_users
    }

    return success(response_data)


### user routes
@app.route("/user/<username>", methods=["GET"])
def user(username: str):
    """
        request body:
            <none>

        1. list user data
    """

    queried_user = db.users.get_user(username)
    return success(queried_user) if queried_user else failure("user %s does not exist" % username)


@app.route("/user_posts/<username>", methods=["GET"])
def user_posts(username: str):
    """
        request body:
            <none>

        1. list n of user's posts
    """
    queried_posts = db_utils.grab_range_from_db(request.json, db.posts.user_posts, username=username)
    return success(queried_posts)


@app.route("/create_user", methods=["POST"])
def create_user():
    """
        request body:
            username, birthday, displayName, bio

        files:
            profilePicture

    """
    if "username" not in request.json or "birthday" not in request.json:
        return failure("username and birthday required to create a new user")

    user_data = server.data.users.User(
        username=request.json["username"],
        birthday=datetime.datetime.strptime(request.json["birthday"], "%Y-%M-%d").date(),
        display_name=request.json["displayName"],
        bio=request.json["bio"]
    )
    new_user = db.users.create_user(user_data)
    return success(new_user)


@app.route("/upload_user_pic", methods=["POST"])
@cognito.auth_required
def upload_user_pic():
    """
        file: profilePicture
    :return:
    """
    upload_info = pic_utils.upload_profile_picture(request, cognito.current_user)
    if upload_info.upload_state == UploadState.success:
        db.users.update_profile_picture(cognito.current_user)
        return success(f"updated profile picture for {cognito.current_user}")

    if upload_info.upload_state == UploadState.no_upload:
        return failure("no picture uploaded")

    return failure ("picture upload failure")


@app.route("/edit_profile", methods=["POST"])
@cognito.auth_required
def edit_profile():
    """
        request body:
            firstName, lastName, bio

    """
    user_data = server.data.users.User(
        display_name=request.json["displayName"],
        bio=request.json["bio"]
    )
    edited_user = db.users.edit_user(cognito.current_user, user_data)

    return success(edited_user)


@app.route("/delete_current_user/", methods=["POST"])
@cognito.auth_required
def delete_current_user():
    # delete profile pic from s3
    pic_utils.delete_profile_picture(cognito.current_user)

    # update secrets
    db.users.delete_user(cognito.current_user)

    return success({})


@app.route("/follow/<user_to_follow>", methods=["GET"])
@cognito.auth_required
def follow(user_to_follow: str):
    return success(db.users.follow(cognito.current_user, user_to_follow))


@app.route("/unfollow/<user_to_unfollow>", methods=["GET"])
@cognito.auth_required
def unfollow(user_to_unfollow: str):
    return success(db.users.unfollow(cognito.current_user, user_to_unfollow))


@app.route("/following/<username>", methods=["GET"])
def following(username: str):
    """
        1. list n of user's follows
    """

    queried_followings = db_utils.grab_range_from_db(None, db.users.following, username=username)
    return success(queried_followings)


@app.route("/followers/<username>", methods=["GET"])
def followers(username: str):
    """
        1. list n of user's followers
    """
    queried_followers = db_utils.grab_range_from_db(None, db.users.followers, username=username)

    return success(queried_followers)
