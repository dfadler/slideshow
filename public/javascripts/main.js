require([
    'config',
    'vendor/polyfill/polyfill-main'
], require([
    'vendor/helpers/helpers-main',
    'slideshow-navigation'
], function(
    helpers,
    SlideshowNavigation
) {

    'use strict';

    var Slideshow = function(selector, args) {

        var defaults = {
            slideSelector: '.slide',
            activeSlide: 0,
            autoplay: 500
        };

        this.options = helpers.extend({}, defaults, args);

        this.el = selector;

        this.initialize();

    };

    Slideshow.prototype = {

        bind: function() {
            
            this.el.addEventListener('mouseenter', this.stop.bind(this), false);
            this.el.addEventListener('mouseleave', this.start.bind(this), false);

            this.navigation.el.addEventListener('mouseenter', this.stop.bind(this), false);
            this.navigation.el.addEventListener('mouseleave', this.start.bind(this), false);

            this.navigation.el.addEventListener('click', function(e) {
                this.goTo(helpers.getIndex(e.target));
            }.bind(this), this);

        },

        initialize: function() {

            this.setupSlides();
            this.setupNavigation();
            this.setupStylesheet();
            this.setActiveSlide(this.options.activeSlide);
            this.bind();
            this.start();

        },

        goTo: function(index) {
            
            if(typeof index === 'number') {
                this.setPreviouslyActiveSlide();
                this.options.activeSlide = index;

            }

            this.toggleActiveNavigation();
            this.toggleActiveSlide();

        },

        next: function() {

            this.setPreviouslyActiveSlide();

            if (this.options.activeSlide === this.length - 1) {

                this.options.activeSlide = 0;

            } else {

                this.options.activeSlide += 1;

            }

            this.goTo();

        },

        prev: function() {
            
            this.setPreviouslyActiveSlide();

            if (this.options.activeSlide === 0) {

                this.options.activeSlide = this.length - 1;

            } else {

                this.options.activeSlide -= 1;

            }

            this.goTo();
        },

        pause: function() {



        },

        setPreviouslyActiveSlide: function() {
            this.options.previouslyActiveSlide = this.options.activeSlide;
        },

        setActiveSlide: function(int) {

            this.slides[int].classList.add('active');

        },

        setupNavigation: function() {
            
            var navigationSelector = this.options.navigation;

            if(navigationSelector) {

                this.navigation = new SlideshowNavigation(navigationSelector);

                helpers.forEach(this.slides, function(slide, i) {

                    this.navigation.createNavigationElement(slide, i);

                }, this);

                this.navigation.appendNavigationElements();

            }

        },

        setupSlides: function() {

            var slideSelector = this.options.slideSelector;

            this.slides = document.querySelectorAll(slideSelector);
            this.length = this.slides.length;

        },

        setupStylesheet: function() {

            var slideshowSelector = '#' + this.el.id,
                slideSelector = slideshowSelector + ' ' + this.options.slideSelector,
                slideSelectorActive = slideSelector + '.active';

            this.stylesheet = helpers.createStylesheet();

            this.stylesheet.addRule(slideshowSelector, 'position: relative;');

            this.stylesheet.addRule(slideSelector, 'position: absolute;, top: 0;, left: 0; z-index: 1;');

            this.stylesheet.addRule(slideSelector, 'opacity: 0');

            helpers.addPrefixedRule(this.stylesheet, slideSelector, 'transition: opacity .25s ease-in-out');

            this.stylesheet.addRule(slideSelectorActive, 'z-index: 2; opacity: 1;');

        },

        stop: function() {

            if (this.interval) {

                clearInterval(this.interval);
                this.interval = false;
            }

        },

        start: function() {

            if (this.interval) {
                this.stop();
            }

            this.interval = setInterval(this.next.bind(this), this.options.autoplay);
        },

        toggleActiveNavigation: function() {
            this.navigation.toggleActiveNavigationElement(this.options.previouslyActiveSlide, this.options.activeSlide);

        },

        toggleActiveSlide: function() {

            this.slides[this.options.previouslyActiveSlide].classList.remove('active');
            this.slides[this.options.activeSlide].classList.add('active');

        }

    };

    var slideshowSelector = document.querySelector('#slideshow'),
        slideshow = new Slideshow(slideshowSelector, {
            navigation: '#slideshow-navigation'
        });

    console.dir(slideshow);

    window.slideshow = slideshow;

}));