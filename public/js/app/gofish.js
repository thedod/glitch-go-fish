define(function () {
  return {
    CardDeck: function(data) {
      var Mustache = require('mustache');
      this.back = data.back;
      this.ranks = data.ranks;
      this.suits = data.suits;
      this.cards = [];
      for (var s=0 ; s<this.suits.length; s++) {
        var suit = this.suits[s];
        suit.order = this.suits.length-(s+1);
        suit.cards = [];
        suit.by_rank = {};
      }
      for (var r=0; r<this.ranks.length; r++) {
        var rank = this.ranks[r];
        rank.order = this.ranks.length-(r+1);
        rank.cards = [];
        for (var s=0 ; s<this.suits.length; s++) {
          var suit = this.suits[s];
          suit.order = this.suits.length-(s+1);
          var card = rank.by_suit[suit.name];
          card.rank = rank;
          card.suit = suit;
          card.order = suit.order+this.suits.length*rank.order;
          if (!card.desc) {
            card.desc = Mustache.render(rank.desc_template, {'suit': suit.name });
          }
          this.cards.push(card);
          rank.cards.push(card);
          suit.cards.push(card);
          suit.by_rank[rank.name] = card
        }
      }
    }
  }
});