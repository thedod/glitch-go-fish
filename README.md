# Web-Based Multiplayer "Go Fish" Card Game

##### Click [here](https://go-fish-reloaded.glitch.me/) to play
Tip: if you find yourself alone there, feel free to "cheat" and play
against yourself in another browser tab (or desktop against phone).

![screenshots](https://cdn.glitch.com/ccb30db3-78cd-46da-af4b-a75cabfc5233%2Fgo-fish-screenshot.gif?1495496552458)

### The card deck

* The ranks (equivalents of Ace, King, etc.) are `Industy`, `Royalty`,
`Ministry`, and `Peasantry`.

* The suits (equivalents of spades, hearts, etc.) are `Communications`, `Defense`, `Agriculture`, and `Finance`.

The deck is based on the [Swiss](https://en.wikipedia.org/wiki/Swiss_playing_cards) one, but you can easily
[remix](https://glitch.com/~go-fish) this and [define](https://go-fish.glitch.me/deck.json) your own (upload card images to `assets` first, of course). Note that it's [customary](https://en.wikipedia.org/wiki/Quartets_(card_game)) to have ~8 ranks.

### How to Play

#### Players vs Spectators
* When you choose a nickname and enter the game, you draw 4 cards from the
  pile and become a *player*.

* If there are less than 4 cards in the pile, you get no cards and remain
  a *spectator* (you can chat and watch text reports about game moves).
  
* Players who no longer hold cards (either by giving the last card to
  someone else, or by holding 3 cards and then pulling a rank [see below]),
  become spectators, but retain the ranks they've pulled.
  
* Players who leave (by closing or reloading the web page) return all cards
  (including the ones in the ranks they've pulled) to the pile.
  
* The game ends when there are less than 2 players: The scores are presented,
  and all players return their cards and ranks to the pile and become
  spectators. Those who want to play another game can simply reload the
  page and join again.

#### Goal
  
* When a player gets all 4 suits of the same rank (this is called  *pulling
  a rank*), the player is no longer holding those cards, but the rank is
  considered "owned" by that player.
  
* The goal of the game is to pull as many ranks as possible.

* As a tie breaker (e.g. if 2 players have pulled one rank each):
  the player holding any cards (there can only be one) gets a lower score.

#### Moves
* Players take turns in a round-robin fashion.
* If a player doesn't make a move within 2 minutes, that player's turn is
  skipped (otherwise, a player could paralyze the server by doing nothing).
* A move is to ask a fellow player for a specific card (e.g. ask Jane for
  Ministry or Defense).
  * If the other player holds that card, the asker gets it, and gets another
    turn.
  * If not &mdash; the asker has to *go fish* (draw a card from the pile,
    unless it's empty).
    
* Once in a while, a player receiving a card (from another player or the
  pile) would pull a rank. This may lead to either or both players running
  out of cards and becoming spectators.
  
* Eventually, more and more empty-handed players would become spectators,
  until there are less than 2 left, and the game is over.

![game over screenshot](https://cdn.glitch.com/ccb30db3-78cd-46da-af4b-a75cabfc5233%2Fgame-over.png?1495496690325)

Play, remix, and be merry.

----

### Credits:

* Code is based on [socketio-chat](https://glitch.com/~socketio-chat).

* [Alef](http://alef.hagilda.com/) font by [Hagilda](http://hagilda.com/).

* Swiss card deck
  [images](https://openclipart.org/detail/175474/swiss-card-deck-xvii)
  by [mariotomo](https://openclipart.org/user-detail/mariotomo).

* [Logo](https://cdn.glitch.com/ccb30db3-78cd-46da-af4b-a75cabfc5233%2Fgo-fish.png?1493734470270)
is based on art by [Last-Dino](https://openclipart.org/detail/170641/playing-cards) and [johnny_automatic](https://openclipart.org/detail/524/jumping-fish).
  
* Thanks to the [Glitch](https://glitch.com/) team for making this so
  easy to happen.


#### Licenses

* Code is licensed under an [AGPL 3.0](https://www.gnu.org/licenses/agpl-3.0.html) license.
* Content is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.
* <a href="https://github.com/Ranks/emojione/tree/2.2.7#readme">Emoji font</a> is licensed by <a href="https://www.emojione.com/">EmojiOne</a> under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.
