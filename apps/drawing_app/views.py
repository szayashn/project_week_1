from django.shortcuts import render, redirect
from django.utils.safestring import mark_safe
import json
import random 
import string 

def welcome(request):
    return render(request, 'drawing_app/welcome.html')

def create(request):
    return render(request, 'drawing_app/create.html', {})

def join(request):
    return render(request, 'drawing_app/join.html')

def room(request):
    if request.method == 'POST':
        room_name = request.POST['room-name-input'].lower()
        user_name = request.POST['user-name-input']
        random_id = ''.join([random.choice(string.ascii_letters + string.digits) for n in range(64)]) 
            
        request.session['user_name'] = user_name
        if not 'user_id' in request.session:
            request.session['user_id'] = random_id
            
        return render(request, 'drawing_app/room.html', {
            'room_name_json': mark_safe(json.dumps(room_name)),
            'user_name_json': mark_safe(json.dumps(user_name))
        })

    return redirect('/')
