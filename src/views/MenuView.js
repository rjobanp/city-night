define(function(require, exports, module) {
  // Famous Modules
  var View = require('famous/core/View');
  var RenderNode = require('famous/core/RenderNode')
  var Transform = require('famous/core/Transform');
  var Surface = require('famous/core/Surface');
  var Modifier = require('famous/core/Modifier');
  var EventHandler = require('famous/core/EventHandler');
  var Timer = require('famous/utilities/Timer');

  // custom dependencies
  var MenuButtonView = require('src/views/MenuButtonView.js');

  function MenuView() {
    View.apply(this);

    this.menuWidth = 150;

    this.mainSurface = new Surface({
      size: [this.menuWidth, undefined],
      properties: {
        backgroundColor: '#333333'
      }
    });

    this.mainModifier = new Modifier({
      transform: Transform.translate(-this.menuWidth, 0, 0)
    });

    // Render node for all menu items
    this.viewNode = new RenderNode();
    this.viewNode.add(this.mainSurface);

    this.add(this.mainModifier).add(this.viewNode);

    _createMenuButtons.apply(this);

  }

  MenuView.prototype = Object.create(View.prototype);
  MenuView.prototype.constructor = MenuView;

  function _createMenuButtons() {
    var buttonData = [
      {
        name: 'Game Mode',
        icon: ''
      }, {
        name: 'View Mode',
        icon: ''
      }, {
        name: 'Options',
        icon: ''
      }, {
        name: 'About',
        icon: ''
      }
    ];

    this.buttonHeightOffset = MenuButtonView.prototype.buttonSize[1] + 20;
    this.buttonLeftOffset = (this.menuWidth - MenuButtonView.prototype.buttonSize[0])/2;
    this.buttonModifiers = [];
    this.buttonViews = [];
    for ( var i = 0; i < buttonData.length; i++ ) {
      var buttonView = new MenuButtonView(buttonData[i]);

      var buttonModifier = new Modifier();

      this.buttonModifiers.push(buttonModifier);
      this.buttonViews.push(buttonView);
      this.viewNode.add(buttonModifier).add(buttonView);
    }

    this.resetMenuButtons();
  };

  MenuView.prototype.resetMenuButtons = function() {
    for ( var i = 0; i < this.buttonModifiers.length; i++ ) {
      this.buttonModifiers[i].setOpacity(0.5);
      this.buttonModifiers[i].setTransform(Transform.multiply(
        Transform.translate(this.buttonLeftOffset + (MenuButtonView.prototype.buttonSize[0]/4), (this.buttonHeightOffset*(i+1)) - (MenuButtonView.prototype.buttonSize[1]/4), 0),
        Transform.scale(0.5, 0.5, 1)
      ));
      this.buttonViews[i].resetIcon();
    }
  }

  MenuView.prototype.showMenuButtons = function() {
    this.resetMenuButtons();
    var timeOffset = 200;
    for ( var i = 0; i < this.buttonModifiers.length; i++ ) {
      Timer.setTimeout(function(i) {
        this.buttonModifiers[i].setOpacity(1);
        this.buttonModifiers[i].setTransform(Transform.multiply(
        Transform.translate(this.buttonLeftOffset, this.buttonHeightOffset*(i+1), 0),
        Transform.scale(1, 1, 1)
      ), {duration: 200, curve: 'easeOut'});
        this.buttonViews[i].showIcon();
      }.bind(this, i), timeOffset*(i-1));
    }
  }

  module.exports = MenuView;
});