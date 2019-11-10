from server import app
from server import cognito
from flask import request
from server.utils.http_utils import success, failure

@app.route("/test")
def test():
    return {
        "data": "test"
    }

@app.route("/secret_test", methods=["GET", "POST"])
def secret_test():
    access_token = request.headers.get("Authorization").split()[1]
    cognito_response = cognito.validate_token(access_token)
    if "error" in cognito_response.keys():
        return failure(cognito_response["error"], 401)
    return cognito_response
