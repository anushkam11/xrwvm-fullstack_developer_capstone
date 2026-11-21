import json
from datetime import date
from urllib.parse import quote

import requests
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST
from django.views.generic import TemplateView

from .models import CarMake, CarModel
from .restapis import analyze_review_sentiments, get_request, post_review


class AppView(TemplateView):
    template_name = 'index.html'

    @method_decorator(ensure_csrf_cookie)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


def response(code=200, **data):
    return JsonResponse({'status': code, **data}, status=code)


def payload(request):
    try:
        data = json.loads(request.body)
        return data if isinstance(data, dict) else {}
    except (ValueError, UnicodeError):
        return {}


@require_POST
def login_user(request):
    data = payload(request)
    username, password = data.get('userName'), data.get('password')
    if not isinstance(username, str) or not isinstance(password, str):
        return response(400, error='Username and password are required.')
    user = authenticate(request, username=username, password=password)
    if user is None:
        return response(401, error='Invalid username or password.')
    login(request, user)
    return response(status='Authenticated', userName=user.username)


@require_POST
def logout_request(request):
    username = request.user.get_username()
    logout(request)
    return response(userName=username, message='Logged out')


@require_POST
def registration(request):
    data = payload(request)
    fields = ('userName', 'firstName', 'lastName', 'email', 'password')
    if any(not isinstance(data.get(field), str) or not data[field].strip() for field in fields):
        return response(400, error='Complete all five fields.')
    user = User(username=data['userName'].strip(), first_name=data['firstName'].strip(),
                last_name=data['lastName'].strip(), email=data['email'].strip())
    try:
        validate_email(user.email)
        user.full_clean(exclude=['password'], validate_unique=False)
        validate_password(data['password'], user)
        user.set_password(data['password'])
        user.save()
    except ValidationError as error:
        return response(400, error=' '.join(error.messages))
    except IntegrityError:
        return response(409, error='This username is already registered.')
    login(request, user)
    return response(201, userName=user.username)


@require_GET
def current_user(request):
    return response(userName=request.user.get_username())


def read_service(key, endpoint):
    try:
        return response(**{key: get_request(endpoint)})
    except requests.RequestException:
        return response(502, error='The dealership service is temporarily unavailable.')


@require_GET
def get_dealerships(request, state=None):
    endpoint = 'fetchDealers' if state in (None, 'All') else f'fetchDealers/{quote(state, safe="")}'
    return read_service('dealers', endpoint)


@require_GET
def get_dealer_details(request, dealer_id):
    return read_service('dealer', f'fetchDealer/{dealer_id}')


@require_GET
def get_dealer_reviews(request, dealer_id):
    return read_service('reviews', f'fetchReviews/dealer/{dealer_id}')


@require_GET
def get_cars(request):
    makes = list(CarMake.objects.order_by('name').values_list('name', flat=True))
    models = CarModel.objects.select_related('make').order_by('make__name', 'name', 'year')
    return response(CarMakes=makes, CarModels=[
        {'id': car.pk, 'CarMake': car.make.name, 'CarModel': car.name,
         'CarType': car.type, 'CarYear': car.year} for car in models
    ])


@require_POST
def add_review(request):
    if not request.user.is_authenticated:
        return response(401, error='Sign in to post a review.')
    data = payload(request)
    try:
        dealer_id = int(data['dealership'])
        text = data['review'].strip()
        car = CarModel.objects.select_related('make').get(pk=data['car_id'])
        purchase_date = date.fromisoformat(data['purchase_date'])
        year = int(data['car_year'])
        if not 1 <= len(text) <= 2000 or not 2015 <= year <= 2023 or purchase_date > date.today():
            raise ValueError
    except (AttributeError, KeyError, TypeError, ValueError, CarModel.DoesNotExist):
        return response(400, error='Enter a review, valid purchase date, car and model year (2015–2023).')
    try:
        if not get_request(f'fetchDealer/{dealer_id}'):
            return response(404, error='Dealership not found.')
        saved = post_review({
            'dealership': dealer_id, 'review': text, 'purchase': True,
            'purchase_date': purchase_date.isoformat(), 'car_make': car.make.name,
            'car_model': car.name, 'car_year': year,
            'name': request.user.get_full_name() or request.user.username,
            'sentiment': analyze_review_sentiments(text),
        })
    except requests.RequestException:
        return response(502, error='A review service is temporarily unavailable.')
    return response(review=saved)
