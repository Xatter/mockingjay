// Generated by CoffeeScript 1.7.1
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.Message = (function() {
    function Message(msg, type) {
      var _ref;
      this.msg = msg;
      this.type = type != null ? type : "MSG";
      this.username = username;
      this.text = ((_ref = this.msg) != null ? _ref.data : void 0) || "";
    }

    Message.prototype._createUserContainer = function() {
      var $timestamp, $userContainer, $userName, date, time;
      date = new Date(this.msg.timestamp);
      time = date.toLocaleTimeString();
      $userContainer = $('<div></div>').addClass('user-container');
      $timestamp = $('<span></span>').addClass('timestamp').append("[" + time + "]");
      $userName = $('<span></span>').addClass('username').append("" + this.msg.username + ":");
      $userContainer.append($timestamp);
      return $userContainer.append($userName);
    };

    Message.prototype.as_html = function() {
      var $text, $userContainer, text;
      text = this.msg.data;
      if (text[0] !== '!') {
        text = linkify(text);
      } else {
        text = text.substring(1);
      }
      $userContainer = this._createUserContainer(this.msg);
      $text = $('<span></span>').append(text);
      return $userContainer.append($text);
    };

    Message.prototype.post_as_html = function() {};

    return Message;

  })();

  this.EventMessage = (function(_super) {
    __extends(EventMessage, _super);

    function EventMessage(msg) {
      this.msg = msg;
      EventMessage.__super__.constructor.call(this, this.msg, "EVENT");
    }

    EventMessage.prototype.as_html = function() {
      return $("<div class='user-container event_msg'><i>" + this.msg + "</i></div>");
    };

    return EventMessage;

  })(Message);

  this.CodeMessage = (function(_super) {
    __extends(CodeMessage, _super);

    function CodeMessage(msg) {
      this.msg = msg;
      CodeMessage.__super__.constructor.call(this, this.msg, "CODE");
    }

    CodeMessage.prototype._escapeHtml = function(text) {
      return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    };

    CodeMessage.prototype.as_html = function() {
      var $code, $userContainer, text;
      $userContainer = this._createUserContainer();
      $code = $("<pre></pre>").addClass("prettyprint").addClass("linenums");
      text = this._escapeHtml(this.msg.data);
      $code.append(text);
      return $userContainer.append($code);
    };

    CodeMessage.prototype.post_as_html = function() {
      return prettyPrint();
    };

    return CodeMessage;

  })(Message);

  this.FileMessage = (function(_super) {
    __extends(FileMessage, _super);

    function FileMessage(msg) {
      this.msg = msg;
      FileMessage.__super__.constructor.call(this, this.msg, "FILE");
    }

    FileMessage.prototype.as_html = function() {
      var $userContainer, text;
      $userContainer = this._createUserContainer();
      if (this.msg.contentType.substring(0, 5) === 'image') {
        text = '<img src="' + this.msg.url + '"/>';
      } else {
        text = "<a href='" + this.msg.url + "' target='_blank'>" + this.msg.fileName + "</a>";
      }
      return $userContainer.append(text);
    };

    return FileMessage;

  })(Message);

  this.CommandMessage = (function(_super) {
    __extends(CommandMessage, _super);

    function CommandMessage(msg) {
      this.msg = msg;
      CommandMessage.__super__.constructor.call(this, this.msg, "CMD");
    }

    return CommandMessage;

  })(Message);

  this.InfoMessage = (function(_super) {
    __extends(InfoMessage, _super);

    function InfoMessage(msg) {
      this.msg = msg;
      InfoMessage.__super__.constructor.call(this, this.msg, "INFO");
    }

    return InfoMessage;

  })(Message);

}).call(this);
