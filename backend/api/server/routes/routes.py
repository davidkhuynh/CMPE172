import datetime
from uuid import uuid4

from flask import request

import server.data.users
from server import app, db, cognito
from server.data import users, posts
from server.utils import pic_utils, db_utils
from server.utils.http_utils import success, failure, get_request_data

### home routes
from server.utils.pic_utils import UploadState

@app.route("/create_post", methods=["POST"])
@cognito.auth_required
def create_post():
    """
        request body:
            text

        files:
            pictureFile


        1. upload image to s3
        2. add new post to request.database
    """


    # upload picture if it exists
    upload_info = pic_utils.upload_post_picture(request, str(uuid4())) # todo check duplicates (highly unlikely)
    if upload_info.upload_state == UploadState.failure:
        failure("failed to upload image")

    request_data = get_request_data(request)
    picture_filename = upload_info.filename

    # update secrets with new post
    new_post = db.posts.create_post(cognito.current_user, request_data["text"], picture_filename)

    return success(new_post)


@app.route("/post/<post_id>", methods=["GET"])
def post(post_id: str):
    """
        1. get post from secrets and format to json to return
    """
    queried_post = db.posts.get_post(post_id)
    return success(queried_post) if queried_post else failure("post id %s does not exist" % post_id)


@app.route("/edit_post/<post_id>", methods=["POST"])
@cognito.auth_required
def edit_post(post_id: str):
    """
        request body:
            currentUser, text

        files:
            pictureFile

        1. check if user owns post
        2. get post 
        3. update request.data in post (see create_post)
    """
    # check if user owns post
    request_data = get_request_data(request)
    queried_post = db.posts.get_post(post_id)
    if not queried_post or cognito.current_user != queried_post["username"]:
        return failure(f"{cognito.current_user} does not own this post")

    # if picture is updated, update picture
    upload_info = pic_utils.upload_post_picture(request, str(uuid4())) # todo check duplicates (highly unlikely)
    if upload_info.upload_state == UploadState.failure:
        failure("failed to upload image")

    picture_filename = upload_info.filename if upload_info.upload_state == UploadState.success else queried_post["picture"]

    # update secrets
    edited_post = db.posts.edit_post(post_id, request_data["text"], picture_filename)

    return success(edited_post)

@app.route("/delete_post/<post_id>", methods=["POST"])
@cognito.auth_required
def delete_post(post_id: str):
    """
    :param post_id:
    :return:
    """

    queried_post = db.posts.get_post(post_id)
    if not queried_post or cognito.current_user != queried_post["username"]:
        return failure(f"{cognito.current_user} does not own this post, cannot delete")

    db.posts.delete_post(post_id)
    return success({})


@app.route("/explore", methods=["GET"])
def explore():
    """
        1. list n most recent posts (todo: random)
    """
    request_data = get_request_data(request)
    queried_posts = db_utils.grab_range_from_db(request_data, db.posts.all_posts)
    return success(queried_posts)


@app.route("/feed", methods=["GET"])
@app.route("/feed/<sort_by>", methods=["GET"])
@app.route("/feed/<sort_by>/<int:first>", methods=["GET"])
@cognito.auth_required
def feed(sort_by: str="mostRecent", first: int=0):
    """
        1. list n most recent posts from people user follows
    """
    request_data = get_request_data(request)

    # todo: followers etc
    #queried_posts = db_utils.grab_range_from_db(request_data, posts.feed_posts, username=request_data["currentUser"])
    queried_posts = db_utils.grab_range_from_db(request_data, db.posts.all_posts)

    return success(queried_posts)


@app.route("/search/<query>", methods=["GET"])
def search(query: str):
    """
        request body:
            <none>

        1. search users and posts by tag and text        
    """
    request_data = get_request_data(request)
    queried_posts = db_utils.grab_range_from_db(request_data, db.posts.search_posts, search_string=query)
    queried_users = db_utils.grab_range_from_db(request_data, db.users.search_users, username=query)
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
    request_data = get_request_data(request)
    queried_posts = db_utils.grab_range_from_db(request_data, db.posts.user_posts, username=username)

    return success(queried_posts)


@app.route("/create_user", methods=["POST"])
def create_user():
    """
        request body:
            username, birthday, firstName, lastName, bio

        files:
            profilePicture

    """
    request_data = get_request_data(request)
    if "username" not in request_data or "birthday" not in request_data:
        return failure("username and birthday required to create a new user")

    upload_info = pic_utils.upload_profile_picture(request, request_data["username"])

    # update secrets
    user_params = server.data.users.User(
        username=request_data["username"],
        birthday=datetime.datetime.strptime(request_data["birthday"], "%Y-%M-%d").date(),
        picture=upload_info.filename,
        first_name=request_data["firstName"],
        last_name=request_data["lastName"],
        bio=request_data["bio"]
    )
    new_user = db.users.create_user(user_params)
    return success(new_user)

@app.route("/edit_profile", methods=["POST"])
@cognito.auth_required
def edit_profile():
    """
        request body:
            firstName, lastName, bio

        files:
            profilePicture

    """
    request_data = get_request_data(request)
    current_username = request_data["currentUser"]
    current_user = db.users.get_user(current_username)

    upload_info = pic_utils.upload_profile_picture(request, current_username)
    new_picture = upload_info.filename \
        if upload_info.upload_state == UploadState.success \
        else current_user["picture"]

    # update secrets
    user_data = server.data.users.User(
        first_name=request_data["firstName"],
        last_name=request_data["lastName"],
        picture=new_picture,
        bio=request_data["bio"]
    )
    edited_user = db.users.edit_user(current_username, user_data)

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
    """
    """
    request_data = get_request_data(request)
    current_user = request_data["currentUser"]
    return success(db.users.follow(current_user, user_to_follow))


@app.route("/following/<username>", methods=["GET"])
def following(username: str):
    """
        request body:
            <none>

        1. list n of user's follows
    """
    request_data = get_request_data(request)
    queried_followings = db_utils.grab_range_from_db(request_data, db.users.following, username=username)

    return success(queried_followings)


@app.route("/followers/<username>", methods=["GET"])
def followers(username: str):
    """
        request body:
            <none>

        1. list n of user's followers
    """
    request_data = get_request_data(request)
    queried_followers = db_utils.grab_range_from_db(request_data, db.users.followers, username=username)

    return success(queried_followers)
