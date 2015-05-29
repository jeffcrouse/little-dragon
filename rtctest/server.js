var path = require('path');
var util = require('util');
var wrtc = require('wrtc');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// Set up MIDI
var midi = require('midi');
var output = new midi.output();
output.getPortCount();
//output.getPortName(0);
output.openPort(0);

var CONTROL = 176;

var ws_addr = null;
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
	ws_addr = util.format("%s:3000", add);
	console.log('ws_addr: '+ws_addr);
})


/*******************************************************
███████╗██╗  ██╗██████╗ ██████╗ ███████╗███████╗███████╗
██╔════╝╚██╗██╔╝██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝
█████╗   ╚███╔╝ ██████╔╝██████╔╝█████╗  ███████╗███████╗
██╔══╝   ██╔██╗ ██╔═══╝ ██╔══██╗██╔══╝  ╚════██║╚════██║
███████╗██╔╝ ██╗██║     ██║  ██║███████╗███████║███████║
╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
*******************************************************/                                           

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log("http", ip);
	var data = {"title": 'Little Dragon Server', 'ws_addr': ws_addr, "client": ip};
	res.render('index', data);
});

app.get('/blank', function (req, res) {
	res.send("-");
});


/**************************************************
███████╗ ██████╗  ██████╗██╗  ██╗███████╗████████╗
██╔════╝██╔═══██╗██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝
███████╗██║   ██║██║     █████╔╝ █████╗     ██║   
╚════██║██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   
███████║╚██████╔╝╚██████╗██║  ██╗███████╗   ██║   
╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   
**************************************************/
var RTCPeerConnection = wrtc.RTCPeerConnection;

// The Socket.io connection will be used for "signaling" with the client, which is basically just
// the handshaking stuff. The real interesting stuff happens with the RTCPeerConnection
io.on('connection', function (socket) {
	var socketId = socket.id
	var clientIp = socket.request.connection.remoteAddress

	console.log("New connection from", clientIp)

	var i_expected = 0;

	var pc = new wrtc.RTCPeerConnection();
	var channel = null;
	// the RTCPeerConnection will generate it's own ice candidates. 
	// When it does, send it to the "client"
	pc.onicecandidate = function (event) {
		if (!event || !event.candidate) return;
		console.log("event.candidate", event.candidate);
		socket.emit("iceCandidate", event.candidate); //send ice candidate through your signaling server to other peer
	};

	// Wait for "iceCandidate" messages from the client.
	// iceCandidates are messages that represent a path for communication
	socket.on("iceCandidate", function(iceCandidate){
		pc.addIceCandidate(new wrtc.RTCIceCandidate(iceCandidate));
	});

	// When the "client" opens the data channel, we will get a reference to it here.
	pc.ondatachannel = function(event) {
		console.log("ondatachannel");
		channel = event.channel;
		channel.onmessage = handleMessage;
	}

	var onError = function(err){
		console.error(err);
	}

	// Receiving an "offer" from the "client" kicks off the handshake process.
	socket.on('offer', function (data) {
		console.log('2. received offer. setting remote description', data);
		pc.setRemoteDescription(data, function(){
		 	console.log("3. set remote description. creating answer");
		 	pc.createAnswer(function(description){
		 		console.log("4. setting local description.")
		 		pc.setLocalDescription(description, function(){
		 			console.log("5. sending answer", description);
		 			socket.emit('answer', description);
		 		}, onError);
		 	}, onError);
		 }, onError);
	});
	
	// Handle incoming WebRTC messages!
	// Also send one back whenever we receive one.
	var handleMessage = function(event) {
		
		var json = JSON.parse( event.data );

		if(json.message=="tick")
		{
			var i = json.number;

			console.log(clientIp, "number", i);
			channel.send( event.data );

			if(i != i_expected) {
				console.error("Missed a message!");
			}
			i_expected++;
		}
		else if(json.message=="touch")
		{
			
			var message = [CONTROL, 22, 1];
			console.log("!!!", message);
			output.sendMessage(message);
			console.log(message);
		}
	}

});




server.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('http listening at http://%s:%s', host, port);
});

