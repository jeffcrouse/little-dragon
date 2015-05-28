
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

// Receives messages from RTC
var onMessage = function(event) {
	//console.log('Received message: ' + event.data);
	var json = JSON.parse(event.data);
}


// Called when RTC connection is opened
var onOpen = function() {
	console.log("open!");
}


socket.on("connect", function(){
	console.log("!!! connected");
	rtc = new RTCDataChannelClient(socket, onOpen, onMessage);
});

// Close down the RTC if we are disconnected for any reason.
socket.on('disconnect', function(){
	if(rtc) rtc.close();
	rtc = null;
	rtc = new RTCDataChannelClient(socket, onOpen, onMessage);
});


socket.on('reload', function(data){
	location.reload(true);
});

