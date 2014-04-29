define(function(require, exports, module) {
  // Famous Modules
  var View = require('famous/core/View');
  var RenderNode = require('famous/core/RenderNode');
  var Transform = require('famous/core/Transform');
  var Surface = require('famous/core/Surface');
  var Transitionable = require('famous/transitions/Transitionable');
  var Modifier = require('famous/core/Modifier');

  // custom modules
  var GameScoreboardView = require('src/views/GameScoreboardView.js');

  function GameControllerView(params) {
    View.apply(this);

    for (var attrname in params) { 
      this[attrname] = params[attrname]; 
    }

    _setScoreboardView.apply(this);

  }

  GameControllerView.prototype = Object.create(View.prototype);
  GameControllerView.prototype.constructor = GameControllerView;

  function _setScoreboardView () {
    this.scoreboardView = new GameScoreboardView({timerLength: 3*60000});
    this.scoreboardModifier = new Modifier({
      origin: [1, 0]
    });
    this.scoreboardModifier.transformFrom(function() {
      return Transform.translate(-20, 20, 5)
    });

    this.add(this.scoreboardModifier).add(this.scoreboardView);
    this.scoreboardView.pipe(this._eventInput);

    this._eventInput.on('changeScore', function(diff) {
      this.scoreboardView.animateScoreChange(diff);
      this.scoreboardView.changeScore(diff);
      if ( diff > 0 ) {
        this.scoreboardView.addStreak();
      } else {
        this.scoreboardView.resetStreak();
      }
    }.bind(this));

    this._eventInput.on('resetGame', function() {
      this.scoreboardView.resetScore();
      this.scoreboardView.resetStreak();
      this.scoreboardView.resetLongestStreak();
      this.scoreboardView.resetTimer();
      this.scoreboardView.startTimer();
      this._eventOutput.emit('resetGame');
    }.bind(this));
  }

  module.exports = GameControllerView;
});