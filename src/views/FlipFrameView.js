define(function(require, exports, module) {
  // Famous Modules
  var View = require('famous/core/View');
  var Transform = require('famous/core/Transform');
  var Surface = require('famous/core/Surface');
  var Transitionable = require('famous/transitions/Transitionable');
  var Modifier = require('famous/core/Modifier');
  var GenericSync = require('famous/inputs/GenericSync');
  var MouseSync = require('famous/inputs/MouseSync');
  var Timer = require('famous/utilities/Timer');

  // custom dependencies
  var CityView = require('src/views/CityView.js');
  var Cities = require('src/models/cities.js');

  function FlipFrameView(params) {
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

    _setCityView.apply(this);
    _setNameView.apply(this);

    // Show the first city view
    this.nextCityView();

    // pipe input events to output
    this._eventInput.pipe(this._eventOutput);

    // Setup swipe
    _setSwipeHandling.apply(this);
  }

  FlipFrameView.prototype = Object.create(View.prototype);
  FlipFrameView.prototype.constructor = FlipFrameView;


  FlipFrameView.prototype.nextCityView = function() {
    var randomNum = getRandomInt(0, this.cities.length-1);
    while (randomNum === this.currentCityIndex) {
      randomNum = getRandomInt(0, this.cities.length-1);
    }
    this.currentCityIndex = randomNum;

    this.cityView.setCity(this.cities[this.currentCityIndex]);

    var cityName = this.cities[this.currentCityIndex].split(/-|\./)[1].replace('_', ' ').replace('_', ' ').replace('_', ' ');
    this.nameSurface.setContent(cityName);
  }

  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function _setNameView () {
    // Create city name surface
    this.nameSurface = new Surface({
      size: [200, 30],
      opacity: 1,
      properties: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: '#ffffff',
        textAlign: 'center',
        padding: '5px',
        fontWeight: 800
      }
    });

    this.nameTransitionable = new Transitionable(-100);

    this.nameModifier = new Modifier({
      opacity: 1,
      origin: [0.5, 1]
    });

    this.nameModifier.transformFrom(function() {
      return Transform.translate(0, this.nameTransitionable.get(), 80)
    }.bind(this));

    this.add(this.nameModifier).add(this.nameSurface);
  }

  function _setCityView () {
    // Create the city views and render controller
    this.currentViewIndex = 0;
    this.currentCityIndex = 0;
    this.cityView = new CityView(this.cities[0]);

    // Create modifiers for moving view area
    this.mainModifier = new Modifier();
    this.rotateModifier = new Modifier({
      origin: [0.5, 0.5]
    });
    // Add transitionables to this main view modifiers
    this.mainXTransitionable = new Transitionable(0);
    this.mainYTransitionable = new Transitionable(0);
    this.mainModifier.transformFrom(function() {
      return Transform.translate(this.mainXTransitionable.get(), this.mainYTransitionable.get(), 0);
    }.bind(this));
    this.rotateModifier.transformFrom(function() {
      return Transform.rotate(this.mainYTransitionable.get()*Math.PI/1800,0,this.mainXTransitionable.get()*Math.PI/1600);
    }.bind(this));

     this.add(this.mainModifier).add(this.rotateModifier).add(this.cityView);
    
    // Pipe events from city views
    this.cityView.pipe(this);
  }

  function _setSwipeHandling() {
    // add mouse sync to defaults touch and scroll sync on generic sync
    GenericSync.register(MouseSync);

    this.swiperX = new GenericSync(function() {
      return this.mainXTransitionable.get();
    }.bind(this), {
      direction: GenericSync.DIRECTION_X
    });

    this.swiperY = new GenericSync(function() {
      return this.mainYTransitionable.get();
    }.bind(this), {
      direction: GenericSync.DIRECTION_Y
    });

    this.pipe(this.swiperX);
    this.pipe(this.swiperY);

    var validSwipeXStart = true;
    var validSwipeYStart = true;

    // this is for touch devices
    this.on('touchstart', function(data) {
      // if this swipe starts from the left side
      if ( data.touches[0].clientX - this.leftTransitionable.get() < 100 ) {
        validSwipeXStart = false;
        validSwipeYStart = false;
      }
    }.bind(this));
    
    // this is for non touch devices
    this.on('mousedown', function(data) {
      // if this swipe starts from the left side
      if ( data.clientX - this.leftTransitionable.get() < 100 ) {
        validSwipeXStart = false;
        validSwipeYStart = false;
      }
    }.bind(this));

    this.swiperX.on('update', function(data) {
      validSwipeXStart && this.mainXTransitionable.set(data.position);
    }.bind(this));

    this.swiperY.on('update', function(data) {
      validSwipeYStart && this.mainYTransitionable.set(data.position);
    }.bind(this));

    this.swiperX.on('end', _endSwipe.bind(this));

    function _endSwipe() {
      validSwipeXStart = true;
      validSwipeYStart = true;

      if ( Math.abs(this.mainXTransitionable.get()) > 100 || Math.abs(this.mainYTransitionable.get()) > 50 ) {
        
        var x = this.mainXTransitionable.get();
        var endX = ( x > 0 ) ? 650 : -650;

        var y = this.mainYTransitionable.get();
        var endY = ( y > 0 ) ? 650 : -650;

        this.mainXTransitionable.set(endX, {duration: 400, curve: 'easeOut'}, function() {
          this.nextCityView();
          
          this.mainXTransitionable.set(0, {duration: 300, curve: 'easeOut'});
          this.mainYTransitionable.set(0, {duration: 300, curve: 'easeOut'});
        }.bind(this));

        this.mainYTransitionable.set(endY, {duration: 600, curve: 'easeOut'});
        
        this.nameTransitionable.set(50, {duration: 300, curve: 'easeOut'}, function() {
          Timer.setTimeout(function() {
            this.nameTransitionable.set(-100, {duration: 400, curve: 'easeIn'});
          }.bind(this), 300);
        }.bind(this));
      } else {
        this.mainXTransitionable.set(0, {duration: 0});
        this.mainYTransitionable.set(0, {duration: 0});
      }
      
    }

  }

  module.exports = FlipFrameView;
});