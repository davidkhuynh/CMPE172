from server import app
from server.s3 import upload_picture
from server.db import users, posts

from flask import request, abort

### utils
def update_picture(picture_file, post_id):
    s3.upload_picture(picture_file, post_id=id)
    posts.update_picture(post["id"])

def success(return_object, code=200):
    return return_object, code

def failure(message, code=400):
    return {"error": message}, code

### routes
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

@app.route("/post/<id>", methods=["GET","POST"])
def post(id: str):
    """
        1. get post from db and format to json to return
    """
    post = posts.get_post(id)
    return success(post) if post else failure("post id %s does not exist" % id)

@app.route("/feed", methods=["GET","POST"])
@app.route("/feed/<int:page>", methods=["GET","POST"])
def feed(page: int=1):
    """
        1. list n most recent posts from people user follows
    """
    return "feed page %i\n request.data: %s" % (page, request.data) 

@app.route("/search/<query>", methods=["GET","POST"])
@app.route("/search/<query>/<int:page>", methods=["GET","POST"])
def search(query: str, page: int=1):
    """
        1. search users and posts by tag and text        
    """
    return "search %s page %i" %(query, page)

@app.route("/user/<username>", methods=["GET","POST"])
def user(username: str):
    """
        1. list user data
        2. list n of user's posts
    """
    user = users.get_user(username)
    return success(user) if user else failure("user %s does not exist" % username)

@app.route("/following/<username>", methods=["GET","POST"])
@app.route("/following/<username>/<int:page>", methods=["GET","POST"])
def following(username: str, page: int=1):
    """
        1. list n of user's follows
    """
    return "user follows for username: %s, page: %i" (username, page)

@app.route("/followers/<username>", methods=["GET","POST"])
@app.route("/followers/<username>/<int:page>", methods=["GET","POST"])
def followers(username: str, page: int=1):
    """
        1. list n of user's followers
    """
    return "followers for username: %s, page: %i" (username, page)
