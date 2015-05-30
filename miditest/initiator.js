var wrtc = require('wrtc');


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


// The Socket.io connection will be used for "signaling" with the client, which is basically just
// the handshaking stuff. The real interesting stuff happens with the RTCPeerConnection
var RTCDataChannelInitiator = function(socket, onOpen, onMessage) {

	var clientIp = socket.request.connection.remoteAddress
	var onError = function(err) {
		console.error(clientIp, err);
	}
	// Create the RTCPeerConnection and a data channel
	var pc = new wrtc.RTCPeerConnection(servers);
	var channel = pc.createDataChannel('sendDataChannel', {reliable: false});

	// When the RTCPeerConnection starts generating ice candidates (communication paths)
	// Send them to the server via the socket
	pc.onicecandidate = function (event) {
		if (!event || !event.candidate) return;
		//console.log("event.candidate", event.candidate);
		socket.emit("iceCandidate", event.candidate); //send ice candidate through your signaling server to other peer
	};

	// Meanwhile, also listen for the server sending out it's own candidates.
	var onIceCandidate = function(iceCandidate){
		pc.addIceCandidate(new wrtc.RTCIceCandidate(iceCandidate));
	}
	socket.on("iceCandidate", onIceCandidate);

	//console.log("1. createOffer");
	pc.createOffer(function(description){
		//console.log("2. setLocalDescription", description);
		pc.setLocalDescription(description, function(){
			//console.log("3. Sending offer to remote", description);
			socket.emit('offer', description );
			//console.log("4. Waiting for answer")
		}, onError)
	}, onError, constraints);

	// The server will send back an answer, which is just a response to the "offer".
	// pc.setRemoteDescription should hopefully open the connection
	var onAnswer = function(data){
		//console.log("5. Received answer")
		var onSuccess = function(description){
			//console.log("7. Signaling is done!")
		}
		var description = new wrtc.RTCSessionDescription(data);
		//console.log("6. setRemoteDescription", description);
		pc.setRemoteDescription( description, onSuccess, onError);
	}
	socket.on('answer', onAnswer);


	// Whee! We're open!
	channel.onopen = onOpen;
	channel.onmessage = onMessage

	// How to send messages over the channel.
	this.send = function(message) {
		channel.send(message);
	}

	this.close = function() {
		socket.removeListener('answer', onAnswer);
		socket.removeListener('iceCandidate', onIceCandidate);
		//pc.close();
		pc = null;
	}
}

module.exports = RTCDataChannelInitiator;