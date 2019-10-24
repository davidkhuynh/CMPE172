import os
import boto3
from botocore.exceptions import ClientError

from server.s3 import s3_config


def upload_picture(picture_file, filename, directory="") -> bool:
    s3_client = boto3.client("s3")
    filepath = os.path.join(directory, filename)
    try:
        response = s3_client.upload_fileobj(picture_file, s3_config.bucket_name, filepath, ExtraArgs={
            "ACL": "public-read",
            "ContentType": picture_file.content_type
        })
    except ClientError as e:
        print(e)
        return False
    return True



def delete_picture(filename, directory) -> bool:
    s3_client = boto3.client("s3")
    filepath = os.path.join(directory, filename)
    try:
        response = s3_client.delete_object(s3_config.bucket_name, filepath)
    except ClientError as e:
        print(e)
        return False
    return True
