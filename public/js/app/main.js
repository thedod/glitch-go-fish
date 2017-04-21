define(function(require) {
  var $ = require("jquery");
  var io = require("io");
  var _bootstrap = require("bootstrap");
  var gofish = require("./gofish");
  var Mustache = require("mustache");
  $(function() {
    var FADE_TIME = 150;
    var TYPING_TIMER_LENGTH = 400;
    var COLORS = [ "#e21400", "#91580f", "#f8a700", "#f78b00", "#58dc00", "#287b00", "#a8f07a", "#4ae8c4", "#3b88eb", "#3824aa", "#a700ff", "#d300e7" ];
    var $window = $(window);
    var $usernameInput = $(".usernameInput");
    var $messagesDiv = $("#messages-div");
    var $cardsDiv = $("#cards-div");
    var $messages = $(".messages");
    var $inputMessage = $(".inputMessage");
    var $loginModal = $("#login-modal");
    var $chatPage = $("#chat-page");
    var $userList = $("#user-list");
    var cardTemplate = $("#card-template").html();
    var userTemplate = $("#user-template").html();
    var username = "";
    var users = [];
    var $usermap = {};
    var typingmap = {};
    var connected = false;
    var typing = false;
    var lastTypingTime;
    var $currentInput = $usernameInput.focus();
    var socket = io();

    $.getJSON("/deck.json", function(data) {
      socket.deck = new gofish.CardDeck(data);
    });
    function updateGame(data) {
      if (data) {
        users = data.game.users;
        $('#pile-size').text(data.game.pile_size);
      }
      $usermap = {};
      users.forEach(function(user) {
        $usermap[user.name] = $("<li/>").addClass("list-group-item").data("user", user);
        updateUser(user.name);
      });
      $userList.empty();
      users.forEach(function(user) {
        $userList.append($usermap[user.name]);
      });
    }
    function updateUser(user_name) {
      var $user = $usermap[user_name];
      if (!$user) {
        console.log("can't find element for user " + user_name);
        return;
      }
      $user.html(Mustache.render(userTemplate, {
        user: $user.data("user"),
        typing: typingmap[user_name],
        me: user_name === username
      }));
    }
    function setUsername() {
      username = cleanInput($usernameInput.val().trim().toLowerCase());
      if (username) {
        $loginModal.modal("hide");
        $currentInput = $inputMessage.removeAttr("disabled").focus().val("").attr("placeholder", "chat here...");
        socket.emit("join", username);
      }
    }
    function sendMessage() {
      var message = $inputMessage.val();
      message = cleanInput(message);
      if (message && connected) {
        $inputMessage.val("");
        addChatMessage({
          username: username,
          message: message
        });
        socket.emit("new message", message);
      }
    }
    function log(message, options) {
      var $el = $("<li>").addClass("log").html(message);
      addMessageElement($el, options);
    }
    function addChatMessage(data, options) {
      var $usernameDiv = $('<span class="username"/>').text(data.username).css("color", getUsernameColor(data.username));
      var $messageBodyDiv = $("<span/>").addClass("messaegBody").text(data.message);
      var typingClass = data.typing ? "typing" : "";
      var $messageDiv = $('<li class="message"/>').data("username", data.username).addClass(typingClass).append($usernameDiv, $messageBodyDiv);
      addMessageElement($messageDiv, options);
    }
    function addChatTyping(data) {
      typingmap[data.username] = true;
      updateUser(data.username);
    }
    function removeChatTyping(data) {
      delete typingmap[data.username];
      updateUser(data.username);
    }
    function addMessageElement(el, options) {
      var $el = $(el);
      if (!options) {
        options = {};
      }
      if (typeof options.fade === "undefined") {
        options.fade = true;
      }
      if (typeof options.prepend === "undefined") {
        options.prepend = false;
      }
      if (options.fade) {
        $el.hide().fadeIn(FADE_TIME);
      }
      if (options.prepend) {
        $messages.prepend($el);
      } else {
        $messages.append($el);
      }
      $messagesDiv.animate({
        scrollTop: $messagesDiv.prop("scrollHeight") - $messagesDiv.height()
      }, 500);
    }
    function cleanInput(input) {
      return $("<div/>").text(input).text();
    }
    function updateTyping() {
      if (connected) {
        if (!typing) {
          typing = true;
          socket.emit("typing");
        }
        lastTypingTime = new Date().getTime();
        setTimeout(function() {
          var typingTimer = new Date().getTime();
          var timeDiff = typingTimer - lastTypingTime;
          if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
            socket.emit("stop typing");
            typing = false;
          }
        }, TYPING_TIMER_LENGTH);
      }
    }
    function getUsernameColor(username) {
      var hash = 7;
      for (var i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + (hash << 5) - hash;
      }
      var index = Math.abs(hash % COLORS.length);
      return COLORS[index];
    }
    $window.keydown(function(event) {
      if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        $currentInput.focus();
      }
      if (event.which === 13) {
        if (username) {
          sendMessage();
          socket.emit("stop typing");
          typing = false;
        } else {
          setUsername();
        }
      }
    });
    $inputMessage.on("input", function() {
      updateTyping();
    });
    $loginModal.click(function() {
      $currentInput.focus();
    });
    $inputMessage.click(function() {
      $inputMessage.focus();
    });
    socket.on("connect", function() {
      socket.hand = new gofish.CardHand(socket.deck);
    });
    socket.on("joined", function(data) {
      username = data.username;
      connected = true;
      var message = "Welcome, "+data.username;
      log(message, {
        prepend: true
      });
      updateGame(data);
    });
    socket.on("username taken", function(data) {
      username = "";
      $currentInput = $usernameInput.focus().val("")
        .attr("placeholder",
              "Sorry, " + data.username + " is taken.");
      $loginModal.modal("show");
    });
    socket.on("new message", function(data) {
      addChatMessage(data);
    });
    socket.on("status", function(data) {
      log(data.message);
      updateGame(data);
    });
    socket.on("take", function(data) {
      var card = socket.hand.deck.getCard(
        data.rank, data.suit);
      socket.hand.take(card);
      socket.hand.sort();
      $cardsDiv.empty();
      socket.hand.cards.forEach(function(card) {
        $cardsDiv.append($(Mustache.render(cardTemplate, card)));
      });
    });
    socket.on("user joined", function(data) {
      log(data.username + " joins");
      updateGame(data);
    });
    socket.on("user left", function(data) {
      log(data.username + " leaves");
      updateGame(data);
    });
    socket.on("typing", function(data) {
      addChatTyping(data);
    });
    socket.on("stop typing", function(data) {
      removeChatTyping(data);
    });
    $loginModal.on("hidden.bs.modal", function(e) {
      if (!username) $loginModal.modal("show");
    });
    $loginModal.modal("show");
  });
});
