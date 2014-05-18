$(function() {
    var unreadCount = 0;
    var $chatWindow = $('#chat');
    var $roomList = $('#room_list');
    var roomList = [];

    var websocket = scheme + "://" + location.hostname + ":" + port + "/ws";

    if (window.WebSocket) {
        ws = new WebSocket(websocket);
    }
    else if (window.MozWebSocket) {
        ws = MozWebSocket(websocket);
    }
    else {
        console.log('WebSocket Not Supported');
        return;
    }


    function updateChatWindow() {
        $(window).scrollTop($(window).height());

        // Prevent the window from getting too full and slowing everything down.
        if ($chatWindow.children().length > 200) {
            $chatWindow.children()[0].remove();
        }

        unreadCount++;
        updateTitle();
    }

    function addMessageToChat(msg) {
        // TODO: Move into ChatWindow class, add different categories of messages: info, say, event, etc.
        $chatWindow.append("<div class='user-container'><strong>" + msg.username + ":</strong> " + msg.data + "</div>");
        updateChatWindow();
    }

    function addEventToChat(msg) {
        $chatWindow.append("<div class='user-container event_msg'><i>" + msg + "</i></div>");
        updateChatWindow();
    }

    function updateTitle() {
        var title = "MockingJay";
        if (unreadCount > 0) {
            title += " (" + unreadCount + ")";
        }

        document.title = title;
    }

    window.onbeforeunload = function(e) {
        addEventToChat('Bye bye...');

        msg = {
            type: 'EVENT',
            event: 'SIGN_OFF',
            username: username
        }

        ws.send(JSON.stringify(msg));
        ws.close(1000, username + " left the chat..");

        if(!e) e = window.event;
        e.stopPropagation();
        e.preventDefault();
    };

    window.onmousemove = function(e) {
        unreadCount = 0;
        updateTitle();
    };

    ws.onmessage = function (evt) {
        msg = JSON.parse(evt.data);
        console.log(msg)
        if (msg.type == "EVENT") {
            if (msg.event == "FIRST_SIGN_ON") {
                username = msg.username;
                addEventToChat("Welcome, " + username + " if you would like to change your name type '/nick [username]' into the chat box below.");
            } else if (msg.event == "SIGN_ON") {
                addEventToChat(msg.username + " signed on");
            } else if (msg.event == "SIGN_OFF") {
                addEventToChat(msg.username + " signed off");
            } else  if (msg.event == "NAME_CHANGED") {
                if (msg.username == username) {
                    username = msg.new_name;
                    window.localStorage['username'] = username;
                }
                addEventToChat(msg.username + " changed name to " + msg.new_name);
            }
        } else if (msg.type == "INFO") {
            if (msg.info == "ROOM_LIST") {
                roomList = msg.data
                $roomList.empty()
                for(var i = 0;i<roomList.length;i++) {
                    $roomList.append("<div>"+ roomList[i] + "</div>");
                }
            }
        } else {
            addMessageToChat(msg);
        }
    };

    ws.onopen = function() {
        msg = {
            type: 'EVENT',
            event: 'FIRST_SIGN_ON'
        };

        if (window.localStorage['username']) {
            msg.username = window.localStorage['username'];
        }

        ws.send(JSON.stringify(msg));
    };

    ws.onclose = function(evt) {
        addEventToChat('Connection closed by server: ' + evt.code + ' \"' + evt.reason);
    };

    function sendMessage() {
        var $message = $('#message');
        var value = $message.val();

        // TODO: move this into a parser class
        if (value[0] == '/') {
            if(value.substring(0,5) == '/nick') {
                var newUsername = value.substring(6,value.length);
                ws.send(JSON.stringify({username: username, type: "CMD", command: "NAME_CHANGE", new_name: newUsername}))
                // TODO: save this to local storage as a preference
            }
        } else {
            ws.send(JSON.stringify({username: username, type: "MSG", data: value}))
        }

        $message.val("");
        return false;
    }

    $('#send').click(function() {
        return sendMessage();
    });

    $('#message').keypress(function(e) {
        unreadCount = 0;
        updateTitle();
        if (e.which == 13) {
            return sendMessage();
        }
    });

});
