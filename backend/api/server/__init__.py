from flask import Flask
import inspect

app = Flask(__name__)

from server.routes import test, routes

@app.route("/")
def api_index():
    return  "%s" %(inspect.getmembers(routes, inspect.isfunction))


