import requests
import json
import os

api_key = os.environ.get('NEWS_API_KEY')
def get_articles(stockCode):
    articles = []
    api_key = 'pub_41037c0421356130dd02f4829a24560ab0c1f'
    url = f'https://newsdata.io/api/1/news?apikey={api_key}&q={stockCode}&language=en'
    response = requests.get(url)
    results = json.loads(response.text)['results']
    for res in results:
        if res['description'] != None:
            articles.append(res['description'])
    return articles