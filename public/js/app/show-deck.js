define(function (require) {
  // Load any app-specific modules
  // with a relative require call,
  // like:
  var gofish = require('./gofish');

  // Load library/vendor modules using
  // full IDs, like:
  var $ = require('jquery');
  var _bootstrap = require('bootstrap');
  var Mustache = require('mustache');

  $(function() {
    window.focus();
    var scroll2hash = function() {
      if (location.hash) {
        var $card = $(location.hash);
        if ($card) {
          $card.focus();
           $('html, body').animate({
            scrollTop: $card.offset().top
          }, 500);
        }
      }
    };

    $.getJSON('/deck.json', function(data) {
      var deck = new gofish.CardDeck(data);

      $('#deck').html(Mustache.render($('#deck-template').html(), deck));
      $(window).on('navigate', scroll2hash);
      scroll2hash();
    });
  });
});