from server import app
from server import cognito
from flask import request

@app.route("/test")
def test():
    return {
        "data": "test"
    }

@app.route("/secret_test", methods=["GET", "POST"])
def secret_test():
    access_token = request.form["accessToken"]
    if (cognito.token_valid(access_token)):
        return "Successfully validated!"
    return "Failure to validate, no accessToken in request data"
