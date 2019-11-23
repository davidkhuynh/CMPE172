import boto3
from server.secrets import aws_config


def get_labels(picture: str):
    print("getting labels...")
    bucket = aws_config.bucket_name
    rekog_client = boto3.client('rekognition',
                                aws_access_key_id=aws_config.aws_access_key,
                                aws_secret_access_key=aws_config.aws_secret_key,
                                region_name=aws_config.region)
    response = rekog_client.detect_labels(
        Image={
            'S3Object': {
                'Bucket': bucket,
                'Name': picture
            }
        },
        MaxLabels=15
    )
    labels = set()
    for label in response['Labels']:
        for parent in label['Parents']:
            print(parent['Name'])
            labels.add(parent['Name'])
    return labels
