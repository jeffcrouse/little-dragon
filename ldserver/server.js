var path = require('path');
var util = require('util');
var express = require('express');
var midi = require('midi');

var ws_port = 9998;
var ws_addr = null;
var http_port = 3000;
var http_addr = null;
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
	ws_addr = util.format("ws://%s:%s", add, ws_port);
	http_port = util.format("http://%s:%s", add, http_port);
	console.log('ws_addr: '+ws_addr);
	console.log('http_port: '+http_port);
});

/********************************************************
███████╗██╗  ██╗██████╗ ██████╗ ███████╗███████╗███████╗
██╔════╝╚██╗██╔╝██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝
█████╗   ╚███╔╝ ██████╔╝██████╔╝█████╗  ███████╗███████╗
██╔══╝   ██╔██╗ ██╔═══╝ ██╔══██╗██╔══╝  ╚════██║╚════██║
███████╗██╔╝ ██╗██║     ██║  ██║███████╗███████║███████║
╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
********************************************************/

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
	var data = {"title": 'Little Dragon Server'};
	res.render('index', data);
});

app.get('/gran/:phone', function(req, res) {
	var data = {"title": 'Little Dragon Server: Ganular Synth Interface 1, Phone 1', 'ws_addr': ws_addr, 'phone': req.params.phone};
	res.render('gran', data);
});

app.get('/drum', function(req, res) {
	res.send('hello world');
});


app.listen(http_port);



/***************************************************************************
██╗    ██╗███████╗██████╗ ███████╗ ██████╗  ██████╗██╗  ██╗███████╗████████╗
██║    ██║██╔════╝██╔══██╗██╔════╝██╔═══██╗██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝
██║ █╗ ██║█████╗  ██████╔╝███████╗██║   ██║██║     █████╔╝ █████╗     ██║   
██║███╗██║██╔══╝  ██╔══██╗╚════██║██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   
╚███╔███╔╝███████╗██████╔╝███████║╚██████╔╝╚██████╗██║  ██╗███████╗   ██║   
 ╚══╝╚══╝ ╚══════╝╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   
***************************************************************************/

// Set up MIDI
var output = new midi.output();
output.getPortCount();
output.getPortName(0);
output.openPort(0);

// CONSTANTS
var CONTROL = 176;
var NOTEON = 144;

var WebSocketServer = require('ws').Server
	, wss = new WebSocketServer({ port: ws_port });

wss.broadcast = function broadcast(data) {
	wss.clients.forEach(function each(client) {
		client.send(data);
	});
};

wss.on('connection', function connection(ws) {
	ws.send('something');

	ws.on('message', function incoming(message) {
		
		console.log('received: %s', message);

		try {
			var json = JSON.parse(message);
			var midiMessage;
			
			if(json.event=="gran_button_2"){
				if(json.data.press == 1) 
					midiMessage = [NOTEON, 64, 127];
				else 
					midiMessage = [NOTEON, 64, 0];//note off
				output.sendMessage(midiMessage);
			}

			if(json.event=="gran_button_3"){
				if(json.data.press == 1) 
					midiMessage = [NOTEON, 66, 127];
				else 
					midiMessage = [NOTEON, 66, 0];//note off
				output.sendMessage(midiMessage);
			}

			if(json.event=="gran_button_4"){
				if(json.data.press == 1) 
					midiMessage = [NOTEON, 67, 127];
				else 
					midiMessage = [NOTEON, 67, 0];//note off
				output.sendMessage(midiMessage);
			}

			if(json.event=="gran_button_5"){
				if(json.data.press == 1) 
					midiMessage = [NOTEON, 69, 127];
				else 
					midiMessage = [NOTEON, 69, 0];//note off
				output.sendMessage(midiMessage);
			}

			if(json.event=="gran_button_6"){
				if(json.data.press == 1) 
					midiMessage = [NOTEON, 71, 127];
				else 
					midiMessage = [NOTEON, 71, 0];//note off
				output.sendMessage(midiMessage);
			}

			if(json.event=="gran_range_1") {
				//filePos		
				midiMessage = [CONTROL, 22, json.data.start * 100];
				output.sendMessage(midiMessage);
				//grain
				midiMessage = [CONTROL, 24, (json.data.stop - json.data.start) * 150];
				// console.log(json.data.stop - json.data.start);
				output.sendMessage(midiMessage);
			}

			if(json.event=="gran_multislider_1") {	
				var slider = Object.keys(json.data)[0];
				var value = parseFloat(json.data[slider]);
				var control;		

				if(slider == "0"){//attack
					control = 25;
				}
				else if(slider == "1"){//decay
					control = 26;
				}
				else if(slider == "2"){//sustain
					control = 27;
				}
				else if(slider == "3"){//release
					control = 28;
				}
				midiMessage = [CONTROL, control, value * 127];
				output.sendMessage(midiMessage);
			}

			if(json.event=="pan") {	
				//TODO: use x, y and z.	
				midiMessage = [CONTROL, 29, json.data.y];
				output.sendMessage(midiMessage);
			}

		} catch(e){
       		console.error("Invalid message from WebSocket client.")
   		}
	});
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
stdin.on( 'data', function( key ){

	if(key=='s') {
		var message = [CONTROL, 22, 1];
		output.sendMessage(message);
		console.log(message);
	}

	if(key=='d') {
		var message = [CONTROL, 23, 1];
		output.sendMessage(message);
		console.log(message);
	}

	if(key=='p') {
		var val = Math.floor(Math.random()*200);
		var message = [CONTROL, 24, val];
		output.sendMessage(message);
		console.log(message);
	}


	// ctrl-c ( end of text )
	if ( key === '\u0003' ) {
		output.closePort();
		process.exit();
	}

	// write the key to stdout all normal like
	//process.stdout.write( key );
});

