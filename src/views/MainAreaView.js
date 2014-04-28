define(function(require, exports, module) {
  // Famous Modules
  var View               = require('famous/core/View');
  var RenderNode         = require('famous/core/RenderNode');
  var Transform          = require('famous/core/Transform');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var Surface            = require('famous/core/Surface');
  var Modifier           = require('famous/core/Modifier');
  var EventHandler       = require('famous/core/EventHandler');
  var RenderController       = require('famous/views/RenderController');

  // custom dependencies
  var FlipFrameView = require('src/views/FlipFrameView.js');
  var GameFrameView = require('src/views/GameFrameView.js');
  var OptionsView = require('src/views/OptionsView.js');

  function MainAreaView(params) {
    View.apply(this);

    for (var attrname in params) { 
      this[attrname] = params[attrname]; 
    }

    // set default app options
    this.cityTypes = ['US', 'World'];

    this.mainRenderController = new RenderController({
      overlap: true
    });

    _createRoutes.apply(this);
    _createMenuToggleButton.apply(this);

    // pipe input events to output
    this._eventInput.pipe(this._eventOutput);

    this.add(this.mainRenderController);

    this.mainRenderController.show(this.gameRoute);


    this.on('selectedCityType', function(event) {
      var currentTypes = this.cityTypes;

      if ( event.selected && !(currentTypes.indexOf(event.cityType) > -1) ) {
        // add to the array
        this.cityTypes.push(event.cityType);
      } else if ( !event.selected && (currentTypes.indexOf(event.cityType) > -1) ) {
        // make sure that there arent going to be no city types left
        if ( currentTypes.length > 1 ) {
          // remove from the array
          this.cityTypes.splice(currentTypes.indexOf(event.cityType), 1);
        } else {
          // reselect this toggle
          this.optionsSurface[event.cityType + 'Toggle'].select();
        }
      }

      this.flipSurface.setCities(this.cityTypes);
      this.gameSurface.setCities(this.cityTypes);
    }.bind(this));
  }

  MainAreaView.prototype = Object.create(View.prototype);
  MainAreaView.prototype.constructor = MainAreaView;

  MainAreaView.prototype.setRoute = function(route) {
    this.route = route;

    if ( this.route === 'game' ) {
      this.gameSurface._eventInput.emit('resetGame');
    }

    this.mainRenderController.show(this[route + 'Route']);
  }

  function _createRoutes() {
    this.flipRoute = new RenderNode();
    this.flipSurface = new FlipFrameView({cityTypes: ['US', 'World'], leftTransitionable: this.leftTransitionable});
    this.flipRoute.add(this.flipSurface);
    
    this.gameRoute = new RenderNode();
    this.gameSurface = new GameFrameView({cityTypes: ['US', 'World']});
    this.gameRoute.add(this.gameSurface);
    
    this.optionsRoute = new RenderNode();
    this.optionsSurface = new OptionsView();
    this.optionsRoute.add(this.optionsSurface);

    // pipe surface events to view input because swipe from appView needs them
    this.flipSurface.pipe(this);
    this.gameSurface.pipe(this);
    this.optionsSurface.pipe(this);
  }

  function _createMenuToggleButton() {
    this.menuToggleButtonModifier = new Modifier({
      transform: Transform.translate(10, 10, 1)
    });
    this.menuToggleButtonAnimateModifier = new Modifier({
      transform: Transform.identity
    });
    this.menuToggleButton = new ImageSurface({
      size: [30, 30],
      content: 'src/images/menu_btn.png',
      properties: {
        cursor: 'pointer'
      }
    });
    this.menuToggleButton.on('click', function() {
      this._eventOutput.emit('menuToggleButtonClicked');
      this.menuToggleButtonAnimateModifier.setTransform(Transform.identity);
    }.bind(this));
    this.menuToggleButton.on('mousedown', this.animateMenuToggleButton.bind(this));
    this.menuToggleButton.on('touchstart', this.animateMenuToggleButton.bind(this));
  
    this.add(this.menuToggleButtonModifier).add(this.menuToggleButtonAnimateModifier).add(this.menuToggleButton);
  }

  MainAreaView.prototype.animateMenuToggleButton = function() {
    this.menuToggleButtonAnimateModifier.setTransform(Transform.scale(1.1, 1.1, 1));
  }

  module.exports = MainAreaView;
});