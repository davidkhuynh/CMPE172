import os
import json

from flask import Flask, jsonify
from flask_cors import CORS
import server.cognito.cognito_config as cognito_config
from server.data import users
from server.data.database import Database
from server.secrets.rds_config import RDS_CONFIG

app = Flask(__name__)

# configuration
# cognito
app.config['COGNITO_REGION'] = cognito_config.REGION
app.config['COGNITO_USER_POOL_ID'] = cognito_config.USER_POOL_ID

# optional
app.config['COGNITO_APP_CLIENT_ID'] = cognito_config.APP_CLIENT_ID,  # client ID you wish to verify user is authenticated agains
app.config['COGNITO_CHECK_TOKEN_EXPIRATION'] = False,  # disable token expiration checking for testing purpose
app.config['COGNITO_JWT_HEADER_NAME'] = 'X-MyApp-Authorization'
app.config['COGNITO_JWT_HEADER_PREFIX'] = 'Bearer'

# download cognito keys
def download_keys(keys_url: str):
    print(keys_url)
    with open(f"{os.getcwd()}/server/secrets/keys.json", "r") as f:
        json_data = json.load(f)
    return json_data
    """
    with urllib.request.urlopen(keys_url) as f:
        response = f.read()
    keys = json.loads(response.decode('utf-8'))['keys']
    return keys
    """

keys_url = f"https://cognito-idp.{app.config['COGNITO_REGION']}.amazonaws.com/{app.config['COGNITO_USER_POOL_ID']}/.well-known/jwks.json."
cognito_keys = download_keys(keys_url)


CORS(app, supports_credentials=True) # allow all origins for now (future maybe only allow from static site)

# database
db = Database(RDS_CONFIG)

from server.routes import test_routes, routes

@app.route("/")
def api_index():
    return jsonify([str(rule) for rule in app.url_map.iter_rules()])


