(function () {
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
        isMobile = !!("ontouchstart" in window),
        keys = [],
        interests = {},
        worldTurns = true,
        infoPanelOpen = false,
        earthInTransit = false,
        animating = false,
        zoomed = false,
        debugPage = false,
        curEarthAngle = -4000,
        konami = "38,38,40,40,37,39,37,39,66,65",
        currentInterest,
        screenWidth = window.innerWidth,
        screenHeight = window.innerHeight;
    
    (function ($) {
        $.fn.actorAnimate = 
            function (state, hflip) {
                var flip = (typeof hflip === "undefined") ? "false" : hflip;
                
                var cssClass = state;
                
                if (flip === true) {
                    cssClass += " flipped";
                }
                
                if (!$(this).hasClass(cssClass)) {
                    $(this).removeClass();
                    $(this).addClass(cssClass);
                }
            }
    })(jQuery);
        
    $doc.on("mousemove", $theStars, 
        function (e) {
            if (!isMobile) {
                var mousePos = mouseCoords(e),
                    x = mousePos.x,
                    y = mousePos.y;
                moveStars(x, y);
            }
        }
    );
    
    $doc.on("click", "#planetEarth>a", 
        function () {
            if (earthInTransit) { return false; };
            
            var interestId = $(this).attr("id");
            
            if (interestId === currentInterest) {
                currentInterest = '';
                worldTurns = true;
                zoomOut();
            } else {
                rotateEarthToInterest(interestId);
            }
            
            updateHeroStatus();
        }
    );
    
    $doc.on("mouseup", "#theHeavens, #infoPanel>span>i", 
        function (e) {
            if (earthInTransit || !zoomed) { return false; };
            
            if (e.target.tagName.toLowerCase() != 'a') {
                currentInterest = '';
                worldTurns = true;
                zoomOut();
                updateHeroStatus();
            }
        }
    );
    
    $doc.on("keydown",
        function (e) {
            keys.push(e.keyCode);
            
            if (keys.toString().indexOf(konami) >= 0) {
                alert("konami'd");
                keys = [];
            }
        }
    );
    
    $win.on("resize",
        function() {
            screenWidth = window.innerWidth;
            screenHeight = window.innerHeight;
            
            setShadowLength();
        }
    )
            
    function Interest(name, locationAngle) {
        this.name = name;
        this.locationAngle = locationAngle;
    }
    
    function moveStars(x, y) {
        if (!infoPanelOpen && !animating) {
            var bgPosX = (50 * (x / screenWidth)),
                bgPosY = (50 * (y / screenHeight)),
                $stars = $(".star");
            
            for (i = 0; i < $stars.length; i++) {
                var star = $stars[i],
                    scale = getScale(star);
                
                TweenLite.to(star, 0.6, {
                    css:{
                        y:bgPosY * scale,
                        x:bgPosX * scale
                    }
                });
            }
        }
    }
            
    function closeInfoPanel() {
        if (infoPanelOpen) {
            animating = true;
            TweenLite.to($infoPanel, 0.8, {
                css:{
                    scale: 1.25,
                    opacity: 0
                }, 
                onComplete: 
                    function () {
                        $infoPanel.hide(0, '', 
                            function() { 
                                animating = false;
                                infoPanelOpen = false;
                            }
                        );
                    }
            });
        }
    };
    
    function openInfoPanel(interestId) {
        var infoPanelLeft = $ourHero.offset().left,
            infoPanelTop = $ourHero.offset().top - 200,
            interestContent = $("#" + interestId + "Content");
        animating = true;
            
        $infoPanel.css("left", infoPanelLeft);
        $infoPanel.css("top", infoPanelTop);
        
        worldTurns = false;
        
        //Clone our interest content to the infoPanel and show it.
        $infoPanel.empty();
        
        interestContent.clone().appendTo("#infoPanel").show();
        
        $infoPanel.show();
        
        TweenLite.to($infoPanel, 0.8, {
            css:{
                opacity: 1,
                scale: 1
            }, 
            onComplete: 
                function () {
                    animating = false;
                    earthInTransit = false
                    infoPanelOpen = true;
                }
        });
    };
    
    function zoomIn(callbackFn) {
            animating = true;
            
            if (!isMobile) {
                TweenLite.to($containerTester, 2, {
                    css:{
                        y: 200
                    }, 
                        ease:Power1.easeInOut
                });
            }
            
            TweenLite.to($theHeavens, 2, {
                css:{
                    scale: 2, 
                    z:1
                }, 
                ease:Power1.easeInOut,
                onComplete: 
                    function () {
                        animating = false;
                        zoomed = true;
                        if(typeof callbackFn === "function"){
                            callbackFn.call(this);
                        }
                    } 
            });
        };
    
    function zoomOut() {
            animating = true;
            closeInfoPanel();
            
            if (!isMobile) {
                TweenLite.to($containerTester, 2, {
                    css:{
                        y: 0
                    }, 
                        ease:Power1.easeInOut
                });
            }
            
            TweenLite.to($theHeavens, 2, {
                css:{
                    scale: 1, 
                    y: 0,
                    z:1
                }, 
                ease:Power1.easeInOut,
                onComplete: 
                    function () {
                        animating = false;
                        zoomed = false;
                    }
            });
        };
    
    function rotateEarthToInterest(interestId) {
        if (earthInTransit) { return false; };
        var targetAngle = getTargetAngle(interestId);
        animating = true;
        currentInterest = '';
        
        closeInfoPanel();
        
        if (curEarthAngle != targetAngle) {
            //We're not currently at this interest, so we need to 
            //    go to a new interest.
            rotateEarthToAngle(targetAngle, interestId);
        }
    };
    
    function rotateEarthToAngle(targetAngle, interestId) {
        worldTurns = false;
        earthInTransit = true;

        updateHeroStatus(targetAngle);
        
        TweenLite.to($planetEarth, 3, {
            css:{
                rotationZ: targetAngle + "deg"
            },
            onComplete: 
                function () {
                    animating = false;
                    currentInterest = interests[interestId].name;
                    curEarthAngle = targetAngle;
                    updateHeroStatus(targetAngle);
                    zoomIn(function() { openInfoPanel(interestId) });
                    earthInTransit = false;
                }
        });
    };
            
    function updateHeroStatus(targetAngle) {
        $heroStatus.hide();
        
        if (targetAngle != null) {
            if (targetAngle > curEarthAngle) {
                //Face our hero left if we're rotating clockwise.
                $ourHero.actorAnimate("walking", true);
            } else {
                //Face our hero right if we're rotating counter-clockwise.
                $ourHero.actorAnimate("walking");
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
    };

    function rotateEarth() {
        if (worldTurns) {
            curEarthAngle -= 0.3;
            
            TweenLite.to($planetEarth, 0, {
                css:{
                    rotationZ: curEarthAngle
                }
            });
                
            $ourHero.actorAnimate("walking");
        };
    }; 
    
    function getTargetAngle(interestId) {
        var targetAngle = interests[interestId].locationAngle,
            remainder = curEarthAngle % 360,
            completedRotations = ((curEarthAngle - remainder) / 360),
            shortestAngle = targetAngle - remainder,
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
        var adjustedTargetAngle = (remainder + shortestAngle) + fullRotations;
        
        return adjustedTargetAngle;
    };
    
    function initializeStars() {
        if ($(".star").length === 0) {
            var starsCount = isMobile ? (mobileType.Android() ? 20 : 40) : (isChrome ? 100 : 70);

            for (var i = 0; i < starsCount; i++) {
                var star = document.createElement("span");
                star.cellSpacing = 0;
                star.className = "star";
                
                $theStars.append(star);
                twinkle(star);
            }
        }
        
        setStarPositions();
    }
    
    function setStarPositions() {
        var $stars = $(".star");
        
        for (i = 0; i < $stars.length; i++) {
            var el = $stars[i],
                left = rFloat(-2.5, 102.5),
                top = rFloat(-2.5, 102.5),
                s = rFloat(0.1, 1.0),
                colorLottery = rInt(1,10),
                op = rFloat(0.0, 1.0),
                rgb = "rgb(255,255,255)",
                bs = "0px";
                
            //1 in 10 odds of getting a color star.
            if (colorLottery === 10) {
                rgb = rRGB();
            }
            
            //Add background-shadow if webkit, since they render it efficiently
            if (isWebkit) {
                bs = "0px 0px 6px 1px " + rgb;
            }
        
            TweenLite.to(el, 0, {
                css:{
                    left:left + "%", 
                    top:top + "%", 
                    z:1, 
                    scale:s, 
                    opacity: op,
                    backgroundColor: rgb,
                    boxShadow: bs
                }
            });
        }
    }
    
    function twinkle(el) {
        var animationDuration = rFloat(0.2,2.0),
            timeoutDuration = rInt(500, 1000),
            colorLottery = rInt(1,10),
            op = rFloat(0.0, 1.0),
            rgb = "rgb(255,255,255)",
            bs = "0px";
        
        //1 in 10 odds of getting a color star.
        if (colorLottery === 10) {
            rgb = rRGB();
        }
        
        //Add background-shadow if webkit, since they render it efficiently
        if (isWebkit) {
            bs = "0px 0px 6px 1px " + rgb;
        }
        
        TweenLite.to(el, animationDuration, {
            css:{
                opacity: op,
                backgroundColor: rgb,
                boxShadow: bs
            },
            onComplete: 
                function() {
                    twinkle(el);
                }
        });
    };
    
    function meteor(startX, startY) {
        var meteor = document.createElement("span");
        meteor.cellSpacing = 0;
        meteor.className = "meteor";
        
        $(meteor)
            .css("top", startY)
            .css("left", startX);
        
        $theStars.append(meteor);
        
        TweenLite.to(meteor, .5, {
            css:{
                x: "-650px", 
                y: "+450px",
                opacity: 0.1
            }, 
            ease:Sine.easeInOut, 
            onComplete: 
                function () { 
                    $(meteor).remove();
                    meteorShower();
                }
        });
    };
        
    function meteorShower() {
        var rTimeout = Math.round((Math.random() * (3000 - 500)) + 1500),
            startX = rInt(-100, (screenWidth + 100)),
            startY = rInt(-100, (screenHeight + 100));
            
        setTimeout(function () {
            meteor(startX, startY);
        }, rTimeout);
    };
    
    function initializeInterests() {
        interests = {
            sheri: new Interest("sheri", -82),
            computers: new Interest("computers", 180),
            nature: new Interest("nature", 55),
            games: new Interest("games", -40),
            cars: new Interest("cars", 0)
        };
    };
    
    function setShadowLength() {
        var centerY = screenHeight / 2,
            centerX= screenWidth / 2,
            length = Math.floor(Math.sqrt(Math.pow(0 - centerX, 2) + Math.pow(screenHeight - centerY, 2)));
        
        $("#earthShadow").css("width", length);
    };
    
    $(function() {
        setShadowLength();
        
        initializeInterests();
        
        initializeStars();
        
        meteorShower();
        
        TweenLite.to($planetEarth, 0, {
            css:{
                rotationZ: curEarthAngle
            }
        });
        
        setInterval(function(){
            rotateEarth();
        }, 60);
        
        //setInterval(function(){
        //    if (debugPage == true) {
        //        debug ("worldTurns:" + worldTurns + "<br>", true);
        //        debug ("infoPanelOpen:" + infoPanelOpen + "<br>");
        //        debug ("earthInTransit:" + earthInTransit + "<br>");
        //        debug ("animating:" + animating + "<br>");
        //    }
        //    if (isMobile) {
        //        debug(screenWidth);
        //    }
        //}, 500);
        
        window.addEventListener ("touchmove", function (event) { event.preventDefault (); }, false);
        
        if (typeof window.devicePixelRatio != 'undefined' && window.devicePixelRatio > 2) {
            var meta = document.getElementById ("viewport");
            if (meta != null) {
                meta.setAttribute ('content', 'width=device-width, initial-scale=' + (2 / window.devicePixelRatio) + ', user-scalable=no');
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
    });
}());