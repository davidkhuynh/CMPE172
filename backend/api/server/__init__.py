from flask import Flask

app = Flask(__name__)

from server.routes import test
