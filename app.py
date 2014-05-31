# -*- coding: utf-8 -*-
import argparse
import random
import os
import cherrypy
import datetime
import tempfile
import shutil

import json

from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool
from ws4py.websocket import WebSocket, Heartbeat
from ws4py.messaging import TextMessage

LAST_MSGS = []

def broadast_message(msg):
    msg['timestamp'] = datetime.datetime.utcnow().isoformat()
    LAST_MSGS.append(msg)
    if len(LAST_MSGS) > 200: LAST_MSGS.pop(0)
    cherrypy.engine.publish('websocket-broadcast', TextMessage(json.dumps(msg)))

class ChatWebSocketHandler(WebSocket):
    room_list = []
    socket_user_map = {}

    def __init__(self, sock, protocols=None, extensions=None, environ=None, heartbeat_freq=30.0):
        WebSocket.__init__(self, sock, protocols=None, extensions=None, environ=None, heartbeat_freq=heartbeat_freq)
        self.hb = Heartbeat(self, 30.0)
        self.hb.start()

    def opened(self):
        self.socket_user_map[self] = None

    def closed(self, code, reason="A client left the room without a proper explanation."):
        cherrypy.engine.publish('websocket-broadcast', TextMessage(reason))
        username = self.socket_user_map[self]
        del self.socket_user_map[self]
        if username in self.room_list:
            self.room_list.remove(username)

    def broadcast_room_list(self):
        room_list_msg = {
            "type": "INFO",
            "info": "ROOM_LIST",
            "data": self.room_list
        }

        broadast_message(room_list_msg)

    def received_message(self, m):
        try:
            return_msg = msg = json.loads(m.data)
            cherrypy.log("Recieved: %s" % msg)

            if msg['type'] != 'CODE':
                bad_string = '<script'
                for k in msg:
                    if bad_string in msg[k]:
                        return

            # eventually this if thing should be a pub/sub or some other event/factory pattern
            if msg['type'] == "CMD":
                if msg['command'] == "NAME_CHANGE":
                    self.room_list[self.room_list.index(msg['username'])] =  msg['new_name']
                    self.room_list.sort()
                    self.broadcast_room_list()
                    self.socket_user_map[self] = msg['new_name']

                    return_msg = {
                        "type": "EVENT",
                        "event": "NAME_CHANGED",
                        "username": msg['username'],
                        "new_name": msg['new_name']
                    }
            elif msg['type'] == "EVENT":
                if msg['event'] == "FIRST_SIGN_ON":
                    userid = 'User%d' % (random.randrange(0,100))
                    if 'username' in msg:
                        userid = msg['username']

                    if userid in self.room_list:
                        userid += str((random.randrange(0,100)))

                    msg['username'] = userid
                    msg['title'] = 'MockingJay'
                    msg['room_list'] = self.room_list
                    msg['history'] = LAST_MSGS

                    self.send(json.dumps(msg), False)

                    self.room_list.append(userid)
                    self.room_list.sort()
                    self.broadcast_room_list()
                    self.socket_user_map[self] = userid

                    return_msg = {
                        "type": 'EVENT',
                        "event": 'SIGN_ON',
                        "username": userid
                    }
                elif msg ['event'] == "RESIGN_ON":
                    userid = msg['username']
                    self.socket_user_map[self] = userid
                    if userid not in self.room_list:
                        self.room_list.append(userid)
                    self.broadcast_room_list()
                    return
                elif msg['event'] == "SIGN_OFF":
                    username = msg['username']
                    if username in self.room_list:
                        self.room_list.remove(username)

                    self.broadcast_room_list()
                    return_msg = {
                        "type": 'EVENT',
                        "event": 'SIGN_OFF',
                        "username": msg['username']
                    }

            broadast_message(return_msg)
        except Exception, e:
            cherrypy.log(str(e), severity=logging.ERROR, traceback=True)


from jinja2 import Environment as Jinja2Environment, FileSystemLoader
jinja2_env = Jinja2Environment(loader=FileSystemLoader('app'))

class Root(object):
    def __init__(self, host, port, ssl=False):
        self.scheme = 'wss' if ssl else 'ws'

    @cherrypy.expose
    def index(self):
        tmpl = jinja2_env.get_template("views/main.html")
        return tmpl.render(scheme=self.scheme)

    @cherrypy.expose
    def ws(self):
        cherrypy.log("Handler created: %s" % repr(cherrypy.request.ws_handler))

    @cherrypy.expose
    def upload(self, username, myFile):
        # Although this just counts the file length, it demonstrates
        # how to read large files in chunks instead of all at once.
        # CherryPy reads the uploaded file into a temporary file;
        # myFile.file.read reads from that.
        # size = 0
        # while True:
        #     data = myFile.file.read(8192)
        #     if not data:
        #         break
        #     size += len(data)

        size = 0
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            while True:
                data = myFile.file.read(1024 * 8)
                if not data:
                    break
                tmp.write(data)
                size+=len(data)

        target = os.path.join(os.getcwd() + '/app/tmp', myFile.filename)
        shutil.move(tmp.name, target)

        msg = {
            'type': 'FILE',
            'username': username,
            'url': '/tmp/' + str(myFile.filename),
            'fileName': str(myFile.filename),
            'contentType': str(myFile.content_type)
        }

        broadast_message(msg)



if __name__ == '__main__':
    import logging
    from ws4py import configure_logger
    configure_logger(level=logging.DEBUG)

    parser = argparse.ArgumentParser(description='Echo CherryPy Server')
    parser.add_argument('--host', default='0.0.0.0')
    parser.add_argument('-p', '--port', default=9000, type=int)
    parser.add_argument('--ssl', action='store_true')
    args = parser.parse_args()

    cherrypy.config.update({'server.socket_host': args.host,
                            'server.socket_port': int(os.environ.get('PORT', '9000')),
                            'tools.staticdir.root': os.path.abspath(os.path.join(os.path.dirname(__file__), 'static'))})

    if args.ssl:
        cherrypy.config.update({'server.ssl_certificate': './server.crt',
                                'server.ssl_private_key': './server.key'})

    WebSocketPlugin(cherrypy.engine).subscribe()
    cherrypy.tools.websocket = WebSocketTool()

    current_dir = os.path.dirname(os.path.abspath(__file__))

    cherrypy.quickstart(Root(args.host, args.port, args.ssl), '', config={
        '/': {
            'tools.staticdir.root': os.path.join(current_dir, 'app'),
        },
        '/ws': {
            'tools.websocket.on': True,
            'tools.websocket.handler_cls': ChatWebSocketHandler
            },
        '/styles': {
              'tools.staticdir.on': True,
              'tools.staticdir.dir': 'styles'
            },
        '/scripts': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': 'scripts'
        },
        '/images': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': 'images'
        },
        '/tmp': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': 'tmp'
        }
    })
