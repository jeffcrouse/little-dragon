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
var root = teoria.note('f#2');
var scaleKeys = root.scale('minor');
var scaleBass = teoria.note('f#1').scale('minor');

//drums
//keep a history of drum messages to detect button hold
//TODO: generalize, should be for all drums
//slot states: empty, recording, playing, stopped.
var drums =	{
				"1":{"clipexists":false, "recording": false, "holding": false, "holdStart":0 },
				"2":{"clipexists":false, "recording": false, "holding": false, "holdStart":0 },
				"3":{"clipexists":false, "recording": false, "holding": false, "holdStart":0 },
				"4":{"clipexists":false, "recording": false, "holding": false, "holdStart":0 }	
			}; 
var holdTimeToRecord = 1000; //how long button needs to be down to start record, in miliseconds


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
			var drum = addr.substring(13, 14);
			
			var note;
			switch(drum){
				case '1': 
					note = 36;
					if(data.press==1)led_sections[0].blink();
					break;
				case '2': 
					note = 37;
					if(data.press==1)led_sections[1].blink();
					break;
				case '3': 
					note = 38;
					if(data.press==1)led_sections[2].blink();
					break;
				case '4': 
					note = 39;
					if(data.press==1)led_sections[3].blink();
					break;
				case '5': 
					note = 40;
					if(data.press==1)led_sections[3].blink();
					break;
			}

			if(data.press==1){ // button down
				//range y: 80 to 670 approx.
				var velocity = Math.map(data.y, 80, 670, 40, 127, true); 
				output.sendMessage([MIDI.CH3.NOTEON, note, velocity]);
			}
			else if(data.press==0){
				output.sendMessage([MIDI.CH3.NOTEOFF, note, velocity]);
			}

			//var drums =	{"1":{"clipexists":false, "recording": false, "holding":false, holdStart":0 }}; 

			//CODE FOR SAMPLING 4 DRUMS (hold longer than a second to rec, less than a second to launch)
			//latest version of this is in branch 'multisamplerdrums'
			
			// if(data.press==1){ // button down
				
			// 	drums[drum].holding = true;
			// 	drums[drum].holdStart = Date.now(); 

			// 	setTimeout(function(){//after holding for a second, start recording
					
			// 		var holdTime = Date.now() - drums[drum].holdStart;
			// 		if(drums[drum].holding && holdTime >= holdTimeToRecord){
			// 			// console.log("start rec");
						
			// 			//send ARM track
			// 			output.sendMessage([MIDI.CH3.NOTEON, control + 10, 1]);

			// 			// send NEW message and overwrite message to start recording new scene
			// 			// if(drum == '1')
			// 			output.sendMessage([MIDI.CH3.CONTROL, 6, 1]);
						

			// 			//send 'session record' to start recording
			// 			output.sendMessage([MIDI.CH3.NOTEON, 110, 1]);
			// 			output.sendMessage([MIDI.CH3.NOTEOFF, 110, 1]);

			// 			drums[drum].recording = true;
						
			// 		}
					
			// 	}, holdTimeToRecord);
			// }
			// else if(data.press==0){ // button up
			// 	var holdTime = Date.now() - drums[drum].holdStart;

			// 	if(drums[drum].clipexists && holdTime < holdTimeToRecord){
			// 		console.log("launch clip");
			// 		//launch clip	
			// 		output.sendMessage([MIDI.CH3.NOTEON, control, 1]);
			// 		// output.sendMessage([MIDI.CH3.NOTEOFF, 103, 1]);

			// 	}

			// 	else if(drums[drum].recording){ 
			// 		console.log("stop rec");
			// 		// STOP session recording
			// 		output.sendMessage([MIDI.CH3.NOTEON, 110, 1]);
			// 		output.sendMessage([MIDI.CH3.NOTEOFF, 110, 1]);
					
			// 		//set LOOP to false 
			// 		output.sendMessage([MIDI.CH3.NOTEON, 120, 1]);
			// 		output.sendMessage([MIDI.CH3.NOTEOFF, 120, 1]);

			// 		// if(drum==4){
			// 			// send NEW message and overwrite message to start recording new scene
			// 			// output.sendMessage([MIDI.CH3.CONTROL, 6, 1]);
			// 		// }

			// 		//un-arm track
			// 		output.sendMessage([MIDI.CH3.NOTEON, control + 10, 1]);
					
			// 		drums[drum].recording = false;
			// 		drums[drum].clipexists = true;
					
			// 	}
			// 	drums[drum].holding = false;
			// }
			
			
			
			
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
	//PROGRAM BASS
	// if(key=='1') {
	// 	var message = [MIDI.CH2.CONTROL, 1, 1];
	// 	output.sendMessage(message);
	// }

	// if(key=='2') {
	// 	var message = [MIDI.CH2.CONTROL, 2, 1];
	// 	output.sendMessage(message);
	// }

	// if(key=='3') {
	// 	var message = [MIDI.CH2.CONTROL, 3, 1];
	// 	output.sendMessage(message);
	// }

	// if(key=='4') {
	// 	var message = [MIDI.CH2.CONTROL, 4, 1];
	// 	output.sendMessage(message);
	// }

	// if(key=='5') {
	// 	var message = [MIDI.CH2.CONTROL, 5, 1];
	// 	output.sendMessage(message);
	// }
	//PROGRAM DRUMS
	//to turn looping off
	// if(key=='q') {
	// 	output.sendMessage([MIDI.CH3.NOTEON, 120, 1]);
	// }
	// //arm
	// if(key=='i'){
	// 	output.sendMessage([MIDI.CH3.CONTROL, 102, 1]);
	// 	// output.sendMessage([MIDI.CH3.NOTEON, 105, 1]);
	// }
	// //new button
	// if(key=='n') {
	// 	output.sendMessage([MIDI.CH3.CONTROL, 6, 1]);
	// }
	// //record session
	// if(key=='m') {
	// 	output.sendMessage([MIDI.CH3.NOTEON, 110, 1]);
		
	// }
	// //launch track
	// if(key=='z') {
	// 	output.sendMessage([MIDI.CH3.NOTEON, 103, 1]);
	// 	output.sendMessage([MIDI.CH3.NOTEOFF, 103, 1]);
	// }
	
	//ARM	
	if(key=='1') {
		output.sendMessage([MIDI.CH3.NOTEON, 30, 1]);
	}
	if(key=='2') {
		output.sendMessage([MIDI.CH3.NOTEON, 31, 1]);
	}
	if(key=='3') {
		output.sendMessage([MIDI.CH3.NOTEON, 32, 1]);
	}
	if(key=='4') {
		output.sendMessage([MIDI.CH3.NOTEON, 33, 1]);
	}

	//LAUNCH
	if(key=='a') {
		output.sendMessage([MIDI.CH3.NOTEON, 20, 1]);
	}
	if(key=='s') {
		output.sendMessage([MIDI.CH3.NOTEON, 21, 1]);
	}
	if(key=='d') {
		output.sendMessage([MIDI.CH3.NOTEON, 22, 1]);
	}
	if(key=='f') {
		output.sendMessage([MIDI.CH3.NOTEON, 23, 1]);
	}
	



	//PROGRAM VOCALS
	// if(key=='a') {
	// 	output.sendMessage([MIDI.CH4.CONTROL, 102, 1]);
	// }
	// if(key=='s') {
	// 	output.sendMessage([MIDI.CH4.CONTROL, 103, 1]);
	// }
	// if(key=='d') {
	// 	output.sendMessage([MIDI.CH4.CONTROL, 104, 1]);
	// }
	// if(key=='f') {
	// 	output.sendMessage([MIDI.CH4.CONTROL, 105, 1]);
	// }



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

var OPC = require("./opc");
var client = new OPC('localhost', 7890);

// ------------------------------------------------------
var pixels = [];
var fade_time = 200;
var Pixel = function(i) {
	var pos = i;
	var r, g, b = 0;
	this.update = function(deltaTime) {
		var fade = Math.map(deltaTime, 0, fade_time, 0, 255);
		this.r = Math.clamp(this.r - fade, 0, 255);
		this.g = Math.clamp(this.g - fade, 0, 255);
		this.b = Math.clamp(this.b - fade, 0, 255);
	}
	this.set = function(_r, _g, _b) {
		this.r = _r; this.g = _g; this.b = _b;
	}
}
for(var i=0; i<512; i++) {
    pixels.push(new Pixel(i));
}

var LEDSection = function(start, end) {
	var r = 255; //Math.map(Math.random(), 0, 1, 100, 255);
	var g = 0; //Math.map(Math.random(), 0, 1, 100, 255);
	var b = 0; //Math.map(Math.random(), 0, 1, 100, 255);

	this.blink = function() {
		for(var i=start; i<=end; i++) {
			pixels[i].set(r, g, b);
		}
	}
}

var led_sections = [];
led_sections[0] = new LEDSection(0, 30);
led_sections[1] = new LEDSection(31, 60);
led_sections[2] = new LEDSection(61, 90);
led_sections[3] = new LEDSection(91, 120);



/*************************************************
      _                      _                   
   __| |_ __ __ ___      __ | | ___   ___  _ __  
  / _` | '__/ _` \ \ /\ / / | |/ _ \ / _ \| '_ \ 
 | (_| | | | (_| |\ V  V /  | | (_) | (_) | |_) |
  \__,_|_|  \__,_| \_/\_/   |_|\___/ \___/| .__/ 
                                          |_|    
*************************************************/

var draw = function() {

    var now = new Date().getTime();
    var deltaTime = now - lastFrame;
    lastFrame = now;

    for(var p in pixels) {
        pixels[p].update(deltaTime);
        client.setPixel(p, pixels[p].r, pixels[p].g, pixels[p].b);
    }
    client.writePixels();
}

var lastFrame = new Date().getTime();
setInterval(draw, 10);




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


