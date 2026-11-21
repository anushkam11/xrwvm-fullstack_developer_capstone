from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView

from djangoapp.views import AppView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('djangoapp/', include('djangoapp.urls')),
    path('about', TemplateView.as_view(template_name='About.html')),
    path('contact', TemplateView.as_view(template_name='Contact.html')),
    path('', AppView.as_view()),
    path('dealers', AppView.as_view()),
    path('login', AppView.as_view()),
    path('register', AppView.as_view()),
    path('dealer/<int:id>', AppView.as_view()),
    path('postreview/<int:id>', AppView.as_view()),
]
