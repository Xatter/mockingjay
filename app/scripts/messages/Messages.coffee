class @Message
  constructor: (@msg, @type="MSG") ->

  _createUserContainer: ->
    date = new Date(msg.timestamp);
    time = date.toLocaleTimeString();
    $userContainer = $('<div></div>').addClass('user-container')
    $timestamp = $('<span></span>').addClass('timestamp').append('[' + time + ']')
    $userName = $('<span></span>').addClass('username').append(@msg.username + ": ")
    $userContainer.append($timestamp)
    $userContainer.append($userName)

  say: ->
    text = @msg.data;

    if text[0] != '!'
      text = linkify(text);
    else
      text = text.substring(1)

    $userContainer = @_createUserContainer(@msg);
    $text = $('<span></span>').append(text);
    $userContainer.append($text);

  post_say: ->

  send: (data) ->
    ws.send(JSON.stringify({username: username, type: @type, data: data}));


class @EventMessage extends Message
  constructor: (@msg) ->
    super(@msg, "EVENT")

  say: ->
    $("<div class='user-container event_msg'><i>" + @msg + "</i></div>")


class @CodeMessage extends Message
  constructor: (@msg) ->
    super(@msg, "CODE")

  _escapeHtml: (text) ->
    text.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  say: ->
    $userContainer = @_createUserContainer()

    $code = $("<pre></pre>")
      .addClass("prettyprint")
      .addClass("linenums")

    text = @_escapeHtml(@msg.data) # for XML
    $code.append(text)
    $userContainer.append($code)

  post_say: ->
    prettyPrint()


class @FileMessage extends Message
  constructor: (@msg) ->
    super(@msg, "FILE")

  say: ->
    $userContainer = @_createUserContainer();
    if @msg.contentType.substring(0, 5) == ('image')
      text = '<img src="' + this.msg.url + '"/>';
    else
      text = "<a href='" + this.msg.url + "' target='_blank'>" + this.msg.fileName + "</a>";

    $userContainer.append(text);

class @CommandMessage extends Message
  constructor: (@msg) ->
    super(@msg, "CMD")
