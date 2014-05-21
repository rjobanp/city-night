define(function(require, exports, module) {
  // Famous Modules
  var View = require('famous/core/View');
  var Transitionable = require('famous/transitions/Transitionable');
  var Easing = require("famous/transitions/Easing");
  var Transform = require('famous/core/Transform');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var Modifier = require('famous/core/Modifier');
  var EventHandler = require('famous/core/EventHandler');
  var SpringTransition = require('famous/transitions/SpringTransition');
  var Timer = require('famous/utilities/Timer');

  Transitionable.registerMethod('snap', SpringTransition);

  function GlobeView() {
    View.apply(this);

    this.mainSurface = new ImageSurface({
      size: [3600, 1800]
    });

    this.mainSurface.pipe(this);

    // pipe input events to output
    this._eventInput.pipe(this._eventOutput);

    this.mainModifier = new Modifier();

    this.add(this.mainModifier).add(this.mainSurface);

    _setupGlobe.call(this);
  }

  GlobeView.prototype = Object.create(View.prototype);
  GlobeView.prototype.constructor = GlobeView;

  function _setupGlobe() {
    this.mainSurface.setContent('src/images/nasa_2012_night_scaleblur.png');
    
    this.mainTransitionable = new Transitionable([200, 150, -15]);

    this.opacityTransitionable = new Transitionable(0);

    this.mainModifier.transformFrom(function() {
      return Transform.translate(this.mainTransitionable.get()[0], this.mainTransitionable.get()[1], this.mainTransitionable.get()[2]);
    }.bind(this));

    this.mainModifier.opacityFrom(function() {
      return this.opacityTransitionable.get();
    }.bind(this));
  }

  GlobeView.prototype.spinGlobe = function(callbackFunc) {
    this.opacityTransitionable.set(1, {duration: 150, curve: 'easeIn'}, function() {
      this.mainTransitionable.set([0, 0, -15], {duration: 0, curve: 'easeIn'}, function() {
        this.mainTransitionable.set([getRandomInt(-2500,-1500), 0, -15], {duration: 600});
        Timer.setTimeout(function(callbackFunc) {
          this.opacityTransitionable.set(0, {duration: 100, curve: 'easeOut'});
          callbackFunc();
        }.bind(this, callbackFunc), 500);

      }.bind(this));
    }.bind(this));
  }

  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  module.exports = GlobeView;
});