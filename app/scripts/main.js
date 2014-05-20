$(function() {
    var unreadCount = 0;
    var $chatWindow = $('#chat');
    var $roomList = $('#room_list');
    var roomList = [];

    var websocket = scheme + "://" + location.hostname + ":" + port + "/ws";

    //this bit can probably be moved to html
    var chime = document.createElement('audio');
    chime.setAttribute('src', 'data:audio/wav;base64,UklGRi4IAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YakHAACAgIGBgYKEh4qLjIyNjY2LioqJh4aGio2QkZGRkI6Lh4B3cXJ0dnp/g4aHiImDdm1pZmVnbHR6fYGLlZuhpKOgnp2dnJGCdWldU0pEPjgyOktaaHR+homLjZWYjn9wYFJNSUZCPkNadYuitMXU2+Dn7uXRv7KnoaCkqKagpLO8wsfJyMG7uLetlYBzaF5ZVFNVVFFWYmt1fH58dm9pZl9NOy4hFQsEBAgKDRwyQ1NldICIi4+Xm5iVkId/eHR0dHN0gZWnuMna6fX6/P/979/Ova+knpybmJWZoaOlp6elopuVk4t7bF9SSUNAP0JGR0xZZXB8g4eLjod6aVdJPjEjHyUwPUlSXnKEiYF0aF1SQjIvOEdZa3iJnaqspp6WlZOLipSlus7d5vD17t/Qv7Oup5+cpbPCztHT1dTFrZN6ZVhLPjo/SVRcW1xiZFtKNiQYEAgAAg4fMkBIUV5mZV9ZVVpjZ218kanB0tzl7Ori2M/IyMrIydDd6vX49fHt4cy0nYd5cGVdXWJpb29pZmZhVEIuHRIMBQAEDhonMTY9RkxMSkVCRk9UWWV3ip6uusPLzcrFwLu7wMPFy9fj7/j6+PTs38y4o5OJgXhzdnuAhYR/endvYU87KiAaEw8SGyYxO0BGTlJQS0VAQEZKTllrf5WsvcHBwcC8s62xvcfT4+/z9vn359PEuayhm5iTi4J3alpQTkxFPjovIRYNBQIKHC0+UGFkXltbWFRXaX+UqsPZ4+fq6uHUzs7LyMvT19HGt5+Da19YVFJWW1ZNRTwvJis2QElVX1tRS05QUmF8mbHK5vn79e7j0b60rqqorLjCv7WnkHFVRDYtKzE2NDAvLysnLDlDTVpna2NdYmptdYqlu9Dn+v/68+zeyLavq6eor7i+vbeslnZcTkAzLS0uKiUmJiIdIzE6PkRMTUQ8P0ZLU2mJpLrT7Pv8+fXs28rEwr67v8vW1Mm/uLCllHdeVlJHNichIy5AXH2NjYuKhXpsaHJ6eHFoXFVWYHF2bWFVR0FETFdbV1piZ25/l7TM1tnZ0MfDwcPN1NTKtZ6Uj4iEgHRlU0I+RElSW1tZV1NTXGp/m662uLGloKCls8DCuaaMd2lgX2JeU0Y2KyszP0xSUFBQTlJfc4uisr/Hw7y8wMfS2NTHr5OAdGtpa2pmXlNNUFVaX15bWlhWW2RziJ2uvcbGwsC+wMXHw7ikjXpsY2JmZ2ZhV05LTE5RT0lFRUVKU2Fzhpajr7Owr66usrW0rqGNe25kXl9gX1xVTUtMT1RYWFdZXGFqdYSVpbG7wsK+vLm5vL26sqibj4d/enp5dW9mXFZTUFBQS0dGR0pSYHWGjY2RnK7Ayse3opOSmJaGbFFFSVRWTDwyPVd2iIh8cHWKqr++pouAh5idjGtLP0hdZ1xGOENkj6+2rKCmwOP589aznp+rq5RrQzI7UWBbSDU2T3eaqJ+NhpOwy9G/n4eDjpaIZDodGSk8PzMgGCdLdI+XkIuWstXq5syunaGtr5p0TTg6SlZTRTc3TnWarayhnarH5fPpzK6en6SehmJBMjVCRz4sHiE5X4CRj4WBjqnH1c62npOVmpV/YEU7QlBXTjwtLUJkhZeZk5GbscnVzrunnZ6jnolpSz1BUl9fUkRATmqKoKejnqCsvsnEspyNjJOWinFUPjhATVJMQDg8TmiAjZGSl6S5zNTMu6mhpKqpm4BjT0pPWFpTS0ZNXHGAh4aDhIydrbOsnIyGipSZkoFwYVZQUVRZYGdpa25sZWNpdoynur65rqKZlpaVl56ioJmLdV9SS09bZmZcTj4xMjtIU1xbVFJWWFdZXmp/ma24vbispaixvMza39rQwK6gl4yCgYOCfHBcRzs7QEpXW1ZOR0A9Q09gdo2eqK+xqZ+Zl5qltL/AuKaOeWxlYmVrbWpjWk5HRklOVl1fXVxbV1ZbZ3eMn6y0ubq1sK6vsLa9wsTAtqaViH52c3V1cWpgVU5MTk9RVFNQUVNUVVpganeIlZ6kpaGbl5eYm6Glp6ahmY2De3JtbG5vbmpiWlVWWV1jZmZjY2VnbHJ5gImSmqCmqaijn5ybnaKmqKahmZCKhYF9enh0cW5qZmRiYmJkZmdnaGhoaWtvdX2EiYyOkZKSkZGQj5CRkpOSkIqFgHt3dXNyc3R1dnl9gYOBfXh1c3Fta2xvcnV3e4CEhoaGhoiIhoSEhomNkJSan6GhnpuZlpGMiIaGhYOCg4WGhoOBfXp1cGtnZ2dnZ2hrbm9ubGtqaWdmZmltcHN2eXx9fHp6ent7e3x/g4iMj5KWmZqamZeWlJGOi4qJiYmJiouNjY2LioiFgn98e3p5eXl5ent7e3p6enp6enp6e3x8fH19fX19fn5+fn5+f39/f39/f3+AgICAgICAgICBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgABMSVNUWAAAAElORk9JQ09QHwAAAENvcHlyaWdodCCpIENpbmVtYXRyb25pY3MgMTk5NQAASVBSRCMAAABNaWNyb3NvZnQgUGx1cyEgriBmb3IgV2luZG93cyA5NSCuAAA=');
    chime.load();


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

    function escapeHtml(text) {
      return text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
    }


    function updateChatWindow() {
        $(window).scrollTop($(window).height());

        // Prevent the window from getting too full and slowing everything down.
        if ($chatWindow.children().length > 200) {
            $chatWindow.children()[0].remove();
            $chatWindow.children()[1].remove(); //We will removed 2 items to preserve odd row highlighting
        }

        unreadCount++;
        updateTitle();
    }


    function addMessageToChat(msg) {
        var text = msg.data;
        // These should be seperate addCodeMessage and addFileMessage calls, but I want the username
        // associated as well so I want the addMessage logic... needs refactoring.
        if (msg.type == "CODE") {
            text = escapeHtml(text); // for XML
            text = '<pre class="prettyprint linenums">' + text + '</pre>';
        } else if (msg.type == "FILE") {
            if (msg.contentType == "image/jpeg") {
                text = '<img src="' + msg.url + '"/>';
            } else {
                text = "<a href='" + msg.url + "' target='_blank'>"+ msg.fileName + "</a>";
            }
        }else {
            if (text[0] != '!') {
                text = linkify(text);
            } else {
                text = text.substring(1);
            }
        }



        // TODO: Move into ChatWindow class, add different categories of messages: info, say, event, etc.
        var date = new Date(msg.timestamp);
        var time = date.toLocaleTimeString();

        var $message = $('<div class="user-container"><span class="timestamp">['+time+'] </span><span class="username">'+msg.username+': </span><span>' + text +'</span></div>');

        if (($chatWindow.children().length % 2) == 1){
          $message.addClass('uc-odd');
        }

        if (text.indexOf(username) != -1) {
            chime.play();
            $message.addClass('highlight'); 
        }

        $chatWindow.append($message);

        updateChatWindow();
        if (msg.type == "CODE") {
            prettyPrint();
        }
    }

    function addEventToChat(msg) {
        $chatWindow.append("<div class='user-container event_msg'><i>" + msg + "</i></div>");
        updateChatWindow();
    }

    function updateTitle() {
        var title = "MockingJay";
        if (unreadCount > 0) {
            title = "(" + unreadCount + ") " + title;
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

    function sendCode() {
        var code = $('#codeArea').val();
        ws.send(JSON.stringify({username: username, type: "CODE", data: code}));
        $('#codeArea').val("");
    }

    $('#sendCode').click(function() {
        return sendCode();
    });

});
