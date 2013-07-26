function debug(string) {
    var curDebugHtml = $("#debugCol").html();
    $("#debugCol").show();
    $("#debugCol").html(curDebugHtml + "\n<br>\n" + string + "\n");
}

(function () {
    //Constants and variables.
    var worldTurns = true;
    var trayOpen = false;
    var earthInTransit = false;
    var curEarthAngle = -4000;
    var animationSpeed = 800;
    var animationTransition = "easeInOutSine";
    var keys = [];
    var konami = '38,38,40,40,37,39,37,39,66,65';
    
    //Frequently used elements
    var doc = $(document);
    var planetEarth = $("#planetEarth");
    var ourHero = $("#ourHero");
    var heroStatus = $("#ourHero>#status");

    //Returns int for .x and .y
    function mouseCoords(ev) {
        if (ev.pageX || ev.pageY) {
            return { x: ev.pageX, y: ev.pageY };
        }
        return {
            x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
            y: ev.clientY + document.body.scrollTop - document.body.clientTop
        };
    }

    //Interest object constructor
    function interest(name, locationAngle, rotation)
    {
        this.name = name;
        this.locationAngle = locationAngle;
        $("#" + this.name).transition({rotate: rotation + "deg", duration:0});
    }

    //Array of interests
    var interests = {
        sheri: new interest('sheri', -82, 90),
        computers: new interest('computers', 180, 186),
        nature: new interest('nature', 55, -43),
        games: new interest('games', -40, 55),
        cars: new interest('cars', 0, 19)
    }
    
    //Spin on!
    setInterval(
        function () {   
            if (worldTurns) {
                curEarthAngle -= 0.3;
                ourHero.actorAnimate("walking");
                planetEarth.transition({
                    rotate: curEarthAngle + "deg",
                    duration: 0
                });
            };
        }, 40
    );

    //Move the heavens!
    doc.on("mousemove", "#theHeavens", 
        function (e) {
            if (trayOpen) {
                return false;
            }

            var mousePos = mouseCoords(e);
            var bgPosX = -100 + (100 * (mousePos.x / $(window).width()));
            var bgPosY = -100 + (100 * (mousePos.y / $(window).height()));
            
            $("#theStars").stop().animate(
                {
                    backgroundPositionX: bgPosX + "px",
                    backgroundPositionY: bgPosY + "px"
                }, 1500, "swing");
        }
    );

    //Interesting.
    doc.on("click", "#planetEarth>a", 
        function () {
            if (earthInTransit) {
                return false;
            }
            
            var interestId = $(this).attr("id");
            
            $(this).closeTray(
                $(this).animateEarthTo(interestId)
            );
        }
    );
    
    //Hide tray when clicking theHeavens or the close icon in the tray <i>
    doc.on("mouseup", "#theHeavens, #tray>div>i", 
        function () {
            if (earthInTransit) {
                return false;
            }
            
            $(this).closeTray(
                worldTurns = true
            );
        }
    );
    
    (function ($) {
        $.fn.animateEarthTo = 
            function (interestId) {
                var targetAngle = interests[interestId].locationAngle;
                var remainder = curEarthAngle % 360;
                var completedRotations = (curEarthAngle - remainder) / 360;
                var shortestAngle = targetAngle - remainder;
                var fullRotations = (360 * completedRotations);
                
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

                    if (adjustedTargetAngle > curEarthAngle) {
                        //Face our hero left if we're rotating clockwise.
                        ourHero.actorAnimate("walking", true);
                    } else {
                        //Face our hero right if we're rotating counter-clockwise.
                        ourHero.actorAnimate("walking");
                    }
                    
                    planetEarth.stop().transition(
                        {
                            rotate: adjustedTargetAngle + "deg", 
                            duration: 1500
                        }, 
                        function () {
                            curEarthAngle = adjustedTargetAngle;
                            earthInTransit = false;
                            ourHero.actorAnimate("standing");
                            $("#" + interestId + "Content").openTray();
                            
                            if (targetAngle == -82) {
                                heroStatus.show();
                            } else {
                                heroStatus.hide();
                            }
                        });
                } else { 
                    //The world keeps turning.
                    worldTurns = true;
                    earthInTransit = false;
                }
            };
    })(jQuery);

    (function ($) {
        $.fn.closeTray = 
            function (callbackFn) {
                var trayHeight = "-" + ($("#tray").height() + 5) + "px";
                $("#tray i").hide();
                heroStatus.hide();
                
                //Animate the tray into hiding.
                trayOpen = false;
                $("#tray").stop().transition(
                    {
                        top: trayHeight, 
                        duration: 1000,
                        easing: animationTransition
                    },
                    function () {
                        if(typeof callbackFn == "function"){
                            callbackFn.call(this, data);
                        }
                    }
                );
                    
                //Animate the heavens so that the top isn't cut off.
                $("#theHeavens").stop().transition(
                    {
                        marginTop: "0px", 
                        duration: 800,
                        easing: animationTransition
                    }
                );
            };
    })(jQuery);
    
    (function ($) {
        $.fn.openTray = 
            function (callbackFn) {
                //Clone our interest content to the tray and show it.
                $("#tray").empty();
                $(this).clone().appendTo("#tray").show();
                
                //Animate the tray so that it's visible.
                $("#tray i").show();
                trayOpen = true;
                worldTurns = false;
                $("#tray").stop().transition(
                    {
                        top: "0px", 
                        duration: 800,
                        easing: animationTransition
                    },
                    function () {
                        if(typeof callbackFn == "function"){
                            callbackFn.call(this, data);
                        }
                    }
                );
                        
                        
                //Animate the heavens so that the top isn't cut off.
                $("#theHeavens").stop().transition(
                    {
                        marginTop: "100px", 
                        duration: 800,
                        easing: animationTransition
                    }
                );
            };
    })(jQuery);

    (function ($) {
        $.fn.actorAnimate = function (state, hflip, callbackFn) {
            hflip = (typeof hflip === "undefined") ? "false" : hflip;
            $(this).removeClass();
            
            switch (state) {
                case "standing":
                    $(this).addClass("standing");
                    break;
                case "walking":
                    $(this).addClass("walking");
                    break;
            }
            
            if (hflip == true) {
                $(this).addClass("flipped");
            }
            
            if(typeof callbackFn == "function"){
                callbackFn.call(this, data);
            }
        }
    })(jQuery);

    $(document)
    .keydown(
        function (e) {
            keys.push(e.keyCode);
            if (keys.toString().indexOf(konami) >= 0) {
                //konamicode toy
                keys = [];
            }
        }
    );

    function meteor(startX, startY)
    {
        d = document.createElement('div');
        $(d).addClass('meteor')
            .appendTo($("#theHeavens"))
            .css("top", startY)
            .css("left", startX);
        $(d).transition({ x: '-300px', y: '300px', rotate: '-45deg', duration: 200 }, function () { $(d).remove() });
    }

    (function meteorLoop() {
        var rand = Math.round(Math.random() * (3000 - 500)) + 500;
        var startX = Math.round(Math.random() * $(window).width());
        var startY = Math.round(Math.random() * $(window).height());
        //var startX = 600;
        //var startY = 200;
        setTimeout(function () {
            meteor(startX, startY);
            meteorLoop();
        }, rand);
    }());
}());