from server import app
from flask_cognito import cognito_auth_required, current_user, current_cognito_jwt
from flask import jsonify

@app.route("/test")
def test():
    return {
        "data": "test"
    }

@app.route("/secret_test")
@cognito_auth_required
def secret_test():
    return jsonify({
        'cognito_username': current_cognito_jwt['username'],   # from cognito pool
        'user_id': current_user.id,   # from your database
    })
