from flask import Flask, jsonify, url_for
from flask_cors import CORS
import inspect

app = Flask(__name__)
CORS(app) # allow all origins for now (future maybe only allow from static site)

from server.routes import test, routes

@app.route("/")
def api_index():
    return jsonify([str(rule) for rule in app.url_map.iter_rules()])


