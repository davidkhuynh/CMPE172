from server import app, cognito
from server.utils.http_utils import success, failure


@app.route("/test")
def test():
    return {
        "data": "test"
    }

@app.route("/secret_test", methods=["GET", "POST"])
@cognito.auth_required
def secret_test():
    if cognito.current_user:
        return success(cognito.current_user)
    return failure("not logged in")
