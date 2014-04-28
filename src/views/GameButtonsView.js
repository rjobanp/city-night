define(function(require, exports, module) {
  // Famous Modules
  var View = require('famous/core/View');
  var Transform = require('famous/core/Transform');
  var Surface = require('famous/core/Surface');
  var Transitionable = require('famous/transitions/Transitionable');
  var Modifier = require('famous/core/Modifier');
  var SpringTransition = require('famous/transitions/SpringTransition');
  var SnapTransition = require('famous/transitions/SnapTransition');

  Transitionable.registerMethod('spring', SpringTransition);
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
      this.buttonSurfaces[index].addClass('green-highlight');
      this.buttonYTransitionables[index].set(-300, {method : 'snap',   dampingRatio : 0.4, period : 200});
    } else {
      // they picked wrong
      this.buttonSurfaces[index].addClass('red-highlight');
      this.buttonXTransitionables[index].set(-50);
      this.buttonXTransitionables[index].set(0, {method : 'spring', dampingRatio : 0.3, period : 200});
      //this.buttonSurfaces[index].removeClass('red-highlight');
    }
  }

  GameButtonsView.prototype.setButtons = function(cities) {
    this.cities = cities || this.cities;

    // randomize these cities first
    shuffleArray(this.cities);

    for ( var i=0; i < this.cities.length; i++ ) {
      if ( this.buttonSurfaces[i] ) {
        var cityName = this.cities[i].split(/-|\./)[1].replace('_', ' ').replace('_', ' ').replace('_', ' ');
        this.buttonSurfaces[i].setContent(cityName);

        // reset buttons
        this.buttonSurfaces[i].setClasses([]);
        this.buttonXTransitionables[i].set(0);
        this.buttonYTransitionables[i].set(-(50)*i - 20);
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
        size: [200, 35],
        opacity: 1,
        properties: {
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: '#ffffff',
          textAlign: 'center',
          padding: '5px',
          fontWeight: 800,
          whiteSpace: 'nowrap',
          cursor: 'pointer'
        }
      });

      this.buttonXTransitionables[i] = new Transitionable(0);
      this.buttonYTransitionables[i] = new Transitionable(-(50)*i - 20);

      this.buttonModifiers[i] = new Modifier({
        origin: [0.5, 1]
      });

      this.buttonModifiers[i].transformFrom(function(i) {
        return Transform.translate(this.buttonXTransitionables[i].get(), this.buttonYTransitionables[i].get(), 1);
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