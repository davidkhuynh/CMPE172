import os
import json

from flask import Flask, jsonify
from flask_cors import CORS
import server.secrets.cognito_config as cognito_config
from server.cognito import Cognito
from server.data import users
from server.data.database import Database
from server.secrets.rds_config import RDS_CONFIG
from server.utils import http_utils

app = Flask(__name__)
app.json_encoder = http_utils.CustomJSONEncoder

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

keys_url = f"https://cognito-idp.{cognito_config.COGNITO_CONFIG.region}.amazonaws.com/{cognito_config.COGNITO_CONFIG.user_pool_id}/.well-known/jwks.json."
cognito_keys = download_keys(keys_url)


CORS(app, supports_credentials=True) # allow all origins for now (future maybe only allow from static site)

# cognito
cognito = Cognito(cognito_config.COGNITO_CONFIG)

# database
db = Database(RDS_CONFIG)

from server.routes import test_routes, routes

@app.route("/")
def api_index():
    return jsonify([str(rule) for rule in app.url_map.iter_rules()])


