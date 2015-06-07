var path = require('path');
var util = require('util');
var express = require('express');
var bodyParser = require('body-parser');
var osc = require('node-osc');
var midi = require('midi');
var teoria = require('teoria');
var oscClient = require("./oscClient");
//var leds = require("./leds")

// Set up MIDI
var output = new midi.output();
output.openPort(0);


// http://betacontroller.com/post/74610077245/phase-2-2-playing-middle-c-with-node-js
// http://www.midi.org/techspecs/midimessages.php
var MIDI = {
	CH1: { NOTEON: 144, NOTEOFF: 126, CONTROL: 176, PITCHBEND: 224 },	// KEYS
	CH2: { NOTEON: 145, NOTEOFF: 129, CONTROL: 177, PITCHBEND: 225 },	// BASS
	CH3: { NOTEON: 146, NOTEOFF: 130, CONTROL: 178, PITCHBEND: 226 },	// DRUMS
	CH4: { NOTEON: 147, NOTEOFF: 131, CONTROL: 179, PITCHBEND: 227 },	// VOCALS
	CH15:{ NOTEON: 158, NOTEOFF: 142, MODECHANGE: 190 }				// FADERFOX CONTROLLER INPUT
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
var root = teoria.note('f#2');
var scaleKeys = root.scale('minor');
var scaleBass = teoria.note('f#1').scale('minor');

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

		/*
		if(addr == "/join") {
			oscClients[data.iface] = new oscClient(data);
		} 

		else if(addr == "/leave") {
			oscClients[data.iface].close();
			delete oscClients[data.iface];
		} 
		*/

		//  ___   _  _______  __   __  _______ 
		// |   | | ||       ||  | |  ||       |
		// |   |_| ||    ___||  |_|  ||  _____|
		// |      _||   |___ |       || |_____ 
		// |     |_ |    ___||_     _||_____  |
		// |    _  ||   |___   |   |   _____| |
		// |___| |_||_______|  |___|  |_______|

	
		
		if(addr=="/keys_multislider_1"){
			//FILTER 
			var frequency = data.list["0"] * FULL_VELOCITY;
			var resonance = data.list["1"] * FULL_VELOCITY;
			output.sendMessage([MIDI.CH1.CONTROL, 1, frequency]);
			output.sendMessage([MIDI.CH1.CONTROL, 2, resonance]);

			//LFO
			var lfoVolume = data.list["2"] * FULL_VELOCITY;
			var lfoPan = data.list["3"] * FULL_VELOCITY;
			output.sendMessage([MIDI.CH1.CONTROL, 3, lfoVolume]);
			output.sendMessage([MIDI.CH1.CONTROL, 4, lfoPan]);
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
			
			sendNote(note.midi(), velocity, MIDI.CH1);

			var fifth = note.interval('P5');
			fifth.octave = note.octave;
			sendNote(fifth.midi(), velocity, MIDI.CH1);
			
		}



		//  _______  _______  _______  _______ 
		// |  _    ||   _   ||       ||       |
		// | |_|   ||  |_|  ||  _____||  _____|
		// |       ||       || |_____ | |_____ 
		// |  _   | |       ||_____  ||_____  |
		// | |_|   ||   _   | _____| | _____| |
		// |_______||__| |__||_______||_______|

		else if(addr=="/bass_multislider_1") {
			
			var attack = data.list["0"] * FULL_VELOCITY;
			var decay = data.list["1"] * FULL_VELOCITY;
			var sustain = data.list["2"] * FULL_VELOCITY;
			var release = data.list["3"] * FULL_VELOCITY;

			output.sendMessage([MIDI.CH2.CONTROL, 1, attack]);
			output.sendMessage([MIDI.CH2.CONTROL, 2, decay]);
			output.sendMessage([MIDI.CH2.CONTROL, 3, sustain]);
			output.sendMessage([MIDI.CH2.CONTROL, 4, release]);
		}

		else if(addr=="/bass_tilt_1") {
			var pan = Math.map(data.x, 0, 0.3, 127, 0, true); 

			midiMessage = [MIDI.CH2.CONTROL, 5, pan];
			output.sendMessage(midiMessage);
		}

		else if(addr.substring(0,15)=="/bass_keyboard_"){
			var velocity = data.on;

			var keyboardNumber = addr.substring(15, 16); //phone 1, phone 2, phone 3, phone 4?
			var keyPos = (data.note - 48); // re-map 48->54 (incoming midi note) to 0->4 (key position)
			var note;

			switch(keyboardNumber){
				case '1':
					if(keyPos == 0){
						note = scaleBass.notes()[6];
						note.octave = 0;
					}
					else{
						note = scaleBass.notes()[keyPos - 1];
						note.octave = 1;
					}	
					break;

				case '2':
					note = scaleBass.notes()[keyPos + 3];
					note.octave = 1;
					break;

				case '3':
					if(keyPos == 0){
						note = scaleBass.notes()[6];
						note.octave = 1;
					}
					else{
						note = scaleBass.notes()[keyPos - 1];
						note.octave = 2;
					}	
					break;

				case '4':
					note = scaleBass.notes()[keyPos + 3];
					note.octave = 2;
					break;
			}
			
			sendNote(note.midi(), velocity, MIDI.CH2);
		}

		// else if(addr=="/bass_keyboard_1") {
	

		//  ______   ______    __   __  __   __  _______ 
		// |      | |    _ |  |  | |  ||  |_|  ||       |
		// |  _    ||   | ||  |  | |  ||       ||  _____|
		// | | |   ||   |_||_ |  |_|  ||       || |_____ 
		// | |_|   ||    __  ||       ||       ||_____  |
		// |       ||   |  | ||       || ||_|| | _____| |
		// |______| |___|  |_||_______||_|   |_||_______|

		else if(addr.substring(0,13)=="/drum_button_"){
			var drumNumber = addr.substring(13, 14);
			
			var control;
			switch(drumNumber){
				case '1': 
					control = 20;
					//if(data.press==1) leds.led_sections[0].blink();
					break;
				case '2': 
					control = 21;
					//if(data.press==1) leds.led_sections[1].blink();
					break;
				case '3': 
					control = 22;
					//if(data.press==1) leds.led_sections[2].blink();
					break;
				case '4': 
					control = 23;
					//if(data.press==1) leds.led_sections[3].blink();
					break;
			}

			if(data.press==1) {
				// console.log("Record drum " + drumNumber + "; control: " + control);
				// On and then Off toggles recording on
				// 
				output.sendMessage([MIDI.CH3.CONTROL, control, 127]);
				// output.sendMessage([MIDI.CH3.NOTEON, control, 1]);
				// output.sendMessage([MIDI.CH3.NOTEOFF, control, 1]);
			} else {
				// console.log("Stop recording drum " + drumNumber);
				output.sendMessage([MIDI.CH3.CONTROL, control, 0]);

				// On and then off toggles it off again.
				// output.sendMessage([MIDI.CH3.NOTEON, control, 1]);
				// output.sendMessage([MIDI.CH3.NOTEOFF, control, 1]);
				
			}
		}

		else if(addr=="/drum_tilt_1") {
			var pan = Math.map(data.x, 0, 0.3, 127, 0, true); 
			
			midiMessage = [MIDI.CH3.CONTROL, 5, pan];
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
		output.sendMessage([MIDI.CH4.CONTROL, 104, reverb]);
		output.sendMessage([MIDI.CH4.CONTROL, 105, delay]);
			
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
	var sendNote = function(midiNote, velocity, channel){
		// console.log(midiNote + " " + velocity);
		if(velocity > 0) //not note off
			velocity = Math.map(velocity, 0, 127, 65, 127); // re-map 0->127 to 65->127

		midiMessage = [channel.NOTEON, midiNote, velocity];
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

// var mdns = require('mdns');
// console.log("advertising", mdns.udp('osc'), osc_port);
// var ad = mdns.createAdvertisement(mdns.udp('osc'), osc_port, {name: "ld-luisa"});
// ad.start();





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

app.get('/composer', function(req, res) {
	var data = {"title": 'Little Dragon Conposer'};
	res.render('composer', data);
});


//io.on('connection', function (socket) {});





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
	//PROGRAM BASS
	if(key=='1') {
		var message = [MIDI.CH2.CONTROL, 1, 1];
		output.sendMessage(message);
	}

	if(key=='2') {
		var message = [MIDI.CH2.CONTROL, 2, 1];
		output.sendMessage(message);
	}

	if(key=='3') {
		var message = [MIDI.CH2.CONTROL, 3, 1];
		output.sendMessage(message);
	}

	if(key=='4') {
		var message = [MIDI.CH2.CONTROL, 4, 1];
		output.sendMessage(message);
	}

	if(key=='5') {
		var message = [MIDI.CH2.CONTROL, 5, 1];
		output.sendMessage(message);
	}
	//PROGRAM DRUMS
	if(key=='q') {
		var message = [MIDI.CH3.CONTROL, 29, 1];
		output.sendMessage(message);
	}
	if(key=='w') {
		var message = [MIDI.CH3.CONTROL, 30, 1];
		output.sendMessage(message);
	}
	if(key=='e') {
		var message = [MIDI.CH3.CONTROL, 31, 1];
		output.sendMessage(message);
	}
	if(key=='r') {
		var message = [MIDI.CH3.CONTROL, 32, 1];
		output.sendMessage(message);
	}

	//PROGRAM VOCALS
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


