import os
import boto3
from botocore.exceptions import ClientError

from server.secrets import aws_config


def upload_picture(picture_file, filename, directory="") -> bool:
    s3_client = boto3.client("s3",
                             aws_access_key_id=aws_config.aws_access_key,
                             aws_secret_access_key=aws_config.aws_secret_key,
                             region_name=aws_config.region)
    filepath = os.path.join(directory, filename)
    try:
        response = s3_client.upload_fileobj(picture_file, aws_config.bucket_name, filepath, ExtraArgs={
            "ACL": "public-read",
            "ContentType": picture_file.content_type
        })
    except ClientError as e:
        print(e)
        return False
    return True


def delete_picture(filename, directory="") -> bool:
    s3_client = boto3.client("s3")
    filepath = os.path.join(directory, filename)
    try:
        response = s3_client.delete_object(Bucket=aws_config.bucket_name, Key=filepath)
    except ClientError as e:
        print(e)
        return False
    return True
