
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

	/*
	keyboard1.octaves = 1;
	keyboard1.midibase = 40;
	keyboard1.init();

	// listen to all of position's output
	keyboard1.on('*', function(data) {
		console.log("keyboard1", data);
		rtc.send(JSON.stringify({"msg": "key", "note": data.note, "vel": data.on}));
	})
	*/
	multitouch1.on('*', function(data){
		for(key in data) {
			var touch = data[key];
			
		}
		console.log("multitouch1", data);
	});
}

// Receives messages from RTC
var onMessage = function(event) {
	//var json = JSON.parse(event.data);
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
	if(rtc) rtc.close();
	rtc = null;
	location.reload(true);
});

