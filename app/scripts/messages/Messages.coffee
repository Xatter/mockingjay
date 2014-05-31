class @Message
  constructor: (@msg, @type="MSG") ->
    @username = username
    @text = @msg?.data or ""

  _createUserContainer: ->
    date = new Date(@msg.timestamp);
    time = date.toLocaleTimeString();
    $userContainer = $('<div></div>').addClass('user-container')
    $timestamp = $('<span></span>').addClass('timestamp').append("[#{time}]")
    $userName = $('<span></span>').addClass('username').append("#{@msg.username}:")
    $userContainer.append($timestamp)
    $userContainer.append($userName)

  as_html: ->
    text = @msg.data;

    if text[0] != '!'
      text = linkify(text);
    else
      text = text.substring(1)

    $userContainer = @_createUserContainer(@msg);
    $text = $('<span></span>').append(text);
    $userContainer.append($text);

  post_as_html: ->

class @EventMessage extends Message
  constructor: (@msg) ->
    super(@msg, "EVENT")

  as_html: ->
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

  as_html: ->
    $userContainer = @_createUserContainer()

    $code = $("<pre></pre>")
      .addClass("prettyprint")
      .addClass("linenums")

    text = @_escapeHtml(@msg.data) # for XML
    $code.append(text)
    $userContainer.append($code)

  post_as_html: ->
    prettyPrint()


class @FileMessage extends Message
  constructor: (@msg) ->
    super(@msg, "FILE")

  as_html: ->
    $userContainer = @_createUserContainer();
    if @msg.contentType.substring(0, 5) == ('image')
      text = "<img src='#{@msg.url}'/>"
    else
      text = "<a href='#{@msg.url}' target='_blank' download='#{@msg.fileName}'>#{@msg.fileName}</a>"

    $userContainer.append(text);

class @CommandMessage extends Message
  constructor: (@msg) ->
    super(@msg, "CMD")

class @InfoMessage extends Message
  constructor: (@msg) ->
    super(@msg, "INFO")
