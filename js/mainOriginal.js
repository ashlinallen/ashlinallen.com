(function () {
    //Constants and variables.
    var worldTurns = false;
    var trayOpen = false;
    var curEarthAngle = -50040;
    var animationSpeed = 850;
    var animationTransition = 'easeOutQuint';

	//Everything in its right place.
	$("#planetEarth").rotate(curEarthAngle);
    $("#computer").rotate(-55);
    $("#game").rotate(55);
    $("#nature").rotate(180);
    $("#sheri").rotate(90);

    //Move the heavens.
    $('#theHeavens').mousemove(function (e) {
        if (trayOpen) return;
		
		var mousePosX = Math.round((e.pageX / $(window).width()) * 20);
		var mousePosY = Math.round((e.pageY / $(window).height()) * 20);
		$('#theHeavens').stop().animate(
		{
			backgroundPositionX: mousePosX + '%',
			backgroundPositionY: mousePosY + '%'
		}, 1500, 'swing');
    });

    //The world keeps spinning.
    setInterval(function () {   
        if (!worldTurns) return;
		curEarthAngle -= 1;
		$("#planetEarth").rotate(curEarthAngle);
    }, 60);

	//Interesting.
    $(".interest").click(function () {
        closeTray();
		var id = $(this).attr('id');
		var target;
		var remainder = curEarthAngle % 360;
		var completedRotations = (curEarthAngle - remainder) / 360;
		
		switch (id) {
			case 'computer':
				target = -295;
				break;
			case 'game':
				target = -40;
				break;
            case 'nature':
                target = -165;
                break;
            case 'sheri':
                target = -82;
                break;
		}

		var shortestAngle = target - remainder;
		if (shortestAngle > 180) {
		    shortestAngle -= 360;
		}
		if (shortestAngle < -180) {
		    shortestAngle += 360
		}


		var adjustedTarget = (remainder + shortestAngle) + (360 * completedRotations);

		if (adjustedTarget > curEarthAngle) {
		    $("#ourHero").actorAnimate('walking', true);
		} else {
		    $("#ourHero").actorAnimate('walking');
		}
		
		if (curEarthAngle != adjustedTarget) {
		    curEarthAngle = adjustedTarget;
		    worldTurns = false;
		    $("#planetEarth")
                .rotate({
                    animateTo:
                    adjustedTarget,
                    specialEasing:
                    animationTransition,
                    duration: 1500,
                    callback: function () {
                        $("#" + id + "Content").openTray();
                    }
                });
		}
    });
	
    $("#tray").click(function () {
        closeTray();
    });

    (function ($) {
        $.fn.openTray = function () {
            $("#ourHero").actorAnimate('standing');

            trayOpen = true;

			$('#tray').empty();
			$(this).clone().appendTo('#tray').show();

            $('#tray').stop().animate({
                top: '0px'
            },
                {
                    duration: animationSpeed,
                    specialEasing: {
                        height: animationTransition
                    }
                });

            $("#verticalCenter").stop().animate({
                top: "60%"
            },
                {
                    duration: animationSpeed,
                    specialEasing: {
                        height: animationTransition
                    }
                });
        };
    })(jQuery);

    function closeTray() {
        var trayHeight = $('#tray').height();
        trayOpen = false;
        worldTurns = true;

        $("#ourHero").actorAnimate('walking');

        $('#tray').stop().animate({
                top: '-' + trayHeight
            },
            {
                duration: animationSpeed,
                specialEasing: {
                    height: animationTransition
                }
            });

        $("#verticalCenter").stop().animate({
                top: "50%"
            },
            {
                duration: animationSpeed,
                specialEasing: {
                    height: animationTransition
                }
            });
    }

    (function ($) {
        $.fn.actorAnimate = function (state, hflip) {
            hflip = (typeof hflip === "undefined") ? "false" : hflip;
            $(this).removeClass();
            switch (state) {
                case 'standing':
                    $(this).addClass('standing');
                    break;
                case 'walking':
                    $(this).addClass('walking');
                    break;
            }
            if (hflip == true) {
                $(this).addClass('flipped');
            }
        };
    })(jQuery);
}());