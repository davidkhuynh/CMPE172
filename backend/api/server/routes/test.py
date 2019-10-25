from server import app
from server import cognito
from flask import request
from server.utils.http_utils import success

@app.route("/test")
def test():
    return {
        "data": "test"
    }

@app.route("/secret_test", methods=["GET", "POST"])
def secret_test():
    access_token = request.form["accessToken"]
    return success(cognito.token_valid(access_token))
