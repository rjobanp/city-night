define(function(require, exports, module) {
  // Famous Modules
  var View = require('famous/core/View');
  var RenderNode = require('famous/core/RenderNode')
  var Transform = require('famous/core/Transform');
  var Transitionable = require('famous/transitions/Transitionable');
  var Modifier = require('famous/core/Modifier');
  var EventHandler = require('famous/core/EventHandler');
  var RenderController = require('famous/views/RenderController');
  var GenericSync = require('famous/inputs/GenericSync');
  var MouseSync = require('famous/inputs/MouseSync');

  // custom dependencies
  var CityView = require('src/views/CityView.js');
  var Cities = require('src/models/cities.js');

  function CityFrameView(params) {
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

    // Create the city views
    this.currentViewIndex = 0;
    this.cityViews = [new CityView(this.cities[0]), new CityView(this.cities[1])];

    this.cityViewRenderController = new RenderController();

    // Create modifiers for moving view area
    this.mainModifier = new Modifier();
    this.rotateModifier = new Modifier({
      origin: [0.5, 0.5]
    });
    // Add transitionables to this main view modifier
    this.mainXTransitionable = new Transitionable(0);
    this.mainYTransitionable = new Transitionable(0);
    this.mainModifier.transformFrom(function() {
      return Transform.translate(this.mainXTransitionable.get(), this.mainYTransitionable.get(), 0);
    }.bind(this));
    this.rotateModifier.transformFrom(function() {
      return Transform.rotateZ(this.mainXTransitionable.get()*Math.PI/720);
    }.bind(this));


    this.add(this.mainModifier).add(this.rotateModifier).add(this.cityViewRenderController);
    
    // Show the first city view
    this.nextCityView();

    // Pipe events from city views
    this.cityViews[0].pipe(this);
    this.cityViews[1].pipe(this);

    // pipe input events to output
    this._eventInput.pipe(this._eventOutput);

    // Setup swipe
    _setSwipeHandling.apply(this);
  }

  CityFrameView.prototype = Object.create(View.prototype);
  CityFrameView.prototype.constructor = CityFrameView;

  CityFrameView.prototype.setCityView = function(viewIndex, cityIndex) {
    if ( viewIndex >= 2 || viewIndex < 0 ) {
      viewIndex = 0;
    }
    if ( cityIndex >= this.cities.length || cityIndex < 0 ) {
      cityIndex = 0;
    }
    this.cityViews[viewIndex].setCity(this.cities[cityIndex]);
  }

  CityFrameView.prototype.nextCityView = function() {
    var randomNum = getRandomInt(0, this.cities.length-1);
    while (randomNum === this.currentCityIndex) {
      randomNum = getRandomInt(0, this.cities.length-1);
    }
    this.currentCityIndex = randomNum;
    
    this.currentViewIndex = (this.currentViewIndex === 1) ? 0 : 1;
    this.setCityView(this.currentViewIndex, this.currentCityIndex);

    this.cityViewRenderController.show(this.cityViews[this.currentViewIndex]);
  }

  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
    this.swiperX.on('start', function(data) {
      // if this swipe starts from the left side
      if ( data.clientX - this.mainXTransitionable.get() < 100 ) {
        validSwipeXStart = false;
      }
    }.bind(this));
    var validSwipeYStart = true;
    this.swiperY.on('start', function(data) {
      // if this swipe starts from the left side
      if ( data.clientX - this.mainXTransitionable.get() < 100 ) {
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

    this.swiperY.on('end', _endSwipe.bind(this));

    function _endSwipe() {
      validSwipeXStart = true;
      validSwipeYStart = true;

      if ( Math.abs(this.mainXTransitionable.get()) > 100 || Math.abs(this.mainYTransitionable.get()) > 50 ) {
        this.nextCityView();
      }
      this.resetTransitionables();
    }

  }

  CityFrameView.prototype.resetTransitionables = function() {
    this.mainXTransitionable.set(0);
    this.mainYTransitionable.set(0);
  }

  module.exports = CityFrameView;
});