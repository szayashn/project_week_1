from django.shortcuts import render, redirect
from django.utils.safestring import mark_safe
import json

def welcome(request):
    return render(request, 'drawing_app/welcome.html')

def create(request):
    return render(request, 'drawing_app/create.html', {})

def join(request):
    return render(request, 'drawing_app/join.html')

def room(request):
    if request.method == 'POST':

        room_name = request.POST['room-name-input']
        user_name = request.POST['user-name-input']
        
        return render(request, 'drawing_app/room.html', {
            'room_name_json': mark_safe(json.dumps(room_name)),
            'user_name_json': mark_safe(json.dumps(user_name))
        })

    return redirect('/')
