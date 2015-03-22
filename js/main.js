/*jshint nonew: false */
/*jslint browser: true, indent: 4, nomen: true*/
/*global $, TweenLite, Power1, Sine, Linear, define, happy */

(function () {
    "use strict";

    var doc, win, planetEarthEl, ashEl, infoPanelEl, contactFormEl, isMobile, isAndroid,
        isDesktop, isIE, isChrome, isFirefox, isWebkit, interestsArr, worldTurns,
        zoomYPos, zoomAnimating, zoomed, infoPanelAnimating, curEarthAngle,
        currentInterest, contactVisible, requires, sprites, screenDims, stars,
        mathHelpers, domHelpers, images, interests, infoPanel, contactForm,
        content, page, earth, earthAnimating;

    requires = ["jquery", "tweenmax", "fancybox", "fancybox_thumbs", "analytics", "happyjs", "happymethods"];

    domHelpers = (function () {
        var _buildEl, _getEl;

        _buildEl = function (type, id, className) {
            //Override createElement to take ID and Class.
            var elem;

            elem = document.createElement(type);

            if (id !== undefined) {
                elem.id = id;
            }

            if (className !== undefined) {
                elem.className = className;
            }

            return elem;
        };

        return {
            buildEl : _buildEl,
            getEl : _getEl
        };
    }());

    mathHelpers = (function () {
        var _pFloat, _rInt, _rFloat, _rRGB, _diff;

        _pFloat = function (input) {
            //Input: (float)input
            //Return: (float) with a precision of two (x.xx)
            var f = ((input * 10) / 10);

            return f;
        };

        _rInt = function (minValue, maxValue) {
            //Input: (int)minValue, (int)maxValue
            //Return: (int) which is greater than minValue and less than maxValue.
            var i = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;

            return i;
        };

        _rFloat = function (minValue, maxValue) {
            //Input: (float)minValue, (float)maxValue
            //Return: (float) which is greater than minValue and less than maxValue.
            var f = parseFloat(Math.min(minValue + (Math.random() * (maxValue - minValue)), maxValue));

            return _pFloat(f);
        };

        _rRGB = function () {
            //Return: (string)CSS property for a random RGB value.
            var r, g, b, rgb;

            r = _rInt(0, 255);
            g = _rInt(0, 255);
            b = _rInt(0, 255);
            rgb = "rgb(" + r + "," + g + "," + b + ")";

            return rgb;
        };

        _diff = function (num1, num2) {
            //Input: (int)num1, (int)num2
            //Return: (int)Value of the difference of num1 and num2
            var difference;

            if (num1 > num2) {
                difference = (num1 - num2);
            } else {
                difference = (num2 - num1);
            }

            return difference;
        };

        return {
            pFloat : _pFloat,
            rInt : _rInt,
            rFloat : _rFloat,
            rRGB : _rRGB,
            diff : _diff
        };
    }());

    screenDims = (function () {
        var _height, _width, _setHeight, _setWidth, _getHeight, _getWidth, _update;

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
            if (win.innerWidth === undefined) { return false; }
            _setHeight(win.innerHeight);
            _setWidth(win.innerWidth);
        };

        return {
            getHeight : _getHeight,
            getWidth : _getWidth,
            update : _update
        };
    }());

    interests = (function () {
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
            if (earthAnimating || infoPanelAnimating || zoomAnimating) { return false; }

            if (interestName === currentInterest) {
                infoPanel.close(true);
            } else {
                earth.rotateToInterest(interestName);
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
                earth.rotateToInterest(nextinterestName);
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

    stars = (function () {
        var mymeteor, starsColl, theStarsEl, _getScale, _move, _twinkle, _randomizeAttributes,
            _meteor, _meteorShower, _generateStars, _init;

        _getScale = function (el) {
            //Input: (HTMLElement)el
            //Return: (float)scale - scale of element
            var style, transform, values, scaleX;

            function fn() {
                style = win.getComputedStyle(el, null);
                transform = style.getPropertyValue("-webkit-transform") ||
                            style.getPropertyValue("-moz-transform") ||
                            style.getPropertyValue("-ms-transform") ||
                            style.getPropertyValue("-o-transform") ||
                            style.getPropertyValue("transform");

                values = transform.split('(')[1];
                values = values.split(')')[0];
                values = values.split(',');

                scaleX = values[0];

                return scaleX;
            }

            return fn();
        };

        _move = function (x, y) {
            //Input: (int)x, (int)y
            //Repositions members of stars on the screen based on 
            //a range of 1 - 50 mapped to screen dimensions.

            //IE doesn't perform well enough for this.
            if (isIE) { return false; }

            var bgPosX, bgPosY, i, star, scale, starY, starX,
                width, height, rangeWidth, rangeHeight, range;

            function fn() {
                range = 50;

                width = screenDims.getWidth();
                height = screenDims.getHeight();

                rangeWidth = (width / range);
                rangeHeight = (height / range);

                bgPosX = (rangeWidth * (x / width));
                bgPosY = (rangeHeight * (y / height));

                for (i = 0; i < starsColl.length; i += 1) {
                    star = starsColl[i];
                    scale = _getScale(star);
                    starY = bgPosY * scale;
                    starX = bgPosX * scale;

                    TweenLite.to(star, 0.6, {
                        css: {
                            y: starY,
                            x: starX
                        }
                    });
                }
            }

            return fn();
        };

        _twinkle = function (el) {
            //Input: (HTMLElement)el
            //Picks a set of randomized values to tween the star to for a twinkle effect.
            var dur, colorLottery, shimmerLottery, opa, rgb, bs;

            function fn() {
                dur = mathHelpers.rFloat(0.2, 2.0);
                colorLottery = mathHelpers.rInt(0, 10);
                shimmerLottery = mathHelpers.rInt(0, 50);
                opa = mathHelpers.rFloat(0.0, 1.0);
                rgb = "rgb(255,255,255)";
                bs = "null";

                //1 in 10 odds of getting a color star.
                if (colorLottery === 100) {
                    rgb = mathHelpers.rRGB();
                }

                //Add background-shadow if webkit, since they render it efficiently.
                if ((!isMobile && isWebkit) || (!isMobile && isFirefox)) {
                    bs = "0px 0px 15px 1px " + rgb;
                }

                //1 in 50 odds of getting a shimering star.
                if (shimmerLottery === 50) {
                    el.classList.add("shimmer");

                    setTimeout(function () {
                        el.classList.remove("shimmer");
                    }, 500);

                    if ((!isMobile && isWebkit) || (!isMobile && isFirefox)) {
                        bs = "0px 0px 20px 3px #fff";
                    }
                }

                TweenLite.to(el, dur, {
                    css: {
                        opacity: opa,
                        backgroundColor: rgb,
                        boxShadow: bs
                    },
                    onComplete: function () {
                        _twinkle(el);
                    }
                });
            }

            return fn();
        };

        _randomizeAttributes = function () {
            //Iterates over stars and sets star attributes to random start values.
            var i, el, left, top, sca, colorLottery, opa, rgb, bs;

            function fn() {
                for (i = 0; i < starsColl.length;  i += 1) {
                    el = starsColl[i];
                    left = mathHelpers.rFloat(-1, 101);
                    top = mathHelpers.rFloat(-1, 101);
                    sca = mathHelpers.rFloat(0.3, 1);
                    colorLottery = mathHelpers.rInt(1, 10);
                    opa = mathHelpers.rFloat(0.0, 1.0);
                    rgb = "rgb(255,255,255)";
                    bs = "null";

                    //1 in 10 odds of getting a color star.
                    if (colorLottery === 10) {
                        rgb = mathHelpers.rRGB();
                    }

                    //Don't use background-shadow if mobile
                    if (!isMobile && isWebkit) {
                        bs = "0px 0px 15px 1px " + rgb;
                    }

                    TweenLite.to(el, 0, {
                        css: {
                            left: left + "%",
                            top: top + "%",
                            z: 1,
                            scale: sca,
                            opacity: opa,
                            backgroundColor: rgb,
                            boxShadow: bs
                        }
                    });
                }
            }

            return fn();
        };

        _meteor = function (startX, startY) {
            //Input: (int)startX, (int)startY
            //Create and animate a meteor from position startX, startY

            function fn() {
                if (mymeteor === null || mymeteor.value === '') {
                    //No meteor in DOM, so we'll add it.
                    mymeteor = domHelpers.buildEl("span", "meteor");
                    theStarsEl.appendChild(mymeteor);
                }

                mymeteor.style.display = "block";
                mymeteor.style.top = startY + "px";
                mymeteor.style.left = startX + "px";

                TweenLite.to(mymeteor, 0.5, {
                    css: {
                        x: "-650px",
                        y: "+450px",
                        opacity: 0
                    },
                    ease: Sine.easeInOut,
                    onComplete: function () {
                        mymeteor.style.display = "none";
                        mymeteor.style.opacity = "1";
                        TweenLite.to(mymeteor, 0, {
                            css: {
                                x: "0px",
                                y: "0px"
                            }
                        });
                        _meteorShower();
                    }
                });
            }

            return fn();
        };

        _meteorShower = function () {
            //Kicks off a meteor, then loops at a random interval.
            var rTimeout, startX, startY;

            function fn() {
                rTimeout = Math.round((Math.random() * (3000 - 500)) + 100);
                startX = mathHelpers.rInt(0, screenDims.getWidth());
                startY = mathHelpers.rInt(0, screenDims.getHeight());

                setTimeout(function () {
                    _meteor(startX, startY);
                }, rTimeout);
            }

            return fn();
        };

        _generateStars = function () {
            //Creates stars then randomizes their attributes.
            if (starsColl.length === 0) {
                var starsCount, i, j, starsStr = '';

                starsCount = 30;

                if (isMobile && !isAndroid) {
                    starsCount = 15;
                }

                if (isDesktop && isWebkit) {
                    starsCount = 55;
                }

                for (i = 0; i < starsCount;  i += 1) {
                    starsStr += "<i></i>";
                }

                theStarsEl.innerHTML = starsStr;

                starsColl = theStarsEl.getElementsByTagName("i");

                for (j = 0; j < starsColl.length;  j += 1) {
                    _twinkle(starsColl[j]);
                }
            }

            _randomizeAttributes();
        };

        _init = function () {
            mymeteor = doc.getElementById("meteor");
            theStarsEl = doc.getElementById("theStars");
            starsColl = theStarsEl.getElementsByTagName("i");

            _generateStars();
            _meteorShower();

            doc.addEventListener("mousemove", function (e) { page.handleMousemove(e); }, false);
        };

        return {
            move : _move,
            init : _init
        };
    }());

    page = (function () {
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
            if (zoomAnimating && (instant !== true)) { return false; }

            var dur;

            dur = 2;
            currentInterest = '';
            worldTurns = true;
            zoomAnimating = true;
            sprites.updateStatus(ashEl);

            if (instant === true) {
                dur = 0;
            }

            //Don't adjust top margin if user is using a mobile device or 
            //currentInterest is "contact".
            if (!isMobile) {
                TweenLite.to(topMarginContainer, dur, {
                    css: {
                        top: 0
                    },
                    ease: Power1.easeInOut
                });
            }

            TweenLite.to(theHeavens, dur, {
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
            var zScale;

            zScale = 1;

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

                zScale = 2;
            }

            TweenLite.to(theHeavens, 2, {
                css: {
                    scale: zScale
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
            if (earthAnimating) { return false; }

            if (zoomed) {
                infoPanel.close(true);
            }

            if (contactVisible) {
                contactForm.hide(true);
            }
        };

        _resize = function () {
            infoPanel.close(true, true);

            currentInterest = '';
            earthAnimating = false;

            if ((contactFormEl.style.opacity > 0.1) || contactVisible) {
                contactForm.hide(true);
            }

            screenDims.update();
            _renderGlow();
            _updateZoomYPos();
            earth.renderShadow();
        };

        _handleResize = function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(_resize(), 15);
        };

        _updateZoomYPos = function () {
            var combinedHeight;

            function fn() {
                combinedHeight = planetEarthEl.offsetHeight + infoPanelEl.offsetHeight + 120;
                zoomYPos = (combinedHeight / 2);

                if (((screenDims.getWidth() <= 600) && (screenDims.getWidth() > 350)) ||
                        (screenDims.getHeight() <= 800)) {
                    zoomYPos = -Math.abs(planetEarthEl.offsetHeight / 2);
                }

                if (screenDims.getWidth() <= 350) {
                    zoomYPos = -Math.abs(planetEarthEl.offsetHeight);
                }
            }

            return fn();
        };

        _mouseCoords = function (ev) {
            //Input: Mouse event
            //Return: Object with .y and .x properties containing mouse event position
            var xy;

            if (ev.pageX || ev.pageY) {
                xy = {
                    x: ev.pageX,
                    y: ev.pageY
                };
            } else {
                xy = {
                    x: ev.clientX + doc.body.scrollLeft - doc.body.clientLeft,
                    y: ev.clientY + doc.body.scrollTop - doc.body.clientTop
                };
            }

            return xy;
        };

        _debug = function (inputString, clear) {
            //Input: (string)inputString, (bool)clear
            //Renders debug panel to DOM and adds inputStr to it
            var curDebugHtml, debugCol;

            debugCol = doc.getElementById("debugCol");

            //No debug col in DOM, so we'll add it.
            if ((debugCol === null) || (debugCol.value === '')) {
                debugCol = domHelpers.buildEl("span", "debugCol");

                doc.body.appendChild(debugCol);
            }

            function fn() {
                //Store current debug col HTML
                curDebugHtml = debugCol.innerHTML;

                //If clearing the current HTML, do that now.
                if (clear) {
                    curDebugHtml = "";
                }

                //Add our new string to the top of current debug HTML and populate debug col with it.
                debugCol.innerHTML = "\n" + inputString + "\n<br>\n" + curDebugHtml;
            }

            return fn();
        };

        _mousemove = function (e) {
            //Input: (event)e
            //Handles mousemove events.
            var mousePos;

            if (!isMobile && !isIE) {
                mousePos = _mouseCoords(e);

                stars.move(mousePos.x, mousePos.y);
            }
        };

        _keydown = (function () {
            //Input: (event)e
            //Handles key presses to trigger effects for some future functionality.
            var konami, codelength, keys;

            konami = "38,38,40,40,37,39,37,39,66,65";
            codelength = konami.split(",").length;
            keys = [];

            return function (e) {
                keys.push(e.keyCode);

                if (keys.toString().indexOf(konami) >= 0) {
                    keys = [];
                    //Phase 2!
                }

                if (keys.length > codelength) {
                    keys.shift();
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
            if ((win.devicePixelRatio !== undefined) && (win.devicePixelRatio > 2)) {
                var meta, metaValue;

                meta = doc.getElementById("viewport");

                if ((meta !== undefined) && (meta.value === '')) {
                    metaValue = 'width=device-width, initial-scale=' + (2 / win.devicePixelRatio) + ', user-scalable=no';
                    meta.setAttribute('content', metaValue);
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
            var bgPos, minPos, rtn;

            function fn() {
                bgPos = undefined;
                minPos = undefined;

                if ((screenDims.getHeight() <= 800) || (screenDims.getWidth() <= 350)) {
                    bgPos = screenDims.getHeight() - 350;
                    minPos = 50;
                }

                if (((screenDims.getWidth() > 350) && (screenDims.getWidth() <= 600)) ||
                        ((screenDims.getHeight() <= 800) && (screenDims.getWidth() > 600))) {
                    bgPos = screenDims.getHeight() - 625;
                    minPos = -225;
                }

                if (bgPos !== undefined) {
                    if (bgPos <= minPos) {
                        bgPos = minPos;
                    }

                    rtn = "center " + bgPos + "px";
                } else {
                    rtn = null;
                }

                doc.body.style.backgroundPosition = rtn;
            }

            return fn();
        };

        _rotateObjects = function () {
            //Rotates earth, moon and lowEarthOrbit layers at an increment.
            var curLEOAngle, curMoonAngle;

            curLEOAngle = 0;
            curMoonAngle = 0;

            function fn() {
                setInterval(function () {
                    curMoonAngle += 0.125;
                    curLEOAngle += 0.25;

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
                            rotationZ: curMoonAngle
                        }
                    });

                    TweenLite.to(lowEarthOrbit, 0, {
                        css: {
                            rotationZ: curLEOAngle
                        }
                    });
                }, 60);
            }

            return fn();
        };

        _animBrightness = function (showHide) {
            //Input: (string)showHide
            //Sets the brightness of the key props for showing contact form.
            var startFloat, endFloat, curFloat, els, anim, nature,
                sheri, computers, games, spaceShuttle, satellite,
                fefuncr, fefuncg, fefuncb;

            nature = doc.getElementById("nature");
            sheri = doc.getElementById("sheri");
            computers = doc.getElementById("computers");
            games = doc.getElementById("games");
            spaceShuttle = doc.getElementById("spaceShuttle");
            satellite = doc.getElementById("satellite");

            function fn() {
                //If the browser is IE we can't depend on CSS filters or SVG, so I just 
                //swap the images with blacked-out versions once zoomed for a lo-fi 
                //solution.
                if (isIE) {
                    els = [planetEarthEl, ashEl, sheri, nature, computers, games, moon, spaceShuttle, satellite];

                    els.classList.remove();

                    if (showHide === "show") {
                        els.classList.add("dark");
                    } else {
                        els.classList.remove("dark");
                    }

                    return;
                }

                if (isFirefox) {
                    fefuncr = doc.getElementById("fefuncr");
                    fefuncg = doc.getElementById("fefuncg");
                    fefuncb = doc.getElementById("fefuncb");
                }

                if (isWebkit) {
                    els = [planetEarthEl, ashEl, lowEarthOrbit, moon];
                }

                //Set the start/end values for tweening.
                if (showHide === "show") {
                    startFloat = parseFloat(1.0).toFixed(1);
                    endFloat = parseFloat(0.0).toFixed(1);
                } else {
                    startFloat = parseFloat(0.0).toFixed(1);
                    endFloat = parseFloat(1.0).toFixed(1);
                }

                curFloat = startFloat;

                //Since the brightness filter isn't officially implemented,
                //we have to animate the filter ourselves.
                anim = setInterval(function () {
                    var next;

                    //Add or subtract 0.1 from our start value, depending on
                    //whether or not we're showing/hiding.
                    if (showHide === "show") {
                        //Subtract
                        next = mathHelpers.pFloat(curFloat) - mathHelpers.pFloat(0.1);
                    } else {
                        //Add
                        next = mathHelpers.pFloat(curFloat) + mathHelpers.pFloat(0.1);
                    }

                    curFloat = next.toFixed(1);

                    //If browser is Firefox, we have to animate the filter lin elements
                    //directly, since there is no brightness filter built-in.

                    if (isFirefox) {
                        fefuncr.setAttribute("slope", curFloat);
                        fefuncg.setAttribute("slope", curFloat);
                        fefuncb.setAttribute("slope", curFloat);
                    }

                    //If browser is Webkit, we can use the built-in vendor specific prefix
                    //and brightness filter.
                    if (isWebkit) {
                        TweenLite.to(els, 0, { css: { '-webkit-filter': 'brightness(' + curFloat + ')' } });
                    }

                    //Stop the interval if we've reached our target brightness.
                    if (curFloat === endFloat) { clearInterval(anim); }
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

    content = (function () {
        var _getGalleryMarkup, _load, _init;

        _getGalleryMarkup = function (interestName) {
            //Input: (string)interestName
            //Return: (string)
            //Returns HTML composing a UL and set of LIs for gallery images,
            //if the interest's gallery contains images
            var interestGallery, galleryCount, i, listItem, image, anchor, imgUrl, list;

            list = null;
            interestGallery = interestsArr[interestName].gallery;
            galleryCount = interestGallery.length;

            if (galleryCount > 0) {
                list = domHelpers.buildEl("ul");

                for (i = 0; i < galleryCount; i += 1) {
                    imgUrl = interestGallery[i].url;

                    image = domHelpers.buildEl("img");
                    image.src = imgUrl.replace(".", "_thumb.");

                    anchor = domHelpers.buildEl("a", null, "fancybox");
                    anchor.href = imgUrl;
                    anchor.setAttribute("title", interestGallery[i].description);
                    anchor.setAttribute("rel", interestName);
                    anchor.appendChild(image);

                    listItem = domHelpers.buildEl("li", null, "interestImage");
                    listItem.appendChild(anchor);

                    list.appendChild(listItem);
                }
            }

            return list;
        };

        _load = function (interestName) {
            //Input: (string)interestName
            //Retrieves interest content from object and loads content
            //into infoPanel template locations.
            var myInterest, galleryList, infoContent, infoHeader;

            infoContent = doc.getElementById("infoContent");
            infoHeader = doc.getElementById("infoHeader");

            function fn() {
                myInterest = interestsArr[interestName];
                galleryList = _getGalleryMarkup(interestName);

                infoContent.innerHTML = "";

                if (galleryList) {
                    infoContent.appendChild(galleryList);
                }

                infoContent.classList.remove();
                infoContent.classList.add(interestName);

                infoContent.innerHTML += myInterest.content;
                infoHeader.innerHTML = myInterest.header;
            }

            return fn();
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
                "a look at the <a href='files/codesamples/site.html.txt' target='_blank'>HTML</a>, " +
                "<a href='files/codesamples/main.js' target='_blank'>Javascript</a> and " +
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

    infoPanel = (function () {
        var infoPanelOpen, _open, _close, _init;

        _open = function (interestName) {
            //Input: (string)interestName
            //Opens info panel and calls loadContent.
            var dur, infoPanelBottom;

            dur = 0.8;

            function fn() {
                infoPanelBottom = ((screenDims.getHeight() / 2) - infoPanelEl.offsetHeight);
                infoPanelAnimating = true;
                worldTurns = false;

                if (infoPanelOpen) {
                    dur = 0.1;
                }

                content.load(interestName);

                infoPanelEl.style.bottom = infoPanelBottom + "px";
                infoPanelEl.style.display = "inline-block";

                TweenLite.to(infoPanelEl, dur, {
                    css: {
                        opacity: 1
                    },
                    onComplete:
                        function () {
                            infoPanelAnimating = false;
                            earthAnimating = false;
                            infoPanelOpen = true;
                        }
                });
            }

            return fn();
        };

        _close = function (zOut, instant) {
            //Input: (bool)zOut
            //Closes infoPanel and triggers zoomout if zOut is true.
            var doZoomOut, dur;

            doZoomOut = (zOut === undefined) ? "false" : zOut;
            dur = 0.5;

            function fn() {
                if (instant === true) {
                    dur = 0;
                }

                if (doZoomOut === true) {
                    if (instant === true) {
                        page.zoomOut(true);
                    } else {
                        page.zoomOut();
                    }
                }

                infoPanelAnimating = true;
                infoPanelOpen = false;

                TweenLite.to(infoPanelEl, dur, {
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
            var next, prev, close;

            infoPanelOpen = false;
            next = doc.getElementById("infoNext");
            prev = doc.getElementById("infoPrev");
            close = doc.getElementById("infoClose");

            next.addEventListener("click", function () { interests.jog(); }, false);
            prev.addEventListener("click", function () { interests.jog("prev"); }, false);
            close.addEventListener("click", function () { page.topMarginContainerClicked(); }, false);
        };

        return {
            open : _open,
            close : _close,
            init : _init
        };
    }());

    earth = (function () {
        var _getTargetAngle, _resume, _rotateToAngle, _rotateToInterest, _renderShadow;

        _getTargetAngle = function (interestName) {
            //Input: (string)interestName
            //Return: (int)
            //Returns a target angle based on the total number of 
            //rotations and the curEarthAngle so we get the shortest 
            //possible rotation regardless of the current angle
            var targetAngle, remainder, completedRotations, shortestAngle,
                fullRotations, adjustedTargetAngle;

            function fn() {
                targetAngle = interestsArr[interestName].locationAngle;
                remainder = (curEarthAngle % 360);
                completedRotations = ((curEarthAngle - remainder) / 360);
                shortestAngle = (targetAngle - remainder);
                fullRotations = (360 * completedRotations);

                //Rotate clockwise?
                if (shortestAngle > 180) {
                    shortestAngle -= 360;
                }

                //Rotate counter-clockwise?
                if (shortestAngle < -180) {
                    shortestAngle += 360;
                }

                //Create our final rotation angle, accounting for current
                //    count of rotations and the shortest direction
                //    (clockwise or counter-clockwise.)
                adjustedTargetAngle = (remainder + shortestAngle) + fullRotations;

                return adjustedTargetAngle;
            }

            return fn();
        };

        _resume = function () {
            worldTurns = true;
            page.animBrightness("hide");
            sprites.update(ashEl, "walking");
        };

        _rotateToAngle = function (targetAngle, interestName) {
            //Input: (int)targetAngle, (string)interestName
            //Rotates earth to targetAngle, zooms, shows infoPanel and contact form.
            var angleDifference, dur, easing;

            function fn() {
                worldTurns = false;
                earthAnimating = true;
                currentInterest = '';

                angleDifference = mathHelpers.diff(curEarthAngle, targetAngle);
                dur = (angleDifference / 30);
                easing = Sine.easeOut;

                contactForm.hide();
                sprites.updateStatus(ashEl, targetAngle);

                TweenLite.to(planetEarthEl, dur, {
                    css: {
                        rotationZ: targetAngle + "deg"
                    },
                    ease: easing,
                    onComplete: function () {
                        currentInterest = interestsArr[interestName].name;
                        curEarthAngle = targetAngle;
                        sprites.updateStatus(ashEl, targetAngle);

                        if (!zoomed) {
                            page.zoomIn(function () {
                                infoPanel.open(interestName);
                            });
                        } else {
                            infoPanel.open(interestName);
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
            if (earthAnimating) { return false; }

            var targetAngle;

            function fn() {
                currentInterest = '';
                earthAnimating = true;
                targetAngle = _getTargetAngle(interestName);

                if ((contactFormEl.style.opacity > 0.1) || contactVisible) {
                    contactForm.hide();
                    page.animBrightness("hide");
                }

                if (curEarthAngle !== targetAngle) {
                    //We're not currently at this interest, so we need to 
                    //    go to a new interest.
                    infoPanel.close();
                    _rotateToAngle(targetAngle, interestName);
                } else {
                    infoPanel.close(true);
                }
            }

            return fn();
        };

        _renderShadow = function () {
            //Creates shadow and sets its length based on some math that finds the 
            //distance to the corner.
            //Source: I don't recall where I got it, but this is borrowed code.
            var earthShadow;

            earthShadow = doc.getElementById("earthShadow");

            function fn() {
                if ((screenDims.getWidth() <= 600) || (screenDims.getHeight() <= 800)) {
                    earthShadow.style.display = "none";
                } else {
                    var centerY, centerX, length;

                    centerY = (screenDims.getHeight() / 2);
                    centerX = (screenDims.getWidth() / 2);
                    length = Math.floor(Math.sqrt(Math.pow(-Math.abs(centerX), 2) + Math.pow(screenDims.getHeight() - centerY, 2)));

                    earthShadow.style.width = length + "px";
                    earthShadow.style.display = "";
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

    contactForm = (function () {
        var contactAnimating, thanksEl, contactEl, _init, _hideThanks, _showThanks,
            _hide, _show, _submit, _successCallback, _errorCallback;

        _hideThanks = function () {
            function fn() {
                TweenLite.to(thanksEl, 0.5, {
                    opacity: 0,
                    onComplete: function () {
                        earth.resume();
                    }
                });
            }

            return fn();
        };

        _showThanks = function () {
            var thanksTop, thanksHeight, thanksMarginLeft;

            function fn() {
                thanksTop = (screenDims.getHeight() * 0.5) - 13 + "px";
                thanksHeight = (planetEarthEl.offsetHeight * 0.7) + "px";
                thanksMarginLeft = -Math.abs((planetEarthEl.offsetHeight * 0.7) / 2) + "px";

                thanksEl.style.display = "block";
                thanksEl.style.top = thanksTop;
                thanksEl.style.width = thanksHeight;
                thanksEl.style.marginLeft = thanksMarginLeft;

                _hide();

                TweenLite.to(thanksEl, 0.5, {
                    opacity: 1,
                    onComplete: function () {
                        setTimeout(function () {
                            _hideThanks();
                        }, 1000);
                    }
                });
            }

            return fn();
        };

        _hide = function (resume) {
            if ((contactFormEl.style.opacity < 0.1) || !contactVisible || contactAnimating) { return; }

            function fn() {
                if (resume === true) {
                    earth.resume();
                }

                contactVisible = false;
                contactFormEl.style.display = "none";
                contactFormEl.style.opacity = "0";
            }

            return fn();
        };

        _show = function () {
            if (contactVisible || contactAnimating) { return; }

            var contactTop, contactHeight, contactMarginLeft;

            function fn() {
                if (zoomed) {
                    infoPanel.close(true);
                }

                worldTurns = false;

                sprites.update(ashEl, "standing");
                page.animBrightness("show");

                contactTop = planetEarthEl.offsetTop + (planetEarthEl.offsetHeight * 0.15) + "px";
                contactHeight = (planetEarthEl.offsetHeight * 0.7) + "px";
                contactMarginLeft = -Math.abs((planetEarthEl.offsetHeight * 0.7) / 2) + "px";

                contactFormEl.style.display = "inline-block";
                contactFormEl.style.top = contactTop;
                contactFormEl.style.height = contactHeight;
                contactFormEl.style.width = contactHeight;
                contactFormEl.style.marginLeft = contactMarginLeft;

                contactAnimating = true;

                TweenLite.to(contactFormEl, 0.75, {
                    opacity: 1,
                    ease: Linear.none,
                    onComplete: function () {
                        contactVisible = true;
                        contactAnimating = false;

                        doc.getElementById("txtName").focus();
                    }
                });
            }

            return fn();
        };

        _submit = function () {
            var nameVal, emailVal, msgVal, options;

            nameVal = doc.getElementById('txtName').value;
            emailVal = doc.getElementById('txtEmail').value;
            msgVal = doc.getElementById('txtMsg').value;

            options = {
                type: "POST",
                url: "Default.aspx/SendEmail",
                data: '{ "name": "' + nameVal + '", "email": "' + emailVal + '", "msg": "' + msgVal + '"}',
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: _successCallback,
                error: _errorCallback
            };

            $.ajax(options);
        };

        _successCallback = function () {
            doc.getElementById('txtName').value = "";
            doc.getElementById('txtEmail').value = "";
            doc.getElementById('txtMsg').value = "";

            _showThanks();
        };

        _errorCallback = function (result) {
            page.debug("error: " + result.statusText);
        };

        _init = function () {
            contactEl = doc.getElementById("contactIcon");
            thanksEl = doc.getElementById("contactThanks");
            contactAnimating = false;

            contactEl.addEventListener("click", function () { _show(); }, false);

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

    images = (function () {
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

    sprites = (function () {
        var _update, _updateStatus;

        _update = function (el, state, hflip) {
            //Input: (string)state, (bool)hflip
            //Takes a string which will be used for a CSS class, and a boolean to set a 
            //"flipped" class, which will then be applied to the actor as a CSS class.
            var flip, cssClass;

            function fn() {
                flip = (hflip === undefined) ? "false" : hflip;
                cssClass = state;

                if (el.classList.contains("dark")) {
                    el.className = "dark";
                } else {
                    el.className = "";
                }

                if (flip === true) {
                    cssClass += " flipped";
                }

                el.className = cssClass;
            }

            return fn();
        };

        _updateStatus = function (el, targetAngle) {
            //Input: (int)targetAngle
            //Sets sprites based on targetAngle and currentInterest
            var status;

            status = doc.getElementById("status");

            function fn() {
                status.style.display = "none";

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
                        status.style.display = "inline-block";
                    } else {
                        status.style.display = "none";
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

    define(requires, function () {
        //Set up some global variables.
        doc = document;
        win = window;
        planetEarthEl = doc.getElementById("planetEarth");
        infoPanelEl = doc.getElementById("infoPanel");
        contactFormEl = doc.getElementById("contactForm");
        ashEl = doc.getElementById("ash");
        worldTurns = true;
        earthAnimating = false;
        zoomAnimating = false;
        zoomed = false;
        infoPanelAnimating = false;
        contactVisible = false;
        interestsArr = {};
        curEarthAngle = 0;

        //Call startup functions.
        page.init();
        stars.init();
        interests.init();
        infoPanel.init();
        images.init();
        content.init();
        contactForm.init();

        //Set up event handlers.
        doc.addEventListener("keydown", function (e) { page.keydown(e); }, false);
        win.addEventListener("resize", function () { page.handleResize(); }, false);
        win.addEventListener("touchmove", function (e) { e.preventDefault(); }, false);

        window.onload = page.show();
    });
}());