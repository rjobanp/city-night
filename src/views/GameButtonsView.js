define(function(require, exports, module) {
  // Famous Modules
  var View = require('famous/core/View');
  var RenderNode = require('famous/core/RenderNode')
  var Transform = require('famous/core/Transform');
  var Surface = require('famous/core/Surface');
  var Transitionable = require('famous/transitions/Transitionable');
  var Modifier = require('famous/core/Modifier');
  var EventHandler = require('famous/core/EventHandler');

  function GameButtonsView(params) {
    View.apply(this);

    _createButtonSurfaces.apply(this);

    // pipe input events to output
    this._eventInput.pipe(this._eventOutput);

  }

  GameButtonsView.prototype = Object.create(View.prototype);
  GameButtonsView.prototype.constructor = GameButtonsView;

  function _createButtonSurfaces () {
    this.buttonSurfaces = [];
    this.buttonModifiers = [];
    for ( var i=0; i < 3; i++ ) {
      this.buttonSurfaces[i] = new Surface({
        size: [150, 30],
        opacity: 0.5,
        properties: {
          backgroundColor: '#888888',
          textAlign: 'center'
        }
      });

      this.buttonModifiers[i] = new Modifier({
        origin: [0.5, 1],
        transform: Transform.translate(0, -(40)*i - 20, 0)
      });

      this.add(this.buttonModifiers[i]).add(this.buttonSurfaces[i]);
    }
  }

  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  module.exports = GameButtonsView;
});