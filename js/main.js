/*jslint browser: true, indent: 4 */
/*global $, jQuery, debug, mobileType, getScale, TweenLite*/
/*global Power1, Sine, rFloat, rInt, rRGB, mouseCoords*/

(function () {
    "use strict";
    var $doc = $(document),
        $win = $(window),
        $theStars = $("#theStars"),
        $theHeavens = $("#theHeavens"),
        $planetEarth = $("#planetEarth"),
        $ourHero = $("#ourHero"),
        $heroStatus = $("#ourHero>#status"),
        $infoPanel = $("#infoPanel"),
        $containerTester = $("#containerTester"),
        isIE = document.documentMode,
        isWebkit = /Webkit/i.test(navigator.userAgent),
        isChrome = /Chrome/i.test(navigator.userAgent),
        isMobile = mobileType.any(),
        keys = [],
        interests = {},
        worldTurns = true,
        infoPanelOpen = false,
        infoPanelAnimating = false,
        earthAnimating = false,
        zoomAnimating = false,
        zoomed = false,
        debugPage = false,
        curEarthAngle = -4000,
        konami = "38,38,40,40,37,39,37,39,66,65",
        currentInterest,
        screenWidth = window.innerWidth,
        screenHeight = window.innerHeight;

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

    function updateScreenDims() {
        screenWidth = window.innerWidth;
        screenHeight = window.innerHeight;
    }

    function Interest(name, locationAngle) {
        this.name = name;
        this.locationAngle = locationAngle;
    }

    function keydown(e) {
        var codelength = konami.split(",").length;

        keys.push(e.keyCode);

        if (keys.toString().indexOf(konami) >= 0) {
            debug("Space invaders!");
            keys = [];
        }

        if (keys.length > codelength) {
            keys.shift();
        }
    }

    function moveStars(x, y) {
        if (infoPanelOpen || earthAnimating || zoomed || zoomAnimating) { return false; }

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

    function zoomIn(callbackFn) {
        zoomAnimating = true;

        if (!isMobile) {
            TweenLite.to($containerTester, 2, {
                css: {
                    y: 200
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

    function updateHeroStatus(targetAngle) {
        $heroStatus.hide();

        if (targetAngle !== null) {
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

    function zoomOut() {
        if (!zoomAnimating) {
            currentInterest = '';
            worldTurns = true;
            zoomAnimating = true;
            updateHeroStatus();

            if (!isMobile) {
                TweenLite.to($containerTester, 2, {
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

    function closeInfoPanel(zOut) {
        var doZoomOut = (zOut === undefined) ? "false" : zOut;

        if (doZoomOut === true) {
            zoomOut();
        }

        infoPanelAnimating = true;
        infoPanelOpen = false;

        TweenLite.to($infoPanel, 0.8, {
            css: {
                display: 'none',
                scale: 1.25,
                opacity: 0
            },
            onComplete: function () {
                infoPanelAnimating = false;
            }
        });
    }

    function openInfoPanel(interestId) {
        var infoPanelLeft = $ourHero.offset().left,
            infoPanelTop = $ourHero.offset().top - 200,
            interestContent = $("#" + interestId + "Content"),
            duration = 0.8;

        infoPanelAnimating = true;
        worldTurns = false;

        if (infoPanelOpen) {
            duration = 0;
        }

        //Clone our interest content to the infoPanel and show it.
        $infoPanel.empty();

        $infoPanel.css("left", infoPanelLeft);
        $infoPanel.css("top", infoPanelTop);

        interestContent.clone().appendTo($infoPanel).show();

        TweenLite.to($infoPanel, duration, {
            css: {
                display: 'block',
                opacity: 1,
                scale: 1
            },
            onComplete:
                function () {
                    infoPanelAnimating = false;
                    earthAnimating = false;
                    infoPanelOpen = true;
                }
        });
    }

    function rotateEarthToAngle(targetAngle, interestId) {
        worldTurns = false;
        earthAnimating = true;
        currentInterest = '';

        updateHeroStatus(targetAngle);

        TweenLite.to($planetEarth, 3, {
            css: {
                rotationZ: targetAngle + "deg"
            },
            onComplete: function () {
                currentInterest = interests[interestId].name;
                curEarthAngle = targetAngle;
                updateHeroStatus(targetAngle);
                zoomIn(function () { openInfoPanel(interestId); });
                earthAnimating = false;
            }
        });
    }

    function rotateEarthToInterest(interestId) {
        if (earthAnimating || infoPanelAnimating) { return false; }

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
            op = rFloat(0.0, 1.0),
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
                opacity: op,
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
            s,
            colorLottery,
            op,
            rgb,
            bs;

        for (i = 0; i < $stars.length;  i += 1) {
            el = $stars[i];
            left = rFloat(-2.5, 102.5);
            top = rFloat(-2.5, 102.5);
            s = rFloat(0.1, 1.0);
            colorLottery = rInt(1, 10);
            op = rFloat(0.0, 1.0);
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
                    scale: s,
                    opacity: op,
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

    function heavensClicked(e) {
        if (earthAnimating || !zoomed) { return false; }

        if (e.target.tagName.toLowerCase() !== 'a') {
            closeInfoPanel(true);
        }
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

    function setShadowLen() {
        var centerY = screenHeight / 2,
            centerX = screenWidth / 2,
            length = Math.floor(Math.sqrt(Math.pow(-Math.abs(centerX), 2) + Math.pow(screenHeight - centerY, 2)));

        $("#earthShadow").css("width", length);
    }

    function resize() {
        updateScreenDims();
        setShadowLen();
    }

    function mousemove(e) {
        if (!isMobile) {
            var mousePos = mouseCoords(e);

            moveStars(mousePos.x, mousePos.y);
        }
    }

    function initializeInterests() {
        interests = {
            sheri: new Interest("sheri", -82),
            computers: new Interest("computers", 180),
            nature: new Interest("nature", 55),
            games: new Interest("games", -40),
            cars: new Interest("cars", 0)
        };
    }

    function initializeStars() {
        if ($(".star").length === 0) {
            var starsCount = isMobile ? (mobileType.Android() ? 20 : 40) : (isChrome ? 100 : 70),
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

    $(function () {
        setShadowLen();
        initializeInterests();
        initializeStars();
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
            if (meta !== null) {
                meta.setAttribute('content', 'width=device-width, initial-scale=' + (2 / window.devicePixelRatio) + ', user-scalable=no');
            }
        }

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

    $doc.on("click", "#planetEarth>a", function () { interestClicked($(this)); });
    $doc.on("mouseup", "#theHeavens", function (e) { heavensClicked(e); });
    $win.on("resize", function () { resize(); });
    $doc.on("mousemove", $theStars, function (e) { mousemove(e); });
    $doc.on("keydown", function (e) { keydown(e); });
}());