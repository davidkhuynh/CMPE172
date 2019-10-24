from flask import Flask, jsonify, url_for
from flask_cors import CORS
from flask_cognito import CognitoAuth
import server.cognito_config as cognito_config
from server.db import users

app = Flask(__name__)

# configuration
# cognito
app.config['COGNITO_REGION'] = cognito_config.REGION
app.config['COGNITO_USERPOOL_ID'] = cognito_config.USER_POOL_ID

    # optional
app.config['COGNITO_APP_CLIENT_ID'] = cognito_config.APP_CLIENT_ID,  # client ID you wish to verify user is authenticated agains
app.config['COGNITO_CHECK_TOKEN_EXPIRATION'] = False,  # disable token expiration checking for testing purpose
app.config['COGNITO_JWT_HEADER_NAME'] = 'X-MyApp-Authorization'
app.config['COGNITO_JWT_HEADER_PREFIX'] = 'Bearer'
CORS(app) # allow all origins for now (future maybe only allow from static site)
cognito_auth = CognitoAuth(app)

@cognito_auth.identity_handler
def lookup_cognito_user(payload):
    return users.get_user(payload["username"])


from server.routes import test, routes

@app.route("/")
def api_index():
    return jsonify([str(rule) for rule in app.url_map.iter_rules()])


