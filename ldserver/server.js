var path = require('path');
var util = require('util');
var express = require('express');
var bodyParser = require('body-parser');
var osc = require('node-osc');
var midi = require('midi');
var teoria = require('teoria');
var oscClient = require("./oscClient");
//var leds = require("./leds")

var song = "1";
//for the bass, start in C. 

var scalePinkCloudKeys = [
	teoria.note("c3"),
	teoria.note("d3"),
	teoria.note("e3"),
	teoria.note("f#3"),
	teoria.note("g3"),
	teoria.note("a3"),
	teoria.note("b3"),

	teoria.note("c#4"),
	teoria.note("d4"),
	teoria.note("e4"),
	teoria.note("f#4"),
	teoria.note("g4"),
	teoria.note("a4"),
	teoria.note("b4"),
]

var songs = {
	"1": {"name":"pink cloud", "root":"e", "keysOctave":"2", "bassOctave":"2", "scale":"minor"}, 
	"2": {"name":"summertearz", "root":"db", "keysOctave":"2", "bassOctave":"2", "scale":"major"},
	"3": {"name":"test", "root":"f#", "keysOctave":"2", "bassOctave":"1", "scale":"minor"},
	"4": {"name":"pretty girls", "root":"g", "keysOctave":"2", "bassOctave":"1", "scale":"minor"},
	"5": {"name":"twice", "root":"bb", "keysOctave":"2", "bassOctave":"1", "scale":"major"}
}

// var notes = {"c3", "d3", "e3", "f#3", "g3", "a3", "b3", "c#3" };

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

var lastRecStart = 0;
var lastRecEnd = 0;
var lastRecDuration = 0;
var recording = false;

//pink dragon is in F#m + Eb
var rootKeys = songs[song].root + songs[song].keysOctave;
var rootBass = songs[song].root + songs[song].bassOctave;
var scale = songs[song].scale;

var scaleKeys = teoria.note(rootKeys).scale(scale);
var scaleBass = teoria.note(rootBass).scale(scale);




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
		
		if(addr=="/keys_range_1"){
			var width = data.stop - data.start;
			var xpos = data.start;
			
			var grainSize = width * FULL_VELOCITY;
			var grainPos = xpos * FULL_VELOCITY;
			output.sendMessage([MIDI.CH1.CONTROL, 10, grainSize]);
			output.sendMessage([MIDI.CH1.CONTROL, 11, grainPos]);
			
		}

		if(addr=="/keys_button_1"){
			if(data.press == 1){
				output.sendMessage([MIDI.CH1.NOTEON, 119, 10]);
				output.sendMessage([MIDI.CH1.NOTEOFF, 119, 0]);
			}
		}

		if(addr=="/keys_multislider_1"){
			//FILTER 
			var spray = data.list["0"] * FULL_VELOCITY;
			var decay = data.list["1"] * FULL_VELOCITY;
			var pitchCoarse = data.list["2"] * FULL_VELOCITY;
			var pitchFine = data.list["3"] * FULL_VELOCITY;
			var crossfade = data.list["4"] * FULL_VELOCITY;

			output.sendMessage([MIDI.CH1.CONTROL, 1, spray]);
			output.sendMessage([MIDI.CH1.CONTROL, 2, decay]);
			output.sendMessage([MIDI.CH1.CONTROL, 3, pitchCoarse]);
			output.sendMessage([MIDI.CH1.CONTROL, 4, pitchFine]);
			output.sendMessage([MIDI.CH1.CONTROL, 15, crossfade]);
			
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


		else if(addr=="/keys_tilt_1") {
			var pan = (data.x +1) * FULL_VELOCITY/2;
			midiMessage = [MIDI.CH1.CONTROL, 5, pan];
			output.sendMessage(midiMessage);
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


		//INSTRUMENT: PRE-SAMPLED DRUMS
		else if(contains(addr, '/pre-drums')){
			//message format: pre-drums_button_4 
			var drum = addr.charAt(addr.length - 1);
			
			var note;
			switch(drum){
				case '1': 
					note = 36;
					// if(data.press==1)led_sections[0].blink();
					break;
				case '2': 
					note = 37;
					// if(data.press==1)led_sections[1].blink();
					break;
				case '3': 
					note = 38;
					// if(data.press==1)led_sections[2].blink();
					break;
				case '4': 
					note = 39;
					// if(data.press==1)led_sections[3].blink();
					break;
				case '5': 
					note = 40;
					// if(data.press==1)led_sections[3].blink();
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
		}

		//INSTRUMENT: LIVE SAMPLED DRUMS (1 sample, 4 triggers with different pitches)
		else if(contains(addr, '/drums')){
			var drum = addr.charAt(addr.length - 1);
			
			if(drum == 1){//record button
				if(data.press==1){ // button down
					if(!recording){
					// if(Date.now() - lastRecording > minTimeBetweenRecordings){
						// console.log("RECORD");
						//send ARM track
						output.sendMessage([MIDI.CH3.NOTEON, 40, 1]);

						// send NEW message and overwrite message to start recording new scene
						// if(drum == '1')
						output.sendMessage([MIDI.CH3.CONTROL, 6, 1]);
						

						//send 'session record' to start recording
						output.sendMessage([MIDI.CH3.NOTEON, 110, 1]);
						output.sendMessage([MIDI.CH3.NOTEOFF, 110, 1]);
						lastRecording = Date.now();
						recording = true;
					// }
					}
					else if(recording){
						// console.log("STOP");
						// STOP session recording
						output.sendMessage([MIDI.CH3.NOTEON, 110, 1]);
						output.sendMessage([MIDI.CH3.NOTEOFF, 110, 1]);
						
						//set LOOP to false 
						output.sendMessage([MIDI.CH3.NOTEON, 120, 1]);
						output.sendMessage([MIDI.CH3.NOTEOFF, 120, 1]);

						//un-arm track
						output.sendMessage([MIDI.CH3.NOTEON, 40, 1]);
						recording = false;
					}
				}
			}
			else{ //actual triggers
				if(data.press==1){ 
					console.log("LAUNCH");
					var pitchShift = 0;
					//note is just a plan B in case sampling fails: enable normal drum
					var note;
					switch(drum){
						case '2':
							pitchShift = 10;
							note = 36;
							break;
						case '3':
							pitchShift = 40;
							note = 37;
							break;
						case '4':
							pitchShift = 70;
							note = 38;
							break;
						case '5':
							pitchShift = 100;
							note = 39;
							break;
					}

					//send pitch message:
					output.sendMessage([MIDI.CH3.CONTROL, 126, pitchShift]);

					//plan B: pre-sampled drums
					output.sendMessage([MIDI.CH3.NOTEON, note, 1]);
					var velocity = Math.map(data.y, 80, 670, 40, 127, true); 
					output.sendMessage([MIDI.CH3.NOTEON, note, velocity]);
					
					//launch clip	
					output.sendMessage([MIDI.CH3.NOTEON, 127, 1]);
				}
				else if(data.press==0){
					output.sendMessage([MIDI.CH3.NOTEOFF, note, 0]);
				}
					
			}
			
			
		}

		//LIVE SAMPLES: ONE SAMPLE PER PHONE (doesn't work quite well because of how ableton's NEW and LOOP functions work
		//––not assigned to individual clip but to whole scenes and all clips respectively)
		// else if(contains(addr, '/drums')){
		// 	var drums =	{"1":{"clipexists":false, "recording": false, "holding":false, "holdStart":0 }}; 

		// 	// CODE FOR SAMPLING 4 DRUMS (hold longer than a second to rec, less than a second to launch)
		// 	// latest version of this is in branch 'multisamplerdrums'
			
		// 	if(data.press==1){ // button down
				
		// 		drums[drum].holding = true;
		// 		drums[drum].holdStart = Date.now(); 

		// 		setTimeout(function(){//after holding for a second, start recording
					
		// 			var holdTime = Date.now() - drums[drum].holdStart;
		// 			if(drums[drum].holding && holdTime >= holdTimeToRecord){
		// 				// console.log("start rec");
						
		// 				//send ARM track
		// 				output.sendMessage([MIDI.CH3.NOTEON, control + 10, 1]);

		// 				// send NEW message and overwrite message to start recording new scene
		// 				// if(drum == '1')
		// 				output.sendMessage([MIDI.CH3.CONTROL, 6, 1]);
						

		// 				//send 'session record' to start recording
		// 				output.sendMessage([MIDI.CH3.NOTEON, 110, 1]);
		// 				output.sendMessage([MIDI.CH3.NOTEOFF, 110, 1]);

		// 				drums[drum].recording = true;
						
		// 			}
					
		// 		}, holdTimeToRecord);
		// 	}
		// 	else if(data.press==0){ // button up
		// 		var holdTime = Date.now() - drums[drum].holdStart;

		// 		if(drums[drum].clipexists && holdTime < holdTimeToRecord){
		// 			console.log("launch clip");
		// 			//launch clip	
		// 			output.sendMessage([MIDI.CH3.NOTEON, control, 1]);
		// 			// output.sendMessage([MIDI.CH3.NOTEOFF, 103, 1]);

		// 		}

		// 		else if(drums[drum].recording){ 
		// 			console.log("stop rec");
		// 			// STOP session recording
		// 			output.sendMessage([MIDI.CH3.NOTEON, 110, 1]);
		// 			output.sendMessage([MIDI.CH3.NOTEOFF, 110, 1]);
					
		// 			//set LOOP to false 
		// 			output.sendMessage([MIDI.CH3.NOTEON, 120, 1]);
		// 			output.sendMessage([MIDI.CH3.NOTEOFF, 120, 1]);

		// 			// if(drum==4){
		// 				// send NEW message and overwrite message to start recording new scene
		// 				// output.sendMessage([MIDI.CH3.CONTROL, 6, 1]);
		// 			// }

		// 			//un-arm track
		// 			output.sendMessage([MIDI.CH3.NOTEON, control + 10, 1]);
					
		// 			drums[drum].recording = false;
		// 			drums[drum].clipexists = true;
					
		// 		}
		// 		drums[drum].holding = false;
		// 	}
			
		// }

		else if(addr=="/drums_tilt_1") {
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
	

	var contains = function(str, substr){
		return str.indexOf(substr) > -1;
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
	var data = {"title": 'Little Dragon Composer'};
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
	
	//multipurpose
	if(key=='='){

	}

	//PROGRAM KEYS
	//grab button
	if(key=='6') {
		// output.sendMessage([MIDI.CH1.CONTROL, 119, 1]);
		output.sendMessage([MIDI.CH1.NOTEON, 119, 1]);
		output.sendMessage([MIDI.CH1.NOTEOFF, 119, 0]);
	}



	//multislider 
	if(key=='1') {
		output.sendMessage([MIDI.CH1.CONTROL, 1, 1]);
	}
	if(key=='2') {
		output.sendMessage([MIDI.CH1.CONTROL, 2, 1]);
	}
	if(key=='3') {
		output.sendMessage([MIDI.CH1.CONTROL, 3, 1]);
	}
	if(key=='4') {
		output.sendMessage([MIDI.CH1.CONTROL, 4, 1]);
	}

	//tilt
	if(key=='5') {
		output.sendMessage([MIDI.CH1.CONTROL, 5, 1]);
	}

	//PROGRAM BASS
	
	//multislider 
	if(key=='q') {
		output.sendMessage([MIDI.CH2.CONTROL, 1, 1]);
	}
	if(key=='w') {
		output.sendMessage([MIDI.CH2.CONTROL, 2, 1]);
	}
	if(key=='e') {
		output.sendMessage([MIDI.CH2.CONTROL, 3, 1]);
	}
	if(key=='r') {
		output.sendMessage([MIDI.CH2.CONTROL, 4, 1]);
	}
	
	//tilt
	if(key=='t') {
		output.sendMessage([MIDI.CH2.CONTROL, 5, 1]);
	}

	//PROGRAM VOICE
	
	//multislider 
	if(key=='z') {
		output.sendMessage([MIDI.CH4.CONTROL, 1, 1]);
	}
	if(key=='x') {
		output.sendMessage([MIDI.CH4.CONTROL, 2, 1]);
	}
	

	//PROGRAM DRUMS
	
	//multislider 
	if(key=='a') {
		output.sendMessage([MIDI.CH3.CONTROL, 1, 1]);
	}
	if(key=='s') {
		output.sendMessage([MIDI.CH3.CONTROL, 2, 1]);
	}
	if(key=='d') {
		output.sendMessage([MIDI.CH3.CONTROL, 3, 1]);
	}
	if(key=='f') {
		output.sendMessage([MIDI.CH3.CONTROL, 4, 1]);
	}
	
	//tilt
	if(key=='g') {
		output.sendMessage([MIDI.CH2.CONTROL, 5, 1]);
	}

	//REC BUTTON
	//FIRST TAP 
	//to turn looping off
	//arm
	if(key=='7'){
		output.sendMessage([MIDI.CH3.NOTEON, 40, 1]);
	}
	//new button
	if(key=='8') {
		output.sendMessage([MIDI.CH3.CONTROL, 6, 1]);
	}

	//record session
	if(key=='9') {
		output.sendMessage([MIDI.CH3.NOTEON, 110, 1]);
		
	}

	//SECOND TAP repeats 7, 9
	//adds Loop control
	if(key=='0') {
		output.sendMessage([MIDI.CH3.NOTEON, 120, 1]);
	}
	
	//TRIGGERS
	//transpose
	if(key=='m') {
		output.sendMessage([MIDI.CH3.NOTEON, 126, 1]);
	}
	//launch track
	if(key==',') {
		output.sendMessage([MIDI.CH3.NOTEON, 127, 1]);
		output.sendMessage([MIDI.CH3.NOTEOFF, 127, 1]);
	}

	//PRE-SAMPLED DRUM MACHINE
	//trigger 1
	if(key=='k') {
		output.sendMessage([MIDI.CH3.NOTEON, 36, 1]);
	}
	//trigger 2
	if(key=='l') {
		output.sendMessage([MIDI.CH3.NOTEON, 37, 1]);
	}
	//trigger 3
	if(key==';') {
		output.sendMessage([MIDI.CH3.NOTEON, 38, 1]);
	}
	//trigger 4
	if(key=='\'') {
		output.sendMessage([MIDI.CH3.NOTEON, 39, 1]);
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


