define(function (require) {
  // Load any app-specific modules
  // with a relative require call,
  // like:
  //var gofish = require('./gofish');

  // Load library/vendor modules using
  // full IDs, like:
  var $ = require('jquery');
  var io = require('io');
  var _bootstrap = require('bootstrap');

  $(function() {
    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORS = [
      '#e21400', '#91580f', '#f8a700', '#f78b00',
      '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
      '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    // Initialize variables
    var $window = $(window);
    var $usernameInput = $('.usernameInput'); // Input for username
    var $messagesDiv = $('#messages-div')
    var $messages = $('.messages'); // Messages area
    var $inputMessage = $('.inputMessage'); // Input message input box

    var $loginModal = $('#login-modal'); // The login modal
    var $chatPage = $('#chat-page'); // The chatroom page
    var $userList = $('#user-list');

    // Prompt for setting a username
    var username = '';
    var $usermap = {};
    var typingmap = {};
    var connected = false;
    var typing = false;
    var lastTypingTime;
    var $currentInput = $usernameInput.focus();

    var socket = io();

    function updateUsers (data) {
      $usermap = {};
      data.users.forEach(function(user) {
        $usermap[user] = $('<li/>')
          .addClass('list-group-item');
        updateUser(user);
      });
      $userList.empty();
      for (var u in $usermap) {
        $userList.append($usermap[u]);
      }
    }

    function updateUser(user) {
      var $user = $usermap[user];
      if (!$user) return;
      $user.text(user);
      if (user===username) {
        $user.append(
          $('<span/>').addClass('badge').text('me')
        )
      }
      if (typingmap[user]) {
        $user.append(
          $('<span/>').addClass('badge').text('typing')
        );
      };
    }

    // Sets the client's username
    function setUsername () {
      username = cleanInput($usernameInput.val().trim().toLowerCase());

      // If the username is valid
      if (username) {
        $loginModal.modal('hide');
        $currentInput = $inputMessage.removeAttr('disabled')
          .focus().val('').attr('placeholder','chat here...');

        // Tell the server your username
        socket.emit('join', username);
      }
    }

    // Sends a chat message
    function sendMessage () {
      var message = $inputMessage.val();
      // Prevent markup from being injected into the message
      message = cleanInput(message);
      // if there is a non-empty message and a socket connection
      if (message && connected) {
        $inputMessage.val('');
        addChatMessage({
          username: username,
          message: message
        });
        // tell server to execute 'new message' and send along one parameter
        socket.emit('new message', message);
      }
    }

    // Log a message
    function log (message, options) {
      var $el = $('<li>').addClass('log').text(message);
      addMessageElement($el, options);
    }

    // Adds the visual chat message to the message list
    function addChatMessage (data, options) {
      // Don't fade the message in if there is an 'X was typing'
      var $typingMessages = getTypingMessages(data);
      options = options || {};
      if ($typingMessages.length !== 0) {
        options.fade = false;
        $typingMessages.remove();
      }

      var $usernameDiv = $('<span class="username"/>')
        .text(data.username)
        .css('color', getUsernameColor(data.username));
      var $messageBodyDiv = $('<span/>').addClass('messaegBody')
        .text(data.message);
      var typingClass = data.typing ? 'typing' : '';
      var $messageDiv = $('<li class="message"/>')
        .data('username', data.username)
        .addClass(typingClass)
        .append($usernameDiv, $messageBodyDiv);

      addMessageElement($messageDiv, options);
    }

    // Adds the visual chat typing message
    function addChatTyping (data) {
      typingmap[data.username] = true;
     updateUser(data.username);
    }

    // Removes the visual chat typing message
    function removeChatTyping (data) {
      typingmap[data.username] = false;
      updateUser(data.username);
    }

    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    //   all other messages (default = false)
    function addMessageElement (el, options) {
      var $el = $(el);

      // Setup default options
      if (!options) {
        options = {};
      }
      if (typeof options.fade === 'undefined') {
        options.fade = true;
      }
      if (typeof options.prepend === 'undefined') {
        options.prepend = false;
      }

      // Apply options
      if (options.fade) {
        $el.hide().fadeIn(FADE_TIME);
      }
      if (options.prepend) {
        $messages.prepend($el);
      } else {
        $messages.append($el);
      }

      // Scroll to bottom
      $messagesDiv.animate(
        { scrollTop: $messagesDiv.prop("scrollHeight") - $messagesDiv.height() },
        500);
    }

    // Prevents input from having injected markup
    function cleanInput (input) {
      return $('<div/>').text(input).text();
    }

    // Updates the typing event
    function updateTyping () {
      if (connected) {
        if (!typing) {
          typing = true;
          socket.emit('typing');
        }
        lastTypingTime = (new Date()).getTime();

        setTimeout(function () {
          var typingTimer = (new Date()).getTime();
          var timeDiff = typingTimer - lastTypingTime;
          if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
            socket.emit('stop typing');
            typing = false;
          }
        }, TYPING_TIMER_LENGTH);
      }
    }

    // Gets the 'X is typing' messages of a user
    function getTypingMessages (data) {
      return $('.typing.message').filter(function (i) {
        return $(this).data('username') === data.username;
      });
    }

    // Gets the color of a username through our hash function
    function getUsernameColor (username) {
      // Compute hash code
      var hash = 7;
      for (var i = 0; i < username.length; i++) {
         hash = username.charCodeAt(i) + (hash << 5) - hash;
      }
      // Calculate color
      var index = Math.abs(hash % COLORS.length);
      return COLORS[index];
    }

    // Keyboard events

    $window.keydown(function (event) {
      // Auto-focus the current input when a key is typed
      if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        $currentInput.focus();
      }
      // When the client hits ENTER on their keyboard
      if (event.which === 13) {
        if (username) {
          sendMessage();
          socket.emit('stop typing');
          typing = false;
        } else {
          setUsername();
        }
      }
    });

    $inputMessage.on('input', function() {
      updateTyping();
    });

    // Click events

    // Focus input when clicking anywhere on login modal
    $loginModal.click(function () {
      $currentInput.focus();
    });

    // Focus input when clicking on the message input's border
    $inputMessage.click(function () {
      $inputMessage.focus();
    });

    // Socket events

    // Whenever the server emits 'joined', log the login message
    socket.on('joined', function (data) {
      connected = true;
      // Display the welcome message
      var message = "Welcome, "+data.username;
      log(message, {
        prepend: true
      });
      updateUsers(data);
    });

    socket.on('username taken', function(data) {
      username = '';
      $currentInput = $usernameInput.focus().val('')
        .attr('placeholder', 'Sorry, '+data.username+' is taken.');
      $loginModal.modal('show');
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', function (data) {
      addChatMessage(data);
    });

    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', function (data) {
      log(data.username + ' joined');
      updateUsers(data);
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', function (data) {
      log(data.username + ' left');
      updateUsers(data);
      removeChatTyping(data);
    });

    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', function (data) {
      addChatTyping(data);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', function (data) {
      removeChatTyping(data);
    });

    $loginModal.on('hidden.bs.modal', function (e) {
      if (!username)
        $loginModal.modal('show');
    });
    
    $loginModal.modal('show');
  });
});
