from flask import jsonify

def success(return_object, code=200):
    return jsonify(return_object), code


def failure(message, code=400):
    return {"error": message}, code

