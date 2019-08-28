from django.urls import path

from . import views

urlpatterns = [
    path('', views.welcome, name='welcome'),
    path('chat/<str:room_name>/', views.room, name='room'),
]

