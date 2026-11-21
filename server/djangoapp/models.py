from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class CarMake(models.Model):
    name = models.CharField(max_length=80, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class CarModel(models.Model):
    class BodyType(models.TextChoices):
        SEDAN = 'Sedan'
        SUV = 'SUV'
        WAGON = 'Wagon'
        COUPE = 'Coupe'
        TRUCK = 'Truck'
        HATCHBACK = 'Hatchback'
        VAN = 'Van'
        CONVERTIBLE = 'Convertible'

    make = models.ForeignKey(CarMake, on_delete=models.CASCADE, related_name='models')
    name = models.CharField(max_length=80)
    type = models.CharField(max_length=20, choices=BodyType.choices)
    year = models.PositiveSmallIntegerField(validators=[MinValueValidator(2015), MaxValueValidator(2023)])

    class Meta:
        constraints = [models.UniqueConstraint(fields=['make', 'name', 'year'], name='unique_car_model_year')]

    def __str__(self):
        return f'{self.make} {self.name} ({self.year})'
