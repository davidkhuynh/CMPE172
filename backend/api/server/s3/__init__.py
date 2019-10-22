import os
import boto3

from server.s3 import s3_config

def upload_picture(picture_file, filename, directory=""):
    s3_client = boto3.client("s3")
    filepath = os.path.join(directory, filename)
    response = s3_client.upload_file(picture_file, s3_config.bucket_name, filepath, ExtraArgs={
        "ACL": "public-read",
        "ContentType": picture_file.content_type
    })
    return response



def delete_picture(filename, directory):
    s3_client = boto3.client("s3")
    filepath = os.path.join(directory, filename)
    response = s3_client.delete_object(s3_config.bucket_name, filepath)
    return response
