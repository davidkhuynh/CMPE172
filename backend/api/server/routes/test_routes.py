import os

from flask import request, send_file

from server import app, cognito
from server.utils.http_utils import success, failure


@app.route("/test")
def test():
    return {
        "data": "test"
    }

@app.route("/ajax", methods=["GET"])
def ajax():
    return success("ajax successful!")

@app.route("/secret_test", methods=["GET"])
@cognito.auth_required
def secret_test():
    if cognito.current_user:
        return success(cognito.current_user)
    return failure("not logged in")

@app.route("/secret_post_test", methods=["POST"])
@cognito.auth_required
def secret_post_test():
    post_data = request.json["secretData"]
    return success(f"here's the secret post data: {post_data}")

@app.route("/file_upload_test", methods=["POST"])
def file_upload_test():
    file = request.files["file"]
    filename, filetype = os.path.splitext(file.filename)
    return send_file(file, mimetype=f"image/{filetype}")
