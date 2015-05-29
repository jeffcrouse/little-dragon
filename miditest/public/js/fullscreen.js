
var doc = window.document;
var docEl = doc.documentElement;
var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

var onTouchStart = function(event) {
	var isFullScreen = doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
	if(!isFullScreen) {
		console.log("Not fullscreen! Changing");
		requestFullScreen.call(docEl);
	}
	document.body.removeEventListener('touchstart', onTouchStart);
}


document.body.addEventListener('touchstart', onTouchStart, false);
