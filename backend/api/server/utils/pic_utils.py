from server import s3


def upload_post_picture(picture_file, post_id):
    return s3.upload_picture(picture_file, filename=post_id)


def upload_profile_picture(picture_file, username):
    return s3.upload_picture(picture_file, filename=username, directory="profile_pics")
