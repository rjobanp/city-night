define(function(require, exports, module) {
    // famous dependencies
    var Engine = require('famous/core/Engine');
    require('famous/inputs/FastClick');

    // custom dependencies
    var AppView = require('views/AppView');
    
    // create the main context
    var mainContext = Engine.createContext();

    this.appView = new AppView();

    mainContext.setPerspective(500);

    mainContext.add(this.appView);
});
