// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

var requirejs = require('requirejs');

requirejs.config({
    baseUrl: 'public/js/lib',
    paths: {
        app: '../app',
        mustache: 'mustache.min'
    },
    nodeRequire: require
});

//
var log_the_deck = requirejs(
  ['mustache', 'app/gofish'],
  function(Mustache, gofish) {
    var deckspec = require(__dirname+'/public/deck.json');
    var deck = new gofish.CardDeck(deckspec);
    console.log(
      Mustache.render(
        'Server listening at port {{port}}\n'+
        '{{#deck.suits}}'+
        '  * {{name}}\n'+
        '{{#cards}}'+
        '    * {{rank.name}}: {{desc}}\n'+
        '{{/cards}}'+
        '{{/deck.suits}}\n',
        {port: port, deck: deck }
      )
    );
  }
);
  
server.listen(port,log_the_deck);

// Routing
app.use(express.static('public'));

// Chatroom
var game = {
  users:[]
};
io.on('connection', function (socket) {
  socket.joined = false;
  socket.game = game;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'join', this listens and executes
  socket.on('join', function (username) {
    if (socket.joined) return;
    if (socket.game.users.indexOf(username)>=0) {
      socket.emit('username taken', {
        username: username
      });
      return;
    }
    // we store the username in the socket session for this client
    socket.username = username;
    socket.game.users.push(username);
    socket.joined = true;
    socket.emit('joined', {
      username: username,
      users: socket.game.users
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      users: socket.game.users
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (socket.joined) {
      // remove self from users
      var i=socket.game.users.indexOf(socket.username);
      if (i>=0) {
        socket.game.users.splice(i,1);
      }

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        users: socket.game.users
      });
    }
  });
});