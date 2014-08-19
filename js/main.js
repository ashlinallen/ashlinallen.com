(function () {
	var isWebkit = /Webkit/i.test(navigator.userAgent),
		isChrome = /Chrome/i.test(navigator.userAgent),
		isMobile = !!("ontouchstart" in window),
		isAndroid = /Android/i.test(navigator.userAgent),
		isIE = document.documentMode,
		screenWidth = window.innerWidth,
		screenHeight = window.innerHeight,
		chromeHeight = screenHeight - (document.documentElement.clientHeight || screenHeight),
		$stars,
		$container = $("#theStars"),
		enableStarMovement = true,
		worldTurns = true,
		infoPanelOpen = false,
		earthInTransit = false,
		enableStarMovement = true,
		curEarthAngle = -4000,
		animationSpeed = 800,
		animationTransition = "easeInOutSine",
		keys = [],
		konami = "38,38,40,40,37,39,37,39,66,65",
		interests = {},
		doc = $(document),
		win = $(window),
		planetEarth = $("#planetEarth"),
		ourHero = $("#ourHero"),
		heroStatus = $("#ourHero>#status");
	
    (function ($) {
        $.fn.rotate = 
			function (degree, duration) {
				var deg = degree + "deg";
                $(this).animate(
					{ rotationZ: deg },
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
					.animate(
                        { 
							rotationZ: adjustedTargetAngle + "deg" 
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
									.animate(
										{ 
											scale: 2, 
											y: 500,
											z:1
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
                $("#infoPanel").stop().animate(
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
								.animate(
									{ 
										scale: 1, 
										y: 0,
										z:1
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
				.animate(
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
		
    $(document).on("mousemove", $container, 
        function (e) {
			if (enableStarMovement) {
				enableStarMovement = false;
				
				var mousePos = mouseCoords(e);
				var bgPosX = (50 * (mousePos.x / $(window).width()));
				var bgPosY = (50 * (mousePos.y / $(window).height()));
				
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
    doc.on("mouseup", "#theHeavens, #infoPanel>span>i", 
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
	
	win.resize(function() {
		setStarPositions();
	});
	
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
	
	function initializeStars() {
		var starsCount = isMobile ? (isAndroid ? 20 : 40) : (isChrome ? 100 : 70),
			starsHtml = "";

		for (var i = 0; i < starsCount; i++) {
			starsHtml += "<span class='star' />";
		}
		
		$stars = $(starsHtml);
	
		if (isWebkit) {
			$stars.css("boxShadow", "0px 0px 6px 1px #FFF");
		}
		
		
		$stars.appendTo($container);
		setStarPositions();
	}
	
	function setStarPositions() {
		screenWidth = window.innerWidth;
		screenHeight = window.innerHeight;
		
		for (i = 0; i < $stars.length; i++) {
			var op = rFloat(0.0, 1.0),
			x = rInt(-50, (screenWidth + 50)),
			y = rInt(-50, (screenHeight + 50)),
			s = rFloat(0.1, 1.0),
			el = $stars[i],
			red = rInt(0,255),
			green = rInt(0,255),
			blue = rInt(0,255),
			white = rInt(1,3),
			rgb = "rgb(" + red + "," + green + "," + blue + ")";
			
			var white = rInt(1,7);
			if (white >= 1 && white <= 6) {
				rgb = "rgb(255,255,255)";
			}
			
			var bs = "0px 0px 6px 1px " + rgb;
		
			TweenLite.to($stars[i], 0, {
				css:{
					x:x, 
					y:y, 
					z:1, 
					scale:s, 
					opacity: op,
					boxShadow: bs,
					backgroundColor: rgb
				}, onComplete:twinkle(el)
			});
		}
	}
	
	function twinkle(el) {
		var op = rFloat(0.0, 1.0),
		animationDuration = rFloat(0.2,2.0),
		timeoutDuration = rInt(500, 1000),
		red = rInt(0,255),
		green = rInt(0,255),
		blue = rInt(0,255),
		white = rInt(1,3),
		rgb = "rgb(" + red + "," + green + "," + blue + ")";
		
		//6 in 7 odds of getting a white star.
		var white = rInt(1,7);
		if (white >= 1 && white <= 6) {
			rgb = "rgb(255,255,255)";
		}
		
		var bs = "0px 0px 6px 1px " + rgb;
		
		setTimeout(function() {
			TweenLite.to($(el), animationDuration, {
				css:{
					opacity: op,
					boxShadow: bs,
					backgroundColor: rgb
				}, onComplete:twinkle($(el))});
		}, timeoutDuration);
	};
	
	//Meteor builder.
    function meteor(startX, startY)
    {
        var d = $('<span />');
		d.addClass("meteor")
		.appendTo($("#theHeavens"))
		.css("top", startY)
		.css("left", startX)
		.animate(
			{ 
				x: "-300px", 
				y: "300px",
				rotationZ: "-45deg"
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
		
		initializeStars();
		
		meteorShower();
		
		setInterval(function(){
			enableStarMovement = true;
			rotateEarth();
		}, 60);
	});
}());