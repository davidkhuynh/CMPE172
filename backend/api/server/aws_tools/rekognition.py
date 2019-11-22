import boto3
from server.secrets import s3_config

def get_labels(picture: str):
    print("getting labels...")
    bucket = s3_config.bucket_name
    rekog_client = boto3.client('rekognition')
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
