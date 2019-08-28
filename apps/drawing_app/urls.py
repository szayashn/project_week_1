from django.urls import path
from django.conf.urls import url, include

from . import views

urlpatterns = [
    url(r'^$', views.index),
    #path('/chat/<str:room_name>/', views.room, name='room'),
    url(r'^room$', views.room)
]