define(function(require, exports, module) {
  // Famous Modules
  var View               = require('famous/core/View');
  var RenderNode         = require('famous/core/RenderNode')
  var Transform          = require('famous/core/Transform');
  var Surface            = require('famous/core/Surface');
  var Modifier           = require('famous/core/Modifier');
  var EventHandler       = require('famous/core/EventHandler');
  var RenderController       = require('famous/views/RenderController');

  // custom dependencies
  var CityFrameView = require('src/views/CityFrameView.js');
  var GameFrameView = require('src/views/GameFrameView.js');

  function MainAreaView() {
    View.apply(this);

    this.mainRenderController = new RenderController({
    });

    this.firstSurface = new Surface({
      size: [undefined, undefined],
      properties: {
        backgroundColor: 'black'
      }
    });
    this.secondSurface = new Surface({
      size: [undefined, undefined],
      properties: {
        backgroundColor: 'blue'
      }
    });

    _createRoutes.apply(this);
    _createMenuToggleButton.apply(this);

    // pipe surface events to view input because swipe from appView needs them
    this.viewSurface.pipe(this);
    this.gameSurface.pipe(this);

    // pipe input events to output
    this._eventInput.pipe(this._eventOutput);

    this.add(this.mainRenderController);
    this.add(this.menuToggleButtonModifier).add(this.menuToggleButtonAnimateModifier).add(this.menuToggleButton);

    this.mainRenderController.show(this.gameRoute);
  }

  MainAreaView.prototype = Object.create(View.prototype);
  MainAreaView.prototype.constructor = MainAreaView;

  MainAreaView.prototype.setRoute = function(route) {
    this.route = route;

    this.mainRenderController.show(this[route + 'Route']);
  }

  function _createRoutes() {
    this.viewRoute = new RenderNode();
    this.viewSurface = new CityFrameView({cityTypes: ['US', 'World']});
    this.viewRoute.add(this.viewSurface);
    
    this.gameRoute = new RenderNode();
    this.gameSurface = new GameFrameView({cityTypes: ['US', 'World']});
    this.gameRoute.add(this.gameSurface);
    
    this.optionsRoute = new RenderNode();
    this.optionsRoute.add(this.firstSurface);
    
    this.aboutRoute = new RenderNode();
    this.aboutRoute.add(this.secondSurface);
  }

  function _createMenuToggleButton() {
    this.menuToggleButtonModifier = new Modifier({
      transform: Transform.translate(10, 10, 1)
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