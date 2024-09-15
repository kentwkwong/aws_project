import boto3
from chalicelib.newsdata_service import get_articles
from datetime import datetime
import os
dynamodb = boto3.resource('dynamodb') 
table = dynamodb.Table('users')  

def save_articles_to_s3(userId,stockCode):
    try:
        date_str = datetime.now().strftime('%Y-%m-%d')
        s3_file_name = f'{userId}/{stockCode}_{date_str}_article.txt'
        bucket_name = os.environ.get('S3_BUCKET_NAME')    
        s3 = boto3.client('s3')
        # Check if file already exists in S3
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=s3_file_name)
        file_exists = 'Contents' in response and any(s3_file_name == content['Key'] for content in response['Contents'])
        if file_exists:
            response = table.get_item(Key={'sub': userId})
            print(response)
            updated_credit_balance = response['Item']['credit_balance']
            print(f'File already exists in S3: {s3_file_name}')
        else:
            articles = get_articles(stockCode)
            articles_text = '\n'.join(articles)  
            s3.put_object(Bucket=bucket_name, Key=s3_file_name, Body=articles_text.encode('utf-8'))
            response = table.update_item(
                Key={'sub': userId},
                UpdateExpression='ADD credit_balance :val',
                ExpressionAttributeValues={':val': -1},
                ReturnValues='UPDATED_NEW'
            )
            updated_credit_balance = response['Attributes']['credit_balance']
            # print(f'User credit balance updated to: {updated_credit_balance}')

            print(f'File uploaded to S3: {s3_file_name}')
        return s3_file_name, updated_credit_balance

    except Exception as e:
        print(e)
        return None
