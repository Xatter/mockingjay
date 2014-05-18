# -*- coding: utf-8 -*-
import argparse
import random
import os
import cherrypy
import json

from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool
from ws4py.websocket import WebSocket
from ws4py.messaging import TextMessage

class MSG_TYPE:
    ADMIN = 'ADMIN'
    MSG   = 'MSG'
    
class MSG_SUB_TYPE:
    OPEN = 'OPEN'
    NAME_CHANGE = 'NAME_CHANGE'
    TEXT = 'TEXT'


class ChatWebSocketHandler(WebSocket):
    room_list = []
    def __init__(self, sock, protocols=None, extensions=None, environ=None, heartbeat_freq=None):
        WebSocket.__init__(self, sock, protocols=None, extensions=None, environ=None, heartbeat_freq=10)
    
    def opened(self):
        pass

    def send_message(self, msg):
        cherrypy.engine.publish('websocket-broadcast', TextMessage(json.dumps(msg)))
    
    def received_message(self, m):
        return_msg = msg = json.loads(m.data)
        print msg

        if msg['type'] == "CMD":
            if msg['command'] == "NAME_CHANGE":
                self.room_list[self.room_list.index(msg['username'])] =  msg['new_name']
                self.room_list.sort()

                return_msg = {
                    "type": "EVENT",
                    "event": "NAME_CHANGED",
                    "username": msg['username'],
                    "new_name": msg['new_name']
                }
        elif msg['type'] == "EVENT":
            if msg['event'] == "SIGN_ON":
                userid = 'User%d' % (random.randrange(0,100))
                return_msg = {
                    "type": 'EVENT',
                    "event": 'SIGN_ON',
                    "username": userid
                }
                self.room_list.append(userid)
                self.room_list.sort()

        self.send_message(return_msg)

    def closed(self, code, reason="A client left the room without a proper explanation."):
        cherrypy.engine.publish('websocket-broadcast', TextMessage(reason))

from jinja2 import Environment as Jinja2Environment, FileSystemLoader
jinja2_env = Jinja2Environment(loader=FileSystemLoader('app'))

class Root(object):
    def __init__(self, host, port, ssl=False):
        self.host = host
        self.port = port
        self.scheme = 'wss' if ssl else 'ws'

    @cherrypy.expose
    def index(self):
        tmpl = jinja2_env.get_template("views/main.html")
        return tmpl.render(port=self.port, host=self.host, scheme=self.scheme)

    @cherrypy.expose
    def ws(self):
        cherrypy.log("Handler created: %s" % repr(cherrypy.request.ws_handler))

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
                            'server.socket_port': args.port,
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
        }
        }
    )
