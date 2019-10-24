from flask import jsonify
from werkzeug.datastructures import ImmutableMultiDict

def success(return_object, code=200):
    return jsonify(return_object), code


def failure(message, code=400):
    return {"error": message}, code


def get_request_data(request):
    request_data = request.form
    return request_data if request_data and isinstance(request_data, ImmutableMultiDict) else ImmutableMultiDict()
