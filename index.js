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

var test_stuff = requirejs(
  ['mustache', 'app/gofish'],
  function(Mustache, gofish) {
    var deck = new gofish.CardDeck(
      require(__dirname+'/public/deck.json'));
    var hand = new gofish.CardHand(deck); // empty hand
    var pile = new gofish.CardHand(deck, true);
    pile.shuffle();
    for (var i=0; i<4; i++)
      hand.take(pile.give());
    var fish = hand.ask('Ministry', 'Communications', true);
    if (fish) pile.take(fish);
    hand.sort();
    
    console.log(
      Mustache.render(
        'Server listening at port {{port}}\n'+
        'Suits:\n{{#pile.deck.suits}}'+
        '  * {{name}}\n'+
        '{{/pile.deck.suits}}\n'+
        'Ranks:\n{{#pile.deck.ranks}}'+
        '  * {{name}} ({{desc_template}})\n'+
        '{{/pile.deck.ranks}}\n'+
        '{{#fish}}fish: {{.}}\n{{/fish}}'+
        'hand:\n'+
        '{{#hand.cards}}'+
        '  {{desc}} (order: {{order}})\n'+
        '{{/hand.cards}}',
        {
          port: port, pile: pile,
          hand: hand, fish: fish
        }
      )
    );
  }
);
  
server.listen(port, test_stuff);

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