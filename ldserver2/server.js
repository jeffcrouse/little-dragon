var path = require('path');
var util = require('util');
var express = require('express');
var bodyParser = require('body-parser');
var osc = require('node-osc');
var midi = require('midi');
var teoria = require('teoria');
var oscClient = require("./oscClient");


// Set up MIDI
var output = new midi.output();
output.openPort(0);


// http://betacontroller.com/post/74610077245/phase-2-2-playing-middle-c-with-node-js
// http://www.midi.org/techspecs/midimessages.php
var MIDI = {
	CH1: { NOTEON: 144, NOTEOFF: 126, CONTROL: 176, PITCHBEND: 224 },	// KEYS
	CH2: { NOTEON: 145, NOTEOFF: 129, CONTROL: 177, PITCHBEND: 225 },	// BASS
	CH3: { NOTEON: 146, NOTEOFF: 130, CONTROL: 178, PITCHBEND: 226 },	// DRUMS
	CH4: { NOTEON: 147, NOTEOFF: 131, CONTROL: 179, PITCHBEND: 227 }	// VOCALS
}
var FULL_VELOCITY = 127;

Math.clamp = function(num, min, max) {
	if(min>max) console.warn("Math.clamp: min > max");
	return Math.min(Math.max(num, min), max);
};
Math.map = function (value, istart, istop, ostart, ostop, clamp) {
	var val = ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
	return clamp ? Math.clamp(val, Math.min(ostart, ostop), Math.max(ostart, ostop)) : val;
}

//pink dragon is in F#m + Eb
//notes we want: 
//o
// D F# G# C# B F# A E
// octave: 0
// B A E0 F0#

// —-> 4 buttons per phone
// var tonic = "F#"
// var scale = {'e1':16; 'f#1':18; 'a1':21; 'b1':23; 'd2':25; 'f#2':26; 'g#2':28; 'b3':30; 'c#3':32 };
// D ---- 38
// 

//bass notes
var scale = [16+12, 18+12, 21+12, 23+12, 25+12, 26+12, 28+12, 30+12, 32+12, 35+12, 37+12, 16+12];
var scaleKeys = [64, 62, 63, 64, 64];

var root = teoria.note('f2');
var scaleKeys = root.scale('minor');

//keys notes


/************************
 ██████╗ ███████╗ ██████╗
██╔═══██╗██╔════╝██╔════╝
██║   ██║███████╗██║     
██║   ██║╚════██║██║     
╚██████╔╝███████║╚██████╗
 ╚═════╝ ╚══════╝ ╚═════╝
*************************/
var http_port = 3000;
var http_addr = null;
var osc_port = 3333;
require('dns').lookup(require('os').hostname(), function (err, addr, fam) {

	http_addr = util.format("http://%s:%s", addr, http_port);
	console.log('http_addr', http_addr);
	console.log("listening for osc", addr, osc_port);

	var oscServer = new osc.Server(osc_port, addr);
	var oscClients = {};


	oscServer.on("message", function (msg, rinfo) {
		console.log(msg);
		
		var addr = msg.shift();
		var data = JSON.parse(msg.shift());
		var midiMessage;
		
		if(io) io.sockets.emit(addr, data);


		if(addr == "/join") {
			oscClients[data.iface] = new oscClient(data);
		} 

		else if(addr == "/leave") {
			oscClients[data.iface].close();
			delete oscClients[data.iface];
		} 
		

		//  ___   _  _______  __   __  _______ 
		// |   | | ||       ||  | |  ||       |
		// |   |_| ||    ___||  |_|  ||  _____|
		// |      _||   |___ |       || |_____ 
		// |     |_ |    ___||_     _||_____  |
		// |    _  ||   |___   |   |   _____| |
		// |___| |_||_______|  |___|  |_______|

	
		
		else if(addr=="/keys_multislider_1"){
			//FILTER 
			var frequency = data.list["0"] * FULL_VELOCITY;
			var resonance = data.list["1"] * FULL_VELOCITY;
			output.sendMessage([MIDI.CH1.CONTROL, 1, frequency]);
			output.sendMessage([MIDI.CH1.CONTROL, 2, resonance]);

			var reverb = data.list["2"] * FULL_VELOCITY;
			var delay = data.list["3"] * FULL_VELOCITY;
			output.sendMessage([MIDI.CH1.CONTROL, 3, reverb]);
			output.sendMessage([MIDI.CH1.CONTROL, 4, delay]);

		}

		else if(addr=="/keys_tilt_1") {
			var pan = (data.x +1) * FULL_VELOCITY/2;
			midiMessage = [MIDI.CH1.CONTROL, 5, pan];
			output.sendMessage(midiMessage);
		}

		else if(addr.substring(0,15)=="/keys_keyboard_"){
			var velocity = data.on;

			var keyPos = addr.substring(15, 16);
			var scalePos = data.note - 48; // re-map 48->54 (incoming midi note) to 0->7 (scale position)
			var note = scaleKeys.notes()[scalePos];

			switch(keyPos){
				case '1':
					note.octave = 1;
					break;
				case '2':
					note.octave = 2;
					break;
				case '3':
					note.octave = 3;
					break;
				case '4':
					note.octave = 4;
					break;
			}
			
			sendNote(note.midi(), velocity);
			var fifth = note.interval('P5');
			fifth.octave = note.octave;
			sendNote(fifth.midi(), velocity);

			console.log(note.interval('P5').midi());
			
		}

		

		// else if(addr=="/keys_multislider_1") {	
		// 	var slider = Object.keys(data)[0];
		// 	var value = parseFloat(data[slider]);
		// 	var control;		

		// 	if(slider == "0"){//attack
		// 		control = 25;
		// 	}
		// 	else if(slider == "1"){//decay
		// 		control = 26;
		// 	}
		// 	else if(slider == "2"){//sustain
		// 		control = 27;
		// 	}
		// 	else if(slider == "3"){//release
		// 		control = 28;
		// 	}
		// 	midiMessage = [MIDI.CH1.CONTROL, control, value * 127];
		// 	output.sendMessage(midiMessage);
		// }

		// else if(addr=="/pan") {	
		// 	//TODO: use x, y and z.	
		// 	midiMessage = [MIDI.CH1.CONTROL, 29, data.y];
		// 	output.sendMessage(midiMessage);
		// }



		//  _______  _______  _______  _______ 
		// |  _    ||   _   ||       ||       |
		// | |_|   ||  |_|  ||  _____||  _____|
		// |       ||       || |_____ | |_____ 
		// |  _   | |       ||_____  ||_____  |
		// | |_|   ||   _   | _____| | _____| |
		// |_______||__| |__||_______||_______|

		else if(addr=="/bass_multislider_1") {
			var reverb = data.list["0"] * FULL_VELOCITY;
			var delay = data.list["1"] * FULL_VELOCITY;
			output.sendMessage([MIDI.CH2.CONTROL, 1, reverb]);
			output.sendMessage([MIDI.CH2.CONTROL, 2, delay]);

			//RECORD AND PLAY BACK EXAMPLE
			// if(data.press==1) {
			// 	console.log("Record!");
			// 	// On and then Off toggles recording on
			// 	output.sendMessage([MIDI.CH2.NOTEON, 29, 1]);
			// 	output.sendMessage([MIDI.CH2.NOTEOFF, 29, 1]);
			// } else {
			// 	console.log("Stop recording")

			// 	// On and then off toggles it off again.
			// 	output.sendMessage([MIDI.CH2.NOTEON, 29, 1]);
			// 	output.sendMessage([MIDI.CH2.NOTEOFF, 29, 1]);
			// }
			// 
			// REVERB AND DELAY
			// var reverb = data.list["0"] * FULL_VELOCITY;
			// var delay = data.list["1"] * FULL_VELOCITY;
			// output.sendMessage([MIDI.CH2.CONTROL, 1, reverb]);
			// output.sendMessage([MIDI.CH2.CONTROL, 2, delay]);
		}

		else if(addr=="/bass_tilt_1") {
			var pan = Math.map(data.x, 0, 0.3, 127, 0, true); 

			midiMessage = [MIDI.CH1.CONTROL, 5, pan];
			output.sendMessage(midiMessage);
		}

		else if(addr=="/bass_keyboard_1") {
			if(data.on==0) {
				midiMessage = [MIDI.CH2.NOTEOFF, data.note, 0];
			} else {
				var note;
				if(data.note == 48)
					note = scale[0];
				else if(data.note == 49)
					note = scale[1];
				else if(data.note == 50)
					note = scale[2];

				var velocity = Math.map(data.on, 0, 127, 65, 127); // re-map 0->127 to 65->127
				midiMessage = [MIDI.CH2.NOTEON, note, velocity];
			}
			output.sendMessage(midiMessage);
		}

		else if(addr=="/bass_keyboard_2") {
			if(data.on==0) {
				midiMessage = [MIDI.CH2.NOTEOFF, data.note, 0];
			} else {
				if(data.note == 48)
					note = scale[3];
				else if(data.note == 49)
					note = scale[4];
				else if(data.note == 50)
					note = scale[5];
				var velocity = Math.map(data.on, 0, 127, 65, 127); // re-map 0->127 to 65->127
				midiMessage = [MIDI.CH2.NOTEON, note, velocity];
			}
			output.sendMessage(midiMessage);
			

		}
		else if(addr=="/bass_keyboard_3") {
			if(data.on==0) {
				midiMessage = [MIDI.CH2.NOTEOFF, data.note, 0];
			} else {
				if(data.note == 48)
					note = scale[6];
				else if(data.note == 49)
					note = scale[7];
				else if(data.note == 50)
					note = scale[8];
				var velocity = Math.map(data.on, 0, 127, 65, 127); // re-map 0->127 to 65->127
				midiMessage = [MIDI.CH2.NOTEON, note, velocity];
			}
			output.sendMessage(midiMessage);
		}

		else if(addr=="/bass_keyboard_4") {
			if(data.on==0) {
				midiMessage = [MIDI.CH2.NOTEOFF, note, 0];
			} else {
				if(data.note == 48)
					note = scale[9];
				else if(data.note == 49)
					note = scale[10];
				else if(data.note == 50)
					note = scale[11];
				var velocity = Math.map(data.on, 0, 127, 65, 127); // re-map 0->127 to 65->127
				midiMessage = [MIDI.CH2.NOTEON, note, velocity];
			}
			output.sendMessage(midiMessage);
		}

	

		//  ______   ______    __   __  __   __  _______ 
		// |      | |    _ |  |  | |  ||  |_|  ||       |
		// |  _    ||   | ||  |  | |  ||       ||  _____|
		// | | |   ||   |_||_ |  |_|  ||       || |_____ 
		// | |_|   ||    __  ||       ||       ||_____  |
		// |       ||   |  | ||       || ||_|| | _____| |
		// |______| |___|  |_||_______||_|   |_||_______|

		else if(addr=="/drum_matrix_1"){

			if(data.list && data.list[0]==1) {
				// console.log(data.list[0]);
				// var velocity = Math.map(data.on, 0, 127, 65, 127); // re-map 0->127 to 65->127
				midiMessage = [MIDI.CH3.NOTEON, 36, 127];
				
			} else {
				midiMessage = [MIDI.CH3.NOTEOFF, 36, 0];
			}
			output.sendMessage(midiMessage);
		}

		else if(addr=="/drum_tilt_1") {
			var pan = Math.map(data.x, 0, 0.3, 127, 0, true); 
			
			midiMessage = [MIDI.CH1.CONTROL, 5, pan];
			output.sendMessage(midiMessage);
		}



		//  __   __  _______  _______  _______  ___      _______ 
		// |  | |  ||       ||       ||   _   ||   |    |       |
		// |  |_|  ||   _   ||       ||  |_|  ||   |    |  _____|
		// |       ||  | |  ||       ||       ||   |    | |_____ 
		// |       ||  |_|  ||      _||       ||   |___ |_____  |
		//  |     | |       ||     |_ |   _   ||       | _____| |
		//   |___|  |_______||_______||__| |__||_______||_______|

		else if(addr=="/vocals_multislider_1"){
		//voice control channels start at 100
		var reverb = data.list["0"] * FULL_VELOCITY;
		var delay = data.list["1"] * FULL_VELOCITY;
		output.sendMessage([MIDI.CH4.CONTROL, 102, reverb]);
		output.sendMessage([MIDI.CH4.CONTROL, 103, delay]);
			
		 //   	//reverb
		 //   	var scale = data.list["0"] * FULL_VELOCITY;
			// var dryWet = data.list["1"] * FULL_VELOCITY;
			// output.sendMessage([MIDI.CH4.CONTROL, 102, reverb]);
			// output.sendMessage([MIDI.CH4.CONTROL, 103, delay]);

			// //delay
			// var feedback = data.list["2"] * FULL_VELOCITY;
			// var dryWet = data.list["3"] * FULL_VELOCITY;
			// output.sendMessage([MIDI.CH4.CONTROL, 104, reverb]);
			// output.sendMessage([MIDI.CH4.CONTROL, 105, delay]);

		   	
		}   	
		   	
		   	//Multitouch ––keeping for now just in case:
		 //   	if(addr=="/voicefx_multitouch_1"){
		 //   		var messages = [];
		 //   		//delay
			// 	if(data.touch0 && data.touch0.x > 0){
			// 		//dry/wet
			// 		control = 102;
					
			// 		//max x coming in from nexus is 0.5
			// 		//TODO: check why 
			// 		value = data.touch0.x * 2;
			// 		midiMessage = [MIDI.CH4.CONTROL, control, value * 127];
			// 		messages.push(midiMessage);

			// 		//scale
			// 		control = 103; 
			// 		//min y coming in from nexus is 0.5
			// 		//TODO: check why 
			// 		value = (data.touch0.y - 0.5) * 2;
			// 		midiMessage = [MIDI.CH4.CONTROL, control, value * 127];
			// 		messages.push(midiMessage);

			// 	} 

			// 	if(data.touch1 && data.touch1.x > 0){
			// 		//feedback
			// 		control = 104;
			// 		//TODO: fix range
			// 		value = data.touch1.x;
			// 		midiMessage = [MIDI.CH4.CONTROL, control, value * 127];
			// 		messages.push(midiMessage);

			// 		//dry/wet
			// 		control = 105;
			// 		value = data.touch1.y;
			// 		midiMessage = [MIDI.CH4.CONTROL, control, value * 127];
			// 		messages.push(midiMessage);
					
			// 	}

			// 	for(var i = 0; i < messages.length; i++){
			// 		output.sendMessage(messages[i]);
			// 	}
				
				
			// }
	});
	var sendNote = function(midiNote, velocity){
		if(velocity > 0) //not note off
			velocity = Math.map(velocity, 0, 127, 65, 127); // re-map 0->127 to 65->127

		midiMessage = [MIDI.CH1.NOTEON, midiNote, velocity];
		output.sendMessage(midiMessage);
	}
		

});




/************************************
███╗   ███╗██████╗ ███╗   ██╗███████╗
████╗ ████║██╔══██╗████╗  ██║██╔════╝
██╔████╔██║██║  ██║██╔██╗ ██║███████╗
██║╚██╔╝██║██║  ██║██║╚██╗██║╚════██║
██║ ╚═╝ ██║██████╔╝██║ ╚████║███████║
╚═╝     ╚═╝╚═════╝ ╚═╝  ╚═══╝╚══════╝
*************************************/                                    

// Advertise the OSC server using ZeroConf discovery 
// so that we don't have to hardcode the IP address into the phones

var mdns = require('mdns');
console.log("advertising", mdns.udp('osc'), osc_port);
var ad = mdns.createAdvertisement(mdns.udp('osc'), osc_port, {name: "ld-luisa"});
ad.start();





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
	var data = {"title": 'Little Dragon Server'};
	res.render('index', data);
});

app.get('/projector/:num', function(req, res) {
	var data = {"title": 'Little Dragon Projection', 'num': req.params.num};
	res.render('projector', data);
});

io.on('connection', function (socket) {
	socket.emit('hello', { hello: 'world' });	
	// socket.on('my other event', function (data) {
	// 	console.log(data);
	// });
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

	if(key=='1') {
		var message = [MIDI.CH1.CONTROL, 1, 1];
		output.sendMessage(message);
	}

	if(key=='2') {
		var message = [MIDI.CH1.CONTROL, 2, 1];
		output.sendMessage(message);
	}

	if(key=='3') {
		var message = [MIDI.CH1.CONTROL, 3, 1];
		output.sendMessage(message);
	}

	if(key=='4') {
		var message = [MIDI.CH1.CONTROL, 4, 1];
		output.sendMessage(message);
	}

	if(key=='5') {
		var message = [MIDI.CH1.CONTROL, 5, 1];
		output.sendMessage(message);
	}
	
	if(key=='a') {
		output.sendMessage([MIDI.CH4.CONTROL, 102, 1]);
	}
	if(key=='s') {
		output.sendMessage([MIDI.CH4.CONTROL, 103, 1]);
	}
	if(key=='d') {
		output.sendMessage([MIDI.CH4.CONTROL, 104, 1]);
	}
	if(key=='f') {
		output.sendMessage([MIDI.CH4.CONTROL, 105, 1]);
	}

	// ctrl-c ( end of text )
	if ( key === '\u0003' ) {
		output.closePort();
		process.exit();
	}

	// write the key to stdout all normal like
	//process.stdout.write( key );
});




/**********************************************
██╗     ██╗ ██████╗ ██╗  ██╗████████╗███████╗
██║     ██║██╔════╝ ██║  ██║╚══██╔══╝██╔════╝
██║     ██║██║  ███╗███████║   ██║   ███████╗
██║     ██║██║   ██║██╔══██║   ██║   ╚════██║
███████╗██║╚██████╔╝██║  ██║   ██║   ███████║
╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝
**********************************************/

/*
var OPC = require("./opc");
var client = new OPC('localhost', 7890);
function draw() {
    var millis = new Date().getTime();

    for (var pixel = 0; pixel < 512; pixel++)
    {
        var t = pixel * 0.2 + millis * 0.002;
        var red = 128 + 96 * Math.sin(t);
        var green = 128 + 96 * Math.sin(t + 0.1);
        var blue = 128 + 96 * Math.sin(t + 0.3);

        client.setPixel(pixel, red, green, blue);
    }
    client.writePixels();
}

setInterval(draw, 30);
*/




/*******************************************************************
███╗   ███╗██╗██████╗ ██╗    ██╗███╗   ██╗██████╗ ██╗   ██╗████████╗
████╗ ████║██║██╔══██╗██║    ██║████╗  ██║██╔══██╗██║   ██║╚══██╔══╝
██╔████╔██║██║██║  ██║██║    ██║██╔██╗ ██║██████╔╝██║   ██║   ██║   
██║╚██╔╝██║██║██║  ██║██║    ██║██║╚██╗██║██╔═══╝ ██║   ██║   ██║   
██║ ╚═╝ ██║██║██████╔╝██║    ██║██║ ╚████║██║     ╚██████╔╝   ██║   
╚═╝     ╚═╝╚═╝╚═════╝ ╚═╝    ╚═╝╚═╝  ╚═══╝╚═╝      ╚═════╝    ╚═╝   
*******************************************************************/
/*
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

		var func = message[0];
		var note = message[1];
		var vel = message[2] / FULL_VELOCITY;
		vel = parseFloat(vel.toFixed(3));

		console.log(func, note, vel)
	});
}
*/


// catch the uncaught errors that weren't wrapped in a domain or try catch statement
// do not use this in modules, but only in applications, as otherwise we could have multiple of these bound
process.on('uncaughtException', function(err) {
    // handle the error safely
    console.error(err)
})


