var midi = require('midi');
var util = require('util');
var path = require('path');
var initiator = require('./initiator');


var PORT = 80;
var WS_ADDR = null;
var HTTP_ADDR = null;
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
	HTTP_ADDR = util.format("http://%s:%s", add, PORT);
	WS_ADDR = util.format("ws://%s:%s", add, PORT);
	
	console.log(HTTP_ADDR);
	console.log(WS_ADDR);
})



/*************************
███╗   ███╗██╗██████╗ ██╗
████╗ ████║██║██╔══██╗██║
██╔████╔██║██║██║  ██║██║
██║╚██╔╝██║██║██║  ██║██║
██║ ╚═╝ ██║██║██████╔╝██║
╚═╝     ╚═╝╚═╝╚═════╝ ╚═╝
*************************/

// http://betacontroller.com/post/74610077245/phase-2-2-playing-middle-c-with-node-js
// http://www.midi.org/techspecs/midimessages.php
var MIDI = {
	C1: { NOTEON: 144, NOTEOFF: 126 },
	C2: { NOTEON: 145, NOTEOFF: 129 },
	C3: { NOTEON: 146, NOTEOFF: 130 }
}
var FULL_VELOCITY = 127;

// Set up MIDI
var output = new midi.output();
output.openPort(0);



/*******************************************************
███████╗██╗  ██╗██████╗ ██████╗ ███████╗███████╗███████╗
██╔════╝╚██╗██╔╝██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝
█████╗   ╚███╔╝ ██████╔╝██████╔╝█████╗  ███████╗███████╗
██╔══╝   ██╔██╗ ██╔═══╝ ██╔══██╗██╔══╝  ╚════██║╚════██║
███████╗██╔╝ ██╗██║     ██║  ██║███████╗███████║███████║
╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
*******************************************************/

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT);

app.get('/', function (req, res) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	var data = {"title": 'Little Dragon', 'ws_addr': WS_ADDR, "client": ip};
	res.render('index', data);
});

app.get('/buttons', function (req, res) {
	console.log("Loading buttons page!");
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	var data = {"title": 'buttons', 'ws_addr': WS_ADDR, "client": ip};
	res.render('buttons', data);
	console.log("Buttons page rendered");
});

app.get('/keyboard', function (req, res) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	var data = {"title": 'keyboard', 'ws_addr': WS_ADDR, "client": ip};
	res.render('keyboard', data);
});

app.get('/sliders', function (req, res) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	var data = {"title": 'sliders', 'ws_addr': WS_ADDR, "client": ip};
	res.render('slider', data);
});


/*************************************************
███████╗ ██████╗  ██████╗██╗  ██╗███████╗████████╗
██╔════╝██╔═══██╗██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝
███████╗██║   ██║██║     █████╔╝ █████╗     ██║   
╚════██║██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   
███████║╚██████╔╝╚██████╗██║  ██╗███████╗   ██║   
╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   
*************************************************/


io.on('connection', function (socket) {
	var socketId = socket.id
	var clientIp = socket.request.connection.remoteAddress
	var tick_num = 0;

	console.log("New connection from", clientIp);

	var onMessage = function(event) {
		//console.log('Received message:', event.data);

		var json = JSON.parse(event.data);
		if(json.msg=="tick") {
			if(json.num != tick_num) {
				console.error("!! missed message ", tick_num, "from on client", clientIp);
				tick_num = json.num;  // catch up so we don't keep getting errors
			}
			tick_num++;
			rtc.send( event.data ); // echo it back
		}

		if(json.msg=="btn") {
			var note = json.value + 36;
			console.log([MIDI.C2.NOTEON, note, FULL_VELOCITY]);
			output.sendMessage([MIDI.C2.NOTEON, note, FULL_VELOCITY]);
			output.sendMessage([MIDI.C2.NOTEOFF, note, FULL_VELOCITY]);
		}
		if(json.msg=="key") {
			console.log(json.note, json.vel);
			if(json.vel>0) {
				output.sendMessage([MIDI.C3.NOTEON, json.note, json.vel]);
			} else {
				output.sendMessage([MIDI.C3.NOTEOFF, json.note, 0]);
			}
			
		}
	}

	var onOpen = function(channel) {
		console.log('!!! Send channel state is', channel.type);
		rtc.send("Hello from initiator!");
	}

	socket.on('disconnect',function() {
		console.log(clientIp, "closing RTC connection")
		rtc.close();
		rtc = null;
		console.log(clientIp, "has disconnected");
	});

	// Kick off the WebRTC connection with the socket client.
	// we use the socket for signaling, then pretty much ignore it
	var rtc = new initiator(socket, onOpen, onMessage);
});





/*****************************************************************
██╗  ██╗███████╗██╗   ██╗██████╗  ██████╗  █████╗ ██████╗ ██████╗ 
██║ ██╔╝██╔════╝╚██╗ ██╔╝██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██╔══██╗
█████╔╝ █████╗   ╚████╔╝ ██████╔╝██║   ██║███████║██████╔╝██║  ██║
██╔═██╗ ██╔══╝    ╚██╔╝  ██╔══██╗██║   ██║██╔══██║██╔══██╗██║  ██║
██║  ██╗███████╗   ██║   ██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝
╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ 
*****************************************************************/                                                          
/**
* Simple key listner to send midi signals
* This makes it easier to do the mapping in Ableton
* http://stackoverflow.com/questions/5006821/nodejs-how-to-read-keystrokes-from-stdin
*/
var stdin = process.stdin;
stdin.setRawMode( true );
stdin.resume();
stdin.setEncoding( 'utf8' ); // i don't want binary, do you?

var map = [
	"1", "2", "3", "4",
	"q", "w", "e", "r",
	"a", "s", "d", "f",
	"z", "x", "c", "v"
];

stdin.on( 'data', function( key ){

	var i = map.indexOf(key);
	if(i > -1) {
		var note = i + 36;
		output.sendMessage([MIDI.C2.NOTEON, note, FULL_VELOCITY]);
		output.sendMessage([MIDI.C2.NOTEOFF, note, FULL_VELOCITY]);
	}

	if(key=='\t') {
		console.log("!! RELOADING ALL CLIENTS");
		io.sockets.emit('reload');
	}

	// ctrl-c ( end of text )
	if ( key === '\u0003' ) {
		output.closePort();
		process.exit();
	}
	
	//process.stdout.write( key ); // write the key to stdout all normal like
});