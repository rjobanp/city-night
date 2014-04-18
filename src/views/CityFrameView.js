define(function(require, exports, module) {
  // Famous Modules
  var View = require('famous/core/View');
  var RenderNode = require('famous/core/RenderNode')
  var Transform = require('famous/core/Transform');
  var Surface = require('famous/core/Surface');
  var Modifier = require('famous/core/Modifier');
  var EventHandler = require('famous/core/EventHandler');
  var RenderController = require('famous/views/RenderController');

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

    this.currentViewIndex = 0;
    this.cityViews = [new CityView(this.cities[0]), new CityView(this.cities[1])];

    this.cityViewRenderController = new RenderController();

    this.add(this.cityViewRenderController);
    this.nextCityView();

    this.cityViews[0].pipe(this);
    this.cityViews[1].pipe(this);

    // pipe input events to output
    this._eventInput.pipe(this._eventOutput);

    this.on('click', function() {
      this.nextCityView();
    }.bind(this));
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

  module.exports = CityFrameView;
});