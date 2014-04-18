define(function(require, exports, module) {
  // Famous Modules
  var View = require('famous/core/View');
  var RenderNode = require('famous/core/RenderNode')
  var Transform = require('famous/core/Transform');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var Modifier = require('famous/core/Modifier');
  var EventHandler = require('famous/core/EventHandler');

  function CityView(cityString) {
    View.apply(this);

    this.mainSurface = new ImageSurface();

    this.mainSurface.pipe(this);

    this.setCity(cityString);

    // pipe input events to output
    this._eventInput.pipe(this._eventOutput);

    this.mainModifier = new Modifier();

    this.add(this.mainModifier).add(this.mainSurface);

  }

  CityView.prototype = Object.create(View.prototype);
  CityView.prototype.constructor = CityView;

  CityView.prototype.setCity = function(cityString) {
    var citySplit = cityString.split(/-|\./);
    this.countryCode = citySplit.length && citySplit[0];
    this.cityName = citySplit.length && citySplit[1];

    this.mainSurface.setContent('src/images/cities/' + cityString);
  }

  module.exports = CityView;
});