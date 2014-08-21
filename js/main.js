(function () {
    var $doc = $(document),
        $win = $(window),
        $theStars = $("#theStars"),
        $theHeavens = $("#theHeavens"),
        $planetEarth = $("#planetEarth"),
        $ourHero = $("#ourHero"),
        $heroStatus = $("#ourHero>#status"),
        $infoPanel = $("#infoPanel"),
        $stars,
        isWebkit = /Webkit/i.test(navigator.userAgent),
        isChrome = /Chrome/i.test(navigator.userAgent),
        isMobile = !!("ontouchstart" in window),
        isAndroid = /Android/i.test(navigator.userAgent),
        isIE = document.documentMode,
        keys = [],
        interests = {},
        worldTurns = true,
        infoPanelOpen = false,
        earthInTransit = false,
        curEarthAngle = -4000,
        konami = "38,38,40,40,37,39,37,39,66,65",
        currentInterest,
        screenWidth = window.innerWidth,
        screenHeight = window.innerHeight;
    
    (function ($) {
        $.fn.rotate = 
            function (degree, duration) {
                var deg = degree + "deg";
                
                TweenLite.to($(this), duration, {
                    css:{
                        rotationZ: deg
                    }, onComplete: 
                            function () {
                                if(typeof callbackFn === "function"){
                                    callbackFn.call(this, data);
                                }
                            } 
                });
            };
            
        $.fn.rotateEarthToInterest = 
            function (interestId) {
                if (earthInTransit) { return false; };
                
                currentInterest = '';
                
                var targetAngle = getTargetAngle(interestId);
                
                if (curEarthAngle != targetAngle) {
                    //We're not currently at this interest, so we need to 
                    //    go to a new interest.
                    worldTurns = false;
                    earthInTransit = true;

                    $ourHero.updateHeroStatus(targetAngle);
                    
                    TweenLite.to($planetEarth, 2, {
                        css:{
                            rotationZ: targetAngle + "deg"
                        },
                            ease:Power1.easeInOut,
                            onComplete: 
                                function () {
                                    currentInterest = interests[interestId].name;
                                    
                                    curEarthAngle = targetAngle;
                                    
                                    $ourHero.updateHeroStatus(targetAngle);
                                    
                                    zoomIn($("#" + interestId + "Content").openInfoPanel());
                                    
                                    if(typeof callbackFn === "function"){
                                        callbackFn.call(this, data);
                                    }
                                } 
                    });
                } else { 
                    //The world keeps turning.
                    worldTurns = true;
                    earthInTransit = false;
                }
            };
            
        $.fn.updateHeroStatus =
            function(targetAngle) {
                $heroStatus.hide();
                
                if (targetAngle != null) {
                    if (targetAngle > curEarthAngle) {
                        //Face our hero left if we're rotating clockwise.
                        $(this).actorAnimate("walking", true);
                    } else {
                        //Face our hero right if we're rotating counter-clockwise.
                        $(this).actorAnimate("walking");
                    }
                    
                    if (curEarthAngle === targetAngle) {
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
                $infoPanel.empty();
                
                $(this).clone().appendTo("#infoPanel").show();
                
                $("#infoPanel").show();
                
                TweenLite.to($infoPanel, 0.8, {
                    css:{
                        opacity: 1,
                        top: pos.top + "px",
                        left: (pos.left + width) + "px"
                    }, onComplete: 
                            function () {
                                if(typeof callbackFn === "function"){
                                    callbackFn.call(this, data);
                                }
                                earthInTransit = false
                                infoPanelOpen = true;
                            }
                });
            };
            
        $.fn.closeInfoPanel = 
            function (callbackFn) {
                if (!infoPanelOpen) { return; };
                
                currentInterest = '';
                
                infoPanelOpen = false;
                
                TweenLite.to($infoPanel, 0.8, {
                    css:{
                        top: "-100px", 
                        opacity: 0
                    }, onComplete: 
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
                });
            };
            
        $.fn.actorAnimate = 
            function (state, hflip, callbackFn) {
                var flip = (typeof hflip === "undefined") ? "false" : hflip;
                
                var cssClass = state;
                
                if (flip === true) {
                    cssClass += " flipped";
                }
                
                if (!$(this).hasClass(cssClass)) {
                    $(this).removeClass();
                    
                    $(this).addClass(cssClass);
                }
                
                if(typeof callbackFn === "function"){
                    callbackFn.call(this, data);
                }
            }
    })(jQuery);
        
    $doc.on("mousemove", $theStars, 
        function (e) {
            if (!infoPanelOpen) {
                
                var mousePos = mouseCoords(e),
                    bgPosX = (50 * (mousePos.x / window.innerWidth)),
                    bgPosY = (50 * (mousePos.y / window.innerHeight));
                
                for (i = 0; i < $stars.length; i++) {
                    var star = $stars[i],
                        scale = getScale(star);
                    
                    TweenLite.to(star, 0.6, {
                        css:{
                            top:bgPosY * scale,
                            left:bgPosX * scale
                        }
                    });
                }
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
    
    function Interest(name, locationAngle) {
        this.name = name;
        this.locationAngle = locationAngle;
        this.el = $("#" + this.name);
    }
    
    function zoomIn(callbackFn) {
            TweenLite.to($theHeavens, 2, {
                css:{
                    scale: 2, 
                    top: 500,
                    z:1
                }, 
                    ease:Power1.easeInOut,
                    onComplete: 
                        function () {
                            if(typeof callbackFn === "function"){
                                callbackFn.call(this, data);
                            }
                        } 
            });
        };
    
    function zoomOut(callbackFn) {
            TweenLite.to($theHeavens, 2, {
                css:{
                    scale: 1, 
                    top: 0,
                    z:1
                }, 
                    ease:Power1.easeInOut,
                    onComplete: 
                        function () {
                            if(typeof callbackFn === "function"){
                                callbackFn.call(this, data);
                            }
                        }
            });
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
            shortestAngle += 360
        }

        //Create our final rotation angle, accounting for current
        //    count of rotations and the shortest direction
        //    (clockwise or counter-clockwise.)
        var adjustedTargetAngle = (remainder + shortestAngle) + fullRotations;
        
        return adjustedTargetAngle;
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
            var el = $stars[i],
                x = rInt(-50, (screenWidth + 50)),
                y = rInt(-50, (screenHeight + 50)),
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
        
            TweenLite.to($stars[i], 0, {
                css:{
                    x:x, 
                    y:y, 
                    z:1, 
                    scale:s, 
                    opacity: op,
                    backgroundColor: rgb,
                    boxShadow: bs
                }, onComplete: twinkle(el)
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
        
        setTimeout(function() {
            TweenLite.to(el, animationDuration, {
                css:{
                    opacity: op,
                    backgroundColor: rgb,
                    boxShadow: bs
                }, onComplete:twinkle($(el))
            });
        }, timeoutDuration);
    };
    
    function meteor(startX, startY) {
        var d = $('<span />');
        
        d.addClass("meteor")
            .appendTo($theHeavens)
            .css("top", startY)
            .css("left", startX);
        
        TweenLite.to(d, 0.3, {
            css:{
                x: "-100px", 
                y: "+100px"
            }, 
            onComplete: 
                function () { 
                    d.remove();
                    meteorShower();
                }
        });
    };
        
    function meteorShower() {
        var rTimeout = Math.round((Math.random() * (3000 - 500)) + 1000),
            startX = rInt(-50, (screenWidth + 50)),
            startY = rInt(-50, (screenHeight + 50));
            
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
    
    $(function() {
        initializeInterests();
        
        initializeStars();
        
        meteorShower();
        
        setInterval(function(){
            rotateEarth();
        }, 60);
    });
}());