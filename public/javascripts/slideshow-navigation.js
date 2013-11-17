define([
    'vendor/helpers/helpers-main'
], function(
    helpers
) {

    'use strict';

    var SlideshowNavigationElement = function(slide, index) {

        this.slide = slide;
        this.index = index;
        this.initialize();

    };

    SlideshowNavigationElement.prototype = {
        
        initialize: function() {
            
            var el = document.createElement('div');

            el.classList.add('navigation-element');

            this.el = el;

        }

    };

    var SlideshowNavigation = function(selector, args) {

        var defaults = {};

        this.options = helpers.extend({}, defaults, args);
        
        this.navigationElements = [];
        this.selector = selector;
        this.el = document.querySelector(selector);

    };

    SlideshowNavigation.prototype = {

        appendNavigationElements: function() {
            
            var div = document.createElement('div');
            
            helpers.forEach(this.navigationElements, function(navigationElement) {
                navigationElement.el.innerText = navigationElement.index;
                if(navigationElement.index === 0) {
                    navigationElement.el.classList.add('active');
                }
                div.appendChild(navigationElement.el);
            }, this);

            this.el.appendChild(div);

        },

        createNavigationElement: function(slide, index) {
            
            var navigationElement = new SlideshowNavigationElement(slide, index);
            
            this.navigationElements.push(navigationElement);

        },

        toggleActiveNavigationElement: function(previouslyActiveIndex, currentlyActiveIndex) {
            
            var navigationElements = this.el.querySelectorAll('.navigation-element');

            navigationElements[previouslyActiveIndex].classList.remove('active');
            navigationElements[currentlyActiveIndex].classList.add('active');
            
        }
        

    };

    return SlideshowNavigation;

});