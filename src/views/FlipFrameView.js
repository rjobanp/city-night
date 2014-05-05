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

    this.cityTypes = params.cityTypes;
    this.leftTransitionable = params.leftTransitionable;

    this.setCities();

    _setCityViews.apply(this);
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
    // set the options for the 'current' index as it becomes the other index
    var randomNum = getRandomInt(0, this.cities.length-1);
    while (randomNum === this.currentCityIndex[this.otherIndex]) {
      randomNum = getRandomInt(0, this.cities.length-1);
    }
    this.currentCityIndex[this.currentIndex] = randomNum;
    this.cityView[this.currentIndex].setCity(this.cities[this.currentCityIndex[this.currentIndex]]);

    // set the name shown to the 'other' index about to become the currnet index
    var cityName = this.cities[this.currentCityIndex[this.otherIndex]].split(/-|\./)[1].replace('_', ' ').replace('_', ' ').replace('_', ' ');
    this.nameSurface.setContent(cityName);

    var other = this.currentIndex;
    this.currentIndex = this.otherIndex;
    this.otherIndex = other;
  }

  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  FlipFrameView.prototype.setCities = function (cityTypes) {
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

  function _setNameView () {
    // Create city name surface
    this.nameSurface = new Surface({
      size: [200, 35],
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

  function _setCityViews () {
    var length = 2;

    this.currentCityIndex = [];
    this.cityView = [];
    this.mainModifier = [];
    this.rotateModifier = [];
    this.mainXTransitionable = [];
    this.mainYTransitionable = [];

    for ( var i=0; i<length; i++ ) {
      _setCityView.call(this, i);
    }

    this.currentIndex = 0;
    this.otherIndex = 1;

    this.mainModifier[this.otherIndex].opacityFrom(0);
  }

  function _setCityView (index) {
    // Create the city views and render controller
    this.currentCityIndex[index] = index;
    this.cityView[index] = new CityView(this.cities[index]);

    // Create modifiers for moving view area
    this.mainModifier[index] = new Modifier();
    this.rotateModifier[index] = new Modifier({
      origin: [0.5, 0.5]
    });

    // Add transitionables to this main view modifiers
    this.mainXTransitionable[index] = new Transitionable(index*1000);
    this.mainYTransitionable[index] = new Transitionable(index*-1000);
    this.mainModifier[index].transformFrom(function(index) {
      return Transform.translate(this.mainXTransitionable[index].get(), this.mainYTransitionable[index].get(), 0);
    }.bind(this, index));
    this.rotateModifier[index].transformFrom(function(index) {
      return Transform.rotate(this.mainYTransitionable[index].get()*Math.PI/1800,0,this.mainXTransitionable[index].get()*Math.PI/1600);
    }.bind(this, index));

     this.add(this.mainModifier[index]).add(this.rotateModifier[index]).add(this.cityView[index]);
    
    // Pipe events from city views
    this.cityView[index].pipe(this);
  }

  function _setSwipeHandling() {
    // add mouse sync to defaults touch and scroll sync on generic sync
    GenericSync.register(MouseSync);

    this.swiperX = new GenericSync(function() {
      return this.mainXTransitionable[this.currentIndex].get();
    }.bind(this), {
      direction: GenericSync.DIRECTION_X
    });

    this.swiperY = new GenericSync(function() {
      return this.mainYTransitionable[this.currentIndex].get();
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
      validSwipeXStart && this.mainXTransitionable[this.currentIndex].set(data.position);
    }.bind(this));

    this.swiperY.on('update', function(data) {
      validSwipeYStart && this.mainYTransitionable[this.currentIndex].set(data.position);
    }.bind(this));

    this.swiperX.on('end', _endSwipe.bind(this));

    function _endSwipe() {
      validSwipeXStart = true;
      validSwipeYStart = true;

      if ( Math.abs(this.mainXTransitionable[this.currentIndex].get()) > 100 || Math.abs(this.mainYTransitionable[this.currentIndex].get()) > 50 ) {
        
        var x = this.mainXTransitionable[this.currentIndex].get();
        var endX = ( x > 0 ) ? 950 : -950;

        var y = this.mainYTransitionable[this.currentIndex].get();
        var endY = ( y > 0 ) ? 950 : -950;

        this.mainXTransitionable[this.currentIndex].set(endX, {duration: 400, curve: 'easeOut'}, function() {
          this.mainModifier[this.currentIndex].opacityFrom(0);
          this.mainModifier[this.otherIndex].opacityFrom(1);

          this.mainXTransitionable[this.currentIndex].set(1000, {duration: 0});
          this.mainYTransitionable[this.currentIndex].set(-1000, {duration: 0});

          this.mainXTransitionable[this.otherIndex].set(0, {duration: 300, curve: 'easeIn'});
          this.mainYTransitionable[this.otherIndex].set(0, {duration: 300, curve: 'easeIn'});
          this.nextCityView();
        }.bind(this));

        this.mainYTransitionable[this.currentIndex].set(endY, {duration: 600, curve: 'easeOut'});
        
        this.nameTransitionable.set(50, {duration: 300, curve: 'easeOut'}, function() {
          Timer.setTimeout(function() {
            this.nameTransitionable.set(-100, {duration: 400, curve: 'easeIn'});
          }.bind(this), 300);
        }.bind(this));
      } else {
        this.mainXTransitionable[this.currentIndex].set(0, {duration: 0});
        this.mainYTransitionable[this.currentIndex].set(0, {duration: 0});
      }
      
    }

  }

  module.exports = FlipFrameView;
});