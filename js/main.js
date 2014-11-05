/*jslint browser: true, indent: 4*/
/*global $, jQuery, debug, mobileType, getScale, TweenLite*/
/*global Power1, Sine, rFloat, rInt, rRGB, mouseCoords, diff*/

(function () {
    "use strict";
    var $doc = $(document),
        $win = $(window),
        $theStars = $("#theStars"),
        $theHeavens = $("#theHeavens"),
        $planetEarth = $("#planetEarth"),
        $ourHero = $("#ourHero"),
        $nature = $("#nature"),
        $sheri = $("#sheri"),
        $computers = $("#computers"),
        $games = $("#games"),
        $moon = $("#moon"),
        $heroStatus = $("#ourHero>#status"),
        $topMarginContainer = $("#topMarginContainer"),
        $infoPanel = $("#infoPanel"),
        $infoPanelNavPrev = $("#infoPanel>#prev"),
        $infoPanelNavNext = $("#infoPanel>#next"),
        $infoPanelHead = $("#infoPanel>div>h2"),
        $infoPanelClose = $("#infoPanel>div>#close"),
        $infoPanelContent = $("#infoPanel>div>span"),
        isIE = document.documentMode,
        isWebkit = /Webkit/i.test(navigator.userAgent),
        isChrome = /Chrome/i.test(navigator.userAgent),
        isFirefox = /firefox/i.test(navigator.userAgent),
        isMobile = mobileType.any(),
        keys = [],
        interests = {},
        worldTurns = true,
        earthAnimating = false,
        zoomAnimating = false,
        zoomed = false,
        debugPage = false,
        infoPanelOpen = false,
        infoPanelAnimating = false,
        infoPanelTop = 0,
        curEarthAngle = -4000,
        konami = "38,38,40,40,37,39,37,39,66,65",
        currentInterest,
        screenWidth = window.innerWidth,
        screenHeight = window.innerHeight;

    function Interest(name, locationAngle) {
        this.name = name;
        this.locationAngle = locationAngle;
        this.content = "";
        this.header = "";
        this.gallery = [];
    }

    function Image(title, url, description, interestId) {
        this.title = title;
        this.url = url;
        this.description = description;

        interests[interestId].gallery.push(this);
    }

    function updateScreenDims() {
        screenWidth = window.innerWidth;
        screenHeight = window.innerHeight;
    }

    function keydown(e) {
        var codelength = konami.split(",").length;

        keys.push(e.keyCode);

        if (keys.toString().indexOf(konami) >= 0) {
            debug("Fun stuff coming soon!");
            keys = [];
        }

        if (keys.length > codelength) {
            keys.shift();
        }
    }

    function moveStars(x, y) {
        if (isIE) { return false; }

        var bgPosX = (50 * (x / screenWidth)),
            bgPosY = (50 * (y / screenHeight)),
            $stars = $(".star"),
            i,
            star,
            scale,
            starY,
            starX;

        for (i = 0; i < $stars.length; i += 1) {
            star = $stars[i];
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

    function updateHeroStatus(targetAngle) {
        $heroStatus.hide();

        if (targetAngle !== undefined) {
            if (targetAngle < curEarthAngle) {
                //Face our hero right if we're rotating counter-clockwise.
                $ourHero.actorAnimate("walking");
            } else {
                //Face our hero left if we're rotating clockwise.
                $ourHero.actorAnimate("walking", true);
            }

            if (curEarthAngle === targetAngle) {
                //We're at our interest, so just stand still.
                $ourHero.actorAnimate("standing");
                if (currentInterest === 'computers') {
                    $ourHero.actorAnimate("standing-away");
                }
                if (currentInterest === 'nature') {
                    $ourHero.actorAnimate("sitting-camp");
                }
                if (currentInterest === 'games') {
                    $ourHero.actorAnimate("sitting-vidya");
                }
            }
        } else {
            $ourHero.actorAnimate("walking");
        }

        if (currentInterest === 'sheri') {
            $heroStatus.show();
        } else {
            $heroStatus.hide();
        }
    }

    function animBrightness(from, to) {
        var fromFloat = parseFloat(from).toFixed(1),
            toFloat = parseFloat(to).toFixed(1),
            dir = (fromFloat > toFloat) ? "lt" : "gt",
            els,
            anim,
            lins,
            i;

        if (isIE) {
            els = $planetEarth
                    .add($ourHero)
                    .add($sheri)
                    .add($nature)
                    .add($computers)
                    .add($games)
                    .add($moon);

            if (dir === "lt") {
                els.addClass("dark");
            } else {
                els.removeClass("dark");
            }

            return;
        }

        anim = setInterval(function () {
            var next = 0.0;

            if (dir === "gt") {
                next = (((fromFloat * 10) + (0.1 * 10)) / 10); //Funky math here to get float accuracy. Blah.
            } else {
                next = (((fromFloat * 10) - (0.1 * 10)) / 10); //More funky float math.
            }

            fromFloat = next.toFixed(1);

            if (isFirefox) {
                lins = document.getElementsByClassName("lin");

                for (i = 0; i < lins.length; i += 1) {
                    lins[i].setAttribute("slope", fromFloat);
                }
            }

            if (isChrome) {
                els = $planetEarth
                        .add($ourHero)
                        .add($("#lowEarthOrbit"))
                        .add($("#moon"));

                TweenLite.to(els, 0, { css: { '-webkit-filter': 'brightness(' + fromFloat + ')' } });
            }

            if (fromFloat === toFloat) { clearInterval(anim); }
        }, 20);
    }

    function showContactForm() {
        animBrightness(1.0, 0.0);

        TweenLite.to($("#contact"), 2, {
            opacity: 1
        });
    }

    function hideContactForm() {
        if ($("#contact").css("opacity") > 0.5) {
            animBrightness(0.0, 1.0);

            TweenLite.to($("#contact"), 0.5, {
                opacity: 0
            });
        }
    }

    function zoomIn(callbackFn) {
        zoomAnimating = true;

        if (!isMobile) {
            TweenLite.to($topMarginContainer, 2, {
                css: {
                    y: 250
                },
                ease: Power1.easeInOut
            });
        }

        TweenLite.to($theHeavens, 2, {
            css: {
                scale: 2,
                z: 1
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
        updateHeroStatus();

        if (!isMobile) {
            TweenLite.to($topMarginContainer, 2, {
                css: {
                    y: 0
                },
                ease: Power1.easeInOut
            });
        }

        TweenLite.to($theHeavens, 2, {
            css: {
                scale: 1,
                y: 0,
                z: 1
            },
            ease: Power1.easeInOut,
            onComplete: function () {
                zoomAnimating = false;
                zoomed = false;
            }
        });
    }

    function getTargetAngle(interestId) {
        var targetAngle = interests[interestId].locationAngle,
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

    function galleryMarkup(interestId) {
        var myInterest = interests[interestId],
            interestGallery = myInterest.gallery,
            galleryCount = interestGallery.length,
            list = null,
            i,
            listItem,
            anchor,
            image,
            imgUrl;

        if (galleryCount > 0) {
            list = document.createElement("ul");

            for (i = 0; i < galleryCount; i += 1) {
                listItem = document.createElement("li");
                listItem.className = "interestImage";

                imgUrl = interestGallery[i].url;

                image = document.createElement("img");
                image.src = imgUrl.replace(".", "_thumb.");

                anchor = document.createElement("a");
                anchor.className = "fancybox";
                anchor.href = imgUrl;
                anchor.setAttribute("title", interestGallery[i].description);
                anchor.setAttribute("rel", interestId);
                anchor.appendChild(image);

                listItem.appendChild(anchor);
                list.appendChild(listItem);
            }
        }

        return list;
    }

    function loadContent(interestId) {
        var myInterest = interests[interestId],
            galleryList = galleryMarkup(interestId);

        $infoPanelContent.empty();

        if (galleryList) {
            $infoPanelContent.append(galleryList);
        }

        $infoPanelContent.append(myInterest.content);

        $infoPanelHead.html(myInterest.header);
    }

    function closeInfoPanel(zOut) {
        var doZoomOut = (zOut === undefined) ? "false" : zOut;

        if (doZoomOut === true) {
            zoomOut();
        }

        infoPanelAnimating = true;
        infoPanelOpen = false;

        TweenLite.to($infoPanel, 0.5, {
            css: {
                display: 'none',
                opacity: 0,
                scale: 0.9
            },
            onComplete: function () {
                $infoPanel.removeAttr("style");
                infoPanelAnimating = false;
            }
        });
    }

    function openInfoPanel(interestId) {
        var duration = 0.8;

        infoPanelAnimating = true;
        worldTurns = false;
        infoPanelTop = $ourHero.offset().top - 300;

        if (infoPanelOpen) {
            duration = 0;
        }

        loadContent(interestId);

        $infoPanel.css("top", infoPanelTop);
        $infoPanel.show();

        TweenLite.to($infoPanel, duration, {
            css: {
                display: 'block',
                opacity: 1,
                marginTop: "-10px"
            },
            onComplete:
                function () {
                    if (interestId === "about") {
                        showContactForm();
                    } else {
                        hideContactForm();
                    }
                    
                    infoPanelAnimating = false;
                    earthAnimating = false;
                    infoPanelOpen = true;
                }
        });
    }

    function rotateEarthToAngle(targetAngle, interestId) {
        var angleDifference = diff(curEarthAngle, targetAngle),
            duration = angleDifference / 30;

        worldTurns = false;
        earthAnimating = true;
        currentInterest = '';

        updateHeroStatus(targetAngle);

        TweenLite.to($planetEarth, duration, {
            css: {
                rotationZ: targetAngle + "deg"
            },
            ease: Sine.easeOut,
            onComplete: function () {
                currentInterest = interests[interestId].name;
                curEarthAngle = targetAngle;
                updateHeroStatus(targetAngle);
                if (!zoomed) {
                    zoomIn(function () { openInfoPanel(interestId); });
                } else {
                    openInfoPanel(interestId);
                }
                earthAnimating = false;
            }
        });
    }

    function rotateEarthToInterest(interestId) {
        if (earthAnimating) { return false; }

        var targetAngle = getTargetAngle(interestId);
        currentInterest = '';
        earthAnimating = true;

        if (curEarthAngle !== targetAngle) {
            //We're not currently at this interest, so we need to 
            //    go to a new interest.
            closeInfoPanel();
            rotateEarthToAngle(targetAngle, interestId);
        } else {
            closeInfoPanel(true);
        }
    }

    function rotateEarth() {
        if (worldTurns) {
            curEarthAngle -= 0.3;

            TweenLite.to($planetEarth, 0, {
                css: {
                    rotationZ: curEarthAngle
                }
            });
        }
    }

    function twinkle(el) {
        var animationDuration = rFloat(0.2, 2.0),
            colorLottery = rInt(1, 10),
            opa = rFloat(0.0, 1.0),
            rgb = "rgb(255,255,255)",
            bs = "null";

        //1 in 10 odds of getting a color star.
        if (colorLottery === 10) {
            rgb = rRGB();
        }

        //Add background-shadow if webkit, since they render it efficiently
        if (!isMobile && isWebkit) {
            bs = "0px 0px 6px 1px " + rgb;
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

    function setStarPositions() {
        var $stars = $(".star"),
            i,
            el,
            left,
            top,
            sca,
            colorLottery,
            opa,
            rgb,
            bs;

        for (i = 0; i < $stars.length;  i += 1) {
            el = $stars[i];
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
                bs = "0px 0px 6px 1px " + rgb;
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

    function interestClicked(el) {
        if (earthAnimating || infoPanelAnimating || zoomAnimating) { return false; }

        var interestId = el.attr("id");

        if (interestId === currentInterest) {
            closeInfoPanel(true);
        } else {
            rotateEarthToInterest(interestId);
        }
    }

    function jogInterests(dir) {
        var keysArray = Object.keys(interests),
            interestCount = Object.keys(interests).length,
            curIndex,
            nextIndex,
            nextInterestId,
            valuesArray;

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

        nextInterestId = valuesArray[nextIndex];

        rotateEarthToInterest(nextInterestId);
    }

    function topMarginContainerClicked() {
        if (earthAnimating || !zoomed) { return false; }

        closeInfoPanel(true);
    }

    function meteor(startX, startY) {
        var mymeteor = document.createElement("span");
        mymeteor.cellSpacing = 0;
        mymeteor.className = "meteor";

        $(mymeteor)
            .css("top", startY)
            .css("left", startX);

        $theStars.append(mymeteor);

        TweenLite.to(mymeteor, 0.5, {
            css: {
                x: "-650px",
                y: "+450px",
                opacity: 0.1
            },
            ease: Sine.easeInOut,
            onComplete: function () {
                $(mymeteor).remove();
                meteorShower();
            }
        });
    }

    function meteorShower() {
        var rTimeout = Math.round((Math.random() * (3000 - 500)) + 1500),
            startX = rInt(-100, (screenWidth + 100)),
            startY = rInt(-100, (screenHeight + 100));

        setTimeout(function () {
            meteor(startX, startY);
        }, rTimeout);
    }

    function mousemove(e) {
        if (!isMobile) {
            var mousePos = mouseCoords(e);

            moveStars(mousePos.x, mousePos.y);
        }
    }

    function initializeInterests() {
        interests = {
            about: new Interest("about", 0),
            games: new Interest("games", -30),
            sheri: new Interest("sheri", -82),
            computers: new Interest("computers", 174),
            nature: new Interest("nature", 45)
        };
    }

    function initializeImages() {
        new Image("Rainier", "photo/rainier_1.jpg", "Rainier with a forboding cloud formation.", "nature");
        new Image("Lake Margaret Trail", "photo/margaret_1.jpg", "Lake Margaret Trail.", "nature");
        new Image("Snow Lake Trail", "photo/snow_1.jpg", "Snow Lake Trail.", "nature");
    }

    function initializeContent() {
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

    function initializeStars() {
        if ($(".star").length === 0) {
            var starsCount = isMobile ? (mobileType.Android() ? 30 : 10) : (isChrome ? 100 : 40),
                i,
                star;

            for (i = 0; i < starsCount;  i += 1) {
                star = document.createElement("span");
                star.cellSpacing = 0;
                star.className = "star";

                $theStars.append(star);
                twinkle(star);
            }
        }

        setStarPositions();
    }

    function initializeShadow() {
        var centerY = screenHeight / 2,
            centerX = screenWidth / 2,
            length = Math.floor(Math.sqrt(Math.pow(-Math.abs(centerX), 2) + Math.pow(screenHeight - centerY, 2)));

        $("#earthShadow").css("width", length);
    }

    function resize() {
        updateScreenDims();
        initializeShadow();
    }

    $ourHero.on("click", function () { rotateEarthToInterest("about"); });
    $("#contactIcon").on("click", function () { rotateEarthToInterest("about"); });
    $infoPanelNavNext.on("click", function () { jogInterests(); });
    $infoPanelNavPrev.on("click", function () { jogInterests("prev"); });
    $infoPanelClose.on("click", function (e) { topMarginContainerClicked(e); });
    $topMarginContainer.on("click", function (e) { if (e.target === this) { topMarginContainerClicked(e); } });
    $doc.on("click", "#planetEarth>a", function () { interestClicked($(this)); });
    $doc.on("mousemove", $theStars, function (e) { mousemove(e); });
    $doc.on("keydown", function (e) { keydown(e); });
    $win.on("resize", function () { resize(); });

    (function ($) {
        $.fn.actorAnimate = function (state, hflip) {
            var flip = (hflip === undefined) ? "false" : hflip,
                cssClass = state;

            $(this).removeClass();
            $(this).addClass(cssClass);

            if (flip === true) {
                $(this).addClass("flipped");
            }
        };
    }(jQuery));

    $(function () {
        initializeShadow();
        initializeStars();
        initializeInterests();
        initializeImages();
        initializeContent();
        meteorShower();

        //Initialize earth rotation in javascript
        TweenLite.to($planetEarth, 0, {
            css: {
                rotationZ: curEarthAngle
            }
        });

        setInterval(function () {
            rotateEarth();
        }, 60);

        window.addEventListener("touchmove",
            function (event) {
                event.preventDefault();
            }, false);

        if ((window.devicePixelRatio !== undefined) && (window.devicePixelRatio > 2)) {
            var meta = document.getElementById("viewport");
            if (meta !== undefined) {
                meta.setAttribute('content', 'width=device-width, initial-scale=' + (2 / window.devicePixelRatio) + ', user-scalable=no');
            }
        }

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

        //Device tilt code for mobiles/tablets. Currently lags ipad.
        //if (window.DeviceOrientationEvent) {
        //    window.addEventListener("deviceorientation", function () {
        //        moveStars((event.beta * 5), (event.gamma * 5));
        //    }, true);
        //} else if (window.DeviceMotionEvent) {
        //    window.addEventListener('devicemotion', function () {
        //        moveStars((event.acceleration.x * 2), (event.acceleration.y * 2));
        //    }, true);
        //} else {
        //    window.addEventListener("MozOrientation", function () {
        //        moveStars((orientation.x * 50), (orientation.y * 50));
        //    }, true);
        //}

        if (debugPage === true) {
            setInterval(function () {
                debug("worldTurns:" + worldTurns + "<br>", true);
                debug("infoPanelOpen:" + infoPanelOpen + "<br>");
                debug("earthAnimating:" + earthAnimating + "<br>");
                if (isMobile) {
                    debug(screenWidth);
                }
            }, 3);
        }
    });
}());