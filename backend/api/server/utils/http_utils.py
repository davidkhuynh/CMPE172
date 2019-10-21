def success(return_object, code=200):
    return return_object, code


def failure(message, code=400):
    return {"error": message}, code

