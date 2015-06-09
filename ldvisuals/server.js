var path = require('path');
var util = require('util');
var express = require('express');
var bodyParser = require('body-parser');
var osc = require('node-osc');
var midi = require('midi');


var MIDI = {
	CH15:{ NOTEON: 158, NOTEOFF: 142, MODECHANGE: 190 }				// FADERFOX CONTROLLER INPUT
}

var FULL_VELOCITY = 127;

var http_port = 3000;
var http_addr = null;
var osc_port = 3333;

require('dns').lookup(require('os').hostname(), function (err, addr, fam) {

	http_addr = util.format("http://%s:%s", addr, http_port);
	console.log('http_addr', http_addr);

	var oscServer = new osc.Server(osc_port, addr);

	oscServer.on("message", function (msg, rinfo) {
		console.log(msg);
		
		var addr = msg.shift();
		var data = JSON.parse(msg.shift());

		if(io) io.sockets.emit(addr, data);
	});
});



/********************************************************
███████╗██╗  ██╗██████╗ ██████╗ ███████╗███████╗███████╗
██╔════╝╚██╗██╔╝██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝
█████╗   ╚███╔╝ ██████╔╝██████╔╝█████╗  ███████╗███████╗
██╔══╝   ██╔██╗ ██╔═══╝ ██╔══██╗██╔══╝  ╚════██║╚════██║
███████╗██╔╝ ██╗██║     ██║  ██║███████╗███████║███████║
╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
********************************************************/
// This is where the projector visuals will be served!


var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

server.listen(http_port);

app.get('/', function (req, res) {
	var data = {"title": 'Little Dragon Projection'};
	res.render('index', data);
});

//io.on('connection', function (socket) {});




/*******************************************************************
███╗   ███╗██╗██████╗ ██╗    ██╗███╗   ██╗██████╗ ██╗   ██╗████████╗
████╗ ████║██║██╔══██╗██║    ██║████╗  ██║██╔══██╗██║   ██║╚══██╔══╝
██╔████╔██║██║██║  ██║██║    ██║██╔██╗ ██║██████╔╝██║   ██║   ██║   
██║╚██╔╝██║██║██║  ██║██║    ██║██║╚██╗██║██╔═══╝ ██║   ██║   ██║   
██║ ╚═╝ ██║██║██████╔╝██║    ██║██║ ╚████║██║     ╚██████╔╝   ██║   
╚═╝     ╚═╝╚═╝╚═════╝ ╚═╝    ╚═╝╚═╝  ╚═══╝╚═╝      ╚═════╝    ╚═╝   
*******************************************************************/

var input = new midi.input();

var devices = {};
for(var i=0; i<input.getPortCount(); i++) {
	var name = input.getPortName(i);
	devices[name] = i;
	console.log(i, name);
}

if("USB Uno MIDI Interface" in devices)
{
	input.openPort(devices["USB Uno MIDI Interface"]);
	input.on('message', function(deltaTime, message) {
		if(!io) return;

		var func = message[0];
		var note = message[1];
		var vel = message[2] / FULL_VELOCITY;
		vel = parseFloat(vel.toFixed(3));
		//console.log(func, note, vel);

		if(func == MIDI.CH15.MODECHANGE) {
			switch(note) {
				case 0: io.sockets.emit('slider1', vel); break;
				case 1: io.sockets.emit('slider2', vel); break;
				case 2: io.sockets.emit('slider3', vel); break;
				case 3: io.sockets.emit('slider4', vel); break;
				case 4: io.sockets.emit('slider5', vel); break;
				case 5: io.sockets.emit('slider6', vel); break;
				case 18: io.sockets.emit("xfade", vel); break;
				case 20: io.sockets.emit("knob1", vel); break;
				case 21: io.sockets.emit("knob2", vel); break;
				case 22: io.sockets.emit("knob3", vel); break;
				case 23: io.sockets.emit("knob4", vel); break;
				case 36: io.sockets.emit("y_axis", vel); break;
				case 38: io.sockets.emit("x_axis", vel); break;
			}
		}
		else if(func == MIDI.CH15.NOTEON) {
			switch(note) {
				case 8: io.sockets.emit("button1", vel); break;
				case 9: io.sockets.emit("button2", vel); break;
				case 10: io.sockets.emit("button3", vel); break;
				case 11: io.sockets.emit("button4", vel); break;
				case 12: io.sockets.emit("button5", vel); break;
				case 13: io.sockets.emit("button6", vel); break;
			}
		}
	});
}


// catch the uncaught errors that weren't wrapped in a domain or try catch statement
// do not use this in modules, but only in applications, as otherwise we could have multiple of these bound
process.on('uncaughtException', function(err) {
    // handle the error safely
    console.error(err);

	var err = new Error();
    console.error( err.stack );
})
