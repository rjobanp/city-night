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
  var Cities = require('src/models/cities.js');

  function GameFrameView(params) {
    View.apply(this);

    for (var attrname in params) { 
      this[attrname] = params[attrname]; 
    }

    // Add the selected city type cities to cities array
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

    var firstCities = this.getOptionCities();
    
    _setCityView.call(this, firstCities);

    _setButtonsView.call(this, firstCities);

    // pipe input events to output
    this._eventInput.pipe(this._eventOutput);

  }

  GameFrameView.prototype = Object.create(View.prototype);
  GameFrameView.prototype.constructor = GameFrameView;

  GameFrameView.prototype.checkAnswer = function(answer) {
    return ( this.cityView.cityName === answer.split(/-|\./)[1] ) 
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

    this.cityTransitionable.set(100, {duration: 500, curve: 'easeOut'}, function() {
      this.cityView.setCity(newCities[0]);

      this.cityTransitionable.set(0, {duration: 500, curve: 'easeIn'});
    }.bind(this));
    
    this.buttonView.setButtons(newCities);
  }

  function _setCityView (firstCities) {
    this.cityView = new CityView(firstCities[0]);
    this.cityModifier = new Modifier({
      origin: [0.5, 0.5]
    });
    this.add(this.cityModifier).add(this.cityView);

    // Add transitionable and transforms to city modifier
    this.cityTransitionable = new Transitionable(0);
    this.cityModifier.transformFrom(function() {
      return Transform.multiply(
        Transform.translate(0,0, this.cityTransitionable.get()),
        Transform.rotateZ(Math.PI*this.cityTransitionable.get()/300)
      )
    }.bind(this));

    this.cityModifier.opacityFrom(function() {
      return (1 - (this.cityTransitionable.get()/100))
    }.bind(this));

    this.cityView.pipe(this);
  }

  function _setButtonsView (firstCities) {
    this.buttonView = new GameButtonsView({cities: firstCities});
    this.buttonModifier = new Modifier();
    this.add(this.buttonModifier).add(this.buttonView);

    // Setup event handler for button clicks
    this.buttonView.on('gameButtonClicked', function(i) {
      var buttonCity = this.buttonView.cities[i];
      if ( this.checkAnswer(buttonCity) ) {
        this.buttonView.animateResult(i, true);
        // move to next city
        Timer.setTimeout(this.nextCity.bind(this), 1000);
      } else {
        this.buttonView.animateResult(i, false);
      }
    }.bind(this));
  }

  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  module.exports = GameFrameView;
});