$(function () {
    var $roomList = $('#room_list');
    var roomList = [];

    var websocket = scheme + "://" + location.hostname + ":" + location.port + "/ws";
    var socket = new Socket(websocket);

    var chatWindow = new ChatWindow(socket);

    function process_message(msg) {
        if (msg.type == "EVENT") {
            if (msg.event == "FIRST_SIGN_ON") {
                username = msg.username;

                for (var i = 0;i < msg.history.length;i++) {
                    process_message(msg.history[i]);
                }

                msg_obj = new EventMessage("<strong>Welcome, " + username + "</strong> if you would like to change your name type '/nick [username]' into the chat box below.");
                chatWindow.append(msg_obj);
                msg_obj = new EventMessage("To share code samples, please paste it in the code box so it will be formatted correctly.");
                chatWindow.append(msg_obj);
                msg_obj = new EventMessage("To share an image or file, simply <strong>drag and drop</strong> it into this window.");
                chatWindow.append(msg_obj);
                return false; //handled
            } else if (msg.event == "SIGN_ON") {
                msg_obj = new EventMessage(msg.username + " signed on");
            } else if (msg.event == "SIGN_OFF") {
                msg_obj = new EventMessage(msg.username + " signed off");
            } else if (msg.event == "NAME_CHANGED") {
                if (msg.username == username) {
                    username = msg.new_name;
                    window.localStorage['username'] = username;
                }
                msg_obj = new EventMessage(msg.username + " changed name to " + msg.new_name);
            }
        } else if (msg.type == "INFO") {
            if (msg.info == "ROOM_LIST") {
                roomList = msg.data
                $roomList.empty()
                for (var i = 0; i < roomList.length; i++) {
                    $roomList.append("<div>" + roomList[i] + "</div>");
                }
            }
            return false; //handled
        } else if (msg.type == "CODE") {
            msg_obj = new CodeMessage(msg);
        } else if (msg.type == 'FILE') {
            msg_obj = new FileMessage(msg);
        } else {
            msg_obj = new Message(msg);
        }

        chatWindow.append(msg_obj);
    }

    socket.onMessage.subscribe(process_message);

    socket.onOpen.subscribe(function(event) {
        msg = {
            type: 'EVENT',
            event: 'FIRST_SIGN_ON'
        };

        if (window.localStorage['username']) {
            msg.username = window.localStorage['username'];
        }

        socket.sendMessage(msg);
    });

    socket.onClose.subscribe(function(evt) {
        msg_obj = new EventMessage('Connection closed by server: ' + evt.code + ' \"' + evt.reason);
        chatWindow.append(msg_obj);
    });

    socket.onReconnect.subscribe(function(e) {
        msg = new EventMessage();
        msg.event = "RESIGN_ON";
        socket.sendMessage(msg);
    });

    socket.connect()


    function sendMessage() {
        var $message = $('#message');
        var value = $message.val();

        if (value[0] == '/') {
            if (value.substring(0, 5) == '/nick') {
                var newUsername = value.substring(6, value.length);
                socket.sendMessage({username: username, type: "CMD", command: "NAME_CHANGE", new_name: newUsername});
            }
        } else {
            msg = new Message();
            msg.data = value;
            socket.sendMessage(msg);
        }

        $message.val("");
    }

    $('#send').click(function () {
        return sendMessage();
    });

    $('#message').keypress(function (e) {
        if (e.which == 13) {
            e.preventDefault();
            return sendMessage();
        }
    });

    $('#sendCode').click(function () {
        var code = $('#codeArea').val();
        msg = new CodeMessage();
        msg.data = code;
        socket.sendMessage(msg);
        $('#codeArea').val("");
    });

    $('#fileupload').fileupload({
        dataType: 'json',
        paramName: 'myFile',
        complete: function (e, data) {
            $('#progress').remove();
        },
        done: function (e, data) {
            $('#progress').remove();
        },
        add: function (e, data) {
            data.formData = {username: username};
            var $ui = $('<div id="progress" class="progress"><div class="progress-bar progress-success" style="width: 0%;"></div></div>');
            $ui.prependTo($('#input-area'))

            if (e.isDefaultPrevented()) {
                return false;
            }

            if (data.autoUpload || (data.autoUpload !== false &&
                $(this).fileupload('option', 'autoUpload'))) {
                data.process().done(function () {
                    data.submit();
                });
            }
        },
        progress: function (e, data) {
            progress = parseInt(data.loaded / data.total * 100, 10);
            $('#progress .progress-bar').css('width', progress + '%');
        }
    }).on('fileuploaddone', function (e, data) {
        });
});
