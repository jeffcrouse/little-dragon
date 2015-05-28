
var doc = window.document;
var docEl = doc.documentElement;
var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;


document.body.addEventListener('touchstart', function(event) {
	var isFullScreen = doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
	if(!isFullScreen) {
		console.log("Not fullscreen! Changing");
		requestFullScreen.call(docEl);
	}
}, false);
