
var servers = {
	iceServers: [{
	    url: 'stun:stun.l.google.com:19302'
	}]
};
var constraints = {
	optional: [  { RtpDataChannels: true } ],
	mandatory: {
		OfferToReceiveAudio: false,
		OfferToReceiveVideo: false
	}
}
var onError = function(err) {
   console.error(err);
}

// Open a socket connection to the node server for signaling.
var socket = io.connect(ws_addr);


// Create the RTCPeerConnection and a data channel
var pc = new RTCPeerConnection(servers);
var channel = pc.createDataChannel('sendDataChannel', {reliable: false});


// When the RTCPeerConnection starts generating ice candidates (communication paths)
// Send them to the server via the socket
pc.onicecandidate = function (event) {
	if (!event || !event.candidate) return;
	console.log("event.candidate", event.candidate);
	socket.emit("iceCandidate", event.candidate); //send ice candidate through your signaling server to other peer
};

// Meanwhile, also listen for the server sending out it's own candidates.
socket.on("iceCandidate", function(iceCandidate){
	pc.addIceCandidate(new RTCIceCandidate(iceCandidate));
});


// This bit kicks off the whole process. The RTCPeerConnection creates a description
// of the kind of connection it needs. ie: a data channel.
// It sets its own location description, and then sends the "offer" to the server
console.log("1. createOffer");
pc.createOffer(function(description){
	console.log("2. setLocalDescription", description);
	pc.setLocalDescription(description, function(){
		console.log("3. Sending offer to remote", description);
		socket.emit('offer', description );
		console.log("4. Waiting for answer")
	}, onError)
}, onError, constraints);


// The server will send back an answer, which is just a response to the "offer".
// pc.setRemoteDescription should hopefully open the connection
socket.on('answer', function(data){
	console.log("5. Received answer")
	var onSuccess = function(description){
		console.log("7. Signaling is done!")
	}
	var description = new RTCSessionDescription(data);
	console.log("6. setRemoteDescription", description);
	pc.setRemoteDescription( description, onSuccess, onError);
});


var messages = [];
var i = 0;

var loop = function() {
	var now = new Date();
	var message = {"message": "tick", "number": i, "date": now};
	messages[i] = now;
	channel.send(JSON.stringify(message));
	i++;
}



// Whee! We're open!
channel.onopen = function() {
	console.log('!!! Send channel state is: ' + channel.readyState);

	// Start off a little loop sending "tick" messages
	setInterval(loop, 500);			
}


// This is where incoming messages will happen.
var receiveDiv =  document.querySelector("div#receive");
channel.onmessage = function(event) {
	var json = JSON.parse(event.data);
	console.log('Received message: ' + event.data);
	if(json.message == "tick") 
	{
		var now = new Date();
		var sentAt = new Date(json.date);
		var elapsed = now - sentAt;

		var message = json.number;
		message += " | ";
		message += moment.duration(elapsed).asMilliseconds();
		message += "ms <br />";

		receiveDiv.innerHTML = message + receiveDiv.innerHTML;
	}

}



var timeDiv = document.querySelector("#time");
setInterval(function(){
	timeDiv.innerHTML = moment().format('h:mm:ss:SSSS a');
}, 10);





// INIT MISC

var isFullScreen = false;
function toggleFullScreen() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if(doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement) {
    cancelFullScreen.call(doc);
  } else {
    requestFullScreen.call(docEl);
  }
}



// Keep this around in case we want any raw touch events
document.querySelector("#container").addEventListener('touchstart', function(event) {
	if(!isFullScreen) {
		//toggleFullScreen();
		isFullScreen = true;
	} 
  
	console.log("touchstart");
	if (event.targetTouches.length == 1) {
		var touch = event.targetTouches[0];
		var message = {"message": "touch"};
		channel.send( JSON.stringify(message) );
	}

  if (event.targetTouches.length == 1) {
    // var touch = event.targetTouches[0];
    // ws.send(JSON.stringify({"event": "single"}));
  } else if (event.targetTouches.length == 2) {
    // var touch = event.targetTouches[0];
    // ws.send(JSON.stringify({"event": "double"}));
  }
}, false);


