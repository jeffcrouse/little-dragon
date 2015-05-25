
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

// Whee! We're open!
channel.onopen = function() {
	console.log('!!! Send channel state is: ' + channel.readyState);

	// Start off a little loop sending "tick" messages
	var i = 0;
	setInterval(function(){
		var message = {"message": "tick", "time": new Date(), "number": i};
		channel.send(JSON.stringify(message));
		i++;
	}, 500);			
}


// This is where incoming messages will happen.
var receiveDiv =  document.querySelector("div#receive");
channel.onmessage = function(event) {
	console.log('Received message: ' + event.data);
	receiveDiv.innerHTML += moment().format('MMMM Do YYYY, h:mm:ss a');
	receiveDiv.innerHTML += " | ";
	receiveDiv.innerHTML += event.data;
	receiveDiv.innerHTML +=  "<br />";
}


document.body.addEventListener('touchmove', function(event) {

	if (event.targetTouches.length == 1) {
		var touch = event.targetTouches[0];
		var message = {"message": "touch"};
		channel.send(JSON.stringify(message));
	}

}, false);


var offset = 0;
function calcOffset() {

	$.ajax({ url: "/blank" }).success(function(res, status, xhr) {
	
		var dateStr = xhr.getResponseHeader("Date");
		var serverTimeMillisGMT = Date.parse(new Date(Date.parse(dateStr)).toUTCString());
		var localMillisUTC = Date.parse(new Date().toUTCString());

		offset = serverTimeMillisGMT -  localMillisUTC;
	});

}
calcOffset();

function getServerTime() {
    var date = new Date();
    date.setTime(date.getTime() + offset);
    return date;
}

var timeDiv = document.querySelector("#time");
setInterval(function(){
	timeDiv.innerHTML = moment( getServerTime() ).format('h:mm:ss:SSSS a');
}, 10);
