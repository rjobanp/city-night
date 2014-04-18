define(function(require, exports, module) {
  // Famous Modules
  var View               = require('famous/core/View');
  var RenderNode         = require('famous/core/RenderNode')
  var Transform          = require('famous/core/Transform');
  var Surface            = require('famous/core/Surface');
  var Modifier           = require('famous/core/Modifier');
  var EventHandler       = require('famous/core/EventHandler');

  function MenuButtonView(params) {
    View.apply(this);

    this.mainSurface = new Surface({
      size: this.buttonSize,
      properties: {
        backgroundColor: '#888888'
      }
    });

    this.mainModifier = new Modifier({
      size: this.buttonSize,
      transform: Transform.identity
    });

    this.iconPadding = [10, 10];
    this.iconSurface = new Surface({
      content: params.icon ? '<img src="' + params.icon + '" width="' + String(this.buttonSize[0]-iconPadding[0]*2) + '" height="' + String(this.buttonSize[1]-iconPadding[1]*2) + '">' : params.name,
      size: [this.buttonSize[0]-this.iconPadding[0]*2, this.buttonSize[1]-this.iconPadding[1]*2],
      properties: {
        color: 'white',
        textAlign: 'center',
        overflow: 'hidden',
        fontWeight: 700
      }
    });

    this.iconModifier = new Modifier({
      origin: [0.5, 0.5],
      opacity: 0
    });

    this.viewNode = new RenderNode();
    this.viewNode.add(this.mainSurface);
    this.viewNode.add(this.iconModifier).add(this.iconSurface);

    this.add(this.mainModifier).add(this.viewNode);

  }

  MenuButtonView.prototype = Object.create(View.prototype);
  MenuButtonView.prototype.constructor = MenuButtonView;

  MenuButtonView.prototype.buttonSize = [80, 80];

  MenuButtonView.prototype.resetIcon = function() {
    this.iconModifier.setOpacity(0);
  }

  MenuButtonView.prototype.showIcon = function() {
    this.iconModifier.setOpacity(1, {duration: 200, curve: 'easeIn'});
  }

  module.exports = MenuButtonView;
});