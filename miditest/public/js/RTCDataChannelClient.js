
var SERVERS = {
	iceServers: [{
		url: 'stun:stun.l.google.com:19302'
	}]
};

var RTCDataChannelClient = function(socket, onOpen, onMessage) {

	var pc = new RTCPeerConnection(SERVERS);
	var self = this;

	var onError = function(err){
		console.error(err);
	}
	// the RTCPeerConnection will generate it's own ice candidates. 
	// When it does, send it to the "client"

	console.log('1. waiting for ICE candidates');
	pc.onicecandidate = function (event) {
		if (!event || !event.candidate) return;
		console.log("event.candidate", event.candidate);
		socket.emit("iceCandidate", event.candidate); //send ice candidate through your signaling server to other peer
	};

	// SOcket.io handler
	// Wait for "iceCandidate" messages from the client.
	// iceCandidates are messages that represent a path for communication
	var onIceCandidate = function(iceCandidate){
		pc.addIceCandidate(new RTCIceCandidate(iceCandidate));
	}
	socket.on("iceCandidate", onIceCandidate);


	// When the "client" opens the data channel, we will get a reference to it here.
	pc.ondatachannel = function(event) {
		console.log("ondatachannel");

		var channel = event.channel;
		channel.onmessage = onMessage;
		self.send = function(message) {
			channel.send(message);
		}
		onOpen();
	}

	// Socket.io handler
	// Receiving an "offer" from the "client" kicks off the handshake process.
	var onOffer = function (data) {
		console.log('2. received offer. setting remote description', data);

		var desc = new RTCSessionDescription(data);
		pc.setRemoteDescription(desc, function(){
		 	console.log("3. set remote description. creating answer");
		 	pc.createAnswer(function(description){
		 		console.log("4. setting local description.")
		 		pc.setLocalDescription(description, function(){
		 			console.log("5. sending answer", description);
		 			socket.emit('answer', description);
		 		}, onError);
		 	}, onError);
		 }, onError);
	}
	socket.on('offer', onOffer);
	
	
	this.close = function() {
		socket.removeListener('offer', onOffer);
		socket.removeListener('iceCandidate', onIceCandidate);
		pc.close();
		pc = null;
	}
}

