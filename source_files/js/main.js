/*jshint nonew: false */
/*jslint browser: true, indent: 4, nomen: true*/
/*global $, TweenLite, Power1, Sine, Linear, define, happy */

(function () {
    "use strict";

    var doc, win, planetEarthEl, ashEl, infoPanelEl, contactFormEl, isMobile, isAndroid,
        isDesktop, isIE, isChrome, isFirefox, isWebkit, interestsArr, worldTurns,
        zoomYPos, zoomAnimating, zoomed, infoPanelAnimating, curEarthAngle,
        currentInterest, contactVisible, sprites, screenHelper, sky,
        mathHelper, domHelper, images, interests, infoPanel, contactForm,
        content, page, earth, earthAnimating, mHelp, domHelp, screenHelperInst, interestInst,
        skyInst, pageInst, contInst, infoPanelInst, earthInst, contactFormInst, imagesInst,
        spritesInst;

    function domHelper() { };
    function mathHelper() {};
    function screenHelper() { };
    function interests() { };
    function sky() { };
    function page() { };
    function content() { };
    function infoPanel() { };
    function earth() { };
    function contactForm() { };
    function images() { };
    function sprites() { };

    domHelper.prototype = (function () {
        var _buildEl;

        _buildEl = function (type, id, className) {
            //Override createElement to take ID and Class.
            var elem = document.createElement(type);

            if (id !== undefined) {
                elem.id = id;
            }

            if (className !== undefined) {
                elem.className = className;
            }

            return elem;
        };

        return {
            buildEl : _buildEl
        };
    }());

    mathHelper.prototype = (function () {
        var _pFloat, _rInt, _rFloat, _rRGB, _diff;

        _pFloat = function (val) {
            //Input: (float)val
            //Return: (float) with a precision of two (x.xx)
            var _f = ((val * 10) / 10);

            return _f;
        };

        _rInt = function (min, max) {
            //Input: (int)min, (int)max
            //Return: (int) which is greater than min and less than max.
            var _i = Math.floor(Math.random() * (max - min + 1)) + min;

            return _i;
        };

        _rFloat = function (min, max) {
            //Input: (float)min, (float)max
            //Return: (float) which is greater than min and less than max.
            var _f = parseFloat(Math.min(min + (Math.random() * (max - min)), max));

            return _pFloat(_f);
        };

        _rRGB = function () {
            //Return: (string)CSS property for a random RGB value.
            var _r, _g, _b, _rgb;

            _r = _rInt(0, 255);
            _g = _rInt(0, 255);
            _b = _rInt(0, 255);
            
            _rgb = "rgb(" + _r + "," + _g + "," + _b + ")";

            return _rgb;
        };

        _diff = function (int1, int2) {
            //Input: (int)int1, (int)int2
            //Return: (int)Value of the difference of int1 and int2
            var _difference;

            if (int1 > int2) {
                _difference = (int1 - int2);
            } else {
                _difference = (int2 - int1);
            }

            return _difference;
        };

        return {
            pFloat : _pFloat,
            rInt : _rInt,
            rFloat : _rFloat,
            rRGB : _rRGB,
            diff : _diff
        };
    }());

    screenHelper.prototype = (function () {
        var _height, _width, _setHeight, _setWidth,
            _getHeight, _getWidth, _update;

        _setHeight = function (val) {
            _height = val;
        };

        _setWidth = function (val) {
            _width = val;
        };

        _getHeight = function () {
            return _height;
        };

        _getWidth = function () {
            return _width;
        };

        _update = function () {
            if (win.innerWidth === undefined) { return; }

            _setHeight(win.innerHeight);
            _setWidth(win.innerWidth);
        };

        return {
            getHeight : _getHeight,
            getWidth : _getWidth,
            update : _update
        };
    }());

    interests.prototype = (function () {
        var Interest, _clicked, _jog, _init;

        Interest = function (name, locationAngle) {
            //Interest Object Constructor
            //Input: (string)name, (int)locationAngle
            this.name = name;
            this.locationAngle = locationAngle;
            this.content = "";
            this.header = "";
            this.gallery = [];
        };

        _clicked = function (interestName) {
            //Either close the info panel or rotate to a new interest.
            if (earthAnimating || infoPanelAnimating || zoomAnimating) { return; }

            if (interestName === currentInterest) {
                infoPanelInst.close(true);
            } else {
                earthInst.rotateToInterest(interestName);
            }
        };

        _jog = function (dir) {
            //Rotate to the next or previous interest.
            var keysArray, interestCount, curIndex, nextIndex,
                nextinterestName, valuesArray;

            interestCount = Object.keys(interestsArr).length;
            keysArray = Object.keys(interestsArr);
            curIndex = keysArray.indexOf(currentInterest);

            function fn() {
                if (dir === "prev") {
                    nextIndex = curIndex - 1;
                    if (nextIndex < 0) {
                        nextIndex = (interestCount - 1);
                    }
                } else {
                    nextIndex = curIndex + 1;
                    if (nextIndex > (interestCount - 1)) {
                        nextIndex = 0;
                    }
                }

                valuesArray = Object.keys(interestsArr).map(function (i) {
                    return String(interestsArr[i].name);
                });

                nextinterestName = valuesArray[nextIndex];
                earthInst.rotateToInterest(nextinterestName);
            }

            return fn();
        };

        _init = function () {
            //Initializes interest values.
            interestsArr = {
                about: new Interest("about", 0),
                games: new Interest("games", -30),
                sheri: new Interest("sheri", -82),
                computers: new Interest("computers", 174),
                nature: new Interest("nature", 35)
            };

            ashEl.addEventListener("click", function () { _clicked("about"); }, false);

            planetEarthEl.onclick = function (e) {
                var target = e.target || e.srcElement;

                if (target.nodeName !== 'A') { return; }

                _clicked(target.getAttribute("id"));
            };
        };

        return {
            jog : _jog,
            init : _init
        };
    }());

    sky.prototype = (function () {
        var _meteor, _starsEl, _starsColl, _getScale, _move, _twinkle, _randomizeAttributes,
            _animateMeteor, _loopMeteor, _generateMeteor, _generateStars, _init;

        _getScale = function (el) {
            //Input: (HTMLElement)el
            //Return: (float)scale - scale of element
            var _style, _transform, _values, _scaleX;

            _style = win.getComputedStyle(el, null);
            _transform = _style.getPropertyValue("-webkit-transform") ||
                        _style.getPropertyValue("-moz-transform") ||
                        _style.getPropertyValue("-ms-transform") ||
                        _style.getPropertyValue("-o-transform") ||
                        _style.getPropertyValue("transform");

            _values = _transform.split('(')[1];
            _values = _values.split(')')[0];
            _values = _values.split(',');

            _scaleX = _values[0];

            return _scaleX;
        };

        _move = function (x, y) {
            //Input: (int)x, (int)y
            //Repositions members of stars on the screen based on 
            //a range of 1 - 50 mapped to screen dimensions.
            var _bgPosX, _bgPosY, _i, _star, _scale, _starY, _starX,
                _width, _height, _rangeWidth, _rangeHeight, _range;

            //IE doesn't perform well enough for this.
            if (isIE) { return; }

            _range = 50;

            _width = screenHelperInst.getWidth();
            _height = screenHelperInst.getHeight();

            _rangeWidth = (_width / _range);
            _rangeHeight = (_height / _range);

            _bgPosX = (_rangeWidth * (x / _width));
            _bgPosY = (_rangeHeight * (y / _height));

            for (_i = 0; _i < _starsColl.length; _i += 1) {
                _star = _starsColl[_i];
                _scale = _getScale(_star);
                _starY = _bgPosY * _scale;
                _starX = _bgPosX * _scale;

                TweenLite.to(_star, 0.6, {
                    css: {
                        y: _starY,
                        x: _starX
                    }
                });
            }
        };

        _twinkle = function (el) {
            //Input: (HTMLElement)el
            //Picks a set of randomized values to tween the star to for a twinkle effect.
            var _dur, _colorLottery, _shimmerLottery, _opa, _rgb, _bs;

            _dur = mHelp.rFloat(0.2, 2.0);
            _colorLottery = mHelp.rInt(0, 10);
            _shimmerLottery = mHelp.rInt(0, 50);
            _opa = mHelp.rFloat(0.0, 1.0);
            _rgb = "rgb(255,255,255)";
            _bs = "null";

            //1 in 10 odds of getting a color star.
            if (_colorLottery === 100) {
                _rgb = mHelp.rRGB();
            }

            //Add background-shadow if webkit, since they render it efficiently.
            if ((!isMobile && isWebkit) || (!isMobile && isFirefox)) {
                _bs = "0px 0px 15px 1px " + _rgb;
            }

            //1 in 50 odds of getting a shimering star.
            if (_shimmerLottery === 50) {
                el.classList.add("shimmer");

                setTimeout(function () {
                    el.classList.remove("shimmer");
                }, 500);

                if ((!isMobile && isWebkit) || (!isMobile && isFirefox)) {
                    _bs = "0px 0px 20px 3px #fff";
                }
            }

            TweenLite.to(el, _dur, {
                css: {
                    opacity: _opa,
                    backgroundColor: _rgb,
                    boxShadow: _bs
                },
                onComplete: function () {
                    _twinkle(el);
                }
            });
        };

        _randomizeAttributes = function () {
            //Iterates over stars and sets star attributes to random start values.
            var _i, _el, _left, _top, _sca, _colorLottery, _opa, _rgb, _bs;

            for (_i = 0; _i < _starsColl.length;  _i += 1) {
                _el = _starsColl[_i];
                _left = mHelp.rFloat(-1, 101);
                _top = mHelp.rFloat(-1, 101);
                _sca = mHelp.rFloat(0.3, 1);
                _colorLottery = mHelp.rInt(1, 10);
                _opa = mHelp.rFloat(0.0, 1.0);
                _rgb = "rgb(255,255,255)";
                _bs = "null";

                //1 in 10 odds of getting a color star.
                if (_colorLottery === 10) {
                    _rgb = mHelp.rRGB();
                }

                //Don't use background-shadow if mobile
                if (!isMobile && isWebkit) {
                    _bs = "0px 0px 15px 1px " + _rgb;
                }

                TweenLite.to(_el, 0, {
                    css: {
                        left: _left + "%",
                        top: _top + "%",
                        z: 1,
                        scale: _sca,
                        opacity: _opa,
                        backgroundColor: _rgb,
                        boxShadow: _bs
                    }
                });
            }
        };

        _animateMeteor = function (startX, startY) {
            var _rTimeout;
            //Input: (int)startX, (int)startY
            //Create and animate a meteor from position startX, startY
            _rTimeout = Math.round((Math.random() * (3000 - 1500)) + 100);
            _meteor.style.top = startY + "px";
            _meteor.style.left = startX + "px";

            TweenMax.fromTo(_meteor, 0.5,
                { css: { x: "-325", y: "+225", opacity: 1 } },
                { css: { x: "-650", y: "+450", opacity: 0 } });

            setTimeout(function () {
                _loopMeteor();
            }, _rTimeout);
        };

        _loopMeteor = function () {
            //Kicks off a meteor, then repeats at a random timeout.
            var _rTimeout, _startX, _startY;

            _rTimeout = Math.round((Math.random() * (3000 - 500)) + 100);
            _startX = mHelp.rInt(0, screenHelperInst.getWidth());
            _startY = mHelp.rInt(0, screenHelperInst.getHeight());

            setTimeout(function () {
                _animateMeteor(_startX, _startY);
            }, _rTimeout);
        };
        
        _generateStars = function () {
            //Creates stars then randomizes their attributes.
            var _starsCount, _starsStr, _i, _j;
            
            _starsStr = '';
            _starsCount = 20;

            if (isMobile && !isAndroid) {
                _starsCount = 15;
            }

            if (isDesktop && isWebkit) {
                _starsCount = 35;
            }

            for (_i = 0; _i < _starsCount;  _i += 1) {
                _starsStr += "<i></i>";
            }

            _starsEl.innerHTML = _starsStr;

            _starsColl = _starsEl.getElementsByTagName("i");
            for (_j = 0; _j < _starsColl.length;  _j += 1) {
                _twinkle(_starsColl[_j]);
            }

            _randomizeAttributes();
        };

        _generateMeteor = function () {
            var _newMeteor;

            _newMeteor = domHelp.buildEl("div", "meteor");
            _starsEl.appendChild(_newMeteor);
            _meteor = doc.getElementById("meteor");

            _loopMeteor();
        };

        _init = function () {
            _starsEl = doc.getElementById("theStars");
            _starsColl = _starsEl.getElementsByTagName("i");
            
            _generateStars();
            _generateMeteor();

            doc.addEventListener("mousemove", function (e) { pageInst.handleMousemove(e); }, false);
        };

        return {
            move : _move,
            init : _init
        };
    }());

    page.prototype = (function () {
        var resizeTimer, _mobileType, _desktopType, mousemoveTimer, theHeavens, moon,
            lowEarthOrbit, topMarginContainer, _zoomOut, _zoomIn, _topMarginContainerClicked,
            _resize, _renderGlow, _updateZoomYPos, _handleResize, _mouseCoords, _debug,
            _mousemove, _handleMousemove, _initUADetection, _preventMobileScale, _initFancybox,
            _rotateObjects, _animBrightness, _init, _keydown, _show;

        _mobileType = {
            Android: function () {
                return (/Android/i).test(navigator.userAgent);
            },
            BlackBerry: function () {
                return (/BlackBerry/i).test(navigator.userAgent);
            },
            iOS: function () {
                return (/iPhone|iPad|iPod/i).test(navigator.userAgent);
            },
            Windows: function () {
                return (/IEMobile/i).test(navigator.userAgent);
            },
            any: function () {
                return ((_mobileType.Android() || _mobileType.BlackBerry() || _mobileType.iOS() || _mobileType.Windows()) && !isDesktop);
            }
        };

        _desktopType = {
            Chrome: function () {
                return (/Chrome/i).test(navigator.userAgent);
            },
            Webkit: function () {
                return (/Webkit/i).test(navigator.userAgent);
            },
            Firefox: function () {
                return (/firefox/i).test(navigator.userAgent);
            },
            IE: function () {
                return doc.documentMode !== undefined;
            },
            any: function () {
                return ((_desktopType.Chrome() || _desktopType.Webkit() || _desktopType.Firefox() || _desktopType.IE()) && !isMobile);
            }
        };

        _zoomOut = function (instant) {
            if ((zoomAnimating === true) && (instant !== true)) { return; }

            var _dur;

            _dur = 2;
            currentInterest = '';
            worldTurns = true;
            zoomAnimating = true;
            spritesInst.updateStatus(ashEl);

            if (instant === true) {
                _dur = 0;
            }

            //Don't adjust top margin if user is using a mobile device or 
            //currentInterest is "contact".
            if (!isMobile) {
                TweenLite.to(topMarginContainer, _dur, {
                    css: {
                        top: 0
                    },
                    ease: Power1.easeInOut
                });
            }

            TweenLite.to(theHeavens, _dur, {
                css: {
                    scale: 1,
                    y: 0
                },
                ease: Power1.easeInOut,
                onComplete: function () {
                    zoomAnimating = false;
                    zoomed = false;
                }
            });
        };

        _zoomIn = function (callbackFn) {
            var _zScale;

            _zScale = 1;

            zoomAnimating = true;

            //Don't adjust top margin if user is using a mobile device or if interest 
            //is contact.
            if (!isMobile) {
                TweenLite.to(topMarginContainer, 2, {
                    css: {
                        top: zoomYPos
                    },
                    ease: Power1.easeInOut
                });

                _zScale = 2;
            }

            TweenLite.to(theHeavens, 2, {
                css: {
                    scale: _zScale
                },
                ease: Power1.easeInOut,
                onComplete: function () {
                    if (typeof callbackFn === "function") {
                        callbackFn.call(this);
                    }
                    zoomAnimating = false;
                    zoomed = true;
                }
            });
        };

        _topMarginContainerClicked = function () {
            //Close info panel when "neutral" area is clicked around earth.
            if (earthAnimating) { return; }

            if (zoomed) {
                infoPanelInst.close(true);
            }

            if (contactVisible) {
                contactFormInst.hide(true);
            }
        };

        _resize = function () {
            infoPanelInst.close(true, true);

            currentInterest = '';
            earthAnimating = false;

            if ((contactFormEl.style.opacity > 0.1) || contactVisible) {
                contactFormInst.hide(true);
            }

            screenHelperInst.update();
            _renderGlow();
            _updateZoomYPos();
            earthInst.renderShadow();
        };

        _handleResize = function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(_resize(), 15);
        };

        _updateZoomYPos = function () {
            var _combinedHeight;

            function fn() {
                _combinedHeight = planetEarthEl.offsetHeight + infoPanelEl.offsetHeight + 120;
                zoomYPos = (_combinedHeight / 2);

                if (((screenHelperInst.getWidth() <= 600) && (screenHelperInst.getWidth() > 350)) ||
                        (screenHelperInst.getHeight() <= 800)) {
                    zoomYPos = -Math.abs(planetEarthEl.offsetHeight / 2);
                }

                if (screenHelperInst.getWidth() <= 350) {
                    zoomYPos = -Math.abs(planetEarthEl.offsetHeight);
                }
            }

            return fn();
        };

        _mouseCoords = function (ev) {
            //Input: Mouse event
            //Return: Object with .y and .x properties containing mouse event position
            var _xy;

            if (ev.pageX || ev.pageY) {
                _xy = {
                    x: ev.pageX,
                    y: ev.pageY
                };
            } else {
                _xy = {
                    x: ev.clientX + doc.body.scrollLeft - doc.body.clientLeft,
                    y: ev.clientY + doc.body.scrollTop - doc.body.clientTop
                };
            }

            return _xy;
        };

        _debug = function (inputString, clear) {
            //Input: (string)inputString, (bool)clear
            //Renders debug panel to DOM and adds inputStr to it
            var _curDebugHtml, _debugCol;

            _debugCol = doc.getElementById("debugCol");

            //No debug col in DOM, so we'll add it.
            if ((_debugCol === null) || (_debugCol.value === '')) {
                _debugCol = domHelp.buildEl("div", "debugCol");

                doc.body.appendChild(_debugCol);
            }

            function fn() {
                //Store current debug col HTML
                _curDebugHtml = _debugCol.innerHTML;

                //If clearing the current HTML, do that now.
                if (clear) {
                    _curDebugHtml = "";
                }

                //Add our new string to the top of current debug HTML and populate debug col with it.
                _debugCol.innerHTML = "\n" + inputString + "\n<br>\n" + _curDebugHtml;
            }

            return fn();
        };

        _mousemove = function (e) {
            //Input: (event)e
            //Handles mousemove events.
            var _mousePos;

            if (!isMobile && !isIE) {
                _mousePos = _mouseCoords(e);

                skyInst.move(_mousePos.x, _mousePos.y);
            }
        };

        _keydown = (function () {
            //Input: (event)e
            //Handles key presses to trigger effects for some future functionality.
            var _konami, _codelength, _keys;

            _konami = "38,38,40,40,37,39,37,39,66,65";
            _codelength = _konami.split(",").length;
            _keys = [];

            return function (e) {
                _keys.push(e.keyCode);

                if (_keys.toString().indexOf(_konami) >= 0) {
                    _keys = [];
                    //Phase 2!
                }

                if (_keys.length > _codelength) {
                    _keys.shift();
                }
            };
        }());

        _handleMousemove = function (e) {
            clearTimeout(mousemoveTimer);

            mousemoveTimer = setTimeout(function () { _mousemove(e); }, 0.5);
        };

        _initUADetection = function () {
            //Initializes User Agent Detection
            isMobile = _mobileType.any();
            isAndroid = _mobileType.Android();
            isDesktop = _desktopType.any();
            isIE = _desktopType.IE();
            isChrome = _desktopType.Chrome();
            isFirefox = _desktopType.Firefox();
            isWebkit = _desktopType.Webkit();
        };

        _preventMobileScale = function () {
            var _meta, _metaValue;

            if ((win.devicePixelRatio !== undefined) && (win.devicePixelRatio > 2)) {

                _meta = doc.getElementById("viewport");

                if ((_meta !== undefined) && (_meta.value === '')) {
                    _metaValue = 'width=device-width, initial-scale=' + (2 / win.devicePixelRatio) + ', user-scalable=no';
                    _meta.setAttribute('content', _metaValue);
                }
            }
        };

        _initFancybox = function () {
            $(".fancybox").fancybox({
                helpers: {
                    title: {
                        type: 'inside'
                    },
                    overlay: {
                        css: {
                            'background' : 'rgba(0, 0, 0, 0.75)'
                        }
                    },
                    thumbs: {
                        width: 50,
                        height: 50
                    }
                }
            });
        };

        _renderGlow = function () {
            var _bgPos, _minPos, _rtn;

            function fn() {
                _bgPos = undefined;
                _minPos = undefined;

                if ((screenHelperInst.getHeight() <= 800) || (screenHelperInst.getWidth() <= 350)) {
                    _bgPos = screenHelperInst.getHeight() - 350;
                    _minPos = 50;
                }

                if (((screenHelperInst.getWidth() > 350) && (screenHelperInst.getWidth() <= 600)) ||
                        ((screenHelperInst.getHeight() <= 800) && (screenHelperInst.getWidth() > 600))) {
                    _bgPos = screenHelperInst.getHeight() - 625;
                    _minPos = -225;
                }

                if (_bgPos !== undefined) {
                    if (_bgPos <= _minPos) {
                        _bgPos = _minPos;
                    }

                    _rtn = "center " + _bgPos + "px";
                } else {
                    _rtn = null;
                }

                doc.body.style.backgroundPosition = _rtn;
            }

            return fn();
        };

        _rotateObjects = function () {
            //Rotates earth, moon and lowEarthOrbit layers at an increment.
            var _curLEOAngle, _curMoonAngle;

            _curLEOAngle = 0;
            _curMoonAngle = 0;

            function fn() {
                setInterval(function () {
                    _curMoonAngle += 0.125;
                    _curLEOAngle += 0.25;

                    if (worldTurns) {
                        curEarthAngle -= 0.50;

                        TweenLite.to(planetEarthEl, 0, {
                            css: {
                                rotationZ: curEarthAngle
                            }
                        });
                    }

                    TweenLite.to(moon, 0, {
                        css: {
                            rotationZ: _curMoonAngle
                        }
                    });

                    TweenLite.to(lowEarthOrbit, 0, {
                        css: {
                            rotationZ: _curLEOAngle
                        }
                    });
                }, 60);
            }

            return fn();
        };

        _animBrightness = function (showHide) {
            //Input: (string)showHide
            //Sets the brightness of the key props for showing contact form.
            var _startFloat, _endFloat, _curFloat, _els, _anim, _nature,
                _sheri, _computers, _games, _shuttle, _satellite,
                _fefuncr, _fefuncg, _fefuncb, _next;

            _nature = doc.getElementById("nature");
            _sheri = doc.getElementById("sheri");
            _computers = doc.getElementById("computers");
            _games = doc.getElementById("games");
            _shuttle = doc.getElementById("spaceShuttle");
            _satellite = doc.getElementById("satellite");

            function fn() {
                //If the browser is IE we can't depend on CSS filters or SVG, so I just 
                //swap the images with blacked-out versions once zoomed for a lo-fi 
                //solution.
                if (isIE) {
                    _els = [planetEarthEl, ashEl, _sheri, _nature, _computers, _games, moon, _shuttle, _satellite];

                    $(_els).removeClass("dark");

                    if (showHide === "show") {
                        $(_els).addClass("dark");
                    } else {
                        $(_els).removeClass("dark");
                    }

                    return;
                }

                _els = [planetEarthEl, ashEl, lowEarthOrbit, moon];

                //Set the start/end values for tweening.
                if (showHide === "show") {
                    _startFloat = parseFloat(1.0).toFixed(1);
                    _endFloat = parseFloat(0.0).toFixed(1);
                } else {
                    _startFloat = parseFloat(0.0).toFixed(1);
                    _endFloat = parseFloat(1.0).toFixed(1);
                }

                _curFloat = _startFloat;

                //Since the brightness filter isn't officially implemented,
                //we have to animate the filter ourselves.
                _anim = setInterval(function () {
                    //Add or subtract 0.1 from our start value, depending on
                    //whether or not we're showing/hiding.
                    if (showHide === "show") {
                        //Subtract
                        _next = mHelp.pFloat(_curFloat) - mHelp.pFloat(0.1);
                    } else {
                        //Add
                        _next = mHelp.pFloat(_curFloat) + mHelp.pFloat(0.1);
                    }

                    _curFloat = _next.toFixed(1);

                    //If browser is Firefox, we have to animate the filter lin elements
                    //directly, since there is no brightness filter built-in.

                    //If browser is Webkit, we can use the built-in vendor specific prefix
                    //and brightness filter.
                    TweenLite.to(_els, 0, { css: { '-webkit-filter': 'brightness(' + _curFloat + ')', 'filter': 'brightness(' + _curFloat + ')' } });

                    //Stop the interval if we've reached our target brightness.
                    if (_curFloat === _endFloat) { clearInterval(_anim); }
                }, 20);
            }

            return fn();
        };

        _show = function () {
            doc.body.classList.add("loaded");
        };

        _init = function () {
            theHeavens = doc.getElementById("theHeavens");
            moon = doc.getElementById("moon");
            lowEarthOrbit = doc.getElementById("lowEarthOrbit");
            topMarginContainer = doc.getElementById("topMarginContainer");

            _initUADetection();
            //_preventMobileScale();
            _handleResize();
            _initFancybox();
            _rotateObjects();

            topMarginContainer.addEventListener("click",
                function (e) {
                    if (e.target === this) {
                        _topMarginContainerClicked();
                    }
                }, false);
        };

        return {
            zoomOut : _zoomOut,
            zoomIn : _zoomIn,
            topMarginContainerClicked : _topMarginContainerClicked,
            resize : _resize,
            handleResize : _handleResize,
            debug : _debug,
            show : _show,
            handleMousemove : _handleMousemove,
            initUADetection : _initUADetection,
            animBrightness : _animBrightness,
            keydown : _keydown,
            init : _init
        };
    }());

    content.prototype = (function () {
        var _getGalleryMarkup, _load, _init;

        _getGalleryMarkup = function (interestName) {
            //Input: (string)interestName
            //Return: (string)
            //Returns HTML composing a UL and set of LIs for gallery images,
            //if the interest's gallery contains images
            var _interestGallery, _galleryCount, _i, _listItem, _image, _anchor, _imgUrl, _list;

            _list = undefined;
            _interestGallery = interestsArr[interestName].gallery;
            _galleryCount = _interestGallery.length;

            if (_galleryCount > 0) {
                _list = domHelp.buildEl("ul");

                for (_i = 0; _i < _galleryCount; _i += 1) {
                    _imgUrl = _interestGallery[_i].url;

                    _image = domHelp.buildEl("img");
                    _image.src = _imgUrl.replace(".", "_thumb.");

                    _anchor = domHelp.buildEl("a", undefined, "fancybox");
                    _anchor.href = _imgUrl;
                    _anchor.setAttribute("title", _interestGallery[_i].description);
                    _anchor.setAttribute("rel", interestName);
                    _anchor.appendChild(_image);

                    _listItem = domHelp.buildEl("li", undefined, "interestImage");
                    _listItem.appendChild(_anchor);

                    _list.appendChild(_listItem);
                }
            }

            return _list;
        };

        _load = function (interestName) {
            //Input: (string)interestName
            //Retrieves interest content from object and loads content
            //into infoPanel template locations.
            var _myInterest, _galleryList, _infoContent, _infoHeader;

            _infoContent = doc.getElementById("infoContent");
            _infoHeader = doc.getElementById("infoHeader");

            _myInterest = interestsArr[interestName];
            _galleryList = _getGalleryMarkup(interestName);

            _infoContent.innerHTML = "";

            if (_galleryList !== undefined) {
                _infoContent.appendChild(_galleryList);
            }

            _infoContent.className = "";
            _infoContent.classList.add(interestName);

            _infoContent.innerHTML += _myInterest.content;
            _infoHeader.innerHTML = _myInterest.header;
        };

        _init = function () {
            interestsArr.about.header = "About Me";
            interestsArr.about.content =
                "<p>Hi, I'm Ash! I was born in 1983 and grew up in Savannah, GA.</p>" +
                "<p>During work hours, I'm a web developer. I specialize in front-end work, but I " +
                "have a lot of experience in back-end languages. I've worked with PHP, ASP, C# and " +
                "Ruby, but the majority of my skill is with ASP.NET Webforms & C#.</p> " +
                "<p>In my free time I enjoy hiking, video games, producing music and " +
                "expanding my skillset toward developing games. You can learn more about " +
                "my interests by clicking the various items on the globe.</p>";

            interestsArr.games.header = "Games";
            interestsArr.games.content =
                "<p>I really enjoy playing video games and discussing game logic and design " +
                "with like-minded people.</p>" +
                "<p>I started playing games back on the family Atari 2600, and grew up with the NES, SNES and N64.</p>" +
                "<p>These days I'm more of a PC Gamer (Battlefield, Half Life, Portal, Team Fortress, Command and Conquer,) " +
                "but I also enjoy Fighters (Smash Bros, Street Fighter, Guilty Gear,) Platformers (Mario, Super " +
                "Meat Boy,) and artistic milestones like Journey and Shadow of the Colossus. I'm also a big " +
                "fan of Nintendo franchises and storytelling. I believe gameplay is the most important " +
                "factor to building a good gaming experience, and I hope to get the opportunity to build " +
                "games independently in the future.</p>";

            interestsArr.sheri.header = "Sheri";
            interestsArr.sheri.content =
                "<p>My girlfriend Sheri and I met many years ago; we've been through thick and thin together. " +
                "We and our cat Kuma recently moved to Seattle and are really enjoying the Pacific Northwest!</p>" +
                "<p>Sheri is a very talented illustrator and a skilled graphic designer. She created the graphics for " +
                "this site! I encourage you to see more of her work over at her site, " +
                "<a href='http://sheribates.com/' target='_blank'>SheriBates.com</a>. <3</p>";

            interestsArr.computers.header = "Computers";
            interestsArr.computers.content =
                "<p>I'm a front-end web developer who works in Javascript, LESS, ASP.NET Webforms and C#, primarily. I " +
                "started building websites in 1996.</p>" +
                "<p>My first exposure to programming was on a Commodore Model 4064, a hand-me-down from " +
                "my uncle. My sister and I would sit and copy lines of code from books for hours, just to hear a little " +
                "jingle from the internal speaker, or make a shape on the screen that would be gone when the " +
                "computer was powered down.</p>" +
                "<p>This site was built as a 'living resume' to showcase the range of my skillset. For more detail on my experience, " +
                "please click the PDF or Word icons at the top of the page to download and view my Resume. I would love for you to have " +
                "a look at the <a href='files/codesamples/default.aspx.txt' target='_blank'>Markup</a>, " +
                "<a href='files/codesamples/main.js' target='_blank'>JavaScript</a> and " +
                "<a href='files/codesamples/site.less.txt' target='_blank'>LESS</a> for this site, as well as some " +
                "<a href='files/codesamples/ButtonLink.cs.txt' target='_blank'>C#</a> from another project.</p>";

            interestsArr.nature.header = "Nature";
            interestsArr.nature.content =
                "<p>I spend a lot of time behind a keyboard, so I really enjoy taking the opportunity to get " +
                "out and hike in the Cascades. I also enjoy photography. I placed some of my favorite " +
                "PNW Hiking photos here in the gallery on the right. Have a look! :)</p>";
        };

        return {
            getGalleryMarkup : _getGalleryMarkup,
            load : _load,
            init : _init
        };
    }());

    infoPanel.prototype = (function () {
        var _infoPanelOpen, _open, _close, _init;

        _open = function (interestName) {
            //Input: (string)interestName
            //Opens info panel and calls loadContent.
            var _dur, _infoPanelBottom;

            _dur = 0.8;

            function fn() {
                _infoPanelBottom = ((screenHelperInst.getHeight() / 2) - infoPanelEl.offsetHeight);
                infoPanelAnimating = true;
                worldTurns = false;

                if (_infoPanelOpen === true) {
                    _dur = 0.1;
                }

                contInst.load(interestName);

                infoPanelEl.style.bottom = _infoPanelBottom + "px";
                infoPanelEl.style.display = "inline-block";

                TweenLite.to(infoPanelEl, _dur, {
                    css: {
                        opacity: 1
                    },
                    onComplete:
                        function () {
                            infoPanelAnimating = false;
                            earthAnimating = false;
                            _infoPanelOpen = true;
                        }
                });
            }

            return fn();
        };

        _close = function (zOut, instant) {
            //Input: (bool)zOut
            //Closes infoPanel and triggers zoomout if zOut is true.
            var _doZoomOut, _dur;

            _doZoomOut = (zOut === undefined) ? "false" : zOut;
            _dur = 0.5;

            function fn() {
                if (instant === true) {
                    _dur = 0;
                }

                if (_doZoomOut === true) {
                    if (instant === true) {
                        pageInst.zoomOut(true);
                    } else {
                        pageInst.zoomOut();
                    }
                }

                infoPanelAnimating = true;
                _infoPanelOpen = false;

                TweenLite.to(infoPanelEl, _dur, {
                    css: {
                        opacity: 0
                    },
                    onComplete: function () {
                        infoPanelEl.removeAttribute("style");
                        infoPanelAnimating = false;
                        infoPanelEl.style.display = "none";
                    }
                });
            }

            return fn();
        };

        _init = function () {
            var _nextIcon, _prevIcon, _closeIcon;

            _infoPanelOpen = false;

            _nextIcon = doc.getElementById("infoNext");
            _prevIcon = doc.getElementById("infoPrev");
            _closeIcon = doc.getElementById("infoClose");

            _nextIcon.addEventListener("click", function () { interestInst.jog(); }, false);
            _prevIcon.addEventListener("click", function () { interestInst.jog("prev"); }, false);
            _closeIcon.addEventListener("click", function () { pageInst.topMarginContainerClicked(); }, false);
        };

        return {
            open : _open,
            close : _close,
            init : _init
        };
    }());

    earth.prototype = (function () {
        var _getTargetAngle, _resume, _rotateToAngle, _rotateToInterest, _renderShadow;

        _getTargetAngle = function (interestName) {
            //Input: (string)interestName
            //Return: (int)
            //Returns a target angle based on the total number of 
            //rotations and the curEarthAngle so we get the shortest 
            //possible rotation regardless of the current angle
            var _targetAngle, _remainder, _completedRotations, _shortestAngle,
                _fullRotations, _adjustedTargetAngle;

            function fn() {
                _targetAngle = interestsArr[interestName].locationAngle;
                _remainder = (curEarthAngle % 360);
                _completedRotations = ((curEarthAngle - _remainder) / 360);
                _shortestAngle = (_targetAngle - _remainder);
                _fullRotations = (360 * _completedRotations);

                //Rotate clockwise?
                if (_shortestAngle > 180) {
                    _shortestAngle -= 360;
                }

                //Rotate counter-clockwise?
                if (_shortestAngle < -180) {
                    _shortestAngle += 360;
                }

                //Create our final rotation angle, accounting for current
                //    count of rotations and the shortest direction
                //    (clockwise or counter-clockwise.)
                _adjustedTargetAngle = (_remainder + _shortestAngle) + _fullRotations;

                return _adjustedTargetAngle;
            }

            return fn();
        };

        _resume = function () {
            worldTurns = true;
            pageInst.animBrightness("hide");
            spritesInst.update(ashEl, "walking");
        };

        _rotateToAngle = function (targetAngle, interestName) {
            //Input: (int)targetAngle, (string)interestName
            //Rotates earth to targetAngle, zooms, shows infoPanel and contact form.
            var _angleDifference, _dur, _easing;

            function fn() {
                worldTurns = false;
                earthAnimating = true;
                currentInterest = '';

                _angleDifference = mHelp.diff(curEarthAngle, targetAngle);
                _dur = (_angleDifference / 30);
                _easing = Sine.easeOut;

                contactFormInst.hide();
                spritesInst.updateStatus(ashEl, targetAngle);

                TweenLite.to(planetEarthEl, _dur, {
                    css: {
                        rotationZ: targetAngle + "deg"
                    },
                    ease: _easing,
                    onComplete: function () {
                        currentInterest = interestsArr[interestName].name;
                        curEarthAngle = targetAngle;
                        spritesInst.updateStatus(ashEl, targetAngle);

                        if (!zoomed) {
                            pageInst.zoomIn(function () {
                                infoPanelInst.open(interestName);
                            });
                        } else {
                            infoPanelInst.open(interestName);
                        }

                        earthAnimating = false;
                    }
                });
            }

            return fn();
        };

        _rotateToInterest = function (interestName) {
            //Input: (int)interestName
            //Rotates earth to Interest. Calls rotateToAngle.
            if (earthAnimating === true) { return; }

            var _targetAngle;

            function fn() {
                currentInterest = '';
                earthAnimating = true;
                _targetAngle = _getTargetAngle(interestName);

                if ((contactFormEl.style.opacity > 0.1) || contactVisible) {
                    contactFormInst.hide();
                    pageInst.animBrightness("hide");
                }

                if (curEarthAngle !== _targetAngle) {
                    //We're not currently at this interest, so we need to 
                    //    go to a new interest.
                    infoPanelInst.close();
                    _rotateToAngle(_targetAngle, interestName);
                } else {
                    infoPanelInst.close(true);
                }
            }

            return fn();
        };

        _renderShadow = function () {
            //Creates shadow and sets its length based on some math that finds the 
            //distance to the corner.
            //Source: I don't recall where I got it, but this is borrowed code.
            var _earthShadow;

            _earthShadow = doc.getElementById("earthShadow");

            function fn() {
                if ((screenHelperInst.getWidth() <= 600) || (screenHelperInst.getHeight() <= 800)) {
                    _earthShadow.style.display = "none";
                } else {
                    var centerY, centerX, length;

                    centerY = (screenHelperInst.getHeight() / 2);
                    centerX = (screenHelperInst.getWidth() / 2);
                    length = Math.floor(Math.sqrt(Math.pow(-Math.abs(centerX), 2) + Math.pow(screenHelperInst.getHeight() - centerY, 2)));

                    _earthShadow.style.width = length + "px";
                    _earthShadow.style.display = "";
                }
            }

            return fn();
        };

        return {
            getTargetAngle : _getTargetAngle,
            resume : _resume,
            rotateToAngle : _rotateToAngle,
            rotateToInterest : _rotateToInterest,
            renderShadow : _renderShadow
        };
    }());

    contactForm.prototype = (function () {
        var _contactAnimating, _thanksEl, _contactEl, _init, _hideThanks, _showThanks,
            _hide, _show, _submit, _successCallback, _errorCallback;

        _hideThanks = function () {
            TweenLite.to(_thanksEl, 0.5, {
                opacity: 0,
                onComplete: function () {
                    earthInst.resume();
                }
            });
        };

        _showThanks = function () {
            var _thanksTop, _thanksHeight, _thanksMarginLeft;

            _thanksTop = (screenHelperInst.getHeight() * 0.5) - 13 + "px";
            _thanksHeight = (planetEarthEl.offsetHeight * 0.7) + "px";
            _thanksMarginLeft = -Math.abs((planetEarthEl.offsetHeight * 0.7) / 2) + "px";

            _thanksEl.style.display = "block";
            _thanksEl.style.top = _thanksTop;
            _thanksEl.style.width = _thanksHeight;
            _thanksEl.style.marginLeft = _thanksMarginLeft;

            _hide();

            TweenLite.to(_thanksEl, 0.5, {
                opacity: 1,
                onComplete: function () {
                    setTimeout(function () {
                        _hideThanks();
                    }, 1000);
                }
            });
        };

        _hide = function (resume) {
            if ((contactFormEl.style.opacity < 0.1) || (contactVisible === false) || _contactAnimating) { return; }

            if (resume === true) {
                earthInst.resume();
            }

            contactVisible = false;
            contactFormEl.style.display = "none";
            contactFormEl.style.opacity = "0";
        };

        _show = function () {
            if (contactVisible || _contactAnimating) { return; }

            var contactTop, contactHeight, contactMarginLeft;

            if (zoomed === true) {
                infoPanelInst.close(true);
            }

            worldTurns = false;

            spritesInst.update(ashEl, "standing");
            pageInst.animBrightness("show");

            contactTop = planetEarthEl.offsetTop + (planetEarthEl.offsetHeight * 0.15) + "px";
            contactHeight = (planetEarthEl.offsetHeight * 0.7) + "px";
            contactMarginLeft = -Math.abs((planetEarthEl.offsetHeight * 0.7) / 2) + "px";

            contactFormEl.style.display = "inline-block";
            contactFormEl.style.top = contactTop;
            contactFormEl.style.height = contactHeight;
            contactFormEl.style.width = contactHeight;
            contactFormEl.style.marginLeft = contactMarginLeft;

            _contactAnimating = true;

            TweenLite.to(contactFormEl, 0.75, {
                opacity: 1,
                ease: Linear.none,
                onComplete: function () {
                    contactVisible = true;
                    _contactAnimating = false;

                    doc.getElementById("txtName").focus();
                }
            });
        };

        _submit = function () {
            var _nameVal, _emailVal, _msgVal, _options;

            _nameVal = doc.getElementById('txtName').value;
            _emailVal = doc.getElementById('txtEmail').value;
            _msgVal = doc.getElementById('txtMsg').value;

            _options = {
                type: "POST",
                url: "Default.aspx/SendEmail",
                data: '{ "name": "' + _nameVal + '", "email": "' + _emailVal + '", "msg": "' + _msgVal + '"}',
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: _successCallback,
                error: _errorCallback
            };

            $.ajax(_options);
        };

        _successCallback = function () {
            doc.getElementById('txtName').value = "";
            doc.getElementById('txtEmail').value = "";
            doc.getElementById('txtMsg').value = "";

            _showThanks();
        };

        _errorCallback = function (result) {
            pageInst.debug("error: " + result.statusText);
        };

        _init = function () {
            _contactEl = doc.getElementById("contactIcon");
            _thanksEl = doc.getElementById("contactThanks");
            _contactAnimating = false;

            _contactEl.addEventListener("click", function () { _show(); }, false);

            $("form").isHappy({
                fields: {
                    '#txtName': {
                        message: '*'
                    },
                    '#txtEmail': {
                        message: '*',
                        test: happy.email
                    },
                    '#txtMsg': {
                        message: '*'
                    }
                },
                submitButton: "#contactSend",
                happy: _submit
            });
        };

        return {
            successCallback : _successCallback,
            errorCallback : _errorCallback,
            submit : _submit,
            show : _show,
            hide : _hide,
            showThanks : _showThanks,
            hideThanks : _hideThanks,
            init : _init
        };
    }());

    images.prototype = (function () {
        var _init, Image;

        Image = function (title, url, description, interestName) {
            //Image Object Constructor
            //Input: (string)title, (string)url, (string)description, (string)interestName
            this.title = title;
            this.url = url;
            this.description = description;

            //Push new image into the gallery for the interest we took as a param
            interestsArr[interestName].gallery.push(this);
        };

        _init = function () {
            new Image("Rainier", "files/photos/rainier_1.jpg", "Rainier with a forboding cloud formation", "nature");
            new Image("Lake Margaret Trail", "files/photos/margaret_1.jpg", "Lake Margaret Trail", "nature");
            new Image("Snow Lake Trail", "files/photos/snow_1.jpg", "Snow Lake Trail", "nature");
            new Image("AutoLoop.us 2013", "files/portfolio/autoloop_1.jpg", "AutoLoop.us 2013. <a href='http://goo.gl/FNfBbY' target='_blank'>Wayback Archive</a>", "computers");
            new Image("AutoLoop Web Application", "files/portfolio/autoloop_2.jpg", "AutoLoop Web Application", "computers");
            new Image("AutoLoop Web Application", "files/portfolio/autoloop_3.jpg", "AutoLoop Web Application", "computers");
            new Image("AutoLoop Web Application", "files/portfolio/autoloop_4.jpg", "AutoLoop Web Application", "computers");
            new Image("AutoLoop Web Application", "files/portfolio/autoloop_5.jpg", "AutoLoop Web Application", "computers");
            new Image("AutoLoop Web Application", "files/portfolio/autoloop_6.jpg", "AutoLoop Web Application", "computers");
            new Image("AutoLoop Web Application", "files/portfolio/autoloop_7.jpg", "AutoLoop Web Application", "computers");
            new Image("AutoLoop Web Application", "files/portfolio/autoloop_8.jpg", "AutoLoop Web Application", "computers");
            new Image("MandalaySolutions.com 2011", "files/portfolio/mandalay_solutions_1.jpg", "MandalaySolutions.com 2011. <a href='http://goo.gl/NQ3pzY' target='_blank'>Wayback Archive</a>", "computers");
            new Image("MandalaySolutions.com Portfolio 2011", "files/portfolio/mandalay_solutions_2.jpg", "MandalaySolutions.com Portfolio 2011. <a href='http://goo.gl/PJcEz0' target='_blank'>Wayback Archive</a>", "computers");
            new Image("FantasticSamsFlorida.com 2011", "files/portfolio/fantastic_sams.jpg", "FantasticSamsFlorida.com 2011. <a href='http://goo.gl/pIYJUv' target='_blank'>Wayback Archive</a>", "computers");
            new Image("GlobalSyntheticIce.com 2011", "files/portfolio/global_synthetic_ice.jpg", "GlobalSyntheticIce.com 2011. <a href='http://goo.gl/128ll0' target='_blank'>Wayback Archive</a>", "computers");
        };

        return {
            init : _init
        };
    }());

    sprites.prototype = (function () {
        var _update, _updateStatus;

        _update = function (el, state, hflip) {
            //Input: (string)state, (bool)hflip
            //Takes a string which will be used for a CSS class, and a boolean to set a 
            //"flipped" class, which will then be applied to the actor as a CSS class.
            var _flip, _cssClass;

            function fn() {
                _flip = (hflip === undefined) ? "false" : hflip;
                _cssClass = state;

                if (el.classList.contains("dark")) {
                    el.className = "dark";
                } else {
                    el.className = "";
                }

                if (_flip === true) {
                    _cssClass += " flipped";
                }

                el.className = "sprite " + _cssClass;
            }

            return fn();
        };

        _updateStatus = function (el, targetAngle) {
            //Input: (int)targetAngle
            //Sets sprites based on targetAngle and currentInterest
            var _status = doc.getElementById("status");

            function fn() {
                _status.style.display = "none";

                if (el === ashEl) {
                    if (targetAngle !== undefined) {
                        if (targetAngle < curEarthAngle) {
                            //Face ash sprite right if we're rotating counter-clockwise.
                            _update(el, "walking");
                        } else {
                            //Face ash sprite left if we're rotating clockwise.
                            _update(el, "walking", true);
                        }

                        if (curEarthAngle === targetAngle) {
                            //We're at our interest, so just stand still.
                            _update(el, "standing");

                            //Change sprite if we're at an interest that requires it.
                            if (currentInterest === 'computers') {
                                _update(el, "standing-away");
                            }
                            if (currentInterest === 'nature') {
                                _update(el, "sitting-camp");
                            }
                            if (currentInterest === 'games') {
                                _update(el, "sitting-vidya");
                            }
                        }
                    } else {
                        _update(el, "walking");
                    }

                    if (currentInterest === 'sheri') {
                        _status.style.display = "inline-block";
                    } else {
                        _status.style.display = "none";
                    }
                }
            }

            return fn();
        };

        return {
            update : _update,
            updateStatus : _updateStatus
        };
    }());

    $(function () {
        //Set up some global variables.
        doc = document;
        win = window;
        planetEarthEl = doc.getElementById("planetEarth");
        infoPanelEl = doc.getElementById("infoPanel");
        contactFormEl = doc.getElementById("contactForm");
        ashEl = doc.getElementById("ash");
        
        mHelp = new mathHelper();
        domHelp = new domHelper();
        screenHelperInst = new screenHelper();
        interestInst = new interests();
        skyInst = new sky();
        pageInst = new page();
        contInst = new content();
        infoPanelInst = new infoPanel();
        earthInst = new earth();
        contactFormInst = new contactForm();
        imagesInst = new images();
        spritesInst = new sprites();
        
        worldTurns = true;
        earthAnimating = false;
        zoomAnimating = false;
        zoomed = false;
        infoPanelAnimating = false;
        contactVisible = false;
        interestsArr = {};
        curEarthAngle = 0;
        
        //Call startup functions.
        pageInst.init();
        skyInst.init();
        interestInst.init();
        infoPanelInst.init();
        imagesInst.init();
        contInst.init();
        contactFormInst.init();

        //Set up event handlers.
        doc.addEventListener("keydown", function (e) { pageInst.keydown(e); }, false);
        win.addEventListener("resize", function () { pageInst.handleResize(); }, false);
        win.addEventListener("touchmove", function (e) { e.preventDefault(); }, false);

        window.onload = pageInst.show();
    });
}());