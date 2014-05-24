class Event
  constructor: ->
    @handlers = [];

  subscribe: (func) ->
    @handlers.push(func)

  trigger: (event) ->
    for handler in @handlers
      handler(event)


class @Socket
  constructor: (@connect_string) ->
    @timeoutInterval = 2000
    @reconnectInterval = 1000
    @debug = false
    @clientClosedConnection = false

    @onMessage = new Event
    @onOpen = new Event
    @onClose = new Event
    @onReconnect = new Event
    @onError = new Event

  connect: (reconnectAttempt=false) ->
    if window.WebSocket
      @_ws = new WebSocket(@connect_string)
    else if window.MozWebSocket
      @_ws = new MozWebSocket(@connect_string)
    else
      console.log "WebSocket Not Supported"

    timeout = setTimeout( =>
      @timedOut = true
      @_ws.close()
      @timedOut = false
    , @timeoutInterval)

    @_ws.onopen = (e) =>
      console.debug('Socket', 'onopen', @connect_string) if @debug

      clearTimeout(timeout)
      if reconnectAttempt
        @onReconnect.trigger(e)
        @reconnectAttempt = false;
      else
        @onOpen.trigger(e)

    @_ws.onclose = (e) =>
      console.debug('Socket', 'onclose', @connect_string) if @debug

      clearTimeout(timeout)
      @_ws = null

      if @clientClosedConnection
        @onClose.trigger(e)
      else
        if !reconnectAttempt and !@timedOut
          console.debug "Socket", "onclose", @connect_string
          @onClose.trigger(e)

        setTimeout( =>
          @connect true
        , @reconnectInterval)

    @_ws.onmessage =  (e) =>
      console.debug('Socket', 'onmessage', @connect_string, event.data) if @debug
      @onMessage.trigger(e)

    @_ws.onerror = (e) =>
      console.debug('Socket', 'onerror', @connect_string, event) if @debug
      @onError.trigger(e)

  send: (data) ->
    console.debug('Socket', 'send', @connect_string, data) if @debug
    @_ws.send(data)

  sendMessage: (message) ->
    console.debug('Socket', 'sendMessage', @connect_string, message)
    @_ws.send(JSON.stringify(message))

  close: ->
    console.debug('Socket', 'close', @connect_string, message) if @debug
    @clientClosedConnection = true
    if @_ws
      @_ws.close()

