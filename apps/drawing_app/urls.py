from django.urls import path
from django.conf.urls import url, include

from . import views

urlpatterns = [
    url(r'^$', views.welcome),
    url(r'create$', views.create),
    url(r'join$', views.join),
    #path('/chat/<str:room_name>/', views.room, name='room'),
    url(r'^room$', views.room)
]
