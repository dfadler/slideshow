    define(function() {

        'use strict';

        return (function() {

            var utilities = {

                addPrefixedRule: function(stylesheet, selector, rule) {

                    var prefixes = utilities.getVendorPrefixes();
                    
                    stylesheet.addRule(selector, rule);

                    this.forEach(prefixes, function(prefix) {

                        stylesheet.addRule(selector, prefix+rule);

                    });

                },

                /**
                 * Adds Stylesheet rules to the head
                 * http://davidwalsh.name/add-rules-stylesheets
                 * @return dom element The created stylesheet
                 */
                createStylesheet: function() {
                    var sheet = (function() {
                        // Create the <style> tag
                        var style = document.createElement("style");

                        // Add a media (and/or media query) here if you'd like!
                        // style.setAttribute("media", "screen")
                        // style.setAttribute("media", "@media only screen and (max-width : 1024px)")

                        // WebKit hack :(
                        style.appendChild(document.createTextNode(""));

                        // Add the <style> element to the page
                        document.head.appendChild(style);

                        return style.sheet;
                    })();

                    return sheet;
                },

                /**
                 * Underscore forEach method
                 * https://github.com/jashkenas/underscore
                 * @param  obj|array         The object or array to iterate over
                 * @param  argument iterator The value each iteration will be assigned to
                 * @param  object context    The value of this within each iteration of the loop
                 */
                forEach: function(obj, iterator, context) {

                    var breaker = {},
                        nativeForEach = Array.prototype.forEach;

                    if (obj == null) {
                        return;
                    }

                    if (nativeForEach && obj.forEach === nativeForEach) {

                        obj.forEach(iterator, context);

                    } else if (obj.length === +obj.length) {

                        for (var i = 0, length = obj.length; i < length; i++) {

                            if (iterator.call(context, obj[i], i, obj) === breaker) return;

                        }

                    } else {

                        var keys = _.keys(obj);

                        for (var i = 0, length = keys.length; i < length; i++) {

                            if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) {
                                return;
                            }
                        }
                    }
                },

                /**
                 * Taken from the underscore extend method
                 * https://github.com/jashkenas/underscore
                 * @param  Object obj The object you want to merge the following objects into
                 * @return Object     Extended object
                 */
                extend: function(obj) {

                    this.forEach(Array.prototype.slice.call(arguments, 1), function(source) {
                        if (source) {
                            for (var prop in source) {
                                obj[prop] = source[prop];
                            }
                        }
                    });

                    return obj;
                },

                getIndex: function(el) {
                    return Array.prototype.indexOf.call(el.parentNode.childNodes, el);
                },

                getVendorPrefixes: function() {

                    return ['-ms-', '-moz-', '-webkit-'];

                }

            };

            return utilities;

        }());

    });