import json

from django.conf import settings
from django.db import transaction

from .models import CarMake, CarModel


@transaction.atomic
def initiate():
    data = json.loads((settings.BASE_DIR / 'database/data/car_records.json').read_text())
    for car in data['cars']:
        make, _ = CarMake.objects.get_or_create(name=car['make'])
        CarModel.objects.get_or_create(
            make=make, name=car['model'], year=car['year'], defaults={'type': car['bodyType']},
        )
