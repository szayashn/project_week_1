from channels.generic.websocket import AsyncWebsocketConsumer
import json

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if text_data_json['isMessage']:
            message = text_data_json['message']
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message
                }
            )

        else:
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