from uuid import uuid4

from flask import request
from server.aws_tools import s3
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

ALLOWED_FORMATS = ("jpg", "jpeg", "png", "gif", "tiff", "bmp")

def upload_post_picture(request: request, filename: str):
    return __validate_and_upload_picture(request, "pictureFile", filename)


def upload_profile_picture(request: request, username: str) -> UploadInfo:
    """
    filename of profile picture will be the same as the username
    :param request:
    :param username:
    :return:
    """
    return __validate_and_upload_picture(request, "profilePicture", str(uuid4()))


def delete_profile_picture(profile_picture: str):
    return s3.delete_picture(filename=profile_picture)


## private
def __validate_and_upload_picture(request, picture_field: str, filename: str, directory: str=""):
    if picture_field not in request.files:
        return UploadInfo(UploadState.no_upload)

    picture_file = __get_picture_file(request, picture_field)
    if not picture_file:
        return UploadInfo(UploadState.failure)

    final_filename = __make_filename(picture_file, filename)

    if s3.upload_picture(picture_file, filename=final_filename, directory=directory):
        return UploadInfo(UploadState.success, final_filename)
    return UploadInfo(UploadState.failure)


def __get_picture_file(request, picture_field: str):
    picture_file = request.files[picture_field]
    file_extension = __get_file_extension(picture_file.filename)
    if file_extension not in ALLOWED_FORMATS:
        return None
    return picture_file


def __make_filename(picture_file, new_filename: str):
    file_extension = __get_file_extension(picture_file.filename)
    filename = f"{new_filename}.{file_extension}"
    return filename

def __get_file_extension(filename: str):
    _, file_extension = os.path.splitext(filename)
    return file_extension[1:]

