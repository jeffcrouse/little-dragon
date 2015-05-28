
// Open a socket connection to the node server for signaling.
var socket = io.connect(ws_addr);
var rtc = null;

/***************
╔╗╔┌─┐─┐ ┬┬ ┬┌─┐
║║║├┤ ┌┴┬┘│ │└─┐
╝╚╝└─┘┴ └─└─┘└─┘
*****************/
nx.onload = function() {	
	nx.sendsTo("js");

	// listen to all of position's output
	button1.on('*', function(data) {
		if(data.press) {
			console.log("button1");
			rtc.send(JSON.stringify({"message": "button", "value": 1}));
		}
	})

	button2.on('*', function(data) {
		if(data.press) {
			console.log("button2");
			rtc.send(JSON.stringify({"message": "button", "value": 2}));
		}
	})

	button3.on('*', function(data) {
		if(data.press) {
			console.log("button3");
			rtc.send(JSON.stringify({"message": "button", "value": 3}));
		}
	});
}


// Called when we receive a message from RTC
var onMessage = function(event) {
	//console.log('Received message: ' + event.data);
	var json = JSON.parse(event.data);
}


// Called when the RTC connection is made
var onOpen = function() {
	console.log("open!");
}

// When the socket.io connection openes, construct the RTC using it.
socket.on("connect", function(){
	console.log("!!! connected");
	rtc = new RTCDataChannelClient(socket, onOpen, onMessage);
});

// Shut down the RTC if we lose connection for any reason.
socket.on('disconnect', function(){
	console.log("!!! disconnected. ")
	if(rtc) rtc.close();
	rtc = null;
});


socket.on('reload', function(data){
	location.reload(true);
});

