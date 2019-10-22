from server import s3


def upload_post_picture(picture_file, post_id):
    return s3.upload_picture(picture_file, filename=post_id)


def upload_profile_picture(picture_file, username):
    return s3.upload_picture(picture_file, filename=username, directory="profile_pics")


def delete_profile_picture(username: str):
    return s3.delete_picture(filename=username, directory="profile_pics")
