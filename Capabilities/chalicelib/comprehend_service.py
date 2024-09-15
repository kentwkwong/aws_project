import boto3
import os
import tarfile
import json
import time
from decimal import Decimal
s3 = boto3.client('s3')
region_name = os.environ.get('REGION_NAME')
bucket_name = os.environ.get('S3_BUCKET_NAME')  
iam_arn = os.environ.get('COMPREHEND_IAM_ROLE_ARN') 
comprehend = boto3.client('comprehend', region_name=region_name) 
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('sentiments')

def get_sentiment_from_article(s3_file_name):
    try:
        print('cp1')
        existing_sentiment = table.get_item(Key={'file_name': s3_file_name})
        print(existing_sentiment)
        if 'Item' in existing_sentiment:
          # print("Item already exists in table:",existing_sentiment['Item'])
          return  existing_sentiment['Item']
        
        print(bucket_name)

        obj = s3.get_object(Bucket=bucket_name, Key=s3_file_name)
        print('cp2')

        # Comprehend only allow 5000 characters
        article = obj['Body'].read().decode('utf-8')[:3000] 
        response = comprehend.detect_sentiment(Text=article, LanguageCode='en')
        # print("response from comprehend:",response)
        print('cp3')

        userId = s3_file_name.split('/')[0]
        stockCode = s3_file_name.split('/')[1].split('_')[0]
        sentiment = response['Sentiment']
        # sentiment_score = response['SentimentScore']
        sentiment_score = {k: Decimal(str(v)) for k, v in response['SentimentScore'].items()}
        print("SENTIMENT SCORE:", sentiment_score)
        item = {
                'userId': userId,
                'stockCode': stockCode,
                'sentiment':  sentiment,
                'sentiment_score': sentiment_score,
                'file_name': s3_file_name,
                'timestamp': int(time.time())
                }
        response = table.put_item(Item=item)
        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
            print("User saved to table:",item)
            return item
        else:
            raise Exception("Error saving item to table")
    except Exception as e:
        print(e)
        raise Exception("Error getting sentiment from article")

