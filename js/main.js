/*jshint nonew: false */
/*jslint browser: true, indent: 4*/
/*global $, TweenLite, Power1, Sine, Linear, define */

(function () {
    "use strict";

    var doc, win, theStars, stars, theHeavens, planetEarth, ash, contactAnimating,
        moon, lowEarthOrbit, topMarginContainer, contactForm, infoPanel, isMobile,
        isAndroid, isIE, isChrome, isFirefox, isWebkit, interests, worldTurns, keydown,
        earthAnimating, zoomYPos, zoomAnimating, zoomed, infoPanelOpen, screenDims,
        infoPanelAnimating, curEarthAngle, currentInterest, contactVisible, requires;

    requires = ["jquery", "tweenmax", "fancybox", "fancybox_thumbs", "analytics"];

    function getEl(s) {
        return doc.getElementById(s);
    }

    //Override createElement to take ID and Class.
    document.createElement = (function (fn) {
        return function (type, id, className) {
            var elem;

            elem = fn.call(document, type);

            if (id) {
                elem.id = id;
            }

            if (className) {
                elem.className = className;
            }

            return elem;
        };
    }(document.createElement));

    //Interest Object Constructor
    //Input: (string)name, (int)locationAngle
    function Interest(name, locationAngle) {
        this.name = name;
        this.locationAngle = locationAngle;
        this.content = "";
        this.header = "";
        this.gallery = [];
    }

    //Image Object Constructor
    //Input: (string)title, (string)url, (string)description, (string)interestName
    function Image(title, url, description, interestName) {
        this.title = title;
        this.url = url;
        this.description = description;

        //Push new image into the gallery for the interest we took as a param
        interests[interestName].gallery.push(this);
    }

    //Input: (float)input
    //Return: (float) with a precision of two (x.xx)
    function pFloat(input) {
        var f;

        f = ((input * 10) / 10);

        return f;
    }

    //Input: (int)minValue, (int)maxValue
    //Return: (int) which is greater than minValue and less than maxValue.
    function rInt(minValue, maxValue) {
        var i;

        i = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;

        return i;
    }

    //Input: (float)minValue, (float)maxValue
    //Return: (float) which is greater than minValue and less than maxValue.
    function rFloat(minValue, maxValue) {
        var r;

        r = parseFloat(Math.min(minValue + (Math.random() * (maxValue - minValue)), maxValue));

        return pFloat(r);
    }

    //Return: (string)CSS property for a random RGB value.
    function rRGB() {
        var r, g, b, rgb;

        r = rInt(0, 255);
        g = rInt(0, 255);
        b = rInt(0, 255);
        rgb = "rgb(" + r + "," + g + "," + b + ")";

        return rgb;
    }

    //Input: (int)num1, (int)num2
    //Return: (int)Value of the difference of num1 and num2
    function diff(num1, num2) {
        var difference;

        if (num1 > num2) {
            difference = (num1 - num2);
        } else {
            difference = (num2 - num1);
        }

        return difference;
    }

    //Input: Mouse event
    //Return: Object with .y and .x properties containing mouse event position
    function mouseCoords(ev) {
        var xy;

        if (ev.pageX || ev.pageY) {
            xy = { x: ev.pageX, y: ev.pageY };
        }

        xy = {
            x: ev.clientX + doc.body.scrollLeft - doc.body.clientLeft,
            y: ev.clientY + doc.body.scrollTop - doc.body.clientTop
        };

        return xy;
    }

    //Input: (string)inputString, (bool)clear
    //Renders debug panel to DOM and adds inputStr to the debug panel
    function debug(inputString, clear) {
        var curDebugHtml, debugCol;

        debugCol = document.getElementById("debugCol");

        //No debug col in DOM, so we'll add it.
        if (debugCol === null || debugCol.value === '') {
            debugCol = document.createElement("span", "debugCol");

            document.body.appendChild(debugCol);
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
    }

    //Input: (HTMLElement)el
    //Return: (float)scale - scale of element
    //Source: http://css-tricks.com/get-value-of-css-rotation-through-javascript/
    function getScale(el) {
        var style, transform, values, scaleX;

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

        function fn() {
            return scaleX;
        }

        return fn();
    }

    screenDims = (function () {
        if (window.innerWidth === undefined) { return false; }

        var screenHeight, screenWidth;

        return {
            getHeight : function () {
                return screenHeight;
            },
            getWidth : function () {
                return screenWidth;
            },
            setHeight : function (height) {
                screenHeight = height;
            },
            setWidth : function (width) {
                screenWidth = width;
            },
            update : function () {
                screenDims.setWidth(window.innerWidth);
                screenDims.setHeight(window.innerHeight);
            }
        };
    }());

    //Input: (event)e
    //Handles key presses to trigger effects for some future functionality.
    keydown = (function () {
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

    //Input: (int)x, (int)y
    //Repositions members of stars on the screen based on 
    //a range of 1 - 50 mapped to screen dimensions.
    function moveStars(x, y) {
        //IE doesn't perform well enough for this.
        if (isIE) { return false; }

        var bgPosX, bgPosY, i, star, scale, starY, starX,
            width, height, rangeWidth, rangeHeight, range;

        range = 50;
        width = screenDims.getWidth();
        height = screenDims.getHeight();
        rangeWidth = (width / range);
        rangeHeight = (height / range);

        function fn() {
            bgPosX = (rangeWidth * (x / width));
            bgPosY = (rangeHeight * (y / height));

            for (i = 0; i < stars.length; i += 1) {
                star = stars[i];
                scale = getScale(star);
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
    }

    //Input: (string)state, (bool)hflip
    //Takes a string which will be used for a CSS class, and a boolean to set a 
    //"flipped" class, which will then be applied to the actor as a CSS class.
    function actorAnimate(el, state, hflip) {
        var flip, cssClass;

        flip = (hflip === undefined) ? "false" : hflip;
        cssClass = state;

        function fn() {
            el.className = "";

            if (flip === true) {
                cssClass += " flipped";
            }

            el.className = cssClass;
        }

        return fn();
    }

    //Input: (int)targetAngle
    //Sets sprites based on targetAngle and currentInterest
    function updateAshStatus(targetAngle) {
        var ashStatus;

        ashStatus = getEl("status");
        ashStatus.style.display = "none";

        function fn() {
            if (targetAngle !== undefined) {
                if (targetAngle < curEarthAngle) {
                    //Face our hero right if we're rotating counter-clockwise.
                    actorAnimate(ash, "walking");
                } else {
                    //Face our hero left if we're rotating clockwise.
                    actorAnimate(ash, "walking", true);
                }

                if (curEarthAngle === targetAngle) {
                    //We're at our interest, so just stand still.
                    actorAnimate(ash, "standing");

                    //Change sprite if we're at an interest that requires it.
                    if (currentInterest === 'computers') {
                        actorAnimate(ash, "standing-away");
                    }
                    if (currentInterest === 'nature') {
                        actorAnimate(ash, "sitting-camp");
                    }
                    if (currentInterest === 'games') {
                        actorAnimate(ash, "sitting-vidya");
                    }
                }
            } else {
                actorAnimate(ash, "walking");
            }

            if (currentInterest === 'sheri') {
                ashStatus.style.display = "inline-block";
            } else {
                ashStatus.style.display = "none";
            }
        }

        return fn();
    }

    //Input: (string)showHide
    //Sets the brightness of the key props for showing contact form.
    function animBrightness(showHide) {
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
                els = $("")
                        .add(planetEarth)
                        .add(ash)
                        .add(sheri)
                        .add(nature)
                        .add(computers)
                        .add(games)
                        .add(moon);

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
                    next = pFloat(startFloat) - pFloat(0.1);
                } else {
                    //Add
                    next = pFloat(startFloat) + pFloat(0.1);
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
                    els = [planetEarth, ash, lowEarthOrbit, moon];

                    TweenLite.to(els, 0, { css: { '-webkit-filter': 'brightness(' + startFloat + ')' } });
                }

                //Stop the interval if we've reached our target brightness.
                if (startFloat === endFloat) { clearInterval(anim); }
            }, 20);
        }

        return fn();
    }

    function showContactForm() {
        if (contactVisible || contactAnimating) { return; }

        var contactTop, contactHeight, contactMarginLeft;

        function fn() {
            animBrightness("show");
            worldTurns = false;
            actorAnimate(ash, "standing");

            contactTop = planetEarth.offsetTop + (planetEarth.offsetHeight * 0.15) + "px";
            contactHeight = (planetEarth.offsetHeight * 0.7) + "px";
            contactMarginLeft = -Math.abs((planetEarth.offsetHeight * 0.7) / 2) + "px";

            contactForm.style.display = "inline-block";
            contactForm.style.top = contactTop;
            contactForm.style.height = contactHeight;
            contactForm.style.width = contactHeight;
            contactForm.style.marginLeft = contactMarginLeft;

            contactAnimating = true;
            TweenLite.to(contactForm, 0.5, {
                opacity: 1,
                onComplete: function () {
                    contactVisible = true;
                    contactAnimating = false;
                }
            });
        }

        return fn();
    }

    function hideContactForm() {
        if ((contactForm.style.opacity < 0.1) || !contactVisible || contactAnimating) { return; }

        worldTurns = true;

        animBrightness("hide");

        actorAnimate(ash, "walking");

        contactAnimating = true;
        TweenLite.to(contactForm, 0.5, {
            opacity: 0,
            onComplete: function () {
                contactVisible = false;
                contactAnimating = false;
                contactForm.style.display = "none";
            }
        });
    }

    function zoomIn(callbackFn) {
        var zScale;

        zScale = 1;

        zoomAnimating = true;

        //Don't adjust top margin if user is using a mobile device or if interest 
        //is contact.

        if (!isMobile || (currentInterest === "contact")) {
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
    }

    function zoomOut(instant) {
        if (zoomAnimating) { return false; }

        var dur;

        dur = 2;
        currentInterest = '';
        worldTurns = true;
        zoomAnimating = true;
        updateAshStatus();

        if (instant === true) {
            dur = 0;
        }

        //Don't adjust top margin if user is using a mobile device or 
        //currentInterest is "contact".
        if (!isMobile || currentInterest === "contact") {
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
    }

    //Input: (string)interestName
    //Return: (int)
    //Returns a target angle based on the total number of 
    //rotations and the curEarthAngle so we get the shortest 
    //possible rotation regardless of the current angle
    function getTargetAngle(interestName) {
        var targetAngle, remainder, completedRotations, shortestAngle,
            fullRotations, adjustedTargetAngle;

        targetAngle = interests[interestName].locationAngle;
        remainder = (curEarthAngle % 360);
        completedRotations = ((curEarthAngle - remainder) / 360);
        shortestAngle = (targetAngle - remainder);
        fullRotations = (360 * completedRotations);

        function fn() {
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
    }

    //Input: (string)interestName
    //Return: (string)
    //Returns HTML composing a UL and set of LIs for gallery images,
    //if the interest's gallery contains images
    function galleryMarkup(interestName) {
        var interestGallery, galleryCount, i, listItem, image, anchor, imgUrl, list;

        list = null;
        interestGallery = interests[interestName].gallery;
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
    }

    //Input: (string)interestName
    //Retrieves interest content from object and loads content
    //into infoPanel template locations.
    function loadContent(interestName) {
        var myInterest, galleryList, infoContent, infoHeader;

        myInterest = interests[interestName];
        galleryList = galleryMarkup(interestName);
        infoContent = getEl("infoContent");
        infoHeader = getEl("infoHeader");

        function fn() {
            infoContent.innerHTML = "";

            if (galleryList) {
                infoContent.appendChild(galleryList);
            }

            infoContent.innerHTML += myInterest.content;
            infoHeader.innerHTML = myInterest.header;
        }

        return fn();
    }

    //Input: (bool)zOut
    //Closes infoPanel and triggers zoomout if zOut is true.
    function closeInfoPanel(zOut, instant) {
        var doZoomOut, dur;

        doZoomOut = (zOut === undefined) ? "false" : zOut;
        dur = 0.5;

        function fn() {
            if (instant === true) {
                dur = 0;
            }

            if (doZoomOut === true) {
                if (instant === true) {
                    zoomOut(true);
                } else {
                    zoomOut();
                }
            }

            infoPanelAnimating = true;
            infoPanelOpen = false;

            TweenLite.to(infoPanel, dur, {
                css: {
                    opacity: 0
                },
                onComplete: function () {
                    infoPanel.removeAttribute("style");
                    infoPanelAnimating = false;
                    infoPanel.style.display = "none";
                }
            });
        }

        return fn();
    }

    //Input: (string)interestName
    //Opens info panel and calls loadContent.
    function openInfoPanel(interestName) {
        var dur, infoPanelBottom;

        dur = 0.8;
        infoPanelBottom = ((screenDims.getHeight() / 2) - infoPanel.offsetHeight);
        infoPanelAnimating = true;
        worldTurns = false;

        function fn() {
            if (infoPanelOpen) {
                dur = 0.8;
            }

            if (interestName !== "contact") {
                loadContent(interestName);
            }

            infoPanel.style.bottom = infoPanelBottom + "px";
            infoPanel.style.display = "inline-block";

            TweenLite.to(infoPanel, dur, {
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
    }

    //Input: (int)targetAngle, (string)interestName
    //Rotates earth to targetAngle, zooms, shows infoPanel and contact form.
    function rotateEarthToAngle(targetAngle, interestName) {
        var angleDifference, dur, easing;

        angleDifference = diff(curEarthAngle, targetAngle);
        dur = (angleDifference / 30);
        easing = Sine.easeOut;

        function fn() {
            //If the current interest is "about", we stop spinning immediately and
            //display the infoPanel
            if (interestName === "about") {
                targetAngle = curEarthAngle;
                easing = Linear.easeNone;
                dur = 0;
            }

            worldTurns = false;
            earthAnimating = true;
            currentInterest = '';

            hideContactForm();

            updateAshStatus(targetAngle);

            TweenLite.to(planetEarth, dur, {
                css: {
                    rotationZ: targetAngle + "deg"
                },
                ease: easing,
                onComplete: function () {
                    currentInterest = interests[interestName].name;
                    curEarthAngle = targetAngle;
                    updateAshStatus(targetAngle);

                    if (!zoomed) {
                        zoomIn(function () {
                            openInfoPanel(interestName);
                        });
                    } else {
                        openInfoPanel(interestName);
                    }

                    earthAnimating = false;
                }
            });
        }

        return fn();
    }

    //Input: (int)interestName
    //Rotates earth to Interest. Calls rotateEarthToAngle.
    function rotateEarthToInterest(interestName) {
        if (earthAnimating) { return false; }

        var targetAngle;

        targetAngle = getTargetAngle(interestName);
        currentInterest = '';
        earthAnimating = true;

        function fn() {
            if (curEarthAngle !== targetAngle) {
                //We're not currently at this interest, so we need to 
                //    go to a new interest.
                closeInfoPanel();
                rotateEarthToAngle(targetAngle, interestName);
            } else {
                closeInfoPanel(true);
            }
        }

        return fn();
    }

    //Rotates earth, moon and lowEarthOrbit layers at an increment.
    function rotateObjects() {
        var curLEOAngle, curMoonAngle;

        curLEOAngle = 0;
        curMoonAngle = 0;

        function fn() {
            setInterval(function () {
                if (worldTurns) {
                    curEarthAngle -= 0.50;

                    TweenLite.to(planetEarth, 0, {
                        css: {
                            rotationZ: curEarthAngle
                        }
                    });
                }

                curMoonAngle += 0.125;
                TweenLite.to(moon, 0, {
                    css: {
                        rotationZ: curMoonAngle
                    }
                });

                curLEOAngle += 0.25;
                TweenLite.to(lowEarthOrbit, 0, {
                    css: {
                        rotationZ: curLEOAngle
                    }
                });
            }, 60);
        }

        return fn();
    }

    //Input: (HTMLElement)el
    //Picks a set of randomized values to tween the star to for a twinkle effect.
    function twinkle(el) {
        var dur, colorLottery, opa, rgb, bs;

        dur = rFloat(0.2, 2.0);
        colorLottery = rInt(1, 10);
        opa = rFloat(0.0, 1.0);
        rgb = "rgb(255,255,255)";
        bs = "null";

        function fn() {
            //1 in 10 odds of getting a color star.
            if (colorLottery === 10) {
                rgb = rRGB();
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
                    twinkle(el);
                }
            });
        }

        return fn();
    }

    //Iterates over stars and sets star attributes to random start values.
    function randomizeStarAttributes() {
        var i, el, left, top, sca, colorLottery, opa, rgb, bs;

        function fn() {
            for (i = 0; i < stars.length;  i += 1) {
                el = stars[i];
                left = rFloat(-1, 101);
                top = rFloat(-1, 101);
                sca = rFloat(0.1, 1.2);
                colorLottery = rInt(1, 10);
                opa = rFloat(0.0, 1.0);
                rgb = "rgb(255,255,255)";
                bs = "null";

                //1 in 10 odds of getting a color star.
                if (colorLottery === 10) {
                    rgb = rRGB();
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
    }

    //Either close the info panel or rotate to a new interest.
    function interestClicked(interestName) {
        if (earthAnimating || infoPanelAnimating || zoomAnimating) { return false; }

        if (interestName === currentInterest) {
            closeInfoPanel(true);
        } else {
            rotateEarthToInterest(interestName);
        }
    }

    //Rotate to the next or previous interest.
    function jogInterests(dir) {
        var keysArray, interestCount, curIndex, nextIndex, nextinterestName,
            valuesArray;

        keysArray = Object.keys(interests);
        interestCount = Object.keys(interests).length;

        valuesArray = Object.keys(interests).map(function (i) {
            return String(interests[i].name);
        });

        function fn() {
            curIndex = keysArray.indexOf(currentInterest);

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

            nextinterestName = valuesArray[nextIndex];

            rotateEarthToInterest(nextinterestName);
        }

        return fn();
    }

    //Close info panel when "neutral" area is clicked around earth.
    function topMarginContainerClicked() {
        if (earthAnimating) { return false; }

        if (zoomed) {
            closeInfoPanel(true);
        }

        if (contactVisible) {
            hideContactForm();
        }
    }

    //Kicks off a meteor, then loops at a random interval.
    function meteorShower() {
        var rTimeout, startX, startY, mymeteor;

        rTimeout = Math.round((Math.random() * (3000 - 500)) + 100);
        startX = rInt(0, screenDims.getWidth());
        startY = rInt(0, screenDims.getHeight());
        mymeteor = doc.getElementById("meteor");

        //Input: (int)startX, (int)startY
        //Create and animate a meteor from position startX, startY
        function meteor(startX, startY) {
            //No meteor in DOM, so we'll add it.
            if (mymeteor === null || mymeteor.value === '') {
                mymeteor = doc.createElement("span", "meteor");

                theStars.appendChild(mymeteor);
            }

            mymeteor.style.display = "block";
            mymeteor.style.top = startY + "px";
            mymeteor.style.left = startX + "px";

            theStars.appendChild(mymeteor);

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
                    meteorShower();
                }
            });
        }

        function fn() {
            setTimeout(function () {
                meteor(startX, startY);
            }, rTimeout);
        }

        return fn();
    }

    //Input: (event)e
    //Handles mousemove events.
    function mousemove(e) {
        var mousePos;

        if (!isMobile && !isIE) {
            mousePos = mouseCoords(e);

            moveStars(mousePos.x, mousePos.y);
        }
    }

    function handleMousemove(e) {
        var mousemoveTimer;

        function fn() {
            clearTimeout(mousemoveTimer);
            mousemoveTimer = setTimeout(function () { mousemove(e); }, 5);
        }

        return fn();
    }

    //Initializes interest values.
    function initInterests() {
        interests = {
            about: new Interest("about", 0),
            contact: new Interest("contact", 1),
            games: new Interest("games", -30),
            sheri: new Interest("sheri", -82),
            computers: new Interest("computers", 174),
            nature: new Interest("nature", 35)
        };
    }

    //Initializes image values.
    function initImages() {
        new Image("Rainier", "photo/rainier_1.jpg", "Rainier with a forboding cloud formation.", "nature");
        new Image("Lake Margaret Trail", "photo/margaret_1.jpg", "Lake Margaret Trail.", "nature");
        new Image("Snow Lake Trail", "photo/snow_1.jpg", "Snow Lake Trail.", "nature");
    }

    //Initializes content values.
    function initContent() {
        interests.about.header = "About Me";
        interests.about.content = 
            "<p>Hi, I'm Ash and I was born in 1983 and grew up in Savannah, GA.</p>" +
            "<p>During work hours, I'm a web developer. I specialize in front-end work, but I've got a lot of " +
            "experience in back-end languages and work there often. I've worked with PHP, ASP, C# and Ruby, but " +
            "of those, I'm most knowledgeable about C# and I use it daily.</p>" +
            "<p>I built this site as a sort of 'living resume'. A place where people can review my code and commitment to quality " +
            "just by using the site and looking at its code. I strived to write clean, semantic, standard code that is, in " +
            "my opinion, as close to perfect as possible. Sloppy, hackish code makes my skin crawl. The code still isn't quite ideal.</p>" +
            "<p>In my free time I enjoy hiking, video games, producing music and expanding my skillset toward " +
            "developing games. You can learn more about my interests by clicking the various items on the globe.</p>";

        interests.games.header = "Games";
        interests.games.content = 
            "<p>I really enjoy playing video games and discussing game logic and design with like-minded " +
            "people.<p>" +
            "<p>I started playing games back on the family Atari 2600, and grew up with the NES, SNES and N64.</p>" +
            "<p>These days I'm more of a PC Gamer (Battlefield, Half Life, Portal, Team Fortress, Command and Conquer,) " +
            "but I also enjoy Fighters (Smash Bros, Street Fighter, Guilty Gear,) Platformers (Mario, Super " +
            "Meat Boy,) and artistic milestones like Journey and Shadow of the Colossus. I'm also a big " +
            "fan of Nintendo franchises and storytelling. I believe gameplay is the most important " +
            "factor to building a good gaming experience, and I hope to get the opportunity to build " +
            "games independently in the future.<p>";

        interests.sheri.header = "Sheri";
        interests.sheri.content = 
            "<p>My girlfriend Sheri and I met many years ago and we've been through thick and thin together.</p>" +
            "<p>We and our cat Kuma recently moved to Seattle, WA and are really enjoying the Pacific Northwest!</p>" +
            "<p>Sheri is a very talented illustrator and a skilled graphic designer, and she created the graphics for " +
            "this site. I encourage you to see more of her work over at her site, " +
            "<a href='http://sheribates.com/' target='_blank'>SheriBates.com</a>. <3</p>";

        interests.computers.header = "Computers";
        interests.computers.content = 
            "<p>I'm a front-end web developer who works in Javascript, LESS, ASP.NET Webforms and C#, primarily. I " +
            "started building websites in 1996.</p>" +
            "<p>My first exposure to programming was on a Commodore Model 4064, a hand-me-down from " +
            "my uncle in the late 80's. My sister and I would sit and copy lines of code from books " +
            "for hours, just to hear a little jingle from the internal speaker, or make a shape on the " +
            "screen that would be gone when the computer was powered down.</p>" +
            "<p>My family got online sometime in 1995 and I knew I had to try my hand at building websites. " +
            "I built my first site in 1996, and continued to learn as CSS and Javascript were introduced. " +
            "I briefly worked with PHP, then ASP over the early 00's. Now I work primarily in HTML, " +
            "LESS, Javascript, ASP.NET Webforms and C#, and I'm expanding to ASP.NET MVC and Web API.</p>" +
            "<p>For more detail on my experience, please click the PDF or Word icons at the top of the page " +
            "to download and view my Resume.";

        interests.nature.header = "Nature";
        interests.nature.content = 
            "<p>I spend a lot time immersed in technology, so I really enjoy taking the opportunity to get " +
            "out and hike in the Cascades. I also enjoy photography, and have placed some of my favorite " +
            "PNW Hiking photos here in the gallery on the right. Have a look! :)</p>";
    }

    //Creates stars then randomizes their attributes.
    function initStars() {
        stars = theStars.getElementsByTagName("i");

        if (stars.length === 0) {
            var starsCount, i, star;

            starsCount = isMobile ? (isAndroid ? 30 : 10) : (isChrome ? 60 : 40);

            for (i = 0; i < starsCount;  i += 1) {
                star = doc.createElement("i");

                theStars.appendChild(star);
                twinkle(star);
            }

            stars = theStars.getElementsByTagName("i");
        }

        randomizeStarAttributes();
    }

    //Initializes User Agent Detection
    function initUADetection() {
        var mobileType, desktopType;

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

        function fn() {
            isMobile = mobileType.any();
            isAndroid = mobileType.Android();
            isIE = desktopType.IE();
            isChrome = desktopType.Chrome();
            isFirefox = desktopType.Firefox();
            isWebkit = desktopType.Webkit();
        }

        return fn();
    }

    function preventMobileScale() {
        if ((win.devicePixelRatio !== undefined) && (win.devicePixelRatio > 2)) {
            var meta, metaValue;

            meta = doc.getElementById("viewport");

            if ((meta !== undefined) && (meta !== null)) {
                metaValue = 'width=device-width, initial-scale=' + (2 / win.devicePixelRatio) + ', user-scalable=no';
                meta.setAttribute('content', metaValue);
            }
        }
    }

    function initFancybox() {
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
    }

    //Creates shadow and sets its length based on some math that finds the 
    //distance to the corner.
    //Source: I don't recall where I got it, but this is borrowed code.
    function renderShadow() {
        var earthShadow;

        earthShadow = getEl("earthShadow");

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
    }

    function renderGlow() {
        var bgPos, minPos;

        bgPos = null;
        minPos = null;

        function fn() {
            if ((screenDims.getHeight() <= 800) || (screenDims.getWidth() <= 350)) {
                bgPos = screenDims.getHeight() - 350;
                minPos = 50;
            }

            if (((screenDims.getWidth() > 350) && (screenDims.getWidth() <= 600)) ||
                    ((screenDims.getHeight() <= 800) && (screenDims.getWidth() > 600))) {
                bgPos = screenDims.getHeight() - 625;
                minPos = -225;
            }

            if (bgPos !== null) {
                if (bgPos <= minPos) {
                    bgPos = minPos;
                }

                bgPos = "center " + bgPos + "px";
            }

            doc.body.style.backgroundPosition = bgPos;
        }

        return fn();
    }

    function updateZoomYPos() {
        var combinedHeight;

        combinedHeight = planetEarth.offsetHeight + infoPanel.offsetHeight + 120;

        function fn() {
            zoomYPos = (combinedHeight / 2);

            if (((screenDims.getWidth() <= 600) && (screenDims.getWidth() > 350)) ||
                    (screenDims.getHeight() <= 800)) {
                zoomYPos = -Math.abs(planetEarth.offsetHeight / 2);
            }

            if (screenDims.getWidth() <= 350) {
                zoomYPos = -Math.abs(planetEarth.offsetHeight);
            }
        }

        return fn();
    }

    function resize() {
        if (zoomed) {
            closeInfoPanel(true, true);
        }

        screenDims.update();
        updateZoomYPos();
        renderShadow();
        renderGlow();
    }

    function handleResize() {
        var resizeTimer;

        function fn() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize(), 15);
        }

        return fn();
    }

    define(requires, function ($) {
        //Set up some global variables.
        doc = document;
        win = window;
        theStars = getEl("theStars");
        theHeavens = getEl("theHeavens");
        planetEarth = getEl("planetEarth");
        ash = getEl("ash");
        moon = getEl("moon");
        lowEarthOrbit = getEl("lowEarthOrbit");
        topMarginContainer = getEl("topMarginContainer");
        contactForm = getEl("contactForm");
        infoPanel = getEl("infoPanel");
        interests = {};
        worldTurns = true;
        earthAnimating = false;
        zoomAnimating = false;
        zoomed = false;
        infoPanelOpen = false;
        infoPanelAnimating = false;
        contactVisible = false;
        contactAnimating = false;
        curEarthAngle = 0;

        //Call startup functions and kick off any loops.
        initUADetection();
        preventMobileScale();
        handleResize();

        initStars();
        initInterests();
        initImages();
        initContent();
        initFancybox();

        meteorShower();
        rotateObjects();

        //Set up event handlers.
        $("#contactIcon").on("click", function () { showContactForm(); });
        $("#infoNext").on("click", function () { jogInterests(); });
        $("#infoPrev").on("click", function () { jogInterests("prev"); });
        $("#infoClose").on("click", function (e) { topMarginContainerClicked(e); });
        $(ash).on("click", function () { interestClicked("about"); });
        $(topMarginContainer).on("click", function (e) { if (e.target === this) { topMarginContainerClicked(e); } });
        $(doc).on("click", "#planetEarth>a", function () { interestClicked($(this).attr("id")); });
        $(doc).on("mousemove", theStars, function (e) { handleMousemove(e); });
        $(doc).on("keydown", function (e) { keydown(e); });
        $(win).on("resize", function () { handleResize(); });
        $(win).on("touchmove", function (e) { e.preventDefault(); });
    });
}());