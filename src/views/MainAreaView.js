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

    // pipe surface events to view input
    this.mainSurface.pipe(this);

    // pipe input events to output
    this._eventInput.pipe(this._eventOutput);

    this.add(this.mainSurface);
  }

  MainAreaView.prototype = Object.create(View.prototype);
  MainAreaView.prototype.constructor = MainAreaView;

  module.exports = MainAreaView;
});