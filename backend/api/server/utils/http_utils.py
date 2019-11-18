import ast
import datetime
from json import JSONEncoder

from flask import jsonify
from werkzeug.datastructures import ImmutableMultiDict

from server.data.users import User


def success(return_object, code=200):
    return jsonify(return_object), code


def failure(message, code=400):
    return {"error": message}, code


def get_request_data(request):
    request_data = request.form
    if not request_data:
        return ImmutableMultiDict()
    # for request data with image uploads where the actual data is encoded as as string in a field called "data"
    if "data" in request_data:
        return ast.literal_eval(request_data["data"])[0]
    return request_data


class CustomJSONEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime)\
            or isinstance(obj, datetime.date):
            return obj.isoformat()
        if isinstance(obj, User):
            return {
                "username": obj.username,
                "birthday": obj.birthday,
                "displayName" : obj.display_name,
                "bio": obj.bio,
                "createdOn": obj.created_on
            }
        else:
            return super().default(obj)
