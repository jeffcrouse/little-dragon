var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({ port: 9998 });
var midi = require('midi');


// Set up MIDI
var output = new midi.output();
output.getPortCount();
output.getPortName(0);
output.openPort(0);


// CONSTANTS
var CONTROL = 176;


/**
*	Set up a websocket listener to accept messages from the phones.
*/
wss.on('connection', function connection(ws) {
	ws.on('message', function incoming(message) {
		var json = JSON.parse(message);

		if(json.event=="single") {
	
			var message = [CONTROL, 22, 1];
			output.sendMessage(message);

		} else if(json.event=="double") {

			var message = [CONTROL, 23, 1];
			output.sendMessage(message);

		} else if(json.event=="tilt") {

			var message = [CONTROL, 24, Math.floor(Math.abs(json.value))];
			output.sendMessage(message);
		}
		//console.log('received: %s', message);
	});

	ws.send('something');
});






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

