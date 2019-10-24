import ast
from flask import jsonify
from werkzeug.datastructures import ImmutableMultiDict

def success(return_object, code=200):
    return jsonify(return_object), code


def failure(message, code=400):
    return {"error": message}, code


def get_request_data(request):
    request_data = request.form
    if not request_data:
        return ImmutableMultiDict()
    # for request data with image uploads where the actual data is encoded as as string
    if "data" in request_data and len(request_data) == 1:
        return ast.literal_eval(request_data["data"])[0]
    return request_data
