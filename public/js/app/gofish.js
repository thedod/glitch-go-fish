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
      suit.order = s;
      suit.cards = [];
      suit.by_rank = {};
      if (!suit.symbol) suit.symbol = suit.name[0];
    }
    for (var r=0; r<this.ranks.length; r++) {
      var rank = this.ranks[r];
      this.rank_by_name[rank.name] = rank;
      rank.order = r;
      rank.cards = [];
      if (!rank.symbol) rank.symbol = rank.name[0];
      for (var s=0 ; s<this.suits.length; s++) {
        var suit = this.suits[s];
        var card = rank.by_suit[suit.name];
        card.rank = rank.name;
        card.suit = suit.name;
        card.suit_symbol = suit.symbol;
        card.rank_symbol = rank.symbol;
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
    
    // clone a simplified rank object for GUI
    this.fullRank = function(r) {
      var rank = this.getrank(r);
      return {
        name: rank.name,
        symbol: rank.symbol,
        desc_template: rank.desc_template,
        cards: rank.cards.slice()
      }
    };
  };
  
  // CardHand (also used as the table's pile)
  var CardHand = function (deck, is_full) {
    this.deck = deck;
    if (is_full) {
      this.cards = this.deck.fullHand();
    } else {
      this.cards = [];
    };
    
    this.clear = function() { this.cards = []; };
    this.give = function() { return this.cards && this.cards.pop(); };
    this.take = function(card) { this.cards.unshift(card); };
    this.ask = function(rank, suit, is_taking) {
      var c = this.deck.getCard(rank, suit);
      var i = this.cards.indexOf(c);
      if (i<0) return null;
      if (is_taking) {
        this.cards.splice(i,1);
      }
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
    // if hands contains a full rank, returns
    // a simplified clone of the rank pulled
    this.pull_rank = function() {
      this.sort();
      var num_suits = this.deck.suits.length;
      var rank=null, rankstart=null, count=0, index=0;
      for (var i=0;
           i<this.cards.length && count<num_suits;
           i++) {
        if (this.cards[i].rank===rank) {
          count++;
        } else {
          rank = this.cards[i].rank;
          rankstart = i;
          count = 1;
        }
      }
      if (count===num_suits) {
        this.cards.splice(rankstart, num_suits);
        rank = this.deck.getRank(rank);
        // Clone it
        return {
          name: rank.name,
          symbol: rank.symbol,
          desc: rank.desc,
          desc_template: rank.desc_template,
          cards: rank.cards.slice() // clone the rank's card array
        }
      };
      return null;
    }
  }
  return {
    CardDeck: CardDeck,
    CardHand: CardHand
  }
});