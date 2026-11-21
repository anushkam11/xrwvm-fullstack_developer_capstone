from pathlib import Path

import nltk
from flask import Flask, jsonify
from nltk.sentiment import SentimentIntensityAnalyzer

nltk.data.path.insert(0, str(Path(__file__).resolve().parent))
analyzer = SentimentIntensityAnalyzer(
    'sentiment/vader_lexicon.zip/vader_lexicon/vader_lexicon.txt',
)
app = Flask(__name__)


@app.get('/')
def home():
    return 'Dealership sentiment service'


@app.get('/analyze/<path:text>')
def analyze_sentiment(text):
    score = analyzer.polarity_scores(text)['compound']
    sentiment = 'positive' if score >= 0.05 else 'negative' if score <= -0.05 else 'neutral'
    return jsonify(sentiment=sentiment)
