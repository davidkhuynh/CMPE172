from server import app
from server.db import users

from flask import request

@app.route("/make_post", methods=["GET","POST"])
def make_post():
    """
        1. add new post to request.database
        2. upload image to s3
    """
    return "make post\n request.data: %s" % (request.data)

@app.route("/edit_post/<id>", methods=["GET","POST"])
def edit_post(id: str):
    """
        1. check if user owns post
        2. get post 
        3. update request.data in post (see make_post)
    """
    return "edit post %s\n request.data: %s" % (id, request.data)

@app.route("/post/<id>", methods=["GET","POST"])
def post(id: str):
    """
        1. get post from db and format to json to return
    """
    return "get post %s\n request.data: %s" % (id, request.data)

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
@app.route("/user/<username>/<int:page>", methods=["GET","POST"])
def user(username: str, page: int=1):
    """
        1. list user data
        2. list n of user's posts
    """
    user = users.get_user("db_test")
    if not user:
        return "%s user does not exist" % (username)
    return "user page for username: %s, bday: %s, page: %i" % (user["username"], user["birthday"], page)

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
