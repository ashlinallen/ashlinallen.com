/*jshint nonew: false */
/*jslint browser: true, indent: 4*/
/*global $, jQuery, TweenLite, Power1, Sine, Linear */

(function () {
    "use strict";

    var doc, win, theStars, stars, theHeavens, planetEarth, earthShadow, ash,
        nature, sheri, computers, games, moon, lowEarthOrbit, ashStatus, lins,
        topMarginContainer, contactForm, contactIcon, infoPanel, infoPrev,
        infoNext, infoHeader, infoClose, infoContent, isMobile, isIE, isChrome,
        isFirefox, isWebkit, keys, interests, worldTurns, earthAnimating,
        zoomAnimating, zoomed, infoPanelOpen, infoPanelAnimating, infoPanelTop,
        curEarthAngle, curMoonAngle, curLEOAngle, konami, currentInterest,
        screenWidth, screenHeight, codelength, mobileType, desktopType;

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
        return ((input * 10) / 10);
    }

    //Input: (int)minValue, (int)maxValue
    //Return: (int) which is greater than minValue and less than maxValue.
    function rInt(minValue, maxValue) {
        return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    }

    //Input: (float)minValue, (float)maxValue
    //Return: (float) which is greater than minValue and less than maxValue.
    function rFloat(minValue, maxValue) {
        var r = parseFloat(Math.min(minValue + (Math.random() * (maxValue - minValue)), maxValue));
        
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
        if (ev.pageX || ev.pageY) {
            return { x: ev.pageX, y: ev.pageY };
        }

        return {
            x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
            y: ev.clientY + document.body.scrollTop - document.body.clientTop
        };
    }

    //Input: (string)inputString, (bool)clear
    //Renders debug panel to DOM and adds inputStr to the debug panel
    function debug(inputString, clear) {
        var curDebugHtml, debugCol;

        debugCol = document.getElementById("debugCol");

        //No debug col in DOM, so we'll add it.
        if (debugCol === null || debugCol.value === '') {
            debugCol = document.createElement("span");
            debugCol.setAttribute("id", "debugCol");

            document.body.appendChild(debugCol);
        }

        //Store current debug col HTML
        curDebugHtml = debugCol.innerHTML;

        //If clearing the current HTML, do that now.
        if (clear) {
            curDebugHtml = "";
        }

        //Add our new string to the top of current debug HTML and populate debug col with it.
        debugCol.innerHTML = "\n" + inputString + "\n<br>\n" + curDebugHtml;
    }

    //Input: (HTMLElement)el
    //Return: (float)scale - scale of element
    //Source: http://css-tricks.com/get-value-of-css-rotation-through-javascript/
    function getScale(el) {
        var style, transform, values, scaleX;

        style = window.getComputedStyle(el, null);
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

    //Function to update screenHeight and screenWidth vars when necessary.
    function updateScreenDims() {
        screenWidth = window.innerWidth;
        screenHeight = window.innerHeight;
    }

    //Input: (event)e
    //Handles key presses to trigger effects for some future functionality.
    function keydown(e) {
        keys.push(e.keyCode);

        if (keys.toString().indexOf(konami) >= 0) {
            debug("Fun stuff coming soon!");

            keys = [];
        }

        if (keys.length > codelength) {
            keys.shift();
        }
    }

    //Input: (int)x, (int)y
    //Repositions members of stars on the screen based on 
    //a range of 1 - 50 mapped to screen dimensions.
    function moveStars(x, y) {
        //IE doesn't perform well enough for this.
        if (isIE) { return false; }

        var bgPosX, bgPosY, i, star, scale, starY, starX;

        bgPosX = (50 * (x / screenWidth));
        bgPosY = (50 * (y / screenHeight));

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

    //Input: (string)state, (bool)hflip
    //Takes a string which will be used for a CSS class, and a boolean to set a 
    //"flipped" class, which will then be applied to the actor as a CSS class.
    function actorAnimate(el, state, hflip) {
        var flip = (hflip === undefined) ? "false" : hflip,
            cssClass = state;

        el.className = "";

        if (flip === true) {
            cssClass += " flipped";
        }

        el.className = cssClass;
    }

    //Input: (int)targetAngle
    //Sets sprites based on targetAngle and currentInterest
    function updateAshStatus(targetAngle) {
        ashStatus.style.display = "none";

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

    //Input: (string)showHide
    //Sets the brightness of the key props for showing contact form.
    function animBrightness(showHide) {
        var startFloat, endFloat, els, anim, i;

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
            var next = 0.0;

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
                lins = document.getElementsByTagName("lin");
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

    function showContactForm() {
        animBrightness("show");

        TweenLite.to(contactForm, 2, {
            opacity: 1
        });
    }

    function hideContactForm() {
        if (contactForm.style.opacity < 0.1) { return; }

        animBrightness("hide");

        TweenLite.to(contactForm, 0.5, {
            opacity: 0,
            onComplete: function () {
                contactForm.style.display = "none";
            }
        });
    }

    function zoomIn(callbackFn) {
        zoomAnimating = true;

        //Don't adjust top margin if user is using a mobile device.
        if (!isMobile) {
            TweenLite.to(topMarginContainer, 2, {
                css: {
                    //todo:set height to screenheight - 50% of planetearth's height. 
                    //then maybe infopanel can be set to 50% height too? something like that.
                    y: 250
                },
                ease: Power1.easeInOut
            });
        }

        TweenLite.to(theHeavens, 2, {
            css: {
                scale: 2
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

    function zoomOut() {
        if (zoomAnimating) { return false; }

        if (currentInterest === "about") {
            hideContactForm();
        }

        currentInterest = '';
        worldTurns = true;
        zoomAnimating = true;
        updateAshStatus();

        //Don't adjust top margin if user is using a mobile device.
        if (!isMobile) {
            TweenLite.to(topMarginContainer, 2, {
                css: {
                    y: 0
                },
                ease: Power1.easeInOut
            });
        }

        TweenLite.to(theHeavens, 2, {
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
        var targetAngle = interests[interestName].locationAngle,
            remainder = curEarthAngle % 360,
            completedRotations = ((curEarthAngle - remainder) / 360),
            shortestAngle = targetAngle - remainder,
            fullRotations = (360 * completedRotations),
            adjustedTargetAngle;

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

    //Input: (string)interestName
    //Return: (string)
    //Returns HTML composing a UL and set of LIs for gallery images,
    //if the interest's gallery contains images
    function galleryMarkup(interestName) {
        var interestGallery, galleryCount, i, listItem, image, anchor, imgUrl,
            list = null;

        interestGallery = interests[interestName].gallery;
        galleryCount = interestGallery.length;

        if (galleryCount > 0) {
            list = document.createElement("ul");

            for (i = 0; i < galleryCount; i += 1) {
                imgUrl = interestGallery[i].url;

                image = document.createElement("img");
                image.src = imgUrl.replace(".", "_thumb.");

                anchor = document.createElement("a");
                anchor.className = "fancybox";
                anchor.href = imgUrl;
                anchor.setAttribute("title", interestGallery[i].description);
                anchor.setAttribute("rel", interestName);
                anchor.appendChild(image);

                listItem = document.createElement("li");
                listItem.className = "interestImage";
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
        var myInterest = interests[interestName],
            galleryList = galleryMarkup(interestName);

        infoContent.innerHTML = "";

        if (galleryList) {
            infoContent.appendChild(galleryList);
        }

        infoContent.innerHTML += myInterest.content;
        infoHeader.innerHTML = myInterest.header;
    }

    //Input: (bool)zOut
    //Closes infoPanel and triggers zoomout if zOut is true.
    function closeInfoPanel(zOut) {
        var doZoomOut = (zOut === undefined) ? "false" : zOut;

        if (doZoomOut === true) {
            zoomOut();
        }

        infoPanelAnimating = true;
        infoPanelOpen = false;

        TweenLite.to(infoPanel, 0.5, {
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

    //Input: (string)interestName
    //Opens info panel and calls loadContent.
    function openInfoPanel(interestName) {
        var duration = 0.8;

        infoPanelAnimating = true;
        worldTurns = false;
        infoPanelTop = ash.offsetTop - 300;

        if (infoPanelOpen) {
            duration = 0.8;
        }

        loadContent(interestName);

        infoPanel.style.top = infoPanelTop;
        infoPanel.style.display = "inline-block";

        TweenLite.to(infoPanel, duration, {
            css: {
                opacity: 1,
                marginTop: "-10px"
            },
            onComplete:
                function () {
                    infoPanelAnimating = false;
                    earthAnimating = false;
                    infoPanelOpen = true;
                }
        });
    }

    //Input: (int)targetAngle, (string)interestName
    //Rotates earth to targetAngle, zooms, shows infoPanel and contact form.
    function rotateEarthToAngle(targetAngle, interestName) {
        var angleDifference = diff(curEarthAngle, targetAngle),
            duration = angleDifference / 30,
            easing = Sine.easeOut;

        //If the current interest is "about", we stop spinning immediately and
        //display the infoPanel
        if (interestName === "about") {
            targetAngle = curEarthAngle;
            easing = Linear.easeNone;
            duration = 0;
        }

        worldTurns = false;
        earthAnimating = true;
        currentInterest = '';

        hideContactForm();

        updateAshStatus(targetAngle);

        TweenLite.to(planetEarth, duration, {
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

                if (interestName === "about") {
                    showContactForm();
                }

                earthAnimating = false;
            }
        });
    }

    //Input: (int)interestName
    //Rotates earth to Interest. Calls rotateEarthToAngle.
    function rotateEarthToInterest(interestName) {
        if (earthAnimating) { return false; }

        var targetAngle = getTargetAngle(interestName);

        currentInterest = '';
        earthAnimating = true;

        if (curEarthAngle !== targetAngle) {
            //We're not currently at this interest, so we need to 
            //    go to a new interest.
            closeInfoPanel();
            rotateEarthToAngle(targetAngle, interestName);
        } else {
            closeInfoPanel(true);
        }
    }

    //Rotates earth, moon and lowEarthOrbit layers at an increment.
    function rotateObjects() {
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

    //Input: (HTMLElement)el
    //Picks a set of randomized values to tween the star to for a twinkle effect.
    function twinkle(el) {
        var animationDuration, colorLottery, opa, rgb, bs;

        animationDuration = rFloat(0.2, 2.0);
        colorLottery = rInt(1, 10);
        opa = rFloat(0.0, 1.0);
        rgb = "rgb(255,255,255)";
        bs = "null";

        //1 in 10 odds of getting a color star.
        if (colorLottery === 10) {
            rgb = rRGB();
        }

        //Add background-shadow if webkit, since they render it efficiently.
        if (!isMobile && isWebkit) {
            bs = "0px 0px 15px 1px " + rgb;
        }

        TweenLite.to(el, animationDuration, {
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

    //Iterates over stars and sets star attributes to random start values.
    function randomizeStarAttributes() {
        var i, el, left, top, sca, colorLottery, opa, rgb, bs;

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

    //Close info panel when "neutral" area is clicked around earth.
    function topMarginContainerClicked() {
        if (earthAnimating || !zoomed) { return false; }

        closeInfoPanel(true);
    }

    //Input: (int)startX, (int)startY
    //Create and animate a meteor from position startX, startY
    function meteor(startX, startY) {
        var mymeteor = document.getElementById("meteor");

        //No meteor in DOM, so we'll add it.
        if (mymeteor === null || mymeteor.value === '') {
            mymeteor = document.createElement("span");
            mymeteor.setAttribute("id", "meteor");

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

    //Kicks off a meteor, then loops at a random interval.
    function meteorShower() {
        var rTimeout = Math.round((Math.random() * (3000 - 500)) + 100),
            startX = rInt(0, screenWidth),
            startY = rInt(0, screenHeight);

        setTimeout(function () {
            meteor(startX, startY);
        }, rTimeout);
    }

    //Input: (event)e
    //Handles mousemove events.
    function mousemove(e) {
        if (!isMobile && !isIE) {
            var mousePos = mouseCoords(e);

            moveStars(mousePos.x, mousePos.y);
        }
    }

    //Initializes interest values.
    function initInterests() {
        interests = {
            about: new Interest("about", 0),
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
            "<p>Pellentesque habitant morbi tristique senectus et netus " +
            "et malesuada fames ac turpis egestas. Vestibulum tortor quam, " +
            "feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu " +
            "libero sit amet quam egestas semper. Aenean ultricies mi vitae est. " +
            "Mauris placerat eleifend leo.</p>" +
            "<p>Pellentesque habitant morbi tristique senectus et netus et " +
            "malesuada fames ac turpis egestas.</p>";

        interests.games.header = "Games";
        interests.games.content = 
            "<p>Pellentesque habitant morbi tristique senectus et netus " +
            "et malesuada fames ac turpis egestas. Vestibulum tortor quam, " +
            "feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu " +
            "libero sit amet quam egestas semper. Aenean ultricies mi vitae est. " +
            "Mauris placerat eleifend leo.</p>" +
            "<p>Pellentesque habitant morbi tristique senectus et netus et " +
            "malesuada fames ac turpis egestas.</p>";

        interests.sheri.header = "Sheri";
        interests.sheri.content = 
            "<p>Pellentesque habitant morbi tristique senectus et netus " +
            "et malesuada fames ac turpis egestas. Vestibulum tortor quam, " +
            "feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu " +
            "libero sit amet quam egestas semper. Aenean ultricies mi vitae est. " +
            "Mauris placerat eleifend leo.</p>" +
            "<p>Pellentesque habitant morbi tristique senectus et netus et " +
            "malesuada fames ac turpis egestas.</p>";

        interests.computers.header = "Computers";
        interests.computers.content = 
            "<p>Pellentesque habitant morbi tristique senectus et netus " +
            "et malesuada fames ac turpis egestas. Vestibulum tortor quam, " +
            "feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu " +
            "libero sit amet quam egestas semper. Aenean ultricies mi vitae est. " +
            "Mauris placerat eleifend leo.</p>" +
            "<p>Pellentesque habitant morbi tristique senectus et netus et " +
            "malesuada fames ac turpis egestas.</p>";

        interests.nature.header = "Nature";
        interests.nature.content = 
            "<p>Pellentesque habitant morbi tristique senectus et netus " +
            "et malesuada fames ac turpis egestas. Vestibulum tortor quam, " +
            "feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu " +
            "libero sit amet quam egestas semper. Aenean ultricies mi vitae est. " +
            "Mauris placerat eleifend leo.</p>" +
            "<p>Pellentesque habitant morbi tristique senectus et netus et " +
            "malesuada fames ac turpis egestas.</p>";
    }

    //Creates stars then randomizes their attributes.
    function initStars() {
        stars = theStars.getElementsByTagName("i");

        if (stars.length === 0) {
            var starsCount, i, star;

            starsCount = isMobile ? (mobileType.Android() ? 30 : 10) : (isChrome ? 60 : 40);

            for (i = 0; i < starsCount;  i += 1) {
                star = document.createElement("i");
                star.cellSpacing = 0;

                theStars.appendChild(star);
                twinkle(star);
            }

            stars = theStars.getElementsByTagName("i");
        }

        randomizeStarAttributes();
    }

    //Initializes User Agent Detection
    function initUADetection() {
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
                return document.documentMode !== undefined;
            },
            any: function () {
                return (desktopType.Chrome() || desktopType.Webkit() || desktopType.Firefox() || desktopType.IE());
            }
        };

        isMobile = mobileType.any();
        isIE = desktopType.IE();
        isChrome = desktopType.Chrome();
        isFirefox = desktopType.Firefox();
        isWebkit = desktopType.Webkit();
    }

    //Creates shadow and sets its length based on some math that finds the 
    //distance to the corner.
    //Source: I don't recall where I got it, but this is borrowed code.
    function initShadow() {
        var centerY = screenHeight / 2,
            centerX = screenWidth / 2,
            length = Math.floor(Math.sqrt(Math.pow(-Math.abs(centerX), 2) + Math.pow(screenHeight - centerY, 2)));

        earthShadow.style.width = length + "px";
    }

    //Handles screen resize events.
    function resize() {
        updateScreenDims();
        initShadow();
    }

    define(["jquery", "tweenmax", "fancybox", "fancybox_thumbs", "analytics"], function($) {
        //Set up variables.
        doc = document;
        win = window;
        theStars = doc.getElementById("theStars");
        theHeavens = doc.getElementById("theHeavens");
        planetEarth = doc.getElementById("planetEarth");
        earthShadow = doc.getElementById("earthShadow");
        ash = doc.getElementById("ash");
        ashStatus = doc.getElementById("status");
        nature = doc.getElementById("nature");
        sheri = doc.getElementById("sheri");
        computers = doc.getElementById("computers");
        games = doc.getElementById("games");
        moon = doc.getElementById("moon");
        lowEarthOrbit = doc.getElementById("lowEarthOrbit");
        topMarginContainer = doc.getElementById("topMarginContainer");
        contactForm = doc.getElementById("contactForm");
        contactIcon = doc.getElementById("contactIcon");
        infoPanel = doc.getElementById("infoPanel");
        infoPrev = doc.getElementById("infoPrev");
        infoNext = doc.getElementById("infoNext");
        infoClose = doc.getElementById("infoClose");
        infoHeader = doc.getElementById("infoHeader");
        infoContent = doc.getElementById("infoContent");
        keys = [];
        interests = {};
        mobileType = {};
        desktopType = {};
        worldTurns = true;
        earthAnimating = false;
        zoomAnimating = false;
        zoomed = false;
        infoPanelOpen = false;
        infoPanelAnimating = false;
        infoPanelTop = 0;
        curEarthAngle = 0;
        curMoonAngle = 0;
        curLEOAngle = 0;
        konami = "38,38,40,40,37,39,37,39,66,65";
        codelength = konami.split(",").length;

        //Call our startup functions and kick off any loops.
        updateScreenDims();
        initUADetection();
        initShadow();
        initStars();
        initInterests();
        initImages();
        initContent();
        meteorShower();
        rotateObjects();

        //Set up a bunch of event handlers.
        $(ash).on("click", function () { interestClicked("about"); });
        $(contactIcon).on("click", function () { interestClicked("about"); });
        $(infoNext).on("click", function () { jogInterests(); });
        $(infoPrev).on("click", function () { jogInterests("prev"); });
        $(infoClose).on("click", function (e) { topMarginContainerClicked(e); });
        $(topMarginContainer).on("click", function (e) { if (e.target === this) { topMarginContainerClicked(e); } });
        $(doc).on("click", "#planetEarth>a", function () { interestClicked($(this).attr("id")); });
        $(doc).on("mousemove", theStars, function (e) { mousemove(e); });
        $(doc).on("keydown", function (e) { keydown(e); });
        $(win).on("resize", function () { resize(); });
        $(win).on("touchmove", function (e) { e.preventDefault(); });

        //Don't allow user to scale display on mobile.
        if ((window.devicePixelRatio !== undefined) && (window.devicePixelRatio > 2)) {
            var meta, metaValue;

            meta = document.getElementById("viewport");

            if (meta !== undefined) {
                metaValue = 'width=device-width, initial-scale=' + (2 / window.devicePixelRatio) + ', user-scalable=no';
                meta.setAttribute('content', metaValue);
            }
        }

        //Kick off fancybox instance.
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
    });
}());