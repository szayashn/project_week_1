from django.shortcuts import render, redirect
from django.utils.safestring import mark_safe
import json

def index(request):
    

    return render(request, 'drawing_app/chat.html', {})

def room(request):
    if request.method == 'POST':

        room_name = request.POST['room-name-input']
        user_name = request.POST['user-name-input']
        
        return render(request, 'drawing_app/room.html', {
            'room_name_json': mark_safe(json.dumps(room_name)),
            'user_name_json': mark_safe(json.dumps(user_name))
        })

    return redirect('/')