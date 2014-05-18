$(function() {
    var unreadCount = 0;
    var $chatWindow = $('#chat');

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
        $chatWindow.append("<div class='user-container'><strong>" + username + ":</strong> " + msg + "</div>");
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
        addMessageToChat('Bye bye...');
        ws.close(1000, username + ' left the room');

        if(!e) e = window.event;
        e.stopPropagation();
        e.preventDefault();
    };

    window.onmousemove = function(e) {
        unreadCount = 0;
        updateTitle();
    };

    ws.onmessage = function (evt) {
        console.log(evt.data);
        msg = JSON.parse(evt.data);
        if (msg.type == "EVENT") {
            if (msg.event == "SIGN_ON") {
                username = msg.username;
                addEventToChat(username + " signed on");
                addMessageToChat("Welcome, " + username + " if you would like to change your name type '/nick [username]' into the chat box below.");
            } else  if (msg.event == "NAME_CHANGED") {
                username = msg.new_name;
                addEventToChat(msg.username + " changed name to " + msg.new_name);
            }
        } else {
            addMessageToChat(msg.data);
        }
    };

    ws.onopen = function() {
        msg = {
            type: 'EVENT',
            event: 'SIGN_ON'
        };

        ws.send(JSON.stringify(msg));
    };

    ws.onclose = function(evt) {
        addMessageToChat('Connection closed by server: ' + evt.code + ' \"' + evt.reason);
    };

    function sendMessage() {
        var $message = $('#message');
        var value = $message.val();

        // TODO: move this into a parser class
        if (value[0] == '/') {
            if(value.substring(0,5) == '/nick') {
                var newUsername = value.substring(6,value.length);
                ws.send(JSON.stringify({username: username, type: "CMD", command: "NAME_CHANGE", new_name: newUsername}))
                username = newUsername;
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
        if (e.which == 13) {
            return sendMessage();
        }
    });

});
