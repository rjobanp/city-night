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
        backgroundColor: 'blue'
      }
    });

    _createMenuButton.apply(this);

    // pipe surface events to view input because swipe from appView needs them
    this.mainSurface.pipe(this);

    // pipe input events to output
    this._eventInput.pipe(this._eventOutput);

    this.add(this.mainSurface);
    this.add(this.menuButtonModifier).add(this.menuButtonAnimateModifier).add(this.menuButton);
  }

  MainAreaView.prototype = Object.create(View.prototype);
  MainAreaView.prototype.constructor = MainAreaView;

  function _createMenuButton() {
    this.menuButtonModifier = new Modifier({
      transform: Transform.translate(10, 10, 0)
    });
    this.menuButtonAnimateModifier = new Modifier({
      transform: Transform.identity
    });
    this.menuButton = new Surface({
      size: [30, 30],
      content: '<img src="src/images/menu_btn.png" width="30" height="30">'
    });
    this.menuButton.on('click', function() {
      this._eventOutput.emit('menuButtonClicked');
      this.menuButtonAnimateModifier.setTransform(Transform.identity);
    }.bind(this));
    this.menuButton.on('mousedown', this.animateMenuButton.bind(this));
    this.menuButton.on('touchstart', this.animateMenuButton.bind(this));
  }

  MainAreaView.prototype.animateMenuButton = function() {
    this.menuButtonAnimateModifier.setTransform(Transform.scale(1.1, 1.1, 1));
  }

  module.exports = MainAreaView;
});