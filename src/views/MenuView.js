define(function(require, exports, module) {
  // Famous Modules
  var View               = require('famous/core/View');
  var RenderNode         = require('famous/core/RenderNode')
  var Transform          = require('famous/core/Transform');
  var Surface            = require('famous/core/Surface');
  var Modifier           = require('famous/core/Modifier');
  var EventHandler       = require('famous/core/EventHandler');

  function MenuView() {
    View.apply(this);

    this.menuWidth = 150;

    this.mainSurface = new Surface({
      size: [this.menuWidth, undefined],
      properties: {
        backgroundColor: 'red'
      }
    });

    this.mainModifier = new Modifier({
      transform: Transform.translate(-this.menuWidth, 0, 0)
    });

    this.add(this.mainModifier).add(this.mainSurface);

  }

  MenuView.prototype = Object.create(View.prototype);
  MenuView.prototype.constructor = MenuView;

  module.exports = MenuView;
});