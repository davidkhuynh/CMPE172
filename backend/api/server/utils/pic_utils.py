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


def upload_post_picture(picture_file, post_id):
    return s3.upload_picture(picture_file, filename=post_id)


def upload_profile_picture(request: request, username: str) -> UploadInfo:
    """
    :param request:
    :return: filename of picture
    """
    if "profilePicture" not in request.files:
        return UploadInfo(UploadState.no_upload)

    profile_picture = request.files["profilePicture"]
    _, file_extension = os.path.splitext(profile_picture.filename)
    filename = f"{username}.{file_extension}"

    if s3.upload_picture(profile_picture, filename=filename, directory="profile_pics"):
        return UploadInfo(UploadState.success, filename)
    return UploadInfo(UploadState.failure)


def delete_profile_picture(username: str):
    return s3.delete_picture(filename=username, directory="profile_pics")
