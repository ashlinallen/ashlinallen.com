//Returns int between min/max.
function rInt(minValue, maxValue) {
	return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
};

//Returns float between min/max.
function rFloat(minValue, maxValue){
	return parseFloat(Math.min(minValue + (Math.random() * (maxValue - minValue)),maxValue).toFixed(2));
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
function debug(string) {
    var curDebugHtml = $("#debugCol").html();
    $("#debugCol").show();
    $("#debugCol").html(curDebugHtml + "\n<br>\n" + string + "\n");
}