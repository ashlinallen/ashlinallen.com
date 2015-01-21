/*jshint nonew: false */
/*jslint browser: true, indent: 4*/
/*global $, TweenLite, Power1, Sine, define, happy */

(function () {
    "use strict";

    var doc, win, planetEarthEl, ashEl, infoPanelEl, isMobile, isAndroid, isIE,
        isChrome, isFirefox, isWebkit, interestsArr, worldTurns, earthAnimating,
        zoomYPos, zoomAnimating, zoomed, infoPanelAnimating, curEarthAngle,
        currentInterest, contactVisible, requires, sprites, screenDims, stars,
        keydown, images, mathHelpers, infoPanel, contactForm, contactFormEl,
        interests, content, page, earth;

    requires = ["jquery", "tweenmax", "fancybox", "fancybox_thumbs", "analytics", "happyjs", "happymethods"];

    document.createElement = (function (fn) {
        //Override createElement to take ID and Class.
        return function (type, id, className) {
            var elem;

            elem = fn.call(document, type);

            if (id !== undefined) {
                elem.id = id;
            }

            if (className !== undefined) {
                elem.className = className;
            }

            return elem;
        };
    }(document.createElement));

    function getEl(s) {
        return document.getElementById(s);
    }

    mathHelpers = (function () {
        return {
            pFloat : function (input) {
                //Input: (float)input
                //Return: (float) with a precision of two (x.xx)
                var f;

                f = ((input * 10) / 10);

                return f;
            },

            rInt : function (minValue, maxValue) {
                //Input: (int)minValue, (int)maxValue
                //Return: (int) which is greater than minValue and less than maxValue.
                var i;

                i = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;

                return i;
            },

            rFloat : function (minValue, maxValue) {
                //Input: (float)minValue, (float)maxValue
                //Return: (float) which is greater than minValue and less than maxValue.
                var r;

                r = parseFloat(Math.min(minValue + (Math.random() * (maxValue - minValue)), maxValue));

                return mathHelpers.pFloat(r);
            },

            rRGB : function () {
                //Return: (string)CSS property for a random RGB value.
                var r, g, b, rgb;

                r = mathHelpers.rInt(0, 255);
                g = mathHelpers.rInt(0, 255);
                b = mathHelpers.rInt(0, 255);
                rgb = "rgb(" + r + "," + g + "," + b + ")";

                return rgb;
            },

            diff : function (num1, num2) {
                //Input: (int)num1, (int)num2
                //Return: (int)Value of the difference of num1 and num2
                var difference;

                if (num1 > num2) {
                    difference = (num1 - num2);
                } else {
                    difference = (num2 - num1);
                }

                return difference;
            }
        };
    }());

    screenDims = (function () {
        return {
            height: 0,

            width: 0,

            update : function () {
                if (window.innerWidth === undefined) { return false; }

                screenDims.height = window.innerHeight;
                screenDims.width = window.innerWidth;
            }
        };
    }());

    interests = (function () {
        return {
            //TODO: I would like to make interest private.
            interest : function (name, locationAngle) {
                //Interest Object Constructor
                //Input: (string)name, (int)locationAngle
                this.name = name;
                this.locationAngle = locationAngle;
                this.content = "";
                this.header = "";
                this.gallery = [];
            },

            clicked : function (interestName) {
                //Either close the info panel or rotate to a new interest.
                if (earthAnimating || infoPanelAnimating || zoomAnimating) { return false; }

                if (interestName === currentInterest) {
                    infoPanel.close(true);
                } else {
                    earth.rotateToInterest(interestName);
                }
            },

            jog : function (dir) {
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
            },

            init : function () {
                //Initializes interest values.
                interestsArr = {
                    about: new this.interest("about", 0),
                    games: new this.interest("games", -30),
                    sheri: new this.interest("sheri", -82),
                    computers: new this.interest("computers", 174),
                    nature: new this.interest("nature", 35)
                };

                $(ashEl).on("click", function () { interests.clicked("about"); });
                $(doc).on("click", "#planetEarth>a", function () { interests.clicked($(this).attr("id")); });
            }
        };
    }());

    stars = (function () {
        var mymeteor, starsColl, theStarsEl;

        return {
            getScale : function (el) {
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
            },

            move : function (x, y) {
                //Input: (int)x, (int)y
                //Repositions members of stars on the screen based on 
                //a range of 1 - 50 mapped to screen dimensions.

                //IE doesn't perform well enough for this.
                if (isIE) { return false; }

                var bgPosX, bgPosY, i, star, scale, starY, starX,
                    width, height, rangeWidth, rangeHeight, range;

                function fn() {
                    range = 50;

                    width = screenDims.width;
                    height = screenDims.height;

                    rangeWidth = (width / range);
                    rangeHeight = (height / range);

                    bgPosX = (rangeWidth * (x / width));
                    bgPosY = (rangeHeight * (y / height));

                    for (i = 0; i < starsColl.length; i += 1) {
                        star = starsColl[i];
                        scale = stars.getScale(star);
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
            },

            twinkle : function (el) {
                //Input: (HTMLElement)el
                //Picks a set of randomized values to tween the star to for a twinkle effect.
                var dur, colorLottery, opa, rgb, bs;

                function fn() {
                    dur = mathHelpers.rFloat(0.2, 2.0);
                    colorLottery = mathHelpers.rInt(1, 10);
                    opa = mathHelpers.rFloat(0.0, 1.0);
                    rgb = "rgb(255,255,255)";
                    bs = "null";

                    //1 in 10 odds of getting a color star.
                    if (colorLottery === 10) {
                        rgb = mathHelpers.rRGB();
                    }

                    //Add background-shadow if webkit, since they render it efficiently.
                    if (!isMobile && isWebkit) {
                        bs = "0px 0px 15px 1px " + rgb;
                    }

                    TweenLite.to(el, dur, {
                        css: {
                            opacity: opa,
                            backgroundColor: rgb,
                            boxShadow: bs
                        },
                        onComplete: function () {
                            stars.twinkle(el);
                        }
                    });
                }

                return fn();
            },

            randomizeAttributes : function () {
                //Iterates over stars and sets star attributes to random start values.
                var i, el, left, top, sca, colorLottery, opa, rgb, bs;

                function fn() {
                    for (i = 0; i < starsColl.length;  i += 1) {
                        el = starsColl[i];
                        left = mathHelpers.rFloat(-1, 101);
                        top = mathHelpers.rFloat(-1, 101);
                        sca = mathHelpers.rFloat(0.1, 1.2);
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
            },

            meteor : function (startX, startY) {
                //Input: (int)startX, (int)startY
                //Create and animate a meteor from position startX, startY

                function fn() {
                    if (mymeteor === null || mymeteor.value === '') {
                        //No meteor in DOM, so we'll add it.
                        mymeteor = doc.createElement("span", "meteor");
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
                            stars.meteorShower();
                        }
                    });
                }

                return fn();
            },

            meteorShower : function () {
                //Kicks off a meteor, then loops at a random interval.
                var rTimeout, startX, startY;

                function fn() {
                    rTimeout = Math.round((Math.random() * (3000 - 500)) + 100);
                    startX = mathHelpers.rInt(0, screenDims.width);
                    startY = mathHelpers.rInt(0, screenDims.height);

                    setTimeout(function () {
                        stars.meteor(startX, startY);
                    }, rTimeout);
                }

                return fn();
            },

            generateStars : function () {
                //Creates stars then randomizes their attributes.
                if (starsColl.length === 0) {
                    var starsCount, i, star;

                    starsCount = isMobile ? (isAndroid ? 30 : 10) : (isChrome ? 60 : 40);

                    for (i = 0; i < starsCount;  i += 1) {
                        star = doc.createElement("i");

                        theStarsEl.appendChild(star);
                        stars.twinkle(star);
                    }

                    starsColl = theStarsEl.getElementsByTagName("i");
                }

                stars.randomizeAttributes();
            },

            init : function () {
                mymeteor = getEl("meteor");
                theStarsEl = getEl("theStars");
                starsColl = theStarsEl.getElementsByTagName("i");

                stars.generateStars();
                stars.meteorShower();

                $(doc).on("mousemove", theStarsEl, function (e) { page.handleMousemove(e); });
            }
        };
    }());

    keydown = (function () {
        //Input: (event)e
        //Handles key presses to trigger effects for some future functionality.
        var konami, codelength, keys;

        konami = "38,38,40,40,37,39,37,39,66,65";
        codelength = konami.split(",").length;

        return function (e) {
            if (keys === undefined) {
                keys = [];
            }

            keys.push(e.keyCode);

            if (keys.toString().indexOf(konami) >= 0) {
                //Phase 2!
                keys = [];
            }

            if (keys.length > codelength) {
                keys.shift();
            }
        };
    }());

    page = (function () {
        var resizeTimer, mobileType, desktopType, mousemoveTimer, theHeavens, moon, lowEarthOrbit, topMarginContainer;

        mobileType = {
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
                return (mobileType.Android() || mobileType.BlackBerry() || mobileType.iOS() || mobileType.Windows());
            }
        };

        desktopType = {
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
                return (desktopType.Chrome() || desktopType.Webkit() || desktopType.Firefox() || desktopType.IE());
            }
        };

        return {
            zoomOut : function (instant) {
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
            },

            zoomIn : function (callbackFn) {
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
            },

            topMarginContainerClicked : function () {
                //Close info panel when "neutral" area is clicked around earth.
                if (earthAnimating) { return false; }

                if (zoomed) {
                    infoPanel.close(true);
                }

                if (contactVisible) {
                    contactForm.hide(true);
                }
            },

            resize : function () {
                infoPanel.close(true, true);

                currentInterest = '';
                earthAnimating = false;

                screenDims.update();
                page.renderGlow();
                page.updateZoomYPos();
                earth.renderShadow();
            },

            handleResize : function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(page.resize(), 15);
            },

            updateZoomYPos : function () {
                var combinedHeight;

                function fn() {
                    combinedHeight = planetEarthEl.offsetHeight + infoPanelEl.offsetHeight + 120;
                    zoomYPos = (combinedHeight / 2);

                    if (((screenDims.width <= 600) && (screenDims.width > 350)) ||
                            (screenDims.height <= 800)) {
                        zoomYPos = -Math.abs(planetEarthEl.offsetHeight / 2);
                    }

                    if (screenDims.width <= 350) {
                        zoomYPos = -Math.abs(planetEarthEl.offsetHeight);
                    }
                }

                return fn();
            },

            mouseCoords : function (ev) {
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
            },

            debug : function (inputString, clear) {
                //Input: (string)inputString, (bool)clear
                //Renders debug panel to DOM and adds inputStr to it
                var curDebugHtml, debugCol;

                debugCol = getEl("debugCol");

                //No debug col in DOM, so we'll add it.
                if ((debugCol === null) || (debugCol.value === '')) {
                    debugCol = doc.createElement("span", "debugCol");

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
            },

            mousemove : function (e) {
                //Input: (event)e
                //Handles mousemove events.
                var mousePos;

                if (!isMobile && !isIE) {
                    mousePos = page.mouseCoords(e);

                    stars.move(mousePos.x, mousePos.y);
                }
            },

            handleMousemove : function (e) {
                clearTimeout(mousemoveTimer);

                mousemoveTimer = setTimeout(function () { page.mousemove(e); }, 0.5);
            },

            initUADetection : function () {
                //Initializes User Agent Detection
                isMobile = mobileType.any();
                isAndroid = mobileType.Android();
                isIE = desktopType.IE();
                isChrome = desktopType.Chrome();
                isFirefox = desktopType.Firefox();
                isWebkit = desktopType.Webkit();
            },

            preventMobileScale : function () {
                if ((win.devicePixelRatio !== undefined) && (win.devicePixelRatio > 2)) {
                    var meta, metaValue;

                    meta = getEl("viewport");

                    if ((meta !== undefined) && (meta.value === '')) {
                        metaValue = 'width=device-width, initial-scale=' + (2 / win.devicePixelRatio) + ', user-scalable=no';
                        meta.setAttribute('content', metaValue);
                    }
                }
            },

            initFancybox : function () {
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
            },

            renderGlow : function () {
                var bgPos, minPos, rtn;

                function fn() {
                    bgPos = undefined;
                    minPos = undefined;

                    if ((screenDims.height <= 800) || (screenDims.width <= 350)) {
                        bgPos = screenDims.height - 350;
                        minPos = 50;
                    }

                    if (((screenDims.width > 350) && (screenDims.width <= 600)) ||
                            ((screenDims.height <= 800) && (screenDims.width > 600))) {
                        bgPos = screenDims.height - 625;
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
            },

            rotateObjects : function () {
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
            },

            animBrightness : function (showHide) {
                //Input: (string)showHide
                //Sets the brightness of the key props for showing contact form.
                var startFloat, endFloat, els, anim, i, lins, nature,
                    sheri, computers, games;

                nature = getEl("nature");
                sheri = getEl("sheri");
                computers = getEl("computers");
                games = getEl("games");

                function fn() {
                    //If the browser is IE we can't depend on CSS filters or SVG, so I just 
                    //swap the images with blacked-out versions once zoomed for a lo-fi 
                    //solution.
                    if (isIE) {
                        els = [planetEarthEl, ashEl, sheri, nature, computers, games, moon];

                        if (showHide === "show") {
                            els.addClass("dark");
                        } else {
                            els.removeClass("dark");
                        }

                        return;
                    }

                    //Set the start/end values for tweening.
                    if (showHide === "show") {
                        startFloat = parseFloat(1.0).toFixed(1);
                        endFloat = parseFloat(0.0).toFixed(1);
                    } else {
                        startFloat = parseFloat(0.0).toFixed(1);
                        endFloat = parseFloat(1.0).toFixed(1);
                    }

                    //Since the brightness filter isn't officially implemented,
                    //we have to animate the filter ourselves.
                    anim = setInterval(function () {
                        var next;

                        next = 0.0;

                        //Add or subtract 0.1 from our start value, depending on
                        //whether or not we're showing/hiding.
                        if (showHide === "show") {
                            //Subtract
                            next = mathHelpers.pFloat(startFloat) - mathHelpers.pFloat(0.1);
                        } else {
                            //Add
                            next = mathHelpers.pFloat(startFloat) + mathHelpers.pFloat(0.1);
                        }

                        startFloat = next.toFixed(1);

                        //If browser is Firefox, we have to animate the filter lin elements
                        //directly, since there is no brightness filter built-in.
                        if (isFirefox) {
                            lins = doc.getElementsByTagName("lin");
                            for (i = 0; i < lins.length; i += 1) {
                                lins[i].setAttribute("slope", startFloat);
                            }
                        }

                        //If browser is Chrome, we can use the built-in vendor specific prefix
                        //and brightness filter.
                        if (isChrome) {
                            els = [planetEarthEl, ashEl, lowEarthOrbit, moon];

                            TweenLite.to(els, 0, { css: { '-webkit-filter': 'brightness(' + startFloat + ')' } });
                        }

                        //Stop the interval if we've reached our target brightness.
                        if (startFloat === endFloat) { clearInterval(anim); }
                    }, 20);
                }

                return fn();
            },

            show : function () {
                //$("body").removeClass("hidden");
            },

            init : function () {
                theHeavens = getEl("theHeavens");
                moon = getEl("moon");
                lowEarthOrbit = getEl("lowEarthOrbit");
                topMarginContainer = getEl("topMarginContainer");

                page.initUADetection();
                page.preventMobileScale();
                page.handleResize();
                page.initFancybox();
                page.rotateObjects();

                $(topMarginContainer).on("click", function (e) { if (e.target === this) { page.topMarginContainerClicked(); } });
            }
        };
    }());

    content = (function () {
        return {
            getGalleryMarkup : function (interestName) {
                //Input: (string)interestName
                //Return: (string)
                //Returns HTML composing a UL and set of LIs for gallery images,
                //if the interest's gallery contains images
                var interestGallery, galleryCount, i, listItem, image, anchor, imgUrl, list;

                list = null;
                interestGallery = interestsArr[interestName].gallery;
                galleryCount = interestGallery.length;

                if (galleryCount > 0) {
                    list = doc.createElement("ul");

                    for (i = 0; i < galleryCount; i += 1) {
                        imgUrl = interestGallery[i].url;

                        image = doc.createElement("img");
                        image.src = imgUrl.replace(".", "_thumb.");

                        anchor = doc.createElement("a", null, "fancybox");
                        anchor.href = imgUrl;
                        anchor.setAttribute("title", interestGallery[i].description);
                        anchor.setAttribute("rel", interestName);
                        anchor.appendChild(image);

                        listItem = doc.createElement("li", null, "interestImage");
                        listItem.appendChild(anchor);

                        list.appendChild(listItem);
                    }
                }

                return list;
            },

            load : function (interestName) {
                //Input: (string)interestName
                //Retrieves interest content from object and loads content
                //into infoPanel template locations.
                var myInterest, galleryList, infoContent, infoHeader;

                infoContent = getEl("infoContent");
                infoHeader = getEl("infoHeader");

                function fn() {
                    myInterest = interestsArr[interestName];
                    galleryList = content.getGalleryMarkup(interestName);

                    infoContent.innerHTML = "";

                    if (galleryList) {
                        infoContent.appendChild(galleryList);
                    }

                    $(infoContent).removeClass();
                    $(infoContent).addClass(interestName);

                    infoContent.innerHTML += myInterest.content;
                    infoHeader.innerHTML = myInterest.header;
                }

                return fn();
            },

            init : function () {
                interestsArr.about.header = "About Me";
                interestsArr.about.content =
                    "<p>Hi, I'm Ash and I was born in 1983 and grew up in Savannah, GA.</p>" +
                    "<p>During work hours, I'm a web developer. I specialize in front-end work, but I've got a lot of " +
                    "experience in back-end languages. I've worked with PHP, ASP, C# and Ruby, but the majority of my skill is with ASP.NET Webforms & C#. " +
                    "<p>In my free time I enjoy hiking, video games, producing music and expanding my skillset toward " +
                    "developing games. You can learn more about my interests by clicking the various items on the globe.</p>";

                interestsArr.games.header = "Games";
                interestsArr.games.content =
                    "<p>I really enjoy playing video games and discussing game logic and design with like-minded " +
                    "people.<p>" +
                    "<p>I started playing games back on the family Atari 2600, and grew up with the NES, SNES and N64.</p>" +
                    "<p>These days I'm more of a PC Gamer (Battlefield, Half Life, Portal, Team Fortress, Command and Conquer,) " +
                    "but I also enjoy Fighters (Smash Bros, Street Fighter, Guilty Gear,) Platformers (Mario, Super " +
                    "Meat Boy,) and artistic milestones like Journey and Shadow of the Colossus. I'm also a big " +
                    "fan of Nintendo franchises and storytelling. I believe gameplay is the most important " +
                    "factor to building a good gaming experience, and I hope to get the opportunity to build " +
                    "games independently in the future.<p>";

                interestsArr.sheri.header = "Sheri";
                interestsArr.sheri.content =
                    "<p>My girlfriend Sheri and I met many years ago and we've been through thick and thin together.</p>" +
                    "<p>We and our cat Kuma recently moved to Seattle, WA and are really enjoying the Pacific Northwest!</p>" +
                    "<p>Sheri is a very talented illustrator and a skilled graphic designer, and she created the graphics for " +
                    "this site. I encourage you to see more of her work over at her site, " +
                    "<a href='http://sheribates.com/' target='_blank'>SheriBates.com</a>. <3</p>";

                interestsArr.computers.header = "Computers";
                interestsArr.computers.content =
                    "<p>I'm a front-end web developer who works in Javascript, LESS, ASP.NET Webforms and C#, primarily. I " +
                    "started building websites in 1996.</p>" +
                    "<p>My first exposure to programming was on a Commodore Model 4064, a hand-me-down from " +
                    "my uncle in the late 80's. My sister and I would sit and copy lines of code from books " +
                    "for hours, just to hear a little jingle from the internal speaker, or make a shape on the " +
                    "screen that would be gone when the computer was powered down.</p>" +
                    "<p>This site was built as a 'living resume' to showcase the range of my skillset. For more detail on my experience, " +
                    "please click the PDF or Word icons at the top of the page to download and view my Resume. I would love for you to have " +
                    "a look at some source files for this site: <a href='js/main.js' target='_blank'>Javascript</a> & " +
                    "<a href='less/site.less.txt' target='_blank'>LESS</a>.";

                interestsArr.nature.header = "Nature";
                interestsArr.nature.content =
                    "<p>I spend a lot time immersed in technology, so I really enjoy taking the opportunity to get " +
                    "out and hike in the Cascades. I also enjoy photography, and have placed some of my favorite " +
                    "PNW Hiking photos here in the gallery on the right. Have a look! :)</p>";
            }
        };
    }());

    infoPanel = (function () {
        var infoPanelOpen;

        return {
            open : function (interestName) {
                //Input: (string)interestName
                //Opens info panel and calls loadContent.
                var dur, infoPanelBottom;

                dur = 0.8;

                function fn() {
                    infoPanelBottom = ((screenDims.height / 2) - infoPanelEl.offsetHeight);
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
            },

            close : function (zOut, instant) {
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
            },

            init : function () {
                infoPanelOpen = false;

                $("#infoNext").on("click", function () { interests.jog(); });
                $("#infoPrev").on("click", function () { interests.jog("prev"); });
                $("#infoClose").on("click", function () { page.topMarginContainerClicked(); });
            }
        };
    }());

    earth = (function () {
        return {
            getTargetAngle : function (interestName) {
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
            },

            resume : function () {
                worldTurns = true;
                page.animBrightness("hide");
                sprites.update(ashEl, "walking");
            },

            rotateToAngle : function (targetAngle, interestName) {
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
            },

            rotateToInterest : function (interestName) {
                //Input: (int)interestName
                //Rotates earth to Interest. Calls earth.rotateToAngle.
                if (earthAnimating) { return false; }

                var targetAngle;

                function fn() {
                    currentInterest = '';
                    earthAnimating = true;
                    targetAngle = earth.getTargetAngle(interestName);

                    if ((contactFormEl.style.opacity > 0.1) || contactVisible) {
                        contactForm.hide();
                        page.animBrightness("hide");
                    }

                    if (curEarthAngle !== targetAngle) {
                        //We're not currently at this interest, so we need to 
                        //    go to a new interest.
                        infoPanel.close();
                        earth.rotateToAngle(targetAngle, interestName);
                    } else {
                        infoPanel.close(true);
                    }
                }

                return fn();
            },

            renderShadow : function () {
                //Creates shadow and sets its length based on some math that finds the 
                //distance to the corner.
                //Source: I don't recall where I got it, but this is borrowed code.
                var earthShadow;

                earthShadow = getEl("earthShadow");

                function fn() {
                    if ((screenDims.width <= 600) || (screenDims.height <= 800)) {
                        earthShadow.style.display = "none";
                    } else {
                        var centerY, centerX, length;

                        centerY = (screenDims.height / 2);
                        centerX = (screenDims.width / 2);
                        length = Math.floor(Math.sqrt(Math.pow(-Math.abs(centerX), 2) + Math.pow(screenDims.height - centerY, 2)));

                        earthShadow.style.width = length + "px";
                        earthShadow.style.display = "";
                    }
                }

                return fn();
            }
        };
    }());

    contactForm = (function () {
        var contactAnimating, thanksEl;

        return {
            successCallback : function () {
                $("#txtName").val("");
                $("#txtEmail").val("");
                $("#txtMsg").val("");

                contactForm.showThanks();
            },

            //For the time being, I'm assuming I won't see any errors.
            //errorCallback : function (result) {
            //    page.debug("error: " + result.statusText);
            //},

            submit : function () {
                var nameVal, emailVal, msgVal, options;

                nameVal = $("#txtName").val();
                emailVal = $("#txtEmail").val();
                msgVal = $("#txtMsg").val();

                options = {
                    type: "POST",
                    url: "Default.aspx/SendEmail",
                    data: '{ "name": "' + nameVal + '", "email": "' + emailVal + '", "msg": "' + msgVal + '"}',
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: contactForm.successCallback,
                    error: contactForm.errorCallback
                };

                $.ajax(options);
            },

            show : function () {
                if (contactVisible || contactAnimating) { return; }

                var contactTop, contactHeight, contactMarginLeft;

                function fn() {
                    if (zoomed) {
                        infoPanel.close(true);
                    }

                    worldTurns = false;

                    page.animBrightness("show");
                    sprites.update(ashEl, "standing");

                    contactTop = planetEarthEl.offsetTop + (planetEarthEl.offsetHeight * 0.15) + "px";
                    contactHeight = (planetEarthEl.offsetHeight * 0.7) + "px";
                    contactMarginLeft = -Math.abs((planetEarthEl.offsetHeight * 0.7) / 2) + "px";

                    contactFormEl.style.display = "inline-block";
                    contactFormEl.style.top = contactTop;
                    contactFormEl.style.height = contactHeight;
                    contactFormEl.style.width = contactHeight;
                    contactFormEl.style.marginLeft = contactMarginLeft;

                    contactAnimating = true;
                    TweenLite.to(contactFormEl, 0.5, {
                        opacity: 1,
                        onComplete: function () {
                            contactVisible = true;
                            contactAnimating = false;

                            $("#txtName").focus();
                        }
                    });
                }

                return fn();
            },

            hide : function (resume) {
                if ((contactFormEl.style.opacity < 0.1) || !contactVisible || contactAnimating) { return; }

                function fn() {
                    contactAnimating = true;

                    if (resume === true) {
                        earth.resume();
                    }

                    TweenLite.to(contactFormEl, 0.5, {
                        opacity: 0,
                        onComplete: function () {
                            contactVisible = false;
                            contactAnimating = false;
                            contactFormEl.style.display = "none";
                        }
                    });
                }

                return fn();
            },

            showThanks : function () {
                var thanksTop, thanksHeight, thanksMarginLeft;

                function fn() {
                    thanksTop = (screenDims.height * 0.5) - 13 + "px";
                    thanksHeight = (planetEarthEl.offsetHeight * 0.7) + "px";
                    thanksMarginLeft = -Math.abs((planetEarthEl.offsetHeight * 0.7) / 2) + "px";

                    thanksEl.style.display = "block";
                    thanksEl.style.top = thanksTop;
                    thanksEl.style.width = thanksHeight;
                    thanksEl.style.marginLeft = thanksMarginLeft;

                    contactForm.hide();

                    TweenLite.to(thanksEl, 0.5, {
                        opacity: 1,
                        onComplete: function () {
                            setTimeout(function () {
                                contactForm.hideThanks();
                            }, 1000);
                        }
                    });
                }

                return fn();
            },

            hideThanks : function () {
                function fn() {
                    TweenLite.to(thanksEl, 0.5, {
                        opacity: 0,
                        onComplete: function () {
                            earth.resume();
                        }
                    });
                }

                return fn();
            },

            init : function () {
                thanksEl = getEl("contactThanks");
                contactAnimating = false;

                $("#contactIcon").on("click", function () { contactForm.show(); });

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
                    happy: contactForm.submit
                });
            }
        };
    }());

    images = (function () {
        return {
            image : function (title, url, description, interestName) {
                //Image Object Constructor
                //Input: (string)title, (string)url, (string)description, (string)interestName
                this.title = title;
                this.url = url;
                this.description = description;

                //Push new image into the gallery for the interest we took as a param
                interestsArr[interestName].gallery.push(this);
            },

            init : function () {
                new images.image("Rainier", "files/photos/rainier_1.jpg", "Rainier with a forboding cloud formation", "nature");
                new images.image("Lake Margaret Trail", "files/photos/margaret_1.jpg", "Lake Margaret Trail", "nature");
                new images.image("Snow Lake Trail", "files/photos/snow_1.jpg", "Snow Lake Trail", "nature");
                new images.image("AutoLoop.us 2013", "files/portfolio/autoloop_1.jpg", "AutoLoop.us 2013. <a href='http://goo.gl/FNfBbY' target='_blank'>Wayback Archive</a>", "computers");
                new images.image("AutoLoop Web Application", "files/portfolio/autoloop_2.jpg", "AutoLoop Web Application", "computers");
                new images.image("AutoLoop Web Application", "files/portfolio/autoloop_3.jpg", "AutoLoop Web Application", "computers");
                new images.image("AutoLoop Web Application", "files/portfolio/autoloop_4.jpg", "AutoLoop Web Application", "computers");
                new images.image("AutoLoop Web Application", "files/portfolio/autoloop_5.jpg", "AutoLoop Web Application", "computers");
                new images.image("AutoLoop Web Application", "files/portfolio/autoloop_6.jpg", "AutoLoop Web Application", "computers");
                new images.image("AutoLoop Web Application", "files/portfolio/autoloop_7.jpg", "AutoLoop Web Application", "computers");
                new images.image("MandalaySolutions.com 2011", "files/portfolio/mandalay_solutions_1.jpg", "MandalaySolutions.com 2011. <a href='http://goo.gl/NQ3pzY' target='_blank'>Wayback Archive</a>", "computers");
                new images.image("MandalaySolutions.com Portfolio 2011", "files/portfolio/mandalay_solutions_2.jpg", "MandalaySolutions.com Portfolio 2011. <a href='http://goo.gl/PJcEz0' target='_blank'>Wayback Archive</a>", "computers");
                new images.image("FantasticSamsFlorida.com 2011", "files/portfolio/fantastic_sams.jpg", "FantasticSamsFlorida.com 2011. <a href='http://goo.gl/pIYJUv' target='_blank'>Wayback Archive</a>", "computers");
                new images.image("GlobalSyntheticIce.com 2011", "files/portfolio/global_synthetic_ice.jpg", "GlobalSyntheticIce.com 2011. <a href='http://goo.gl/128ll0' target='_blank'>Wayback Archive</a>", "computers");
            }
        };
    }());

    sprites = (function () {
        return {
            update : function (el, state, hflip) {
                //Input: (string)state, (bool)hflip
                //Takes a string which will be used for a CSS class, and a boolean to set a 
                //"flipped" class, which will then be applied to the actor as a CSS class.
                var flip, cssClass;

                function fn() {
                    flip = (hflip === undefined) ? "false" : hflip;
                    cssClass = state;

                    el.className = "";

                    if (flip === true) {
                        cssClass += " flipped";
                    }

                    el.className = cssClass;
                }

                return fn();
            },

            updateStatus : function (el, targetAngle) {
                //Input: (int)targetAngle
                //Sets sprites based on targetAngle and currentInterest
                var status;

                status = getEl("status");

                function fn() {
                    status.style.display = "none";

                    if (el === ashEl) {
                        if (targetAngle !== undefined) {
                            if (targetAngle < curEarthAngle) {
                                //Face our hero right if we're rotating counter-clockwise.
                                sprites.update(el, "walking");
                            } else {
                                //Face our hero left if we're rotating clockwise.
                                sprites.update(el, "walking", true);
                            }

                            if (curEarthAngle === targetAngle) {
                                //We're at our interest, so just stand still.
                                sprites.update(el, "standing");

                                //Change sprite if we're at an interest that requires it.
                                if (currentInterest === 'computers') {
                                    sprites.update(el, "standing-away");
                                }
                                if (currentInterest === 'nature') {
                                    sprites.update(el, "sitting-camp");
                                }
                                if (currentInterest === 'games') {
                                    sprites.update(el, "sitting-vidya");
                                }
                            }
                        } else {
                            sprites.update(el, "walking");
                        }

                        if (currentInterest === 'sheri') {
                            status.style.display = "inline-block";
                        } else {
                            status.style.display = "none";
                        }
                    }
                }

                return fn();
            }
        };
    }());

    define(requires, function ($) {
        //Set up some global variables.
        doc = document;
        win = window;
        planetEarthEl = getEl("planetEarth");
        infoPanelEl = getEl("infoPanel");
        contactFormEl = getEl("contactForm");
        ashEl = getEl("ash");
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
        $(doc).on("keydown", function (e) { keydown(e); });
        $(win).on("resize", function () { page.handleResize(); });
        $(win).on("touchmove", function (e) { e.preventDefault(); });

        page.show();
    });
}());