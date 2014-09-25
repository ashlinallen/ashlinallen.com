//Returns int between min/max.
function rInt(minValue, maxValue) {
    return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
};

//Returns float between min/max.
function rFloat(minValue, maxValue) {
    return parseFloat(Math.min(minValue + (Math.random() * (maxValue - minValue)),maxValue).toFixed(2));
};

//Returns random RGB
function rRGB() {
    var red = rInt(0,255),
        green = rInt(0,255),
        blue = rInt(0,255),
        rgb = "rgb(" + red + "," + green + "," + blue + ")";
    
    return rgb;
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
};

//Dump values to debug panel.
function debug(string, clear) {
    var curDebugHtml = $("#debugCol").html();
    if (clear) {
        curDebugHtml = "";
    }
    $("#debugCol").show();
    $("#debugCol").html("\n" + string + "\n<br>\n" + curDebugHtml);
}

//Get element scale from transform3D matrix
function getScale(el) {
    var st = window.getComputedStyle(el, null);
    var tr = st.getPropertyValue("-webkit-transform") ||
             st.getPropertyValue("-moz-transform") ||
             st.getPropertyValue("-ms-transform") ||
             st.getPropertyValue("-o-transform") ||
             st.getPropertyValue("transform");

    var values = tr.split('(')[1].split(')')[0].split(','),
        a = values[0],
        b = values[1],
        scale = Math.sqrt(a*a + b*b);
        
    return scale;
};

var mobileType = {
    Android: function() {
        return /Android/i.test(navigator.userAgent);
    },
    BlackBerry: function() {
        return /BlackBerry/i.test(navigator.userAgent);
    },
    iOS: function() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    },
    Windows: function() {
        return /IEMobile/i.test(navigator.userAgent);
    },
    any: function() {
        return (mobileType.Android() || mobileType.BlackBerry() || mobileType.iOS() || mobileType.Windows());
    }
};