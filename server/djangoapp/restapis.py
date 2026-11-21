import os
from urllib.parse import quote

import requests
from dotenv import load_dotenv

load_dotenv()

BACKEND = os.getenv('backend_url', 'http://127.0.0.1:3030').rstrip('/')
SENTIMENT = os.getenv('sentiment_analyzer_url', 'http://127.0.0.1:5050').rstrip('/')


def service_request(method, base, endpoint, **kwargs):
    response = requests.request(method, f'{base}/{endpoint}', timeout=6, **kwargs)
    response.raise_for_status()
    return response.json()


def get_request(endpoint):
    return service_request('GET', BACKEND, endpoint)


def analyze_review_sentiments(text):
    return service_request('GET', SENTIMENT, f'analyze/{quote(text, safe="")}')['sentiment']


def post_review(data):
    return service_request('POST', BACKEND, 'insert_review', json=data)
