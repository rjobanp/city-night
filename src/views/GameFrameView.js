define(function(require, exports, module) {
  // Famous Modules
  var View = require('famous/core/View');
  var Transform = require('famous/core/Transform');
  var Surface = require('famous/core/Surface');
  var Transitionable = require('famous/transitions/Transitionable');
  var Modifier = require('famous/core/Modifier');
  var Timer = require('famous/utilities/Timer');

  // custom dependencies
  var CityView = require('src/views/CityView.js');
  var GameButtonsView = require('src/views/GameButtonsView.js');
  var GameControllerView = require('src/views/GameControllerView.js');
  var Cities = require('src/models/cities.js');

  function GameFrameView(params) {
    View.apply(this);

    this.cityTypes = params.cityTypes;
    
    this.setCities();

    this.optionCities = this.getOptionCities();
    
    _setCityViewA.call(this, this.optionCities);
    _setCityViewB.call(this, this.optionCities);

    _setButtonsView.call(this, this.optionCities);

    this.currentView = 'A';

    this.nextCity();

    this.gameControllerView = new GameControllerView();
    this.add(this.gameControllerView);
    this.pipe(this.gameControllerView);
    this.gameControllerView.on('resetGame', this.resetGame.bind(this));

    // pipe input events to output
    this._eventInput.pipe(this._eventOutput);

    this._eventInput.on('resetGame', this.resetGame.bind(this));

  }

  GameFrameView.prototype = Object.create(View.prototype);
  GameFrameView.prototype.constructor = GameFrameView;

  GameFrameView.prototype.resetGame = function() {
    this.optionCities = this.getOptionCities();
    this.cityViewA.setCity(this.optionCities[getRandomInt(0,2)]);
    this.currentView = 'B';
    this.nextCity();
  }

  GameFrameView.prototype.checkAnswer = function(answer) {
    if ( this.currentView === 'A' ) {
      return ( this.cityViewA.cityName === answer.split(/-|\./)[1] )
    } else {
      return ( this.cityViewB.cityName === answer.split(/-|\./)[1] )
    }
  }

  GameFrameView.prototype.getOptionCities = function() {
    var cities = [];
    for ( var i=0; i < 3; i++ ) {
      var thisCity = this.cities[getRandomInt(0, this.cities.length-1)];
      while(cities.indexOf(thisCity) > -1) {
        thisCity = this.cities[getRandomInt(0, this.cities.length-1)];
      }
      cities.push(thisCity);
    }

    return cities;
  }

  GameFrameView.prototype.nextCity = function() {
    var newCities = this.getOptionCities();

    if ( this.currentView === 'A' ) {
      this.cityTransitionableA.set(100, {duration: 300, curve: 'easeOut'}, function() {
        this.cityViewA.setCity(newCities[getRandomInt(0,2)]);

        this.cityTransitionableB.set(0, {duration: 400, curve: 'easeIn'});
      }.bind(this));

      this.currentView = 'B';
    } else {
      this.cityTransitionableB.set(100, {duration: 300, curve: 'easeOut'}, function() {
        this.cityViewB.setCity(newCities[getRandomInt(0,2)]);

        this.cityTransitionableA.set(0, {duration: 400, curve: 'easeIn'});
      }.bind(this));

      this.currentView = 'A';
    }
    
    this.buttonView.setButtons(this.optionCities);

    this.optionCities = newCities;
  }

  GameFrameView.prototype.setCities = function (cityTypes) {
    // Add the selected city type cities to cities array
    this.cityTypes = cityTypes || this.cityTypes;
    this.cities = [];

    if ( this.cityTypes.indexOf('US') > -1 ) {
      for ( var i=0; i < Cities.US.length; i++ ) {
        this.cities.push(Cities.US[i]);
      }
    }
    if ( this.cityTypes.indexOf('World') > -1 ) {
      for ( var i=0; i < Cities.World.length; i++ ) {
        this.cities.push(Cities.World[i]);
      }
    }
  }

  function _setCityViewA (firstCities) {
    this.cityViewA = new CityView(firstCities[0]);
    this.cityModifierA = new Modifier({
      origin: [0.5, 0.5]
    });
    this.add(this.cityModifierA).add(this.cityViewA);

    // Add transitionable and transforms to city modifier
    this.cityTransitionableA = new Transitionable(0);
    this.cityModifierA.transformFrom(function() {
      return Transform.multiply(
        Transform.translate(0,0, -this.cityTransitionableA.get()),
        Transform.rotateZ(Math.PI*this.cityTransitionableA.get()/300)
      )
    }.bind(this));

    this.cityModifierA.opacityFrom(function() {
      return (1 - (this.cityTransitionableA.get()/100))
    }.bind(this));

    this.cityViewA.pipe(this);
  }

  function _setCityViewB (firstCities) {
    this.cityViewB = new CityView(firstCities[1]);
    this.cityModifierB = new Modifier({
      origin: [0.5, 0.5]
    });
    this.add(this.cityModifierB).add(this.cityViewB);

    // Add transitionable and transforms to city modifier
    this.cityTransitionableB = new Transitionable(100);
    this.cityModifierB.transformFrom(function() {
      return Transform.multiply(
        Transform.translate(0,0, -this.cityTransitionableB.get()),
        Transform.rotateZ(Math.PI*this.cityTransitionableB.get()/300)
      )
    }.bind(this));

    this.cityModifierB.opacityFrom(function() {
      return (1 - (this.cityTransitionableB.get()/100))
    }.bind(this));

    this.cityViewB.pipe(this);
  }

  function _setButtonsView (firstCities) {
    this.buttonView = new GameButtonsView({cities: firstCities});
    this.buttonModifier = new Modifier();
    this.add(this.buttonModifier).add(this.buttonView);

    // Setup event handler for button clicks
    this.buttonView.on('gameButtonClicked', function(i) {
      // check that game is still running
      if (this.gameControllerView.scoreboardView.timerOkayToRun) {
        var buttonCity = this.buttonView.cities[i];
        // check the answer
        if ( this.checkAnswer(buttonCity) ) {
          this.buttonView.animateResult(i, true);
          this._eventOutput.emit('changeScore', 100);
          // move to next city
          Timer.setTimeout(this.nextCity.bind(this), 750);
        } else {
          this.buttonView.animateResult(i, false);
          this._eventOutput.emit('changeScore', -50);
        }
      }
    }.bind(this));
  }

  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  module.exports = GameFrameView;
});