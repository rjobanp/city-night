define(function(require, exports, module) {
	// famous dependencies
	var View = require('famous/core/View');
	var RenderNode = require('famous/core/RenderNode');
	var Transform = require('famous/core/Transform');
	var Transitionable = require('famous/transitions/Transitionable');
	var Modifier = require('famous/core/Modifier');
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
    this.menuOpen = false;

		// Create main area view
		this.mainAreaView = new MainAreaView({leftTransitionable: this.mainTransitionable});

		this.menuView.on('changeRoute', function(route) {
			this.mainAreaView.setRoute(route);
		}.bind(this));

		// Render node for views
		this.viewNode = new RenderNode();
		this.viewNode.add(this.menuView);
		this.viewNode.add(this.mainAreaView);

		this.add(this.mainModifier).add(this.viewNode);

    // Setup swipe handling for opening menu side
		_setSwipeHandling.apply(this);
    // Trigger menu opening based on click of menu button also
    this.mainAreaView.on('menuToggleButtonClicked', this.toggleMenu.bind(this));
	}

	AppView.prototype = Object.create(View.prototype);
	AppView.prototype.constructor = AppView;

	function _setSwipeHandling() {
		// add mouse sync to defaults touch and scroll sync on generic sync
		GenericSync.register(MouseSync);

		this.swiper = new GenericSync(function() {
        return this.mainTransitionable.get();
    }.bind(this),	{
			direction: GenericSync.DIRECTION_X
		});

		this.mainAreaView.pipe(this.swiper);

		var validSwipeStart = false;

		// this is for touch devices
		this.mainAreaView.on('touchstart', function(data) {
			// if this swipe starts from the left side
			if ( data.touches[0].clientX - this.mainTransitionable.get() < 100 ) {
				validSwipeStart = true;
			}
		}.bind(this));

		// this is for non touch devices
		this.mainAreaView.on('mousedown', function(data) {
			// if this swipe starts from the left side
			if ( data.clientX - this.mainTransitionable.get() < 100 ) {
				validSwipeStart = true;
			}
		}.bind(this));

		this.swiper.on('update', function(data) {
			// trigger animation of menu buttons
			if (this.mainTransitionable.get() === 0 && data.position > 0) {
				this.menuView.showMenuButtons();
			}

			// move main view, with a max offset of the menu width
			validSwipeStart && this.mainTransitionable.set(Math.min(this.menuView.menuWidth, Math.max(0, data.position)));
		}.bind(this));

		this.swiper.on('end', function(data) {
			validSwipeStart = false;

			if ( this.mainTransitionable.get() > 50 ) {
				this.openMenu();
			} else {
				this.closeMenu();
			}
		}.bind(this));

	}

  AppView.prototype.toggleMenu = function() {
    if ( this.menuOpen ) {
      this.closeMenu();
    } else {
      this.openMenu();
      this.menuView.showMenuButtons();
    }
  }

	AppView.prototype.openMenu = function() {
		this.mainTransitionable.set(this.menuView.menuWidth, {duration: 300, curve: 'easeOut'}, function() {
      this.menuOpen = true;
    }.bind(this));
	}

	AppView.prototype.closeMenu = function() {
		this.mainTransitionable.set(0, {duration: 300, curve: 'easeOut'}, function() {
      this.menuOpen = false;
    }.bind(this));
	}

	module.exports = AppView;
});