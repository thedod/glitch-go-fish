define(function () {
  // CardDeck
  var CardDeck = function(data) {
    var Mustache = require('mustache');
    this.back = data.back;
    this.ranks = data.ranks;
    this.suits = data.suits;
    this.rank_by_name = {};
    this.suit_by_name = {};
    this.cards = [];
    for (var s=0 ; s<this.suits.length; s++) {
      var suit = this.suits[s];
      this.suit_by_name[suit.name] = suit;
      suit.order = this.suits.length-(s+1);
      suit.cards = [];
      suit.by_rank = {};
    }
    for (var r=0; r<this.ranks.length; r++) {
      var rank = this.ranks[r];
      this.rank_by_name[rank.name] = rank;
      rank.order = this.ranks.length-(r+1);
      rank.cards = [];
      for (var s=0 ; s<this.suits.length; s++) {
        var suit = this.suits[s];
        var card = rank.by_suit[suit.name];
        card.rank = rank.name;
        card.suit = suit.name;
        card.order = suit.order+this.suits.length*rank.order;
        if (!card.desc) {
          card.desc = Mustache.render(rank.desc_template, {'suit': suit.name });
        }
        this.cards.push(card);
        rank.cards.push(card);
        suit.cards.push(card);
        suit.by_rank[rank.name] = card;
      }
    };
    this.getRank = function(r) { return this.rank_by_name[r]; };
    this.getSuit = function(s) { return this.suit_by_name[s]; };
    this.getCard = function(r,s) { return this.rank_by_name[r].by_suit[s]};
    this.fullHand = function() { return this.cards.slice(); }; // clone, don't pwn
  };
  
  // CardHand (also used as the table's pile)
  var CardHand = function (deck, is_full) {
    this.deck = deck;
    if (is_full) {
      this.cards = this.deck.fullHand();
    } else {
      this.cards = [];
    };
    
    this.give = function() { return this.cards && this.cards.pop(); };
    this.take = function(card) { this.cards.unshift(card); };
    this.ask = function(rank, suit, is_taking) {
      var c = this.deck.getCard(rank, suit);
      var i = this.cards.indexOf(c);
      if (i<1) return null;
      if (is_taking) delete this.cards[i];
      return c;
    };
    
    this.compare = function(a, b) { return a.order - b.order; };
    this.sort = function() { this.cards.sort(this.compare) };
    this.shuffle = function() { // see https://bost.ocks.org/mike/shuffle/
      var m = this.cards.length, t, i;
      while (m) {
        i = Math.floor(Math.random() * m--);
        t = this.cards[m];
        this.cards[m] = this.cards[i];
        this.cards[i] = t;
      }
    };
  };

  return {
    CardDeck: CardDeck,
    CardHand: CardHand
  }
});