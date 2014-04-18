define(function(require, exports, module) {
  // Famous Modules
  var View               = require('famous/core/View');
  var RenderNode         = require('famous/core/RenderNode')
  var Transform          = require('famous/core/Transform');
  var Surface            = require('famous/core/Surface');
  var Modifier           = require('famous/core/Modifier');
  var EventHandler       = require('famous/core/EventHandler');
  var ViewSequence       = require('famous/core/ViewSequence');

  function MainAreaView() {
    View.apply(this);

    this.mainSurface = new Surface({
      size: [undefined, undefined],
      properties: {
        backgroundColor: 'black'
      }
    });

    _createMenuToggleButton.apply(this);

    // pipe surface events to view input because swipe from appView needs them
    this.mainSurface.pipe(this);

    // pipe input events to output
    this._eventInput.pipe(this._eventOutput);

    this.add(this.mainSurface);
    this.add(this.menuToggleButtonModifier).add(this.menuToggleButtonAnimateModifier).add(this.menuToggleButton);
  }

  MainAreaView.prototype = Object.create(View.prototype);
  MainAreaView.prototype.constructor = MainAreaView;

  function _createMenuToggleButton() {
    this.menuToggleButtonModifier = new Modifier({
      transform: Transform.translate(10, 10, 0)
    });
    this.menuToggleButtonAnimateModifier = new Modifier({
      transform: Transform.identity
    });
    this.menuToggleButton = new Surface({
      size: [30, 30],
      content: '<img src="src/images/menu_btn.png" width="30" height="30">'
    });
    this.menuToggleButton.on('click', function() {
      this._eventOutput.emit('menuToggleButtonClicked');
      this.menuToggleButtonAnimateModifier.setTransform(Transform.identity);
    }.bind(this));
    this.menuToggleButton.on('mousedown', this.animateMenuToggleButton.bind(this));
    this.menuToggleButton.on('touchstart', this.animateMenuToggleButton.bind(this));
  }

  MainAreaView.prototype.animateMenuToggleButton = function() {
    this.menuToggleButtonAnimateModifier.setTransform(Transform.scale(1.1, 1.1, 1));
  }

  module.exports = MainAreaView;
});