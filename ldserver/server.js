var path = require('path');
var util = require('util');
var express = require('express');
var midi = require('midi');

var ws_port = 9998;
var ws_addr = null;
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
	ws_addr = util.format("ws://%s:%s", add, ws_port);
	console.log('ws_addr: '+ws_addr);
})

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

app.get('/gran', function(req, res) {
	var data = {"title": 'Little Dragon Server: Ganular Synth Interface 1', 'ws_addr': ws_addr};
	res.render('gran', data);
});

app.get('/drum', function(req, res) {
	res.send('hello world');
});


app.listen(3000);



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
			
			if(json.event=="grab"){
				console.log(json.data);	
				var message;
				if(json.data.press == 1) message = [NOTEON, 64, 127];
				else message = [NOTEON, 64, 0];//note off
				
				output.sendMessage(message);
			}

			if(json.event=="grainWidthPos") {	
				console.log(json.data);	
				//filePos		
				var message = [CONTROL, 22, json.data.start * 100];
				output.sendMessage(message);
				//grain
				message = [CONTROL, 24, (json.data.stop - json.data.start) * 150];
				console.log(json.data.stop - json.data.start);
				output.sendMessage(message);
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

