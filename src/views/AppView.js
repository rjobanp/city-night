define(function(require, exports, module) {
	// famous dependencies
	var View = require('famous/core/View');
	var RenderNode = require('famous/core/RenderNode');
	var Transform = require('famous/core/Transform');
	var Transitionable = require('famous/transitions/Transitionable');
	var Modifier = require('famous/core/Modifier');
	var EventHandler = require('famous/core/EventHandler');
	var GenericSync = require('famous/inputs/GenericSync');
	var MouseSync = require('famous/inputs/MouseSync');

	// custom dependencies
	var MenuView = require('src/views/MenuView.js');
	var MainAreaView = require('src/views/MainAreaView.js');

	function AppView() {
		View.apply(this);

		// Create modifier for moving main view area
		this.mainModifier = new Modifier();

		// Add transitionable to this main view modifier
		this.mainTransitionable = new Transitionable(0); // 0 is default offset
		this.mainModifier.transformFrom(function() {
			return Transform.translate(this.mainTransitionable.get(), 0, 0);
		}.bind(this));

		// Create the menu view
		this.menuView = new MenuView();

		// Create main area view
		this.mainAreaView = new MainAreaView();

		// Render node for views
		this.viewNode = new RenderNode();
		this.viewNode.add(this.menuView);
		this.viewNode.add(this.mainAreaView);

		this.add(this.mainModifier).add(this.viewNode);

		this.setSwipeHandling();
	}

	AppView.prototype = Object.create(View.prototype);
	AppView.prototype.constructor = AppView;

	AppView.prototype.setSwipeHandling = function() {
		// remember to apply/call 'this' for appView on this func

		// add mouse sync to defaults touch and scroll sync on generic sync
		GenericSync.register(MouseSync);

		this.swiper = new GenericSync(function() {
            return this.mainTransitionable.get();
        }.bind(this),
		{
			direction: GenericSync.DIRECTION_X
		});

		// Not sure about this--which view should we be piping?
		this.mainAreaView.pipe(this.swiper);

		this.validSwipeStart = false;
		this.swiper.on('start', function(data) {
			// if this swipe starts from the left side
			if ( data.clientX - this.mainTransitionable.get() < 150 ) {
				this.validSwipeStart = true;
			}
		}.bind(this));

		this.swiper.on('update', function(data) {
			// move main view, with a max offset of the menu width
			this.validSwipeStart && this.mainTransitionable.set(Math.min(this.menuView.menuWidth, Math.max(0, data.position)));
		}.bind(this));

		this.swiper.on('end', function(data) {
			this.validSwipeStart = false;

			if ( this.mainTransitionable.get() > 50 ) {
				this.openMenu();
			} else {
				this.closeMenu();
			}
		}.bind(this));

	}

	AppView.prototype.openMenu = function() {
		this.mainTransitionable.set(this.menuView.menuWidth, {duration: 400, curve: 'easeOut'});
	}

	AppView.prototype.closeMenu = function() {
		this.mainTransitionable.set(0, {duration: 400, curve: 'easeOut'});
	}

	module.exports = AppView;
});