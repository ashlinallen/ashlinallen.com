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
        isIE = document.documentMode,
        keys = [],
        interests = {},
        worldTurns = true,
        infoPanelOpen = false,
        earthInTransit = false,
        animating = false,
        zoomed = false,
        curEarthAngle = -4000,
        konami = "38,38,40,40,37,39,37,39,66,65",
        currentInterest,
        screenWidth = window.innerWidth,
        screenHeight = window.innerHeight;
        //isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows()
    
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
            if (!infoPanelOpen && !animating) {
                
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
            
            initializeStars();
        }
    )
            
    function Interest(name, locationAngle) {
        this.name = name;
        this.locationAngle = locationAngle;
    }
            
    function closeInfoPanel() {
        if (infoPanelOpen) {
            animating = true;
            TweenLite.to($infoPanel, 0.8, {
                css:{
                    scale: 1.25,
                    opacity: 0
                }, onComplete: 
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
            }, onComplete: 
                    function () {
                        animating = false;
                        earthInTransit = false
                        infoPanelOpen = true;
                    }
        });
    };
    
    function zoomIn(callbackFn) {
            animating = true;
            
            TweenLite.to($("#containerTester"), 2, {
                css:{
                    y: 200
                }, 
                    ease:Power1.easeInOut
            });
            
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
            
            TweenLite.to($("#containerTester"), 2, {
                css:{
                    y: 0
                }, 
                    ease:Power1.easeInOut
            });
            
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
    
    //function rotateEarthToAngle(targetAngle, interestId) {
    //    worldTurns = false;
    //    earthInTransit = true;
    //
    //    var blah = setInterval(function(){
    //        
    //        if (curEarthAngle.toFixed(0) != targetAngle) {
    //            curEarthAngle -= 0.1;
    //            
    //            TweenLite.to($planetEarth, 0, {
    //                css:{
    //                    rotationZ: curEarthAngle
    //                }
    //            });
    //        
    //            rotateEarthToAngle(targetAngle, interestId);
    //        } else {
    //            animating = false;
    //            currentInterest = interests[interestId].name;
    //            earthInTransit = false;
    //            updateHeroStatus(targetAngle);
    //            clearInterval(blah);
    //            zoomIn(function() { openInfoPanel(interestId) });
    //        }
    //        
    //        updateHeroStatus(targetAngle);
    //    }, 60);
    //    
    //};
    
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
            shortestAngle += 360
        }

        //Create our final rotation angle, accounting for current
        //    count of rotations and the shortest direction
        //    (clockwise or counter-clockwise.)
        var adjustedTargetAngle = (remainder + shortestAngle) + fullRotations;
        
        return adjustedTargetAngle;
    };
    
    function initializeStars() {
        var starsCount = isMobile ? (isMobile.Android() ? 20 : 40) : (isChrome ? 100 : 70),
            starsHtml = "";
        $(".star").remove();

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
                }, onComplete: twinkle(el)
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
        
        TweenLite.to($planetEarth, 0, {
            css:{
                rotationZ: curEarthAngle
            }
        });
        
        setInterval(function(){
            rotateEarth();
        }, 60);
        
        setInterval(function(){
            //debug ("worldTurns:" + worldTurns + "<br>", true);
            //debug ("infoPanelOpen:" + infoPanelOpen + "<br>");
            //debug ("earthInTransit:" + earthInTransit + "<br>");
            //debug ("animating:" + animating + "<br>");
        }, 500);
        
        window.addEventListener ("touchmove", function (event) { event.preventDefault (); }, false);
        if (typeof window.devicePixelRatio != 'undefined' && window.devicePixelRatio > 2) {
            alert("hit");
        }
        
        var meta = document.getElementById ("viewport");
        meta.setAttribute ('content', 'width=device-width, initial-scale=' + (2 / window.devicePixelRatio) + ', user-scalable=no');
    });
}());