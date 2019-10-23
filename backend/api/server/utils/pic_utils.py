from flask import request
from server import s3
from dataclasses import dataclass
from enum import Enum
import os

class UploadState(Enum):
    success = 0
    failure = 1
    no_upload = 2

@dataclass
class UploadInfo:
    upload_state: UploadState
    filename: str=""

ALLOWED_FORMATS = ("jpg", "jpeg", "png", "gif", "tiff")

def upload_post_picture(request: request, filename: str):
    return __validate_and_upload_picture(request, "pictureFile", filename)


def upload_profile_picture(request: request, username: str) -> UploadInfo:
    return __validate_and_upload_picture(request, "profilePicture", username, "profile_pics")


def delete_profile_picture(username: str):
    return s3.delete_picture(filename=username, directory="profile_pics")


## private
def __validate_and_upload_picture(request, picture_field: str, filename: str, directory: str=""):
    if picture_field not in request.files:
        return UploadInfo(UploadState.no_upload)

    profile_picture = __get_picture_file(request)
    if not profile_picture:
        return UploadInfo(UploadState.failure)

    final_filename = __make_filename(profile_picture, filename)

    if s3.upload_picture(profile_picture, filename=final_filename, directory=directory):
        return UploadInfo(UploadState.success, final_filename)
    return UploadInfo(UploadState.failure)


def __get_picture_file(request):
    profile_picture = request.files["profilePicture"]
    if __get_file_extension(profile_picture.filename) not in ALLOWED_FORMATS:
        return None
    return profile_picture


def __make_filename(picture_file, new_filename: str):
    file_extension = __get_file_extension(picture_file.filename)
    filename = f"{new_filename}.{file_extension}"
    return filename

def __get_file_extension(filename: str):
    _, file_extension = os.path.splitext(filename)
    return file_extension

