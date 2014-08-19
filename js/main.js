(function () {
    var $doc = $(document),
        $win = $(window),
        
        $theStars = $("#theStars"),
        $theHeavens = $("#theHeavens"),
        $planetEarth = $("#planetEarth"),
        $ourHero = $("#ourHero"),
        $heroStatus = $("#ourHero>#status"),
        
        isWebkit = /Webkit/i.test(navigator.userAgent),
        isChrome = /Chrome/i.test(navigator.userAgent),
        isMobile = !!("ontouchstart" in window),
        isAndroid = /Android/i.test(navigator.userAgent),
        isIE = document.documentMode,
        
        keys = [],
        interests = {},
        $stars,
        
        enableStarMovement = true,
        worldTurns = true,
        infoPanelOpen = false,
        earthInTransit = false,
        enableStarMovement = true,
        curEarthAngle = -4000,
        animationSpeed = 800,
        konami = "38,38,40,40,37,39,37,39,66,65",
        animationEasing = "easeInOutSine",
        currentInterest,
        
        screenWidth = window.innerWidth,
        screenHeight = window.innerHeight,
        chromeHeight = screenHeight - (document.documentElement.clientHeight || screenHeight);
    
    (function ($) {
        $.fn.rotate = 
            function (degree, duration) {
                var deg = degree + "deg";
                $(this).animate(
                    { rotationZ: deg },
                    { duration: duration }
                );
            };
            
        $.fn.rotateEarthToInterest = 
            function (interestId) {
                if (earthInTransit) { return false; };
                
                currentInterest = '';
                
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
                    shortestAngle += 360
                }

                //Create our final rotation angle, accounting for current
                //    count of rotations and the shortest direction
                //    (clockwise or counter-clockwise.)
                var adjustedTargetAngle = (remainder + shortestAngle) + fullRotations;
                
                if (curEarthAngle != adjustedTargetAngle) {
                    //We're not currently at this interest, so we need to 
                    //    go to a new interest.
                    worldTurns = false;
                    earthInTransit = true;

                    $ourHero.updateHeroStatus(adjustedTargetAngle);
                    
                    $planetEarth
                    .stop()
                    .animate(
                        { 
                            rotationZ: adjustedTargetAngle + "deg" 
                        },
                        { 
                            duration: 1500,
                            complete: 
                                function () {
                                    currentInterest = interests[interestId].name;
                                    
                                    curEarthAngle = adjustedTargetAngle;
                                    
                                    $ourHero.updateHeroStatus(adjustedTargetAngle);
                                    
                                    zoomIn($("#" + interestId + "Content").openInfoPanel());
                                }
                        }
                    );
                } else { 
                    //The world keeps turning.
                    worldTurns = true;
                    earthInTransit = false;
                }
            };
            
        $.fn.updateHeroStatus =
            function(adjTargetAngle) {
                $heroStatus.hide();
                
                if (adjTargetAngle != null) {
                    if (adjTargetAngle > curEarthAngle) {
                        //Face our hero left if we're rotating clockwise.
                        $(this).actorAnimate("walking", true);
                    } else {
                        //Face our hero right if we're rotating counter-clockwise.
                        $(this).actorAnimate("walking");
                    }
                    
                    if (curEarthAngle === adjTargetAngle) {
                        //We're at our interest, so just stand still.
                        $(this).actorAnimate("standing");
                    }
                } else {
                    $(this).actorAnimate("walking");
                }
                
                if (currentInterest === 'sheri') {
                    $heroStatus.show();
                } else {
                    $heroStatus.hide();
                }
            };
            
        $.fn.openInfoPanel = 
            function (callbackFn) {
                if (infoPanelOpen) { return; };
                
                var pos = $ourHero.position(),
                    width = $ourHero.outerWidth();
                
                worldTurns = false;
                
                //Clone our interest content to the infoPanel and show it.
                $("#infoPanel").empty();
                
                $(this).clone().appendTo("#infoPanel").show();
                
                $("#infoPanel")
                .stop()
                .show()
                .animate(
                    {
                        opacity: 1,
                        top: pos.top + "px",
                        left: (pos.left + width) + "px"
                    },
                    {
                        duration: 800,
                        easing: animationEasing,
                        complete: 
                            function () {
                                if(typeof callbackFn === "function"){
                                    callbackFn.call(this, data);
                                }
                                earthInTransit = false
                                infoPanelOpen = true;
                            }
                    }
                );
            };
            
        $.fn.closeInfoPanel = 
            function (callbackFn) {
                if (!infoPanelOpen) { return; };
                
                currentInterest = '';
                
                $("#infoPanel i").hide();
                
                //Animate the infoPanel into hiding.
                infoPanelOpen = false;
                
                $("#infoPanel").stop().animate(
                    {
                        top: "-100px", 
                        opacity: 0
                    },
                    {
                        duration: 800,
                        easing: animationEasing,
                        complete: 
                            function () {
                                if(typeof callbackFn === "function"){
                                    callbackFn.call(this, data);
                                }
                                
                                $("#infoPanel").hide(0, '', 
                                    function() { 
                                        infoPanelOpen = false 
                                    }
                                );
                            }
                    }
                );
            };
            
        $.fn.actorAnimate = 
            function (state, hflip, callbackFn) {
                var flip = (typeof hflip === "undefined") ? "false" : hflip;
                
                $(this).removeClass();
                
                $(this).addClass(state);
                
                if (flip === true) {
                    $(this).addClass("flipped");
                }
                
                if(typeof callbackFn === "function"){
                    callbackFn.call(this, data);
                }
            }
    })(jQuery);
        
    $doc.on("mousemove", $theStars, 
        function (e) {
            if (enableStarMovement && !infoPanelOpen) {
                enableStarMovement = false;
                
                var mousePos = mouseCoords(e),
                    bgPosX = (50 * (mousePos.x / window.innerWidth)),
                    bgPosY = (50 * (mousePos.y / window.innerHeight));
                
                $stars
                    .animate(
                        { 
                            top:bgPosY,
                            left:bgPosX
                        }, 
                        {
                            duration: 30, 
                            queue: false, 
                            complete: 
                                function() { 
                                    enableStarMovement = true; 
                                    twinkle($(this));
                                } 
                        }
                    );
            }
        }
    );

    $doc.on("click", "#planetEarth>a", 
        function () {
            if (earthInTransit) { return false; };
            
            var interestId = $(this).attr("id");
                
            if (!infoPanelOpen) {
                $ourHero.updateHeroStatus();
                
                $(this).closeInfoPanel(
                    $(this).rotateEarthToInterest(interestId)
                );
            } else {
                $(this).rotateEarthToInterest(interestId);
            }
        }
    );
    
    $doc.on("mouseup", "#theHeavens, #infoPanel>span>i", 
        function (e) {
            if (earthInTransit) { return false; };
            
            if (infoPanelOpen) {
                $(this).closeInfoPanel(
                    worldTurns = true
                );
                
                if(e.target.tagName.toLowerCase() != 'a') {
                    zoomOut();
                }
                
                $ourHero.updateHeroStatus();
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
            
            setStarPositions();
        }
    )
    
    function Interest(name, locationAngle, rotation) {
        this.name = name;
        this.locationAngle = locationAngle;
        this.rotation = rotation;
        this.el = $("#" + this.name);
    }
    
    function zoomIn(callbackFn) {
            $theHeavens
            .stop()
            .animate(
                { 
                    scale: 2, 
                    top: 500,
                    z:1
                }, 
                { 
                    duration: 2000,
                    complete:
                        function () {
                            if(typeof callbackFn === "function"){
                                callbackFn.call(this, data);
                            }
                        } 
                }
            );
        };
    
    function zoomOut(callbackFn) {
            $theHeavens
            .stop()
            .animate(
                { 
                    scale: 1, 
                    top: 0,
                    z:1
                }, 
                { 
                    duration: 2000,
                    complete:
                        function () {
                            if(typeof callbackFn === "function"){
                                callbackFn.call(this, data);
                            }
                        }
                }
            );
        };
        
    function rotateEarth() {
        if (worldTurns) {
            curEarthAngle -= 0.3;
            $planetEarth.rotate(curEarthAngle, 0);
            $ourHero.actorAnimate("walking");
        };
    }; 
    
    function initializeStars() {
        var starsCount = isMobile ? (isAndroid ? 20 : 40) : (isChrome ? 100 : 70),
            starsHtml = "";

        for (var i = 0; i < starsCount; i++) {
            starsHtml += "<span class='star' />";
        }
        
        $stars = $(starsHtml);
        
        $stars.appendTo($theStars);
        
        setStarPositions();
    }
    
    function setStarPositions() {
        for (i = 0; i < $stars.length; i++) {
            var x = rInt(-50, (screenWidth + 50)),
                y = rInt(-50, (screenHeight + 50)),
                s = rFloat(0.1, 1.0),
                el = $stars[i],
                rgb = "rgb(255,255,255)",
                colorLottery = rInt(1,7),
                op = rFloat(0.0, 1.0),
                bs = "0px";
            
            //1 in 7 odds of getting a color star.
            if (colorLottery === 7) {
                var red = rInt(0,255),
                    green = rInt(0,255),
                    blue = rInt(0,255),
                    rgb = "rgb(" + red + "," + green + "," + blue + ")";
            }
            
            if (isWebkit) {
                bs = "0px 0px 6px 1px " + rgb;
            }
        
            TweenLite.to($stars[i], 0, {
                css:{
                    x:x, 
                    y:y, 
                    z:1, 
                    scale:s, 
                    opacity: op,
                    boxShadow: bs,
                    backgroundColor: rgb
                }, onComplete: twinkle(el)
            });
        }
    }
    
    function twinkle(el) {
        var animationDuration = rFloat(0.2,2.0),
            timeoutDuration = rInt(500, 1000),
            rgb = "rgb(255,255,255)",
            colorLottery = rInt(1,7),
            op = rFloat(0.0, 1.0),
                bs = "0px";
        
        //1 in 7 odds of getting a color star.
        if (colorLottery === 7) {
            var red = rInt(0,255),
                green = rInt(0,255),
                blue = rInt(0,255),
                rgb = "rgb(" + red + "," + green + "," + blue + ")";
        }
        
        if (isWebkit) {
            bs = "0px 0px 6px 1px " + rgb;
        }
        
        setTimeout(function() {
            TweenLite.to($(el), animationDuration, {
                css:{
                    opacity: op,
                    boxShadow: bs,
                    backgroundColor: rgb
                }, onComplete:twinkle($(el))
            });
        }, timeoutDuration);
    };
    
    function meteor(startX, startY) {
        var d = $('<span />');
        d.addClass("meteor")
            .appendTo($theHeavens)
            .css("top", startY)
            .css("left", startX)
            .animate(
                { 
                    x: "-300px", 
                    y: "300px"
                },
                {
                    duration: 300,
                    complete: 
                        function () { 
                            $(this).remove();
                            meteorShower();
                        }
                }    
            );
    };
        
    function meteorShower() {
        var rand = Math.round((Math.random() * (3000 - 500)) + 1000),
            startX = rInt(-50, (screenWidth + 50)),
            startY = rInt(-50, (screenHeight + 50));
            
        setTimeout(function () {
            meteor(startX, startY);
        }, rand);
    };
    
    function initiateInterests() {
        //Create array of interests.
        interests = {
            sheri: new Interest("sheri", -82, 90),
            computers: new Interest("computers", 180, 186),
            nature: new Interest("nature", 55, -43),
            games: new Interest("games", -40, 55),
            cars: new Interest("cars", 0, 19)
        };
    
        //Set up interest rotations. Maybe move this to CSS?
        for (var key in interests) {
            if (interests.hasOwnProperty(key))
            {
                var interest = interests[key];
                
                interest.el.rotate(interest.rotation, 0);
            }
        };
    };
    
    $(function() {
        initiateInterests();
        
        initializeStars();
        
        meteorShower();
        
        setInterval(function(){
            enableStarMovement = true;
            rotateEarth();
        }, 60);
    });
}());