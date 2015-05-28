
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
	slider1.on('*', function(data) {
		console.log("slider1", data.value);
		
	})
}


// Handles messages from the RTC
var onMessage = function(event) {
	//console.log('Received message: ' + event.data);
	var json = JSON.parse(event.data);
}


// Called when the RTC is opened
var onOpen = function() {
	console.log("open!");
}

// When the socket.io connection openes, construct the RTC using it.
socket.on("connect", function(){
	console.log("!!! connected");
	rtc = new RTCDataChannelClient(socket, onOpen, onMessage);
});

// Reconnect if we lose connection for any reason
socket.on('disconnect', function(){
	if(rtc) rtc.close();
	rtc = null;
	rtc = new RTCDataChannelClient(socket, onOpen, onMessage);
});


socket.on('reload', function(data){
	location.reload(true);
});

