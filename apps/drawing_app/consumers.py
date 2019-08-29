from channels.generic.websocket import AsyncWebsocketConsumer
import json
all_users = {}
class User:
    def __init__(self, id, name, isHost):
        self.id = id
        self.name = name
        self.isHost = isHost

    def get_id(self):
        return self.id

    def get_name(self):
        return self.name


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name
        all_users.setdefault(self.room_name, [])
        if len(all_users[self.room_name]) == 0: #fix it
            self.current_user = User(
                self.scope['session']['user_id'],
                self.scope['session']['user_name'],
                True
            )
        else:
            self.current_user = User(
                self.scope['session']['user_id'],
                self.scope['session']['user_name'],
                False
            )
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        all_users[self.room_name].append(self.current_user.__dict__)
        
        await self.accept()
        await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'users_online'
                }
            )
            
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        count = -1
        for u in all_users[self.room_name]:
            count += 1
            if u['id'] == self.current_user.get_id():
                del all_users[self.room_name][count]

        await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'users_online'
                }
            )
    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if 'message' in text_data_json:
            message = text_data_json['message']
            if message.split(': ')[1] == 'test':
                for u in all_users[self.room_name]:
                    u['isHost'] = False
                self.current_user.isHost = True
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'winner',
                        'message': message
                    }
                )
            else:   
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message
                    }
                )

        elif 'clickX' in  text_data_json:
            clickX = text_data_json['clickX']
            clickY = text_data_json['clickY']
            clickDrag = text_data_json['clickDrag']

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'draw_on_canvas',
                    'clickX': clickX,
                    'clickY': clickY,
                    'clickDrag': clickDrag
                }
            )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))

    async def draw_on_canvas(self, event):

        clickX = event['clickX']
        clickY = event['clickY']
        clickDrag = event['clickDrag']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'clickX': clickX,
            'clickY': clickY,
            'clickDrag': clickDrag
        }))

    async def users_online(self, event):
        await self.send(text_data=json.dumps({
            'user_names': all_users[self.room_name],
            'current_user': self.current_user.__dict__
        }))
    
    async def winner(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message,
            'winner': self.current_user.__dict__
        }))
        