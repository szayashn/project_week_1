from django.shortcuts import render
from django.utils.safestring import mark_safe
import json

def welcome(request):
    return render(request, 'drawing_app/welcome.html')

def index(request):
    return render(request, 'drawing_app/chat.html', {})

def room(request, room_name):
    
    return render(request, 'drawing_app/room.html', {
        'room_name_json': mark_safe(json.dumps(room_name))
    })