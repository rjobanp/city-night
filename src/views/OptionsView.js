define(function(require, exports, module) {
  // Famous Modules
  var View = require('famous/core/View');
  var RenderNode = require('famous/core/RenderNode');
  var Transform = require('famous/core/Transform');
  var Surface = require('famous/core/Surface');
  var Modifier = require('famous/core/Modifier');
  var ToggleButton = require('famous/widgets/ToggleButton');

  // custom dependencies
  

  function OptionsView(params) {
    View.apply(this);

    for (var attrname in params) { 
      this[attrname] = params[attrname]; 
    }

    this.mainModifier = new Modifier({
      origin: [0.5, 0],
      transform: Transform.translate(0, 50, 0)
    });
    this.mainNode = new RenderNode();

    _createOptionToggles.apply(this);
    _setToggleEvents.apply(this);
    _createOptionsHeader.apply(this);

    this.add(this.mainModifier).add(this.mainNode);

    // pipe input events to output
    this._eventInput.pipe(this._eventOutput);

  }

  function _createOptionToggles () {
    var toggleOnProperties = {
      textAlign: 'center',
      backgroundColor: 'rgba(0,200,100,1)',
      padding: '5px',
      cursor: 'pointer'
    }
    var toggleOffProperties = {
      textAlign: 'center',
      backgroundColor: 'rgba(200,0,50,1)',
      padding: '5px',
      cursor: 'pointer'
    }

    this.USToggle = new ToggleButton({
      content: 'US Cities',
      size: [200, 35]
    });

    this.USToggle.onSurface.setProperties(toggleOnProperties);
    this.USToggle.offSurface.setProperties(toggleOffProperties);

    this.WorldToggle = new ToggleButton({
      content: 'World Cities',
      size: [200, 35]
    });

    this.WorldToggle.onSurface.setProperties(toggleOnProperties);
    this.WorldToggle.offSurface.setProperties(toggleOffProperties);

    this.USModifier = new Modifier({
      transform: Transform.translate(0, 100, 0)
    });
    this.WorldModifier = new Modifier({
      transform: Transform.translate(0, 150, 0)
    });

    this.mainNode.add(this.USModifier).add(this.USToggle);
    this.mainNode.add(this.WorldModifier).add(this.WorldToggle);

    this.USToggle.select();
    this.WorldToggle.select();
  }

  function _setToggleEvents () {
    this.USToggle._eventOutput.on('select', function() {
      this._eventOutput.emit('selectedCityType', {cityType: 'US', selected: true})
    }.bind(this));

    this.WorldToggle._eventOutput.on('select', function() {
      this._eventOutput.emit('selectedCityType', {cityType: 'World', selected: true})
    }.bind(this));

    this.USToggle._eventOutput.on('deselect', function() {
      this._eventOutput.emit('selectedCityType', {cityType: 'US', selected: false})
    }.bind(this));

    this.WorldToggle._eventOutput.on('deselect', function() {
      this._eventOutput.emit('selectedCityType', {cityType: 'World', selected: false})
    }.bind(this));
  }

  function _createOptionsHeader() {
    this.optionsHeaderSurface = new Surface({
      content: 'Options',
      size: [150, 50],
      properties: {
        fontSize: '24px',
        textAlign: 'center'
      }
    });

    this.mainNode.add(this.optionsHeaderSurface);
  }

  OptionsView.prototype = Object.create(View.prototype);
  OptionsView.prototype.constructor = OptionsView;

  module.exports = OptionsView;
});