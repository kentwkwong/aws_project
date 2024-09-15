from chalice import (
    Chalice,
    Response,
    CORSConfig,
    ChaliceViewError
)

import boto3
from chalicelib.s3_storage_service import save_articles_to_s3
from chalicelib.comprehend_service import get_sentiment_from_article


app = Chalice(app_name="aws-api")
app.debug = True
dynamodb = boto3.resource('dynamodb')

@app.route("/addUser", cors=True, methods=["POST"])
def add_user_to_db():
    table = dynamodb.Table('users')  
    print(f'table: {table}')
    try:
        request = app.current_request.json_body
        print(request)
        user_sub = request.get('sub')
        existing_user = table.get_item(Key={'sub': user_sub})  
        if 'Item' in existing_user:
            return Response(body={"user": existing_user['Item']}, status_code=200)

        user_info ={
            'sub': user_sub,
            'email': request.get('email'),  
            'username': request.get('username'), 
            'credit_balance': 3,
            'tier': 1
        }
    
        table.put_item(Item=user_info)

        return Response(body={"user": user_info}, status_code=200)
    except Exception as e:
        print(e)
        raise ChaliceViewError(e)
    
@app.route("/upgradeUser", cors=True, methods=["POST"])
def upgrade_user_to_db():
    table = dynamodb.Table('users')  
    try:
        request = app.current_request.json_body
        upgrade_id = request.get('id')
        userId = request.get('userId')
           
        if upgrade_id == 2:
            increment = 20
        elif upgrade_id == 3:
            increment = 100
        else:
            return {"error": "Invalid upgrade ID."}  

        response = table.update_item(
            Key={'sub': userId}, 
            UpdateExpression='ADD credit_balance :val',
            ExpressionAttributeValues={':val': increment}, 
            ReturnValues='UPDATED_NEW'
        )
        updated_credit_balance = response['Attributes']['credit_balance']
        
        return Response(body={"updated_credit_balance": updated_credit_balance}, status_code=200)
    except Exception as e:
        raise ChaliceViewError(e)

@app.route('/search/{userId}', cors=True, methods=['GET'])
def search_history(userId):
    try:
        table = dynamodb.Table('sentiments')
        query_response = table.query(
            IndexName='userId-index',
            KeyConditionExpression=boto3.dynamodb.conditions.Key('userId').eq(userId)
        )
        # print("query_response:",query_response)
        searchHistory = query_response['Items']
        
        return Response(body={"searchHistory": searchHistory}, status_code=200)
    except Exception as e:
        print(e)
        raise ChaliceViewError(e)

@app.route('/stockcode',cors=True, methods=['POST'])
def stockcode():
    try:
        request = app.current_request.json_body
        stockCode = request.get('stockCode')
        userId = request.get('userId')
        s3_file_name,updated_credit_balance  = save_articles_to_s3(userId, stockCode)
        result = get_sentiment_from_article(s3_file_name)
        print(f'User credit balance updated to: {updated_credit_balance}')
        return {"result": result, "updated_credit_balance": updated_credit_balance}
    except Exception as e:
        print(e)
        raise ChaliceViewError(e)
