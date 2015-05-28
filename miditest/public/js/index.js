
// Open a socket connection to the node server for signaling.
var socket = io.connect(ws_addr);
var rtc = null;
var ticks = [];
var tick_num = 0;
var header =  document.querySelector("#header");
var roundtripTimer = null;


// Handles messages sent by the RTC
var onMessage = function(event) {
	//console.log('Received message: ' + event.data);
	var json = JSON.parse(event.data);

	if(json.message == "tick") {
		var now = new Date();
		var sentAt = new Date(json.date);
		var elapsed = now - sentAt;
		var message = [me, json.num, moment.duration(elapsed).asMilliseconds()+"ms"];
		header.innerHTML = message.join(" | ");
	}
}



// Called when the RTC connection is opened
var onOpen = function() {
	console.log("open!");

	var loop = function() {
		var now = new Date();
		ticks[tick_num] = now;
		rtc.send(JSON.stringify({"message": "tick", "num": tick_num, "date": now}));
		tick_num++;
	};
	roundtripTimer = setInterval(loop, 50);
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

