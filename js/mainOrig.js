//Constants and variables.
var worldTurns = true;
var trayOpen = false;
var curEarthAngle = -50000;
var animationSpeed = 850;
var animationTransition = 'easeOutQuint';
	
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

(function () {
	//Everything in its right place.
	$("#planetEarth").transition({ rotate: curEarthAngle + 'deg', duration:0  });
    $("#computer").transition({ rotate: '-55deg', duration:0  });
    $("#game").transition({ rotate: '55deg', duration:0  });
    $("#nature").transition({ rotate: '180deg', duration:0  });
    $("#sheri").transition({ rotate: '90deg', duration:0  });

    //Move the heavens.
    $('#theHeavens').mousemove(function (e) {
        if (trayOpen) return;
		
		var mousePosX = Math.round((e.pageX / $(window).width()) * 50);
		var mousePosY = Math.round((e.pageY / $(window).height()) * 50);
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
		$("#planetEarth").transition({ rotate: curEarthAngle+ 'deg', easing: 'linear', duration:0 });
    }, 30);

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
				.transition({ rotate: adjustedTarget + 'deg', duration: 1500 }, function() {
					$("#" + id + "Content").openTray();
				});
		}
    });
	
    $("#tray").click(function () {
        closeTray();
    });

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