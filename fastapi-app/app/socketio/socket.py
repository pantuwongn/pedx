from fastapi import FastAPI
import socketio
# from typing import List
# import logging
# from python_settings import settings

# def handle_connect(sid,eviron):
#     logging.info(f"Socket connected with sid {sid}")


class SocketManager:
    def __init__(
        self,
        app: FastAPI,
        mount_location: str = "/ws",
        socketio_path: str = "socket.io",
        cors_allowed_origins: str = "*",
        async_mode: str = "asgi",
    ) -> None:
        self._sio = socketio.AsyncServer(
            async_mode=async_mode, cors_allowed_origins=cors_allowed_origins
        )
        self._app = socketio.ASGIApp(
            socketio_server=self._sio, socketio_path=socketio_path
        )
        app.mount(mount_location, self._app)
        app.sio = self._sio

    def is_asyncio_based(self) -> bool:
        return True

    @property
    def event(self):
        return self._sio.event

    @property
    def on(self):
        return self._sio.on

    @property
    def attach(self):
        return self._sio.attach

    @property
    def emit(self):
        return self._sio.emit

    @property
    def send(self):
        return self._sio.send

    @property
    def call(self):
        return self._sio.call

    @property
    def close_room(self):
        return self._sio.close_room

    @property
    def get_session(self):
        return self._sio.get_session

    @property
    def save_session(self):
        return self._sio.save_session

    @property
    def session(self):
        return self._sio.session

    @property
    def disconnect(self):
        return self._sio.disconnect

    @property
    def handle_request(self):
        return self._sio.handle_request

    @property
    def start_background_task(self):
        return self._sio.start_background_task

    @property
    def sleep(self):
        return self._sio.sleep

    @property
    def enter_room(self):
        return self._sio.enter_room

    @property
    def leave_room(self):
        return self._sio.leave_room


def createSocket(sio: SocketManager):
    print("create socket")
    # socket io
    @sio.on("join")
    async def handle_join(sid, *args, **kwargs):
        print("join")

    @sio.event
    def connect(sid, eviron, auth):
        print("connect", sid)

    @sio.event
    def disconnect(sid):
        print('disconnect',sid)

    @sio.on("input")
    async def input_join(sid, data):
        print(data)
        await sio.emit('update',{'data':data})
