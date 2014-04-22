define(function(require, exports, module) {
  // Famous Modules
  var View = require('famous/core/View');
  var RenderNode = require('famous/core/RenderNode')
  var Transform = require('famous/core/Transform');
  var Surface = require('famous/core/Surface');
  var Transitionable = require('famous/transitions/Transitionable');
  var Modifier = require('famous/core/Modifier');
  var EventHandler = require('famous/core/EventHandler');

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


    this.cityView = new CityView(this.cities[getRandomInt(0, this.cities.length-1)]);
    this.cityModifier = new Modifier();
    this.add(this.cityModifier).add(this.cityView);

    this.buttonView = new GameButtonsView();
    this.buttonModifier = new Modifier();
    this.add(this.buttonModifier).add(this.buttonView);

    this.cityView.pipe(this);

    // pipe input events to output
    this._eventInput.pipe(this._eventOutput);

  }

  GameFrameView.prototype = Object.create(View.prototype);
  GameFrameView.prototype.constructor = GameFrameView;

  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  module.exports = GameFrameView;
});