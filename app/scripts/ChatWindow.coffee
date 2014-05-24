class @ChatWindow
  constructor: ->
    @unreadCount = 0;
    @$chatWindow = $('#chat');

    window.onmousemove = (e) =>
      @_resetUnreadCount()

    window.onbeforeunload = (e) ->
      msg_obj = new EventMessage('Bye bye...')

      msg = {
        type: 'EVENT',
        event: 'SIGN_OFF',
        username: username
      }

      ws.send(JSON.stringify(msg));
      ws.close(1000, username + " left the chat..")

      if (!e)
        e = window.event;
      e.stopPropagation()
      e.preventDefault()

    $('#message').keypress (e) =>
      @unreadCount = 0;
      @update();

  _resetUnreadCount: ->
    @unreadCount = 0
    @_updateTitle()


  _updateTitle: ->
    title = "MockingJay"
    if @unreadCount > 0
      title = "(#{@unreadCount}) #{title}"

    document.title = title

  _autoScroll: ->
    $(window).scrollTop($(window).height())

  update: ->
    @_autoScroll()

    # Prevent the window from getting too full and slowing everything down.
    if @$chatWindow.children().length > 200
      @$chatWindow.children()[0].remove();
      @$chatWindow.children()[1].remove(); # We will removed 2 items to preserve odd row highlighting

    @_resetUnreadCount()

  append: (msg) ->
    $msg = msg.say()

    if (@$chatWindow.children().length % 2) == 1
      $msg.addClass('uc-odd');

    if $msg.val().indexOf(username) != -1
      chime.play();
      $msg.addClass('highlight');

    @$chatWindow.append $msg
    @update()


