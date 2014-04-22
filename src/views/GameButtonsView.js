define(function(require, exports, module) {
  // Famous Modules
  var View = require('famous/core/View');
  var RenderNode = require('famous/core/RenderNode')
  var Transform = require('famous/core/Transform');
  var Surface = require('famous/core/Surface');
  var Transitionable = require('famous/transitions/Transitionable');
  var Modifier = require('famous/core/Modifier');
  var EventHandler = require('famous/core/EventHandler');
  var SpringTransition = require('famous/transitions/SpringTransition');
  var WallTransition = require('famous/transitions/WallTransition');
  var SnapTransition = require('famous/transitions/SnapTransition');

  Transitionable.registerMethod('spring', SpringTransition);
  Transitionable.registerMethod('wall', WallTransition);
  Transitionable.registerMethod('snap', SnapTransition);

  function GameButtonsView(params) {
    View.apply(this);

    for (var attrname in params) { 
      this[attrname] = params[attrname]; 
    }

    _createButtonSurfaces.apply(this);

    this.setButtons();

  }

  GameButtonsView.prototype = Object.create(View.prototype);
  GameButtonsView.prototype.constructor = GameButtonsView;

  GameButtonsView.prototype.animateResult = function(index, result) {
    if ( result ) {
      // they picked the winner
      this.buttonYTransitionables[index].set(-400, {method : 'snap',   dampingRatio : 0.4, period : 300});
    } else {
      this.buttonXTransitionables[index].set(-50);
      this.buttonXTransitionables[index].set(0, {method : 'spring', dampingRatio : 0.3, period : 200});

    }
  }

  GameButtonsView.prototype.setButtons = function(cities) {
    cities = cities || this.cities;

    // randomize these cities first
    shuffleArray(cities);

    for ( var i=0; i < cities.length; i++ ) {
      if ( this.buttonSurfaces[i] ) {
        var cityName = cities[i].split(/-|\./)[1].replace('_', ' ');
        this.buttonSurfaces[i].setContent(cityName);
      }
    }
  }

  function _createButtonSurfaces () {
    this.buttonSurfaces = [];
    this.buttonModifiers = [];
    this.buttonXTransitionables = [];
    this.buttonYTransitionables = [];

    for ( var i=0; i < 3; i++ ) {
      this.buttonSurfaces[i] = new Surface({
        size: [150, 30],
        opacity: 0.5,
        properties: {
          backgroundColor: '#888888',
          textAlign: 'center'
        }
      });

      this.buttonXTransitionables[i] = new Transitionable(0);
      this.buttonYTransitionables[i] = new Transitionable(-(40)*i - 20);

      this.buttonModifiers[i] = new Modifier({
        origin: [0.5, 1]
      });

      this.buttonModifiers[i].transformFrom(function(i) {
        return Transform.translate(this.buttonXTransitionables[i].get(), this.buttonYTransitionables[i].get(), 0);
      }.bind(this, i));

      this.add(this.buttonModifiers[i]).add(this.buttonSurfaces[i]);

      this.buttonSurfaces[i].on('click', function(i) {
        this._eventOutput.emit('gameButtonClicked', i);
      }.bind(this, i));
    }
  }

  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
  }


  module.exports = GameButtonsView;
});