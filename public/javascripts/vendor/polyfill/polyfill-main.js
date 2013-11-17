define(function() {
   
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
    if (!Function.prototype.bind) {
        Function.prototype.bind = function(oThis) {
            if (typeof this !== "function") {
                // closest thing possible to the ECMAScript 5 internal IsCallable function
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function() {},
                fBound = function() {
                    return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                        aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
    (function() {
        if (!Event.prototype.preventDefault) {
            Event.prototype.preventDefault = function() {
                this.returnValue = false;
            };
        }
        if (!Event.prototype.stopPropagation) {
            Event.prototype.stopPropagation = function() {
                this.cancelBubble = true;
            };
        }
        if (!Element.prototype.addEventListener) {
            var eventListeners = [];

            var addEventListener = function(type, listener /*, useCapture (will be ignored) */ ) {
                var self = this;
                var wrapper = function(e) {
                    e.target = e.srcElement;
                    e.currentTarget = self;
                    if (listener.handleEvent) {
                        listener.handleEvent(e);
                    } else {
                        listener.call(self, e);
                    }
                };
                if (type == "DOMContentLoaded") {
                    var wrapper2 = function(e) {
                        if (document.readyState == "complete") {
                            wrapper(e);
                        }
                    };
                    document.attachEvent("onreadystatechange", wrapper2);
                    eventListeners.push({
                        object: this,
                        type: type,
                        listener: listener,
                        wrapper: wrapper2
                    });

                    if (document.readyState == "complete") {
                        var e = new Event();
                        e.srcElement = window;
                        wrapper2(e);
                    }
                } else {
                    this.attachEvent("on" + type, wrapper);
                    eventListeners.push({
                        object: this,
                        type: type,
                        listener: listener,
                        wrapper: wrapper
                    });
                }
            };
            var removeEventListener = function(type, listener /*, useCapture (will be ignored) */ ) {
                var counter = 0;
                while (counter < eventListeners.length) {
                    var eventListener = eventListeners[counter];
                    if (eventListener.object == this && eventListener.type == type && eventListener.listener == listener) {
                        if (type == "DOMContentLoaded") {
                            this.detachEvent("onreadystatechange", eventListener.wrapper);
                        } else {
                            this.detachEvent("on" + type, eventListener.wrapper);
                        }
                        break;
                    }
                    ++counter;
                }
            };
            Element.prototype.addEventListener = addEventListener;
            Element.prototype.removeEventListener = removeEventListener;
            if (HTMLDocument) {
                HTMLDocument.prototype.addEventListener = addEventListener;
                HTMLDocument.prototype.removeEventListener = removeEventListener;
            }
            if (Window) {
                Window.prototype.addEventListener = addEventListener;
                Window.prototype.removeEventListener = removeEventListener;
            }
        }
    })();


    // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
    // Production steps of ECMA-262, Edition 5, 15.4.4.18
    // Reference: http://es5.github.com/#x15.4.4.18
    if (!Array.prototype.forEach) {

        Array.prototype.forEach = function forEach(callback, thisArg) {

            'use strict';

            var T, k;

            if (this == null) {
                throw new TypeError("this is null or not defined");
            }

            var kValue,
                // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
                O = Object(this),

                // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
                // 3. Let len be ToUint32(lenValue).
                len = O.length >>> 0; // Hack to convert O.length to a UInt32

            // 4. If IsCallable(callback) is false, throw a TypeError exception.
            // See: http://es5.github.com/#x9.11
            if ({}.toString.call(callback) !== "[object Function]") {
                throw new TypeError(callback + " is not a function");
            }

            // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
            if (arguments.length >= 2) {
                T = thisArg;
            }

            // 6. Let k be 0
            k = 0;

            // 7. Repeat, while k < len
            while (k < len) {

                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                if (k in O) {

                    // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                    kValue = O[k];

                    // ii. Call the Call internal method of callback with T as the this value and
                    // argument list containing kValue, k, and O.
                    callback.call(T, kValue, k, O);
                }
                // d. Increase k by 1.
                k++;
            }
            // 8. return undefined
        };
    }

    /*
     * classList.js: Cross-browser full element.classList implementation.
     * 2012-11-15
     *
     * By Eli Grey, http://eligrey.com
     * Public Domain.
     * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
     */

    /*global self, document, DOMException */

    /*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

    if (typeof document !== "undefined" && !("classList" in document.documentElement)) {

        (function(view) {

            "use strict";

            if (!('HTMLElement' in view) && !('Element' in view)) return;

            var
            classListProp = "classList",
                protoProp = "prototype",
                elemCtrProto = (view.HTMLElement || view.Element)[protoProp],
                objCtr = Object,
                strTrim = String[protoProp].trim || function() {
                    return this.replace(/^\s+|\s+$/g, "");
                }, arrIndexOf = Array[protoProp].indexOf || function(item) {
                    var
                    i = 0,
                        len = this.length;
                    for (; i < len; i++) {
                        if (i in this && this[i] === item) {
                            return i;
                        }
                    }
                    return -1;
                }
                // Vendors: please allow content code to instantiate DOMExceptions
                , DOMEx = function(type, message) {
                    this.name = type;
                    this.code = DOMException[type];
                    this.message = message;
                }, checkTokenAndGetIndex = function(classList, token) {
                    if (token === "") {
                        throw new DOMEx(
                            "SYNTAX_ERR", "An invalid or illegal string was specified"
                        );
                    }
                    if (/\s/.test(token)) {
                        throw new DOMEx(
                            "INVALID_CHARACTER_ERR", "String contains an invalid character"
                        );
                    }
                    return arrIndexOf.call(classList, token);
                }, ClassList = function(elem) {
                    var
                    trimmedClasses = strTrim.call(elem.className),
                        classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [],
                        i = 0,
                        len = classes.length;
                    for (; i < len; i++) {
                        this.push(classes[i]);
                    }
                    this._updateClassName = function() {
                        elem.className = this.toString();
                    };
                }, classListProto = ClassList[protoProp] = [],
                classListGetter = function() {
                    return new ClassList(this);
                };
            // Most DOMException implementations don't allow calling DOMException's toString()
            // on non-DOMExceptions. Error's toString() is sufficient here.
            DOMEx[protoProp] = Error[protoProp];
            classListProto.item = function(i) {
                return this[i] || null;
            };
            classListProto.contains = function(token) {
                token += "";
                return checkTokenAndGetIndex(this, token) !== -1;
            };
            classListProto.add = function() {
                var
                tokens = arguments,
                    i = 0,
                    l = tokens.length,
                    token, updated = false;
                do {
                    token = tokens[i] + "";
                    if (checkTokenAndGetIndex(this, token) === -1) {
                        this.push(token);
                        updated = true;
                    }
                }
                while (++i < l);

                if (updated) {
                    this._updateClassName();
                }
            };
            classListProto.remove = function() {
                var
                tokens = arguments,
                    i = 0,
                    l = tokens.length,
                    token, updated = false;
                do {
                    token = tokens[i] + "";
                    var index = checkTokenAndGetIndex(this, token);
                    if (index !== -1) {
                        this.splice(index, 1);
                        updated = true;
                    }
                }
                while (++i < l);

                if (updated) {
                    this._updateClassName();
                }
            };
            classListProto.toggle = function(token, forse) {
                token += "";

                var
                result = this.contains(token),
                    method = result ?
                        forse !== true && "remove" :
                        forse !== false && "add";

                if (method) {
                    this[method](token);
                }

                return !result;
            };
            classListProto.toString = function() {
                return this.join(" ");
            };

            if (objCtr.defineProperty) {
                var classListPropDesc = {
                    get: classListGetter,
                    enumerable: true,
                    configurable: true
                };
                try {
                    objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                } catch (ex) { // IE 8 doesn't support enumerable:true
                    if (ex.number === -0x7FF5EC54) {
                        classListPropDesc.enumerable = false;
                        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                    }
                }
            } else if (objCtr[protoProp].__defineGetter__) {
                elemCtrProto.__defineGetter__(classListProp, classListGetter);
            }

        }(self));

    }



});