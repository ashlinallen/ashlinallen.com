function debug(string) {
    var curDebugHtml = $("#debugCol").html();
    $("#debugCol").show();
    $("#debugCol").html(curDebugHtml + "\n<br>\n" + string + "\n");
}

(function () {
    //Constants and variables.
    var worldTurns = true;
    var infoPanelOpen = false;
    var earthInTransit = false;
	var enableStarMovement = true;
    var curEarthAngle = -4000;
    var animationSpeed = 800;
    var animationTransition = "easeInOutSine";
    var keys = [];
    var konami = "38,38,40,40,37,39,37,39,66,65";
	var interests = {};
    
    //Frequently used elements
    var doc = $(document);
    var planetEarth = $("#planetEarth");
    var ourHero = $("#ourHero");
    var heroStatus = $("#ourHero>#status");
	
    (function ($) {
        $.fn.rotate = 
			function (degree, duration) {
				var deg = degree + "deg";
                $(this).velocity(
					{ rotateZ: deg },
					{ duration: duration }
				);
            };
			
        $.fn.animateEarthTo = 
            function (interestId) {
				if (earthInTransit) { return false; };
			
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
                    
                    planetEarth
					.stop()
					.velocity(
                        { 
							rotateZ: adjustedTargetAngle + "deg" 
						},
                        { 
							duration: 1500,
							complete: 
								function () {
									curEarthAngle = adjustedTargetAngle;
									ourHero.actorAnimate("standing");
									
									if (targetAngle === -82) {
										heroStatus.show();
									} else {
										heroStatus.hide();
									}
									
									$("#theHeavens")
									.stop()
									.velocity(
										{ 
											scale: 2, 
											marginTop: '300px' 
										}, 
										{ 
											duration: 2000 
										}
									);
									
									setTimeout(function () {
										$("#" + interestId + "Content").openInfoPanel();
									}, 1000);
									
									setTimeout(function () {
										earthInTransit = false;
									}, 3000);
								}
						}
					);
                } else { 
                    //The world keeps turning.
                    worldTurns = true;
                    earthInTransit = false;
                }
            };
			
        $.fn.closeInfoPanel = 
            function (callbackFn) {
				if (!infoPanelOpen) { return; };
                $("#infoPanel i").hide();
                heroStatus.hide();
                
                //Animate the infoPanel into hiding.
                infoPanelOpen = false;
                $("#infoPanel").stop().velocity(
                    {
                        top: "-100px", 
						opacity: 0
					},
					{
                        duration: 1000,
                        easing: animationTransition,
						complete: 
							function () {
								if(typeof callbackFn === "function"){
									callbackFn.call(this, data);
								}
								
								$("#infoPanel").hide();
								
								
								$("#theHeavens")
								.stop()
								.velocity(
									{ 
										scale: 1, 
										marginTop: '0px' 
									}, 
									{ 
										duration: 2000 
									}
								);
								
								setTimeout(function () {
									infoPanelOpen = false;
								}, 2000);
							}
                    }
                );
            };
			
        $.fn.openInfoPanel = 
            function (callbackFn) {
				if (infoPanelOpen) { return false; };
				
				worldTurns = false;
				
				//Clone our interest content to the infoPanel and show it.
				$("#infoPanel").empty();
				
				$(this).clone().appendTo("#infoPanel").show();
				
				$("#infoPanel")
				.stop()
				.show()
				.velocity(
					{
						top: "-80px", 
						opacity: 1
					},
					{
						duration: 800,
						easing: animationTransition,
						complete: 
							function () {
								if(typeof callbackFn === "function"){
									callbackFn.call(this, data);
								}
								
								setTimeout(function () {
									infoPanelOpen = true;
								}, 2000);
							}
					}
				);
            };
			
        $.fn.actorAnimate = function (state, hflip, callbackFn) {
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

    //Move the heavens!
    doc.on("mousemove", "#theHeavens", 
        function (e) {
			if (enableStarMovement && !infoPanelOpen) {
				enableStarMovement = false;
				
				var mousePos = mouseCoords(e);
				var bgPosX = -200 + (100 * (mousePos.x / $(window).width()));
				var bgPosY = -200 + (100 * (mousePos.y / $(window).height()));
				
				$("#theStars").stop().velocity(
					{
						backgroundPositionX: bgPosX + "px",
						backgroundPositionY: bgPosY + "px"
					},
					{
						duration: 1000
					}
				);
			}
        }
    );

    //Interesting.
    doc.on("click", "#planetEarth>a", 
        function () {
            if (earthInTransit) { return false; };
            
            var interestId = $(this).attr("id");
            
            $(this).closeInfoPanel(
                $(this).animateEarthTo(interestId)
            );
        }
    );
    
    //Hide infoPanel when clicking theHeavens or the close icon in the infoPanel
    doc.on("mouseup", "#theHeavens, #infoPanel>div>i", 
        function () {
            if (earthInTransit) {
                return false;
            }
            
            $(this).closeInfoPanel(
                worldTurns = true
            );
        }
    );
	
	//You know what to do.  ;)
    doc.on("keydown",
        function (e) {
            keys.push(e.keyCode);
            if (keys.toString().indexOf(konami) >= 0) {
                alert("konami'd");
                keys = [];
            }
        }
    );
	
    //Interest object constructor
    function Interest(name, locationAngle, rotation)
    {
        this.name = name;
        this.locationAngle = locationAngle;
		this.rotation = rotation;
		this.el = $("#" + this.name);
    }
	
	//Rotate the earth and make sure the sprite is in its "walking" animation.
	function rotateEarth() {
		if (worldTurns) {
			curEarthAngle -= 0.3;
			planetEarth.rotate(curEarthAngle, 0);
			ourHero.actorAnimate("walking");
		};
	};
	
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
	
	//Meteor builder.
    function meteor(startX, startY)
    {
        var d = $('<span />');
		d.addClass("meteor")
		.appendTo($("#theHeavens"))
		.css("top", startY)
		.css("left", startX)
		.velocity(
			{ 
				x: "-300px", 
				y: "300px",
				rotateZ: "-45deg"
			},
			{
				duration: 200,
				complete: 
					function () { 
						$(this).remove();
					}
			}
		);
    }
		
	//Make it rain.
	function meteorShower() {
		var rand = Math.round(Math.random() * (3000 - 500)) + 1000;
		var startX = Math.round(Math.random() * $(window).width());
		var startY = Math.round(Math.random() * $(window).height());
		
		setTimeout(function () {
			meteor(startX, startY);
			meteorShower();
		}, rand);
	};
	
	//Instantiate interests and iterate over them to set their rotation.
	function initiateInterests() {
		interests = {
			sheri: new Interest("sheri", -82, 90),
			computers: new Interest("computers", 180, 186),
			nature: new Interest("nature", 55, -43),
			games: new Interest("games", -40, 55),
			cars: new Interest("cars", 0, 19)
		}
	
		for (var key in interests) {
			if (interests.hasOwnProperty(key))
			{
				var interest = interests[key];
				
				interest.el.rotate(interest.rotation, 0);
			}
		}
	};
	
	//Doc ready.
	$(function() {
		initiateInterests();
		
		setInterval(function(){
			enableStarMovement = true;
			rotateEarth();
		}, 60);
		
		meteorShower();
	});
}());