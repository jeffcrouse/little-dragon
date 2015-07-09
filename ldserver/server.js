var path = require('path');
var util = require('util');
var teoria = require('teoria');
var midi = require('midi');
var osc = require('node-osc');

var song = "2";
var songs = {
	"1": {	
		"name":"pink cloud", 
		"scaleBass": [
						teoria.note("c"),
						teoria.note("d"),
						teoria.note("e"),
						teoria.note("f#"),
						teoria.note("g"),
						teoria.note("a"),
						teoria.note("b")
					],
		"scaleKeys": [
						teoria.note("c3"),
						teoria.note("d3"),
						teoria.note("e3"),
						teoria.note("f#3"),
						teoria.note("g3"),
						teoria.note("a3"),
						teoria.note("b3")
					]//second keyboard should replace C with teoria.note("c#3")
	}, 
	"2": {
		"name":"summertearz", 
		"scaleBass": teoria.note("f").scale("major").notes(),
		// "scaleBass": [
		// 				teoria.note("g"),
		// 				teoria.note("a"),
		// 				teoria.note("c#"),
		// 				teoria.note("d"),
		// 				teoria.note("e"),
		// 				teoria.note("g"),
		// 				teoria.note("a")
		// 			],
		"scaleKeys": teoria.note("f").scale("major").notes()
	
	},
	"3": {
		"name":"test", 
		"scaleBass": teoria.note("f#2").scale("minor").notes(),
		"scaleKeys": teoria.note("bb").scale("minor").notes()
	},
	"4": {
		"name":"pretty girls", 
		// "scaleBass": teoria.note("f2").scale("minor").notes(),
		"scaleBass": [
						teoria.note("c"),
						teoria.note("db"),
						teoria.note("eb"),
						teoria.note("f"),
						teoria.note("g"),
						teoria.note("ab"),
						teoria.note("bb")
					],
		"scaleKeys": teoria.note("f1").scale("minor").notes()
	},
	"5": {
		"name":"twice", 
		"scaleBass": [
						teoria.note("c"),
						teoria.note("d"),
						teoria.note("e"),
						teoria.note("f"),
						teoria.note("g"),
						teoria.note("a"),
						teoria.note("bb")
					],
		"scaleKeys": teoria.note("bb1").scale("major").notes()
	}
}




// Set up MIDI
var output = new midi.output();
output.openPort(0);

// http://betacontroller.com/post/74610077245/phase-2-2-playing-middle-c-with-node-js
// http://www.midi.org/techspecs/midimessages.php
var MIDI = {
	CH1: { NOTEON: 144, NOTEOFF: 128, CONTROL: 176, PITCHBEND: 224 },	// KEYS
	CH2: { NOTEON: 145, NOTEOFF: 129, CONTROL: 177, PITCHBEND: 225 },	// BASS
	CH3: { NOTEON: 146, NOTEOFF: 130, CONTROL: 178, PITCHBEND: 226 },	// DRUMS
	CH4: { NOTEON: 147, NOTEOFF: 131, CONTROL: 179, PITCHBEND: 227 },	// VOCALS
	CH15:{ NOTEON: 158, NOTEOFF: 142, CONTROL: 190 }				// FADERFOX CONTROLLER INPUT
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



setTimeout(function autoPlay(){
	console.log("===PLAYING!!");
	output.sendMessage([MIDI.CH15.CONTROL, 1, FULL_VELOCITY]);
}, 1000*30);


/************************
 ██████╗ ███████╗ ██████╗
██╔═══██╗██╔════╝██╔════╝
██║   ██║███████╗██║     
██║   ██║╚════██║██║     
╚██████╔╝███████║╚██████╗
 ╚═════╝ ╚══════╝ ╚═════╝
*************************/

var osc_port = 3333;
require('dns').lookup(require('os').hostname(), function (err, addr, fam) {

	console.log("listening for osc", addr, osc_port);

	var oscServer = new osc.Server(osc_port, addr);
	var oscClient = new osc.Client('127.0.0.1', 3334);


	oscServer.on("message", function (msg, rinfo) {

		console.log(msg);

		var scaleKeys = songs[song].scaleKeys;
		var scaleBass = songs[song].scaleBass;
		
		var addr = msg.shift();
		var data = msg.shift();

		oscClient.send(addr, data);

		data = JSON.parse(data);
		var midiMessage;

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
				output.sendMessage([MIDI.CH1.CONTROL, 119, 127]);
			}
			else if(data.press ==0){
				output.sendMessage([MIDI.CH1.CONTROL, 119, 0]);
				// output.sendMessage([MIDI.CH1.NOTEOFF, 119, 0]);
			}
		}

		if(addr=="/keys_multislider_1"){
			//FILTER 
			var spray = data.list["0"] * FULL_VELOCITY;
			var decay = data.list["1"] * FULL_VELOCITY;
			var pitchCoarse = data.list["2"] * FULL_VELOCITY;
			var pitchFine = data.list["3"] * FULL_VELOCITY;
			var crossfade = data.list["4"] * FULL_VELOCITY;

			// console.log(data.list["3"]);

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
			var note = scaleKeys[scalePos];
			var midiNote = note.midi();

			switch(keyPos){
				case '1':
					note.octave = 1;
					break;
				case '2'://this is actually the first keyboard
					// note.octave = 2;
					midiNote += 12;
					// console.log("note: " + note);
					break;
				case '3'://this is actually the second keyboard
					midiNote += 24;
					// console.log("note: " + note);
					break;
				case '4':
					note.octave = 4;
					break;
			}

			//particular case for pink cloud: second C should be #:
			if(song == '1'){
				// console.log("song: " + song);
				// console.log("keyboard: " + keyPos);
				if(keyPos == "3"){
					
					switch(scalePos){
						case 0:
							console.log("first note");
							midiNote = teoria.note("c#4").midi() +12;
							break;
						case 1://this is actually the first keyboard
							midiNote = teoria.note("d4").midi()+12;
							break;
						case 2://this is actually the second keyboard
							midiNote = teoria.note("e4").midi()+12;
							break;
						case 3:
							midiNote = teoria.note("f#4").midi()+12;
							break;
						case 4:
							midiNote = teoria.note("g4").midi()+12;
							break;
						case 5:
							midiNote = teoria.note("a4").midi()+12;
							break;
						case 6:
							midiNote = teoria.note("b4").midi()+12;
							break;
					}
					
				}
			}
			
			sendNote(midiNote, velocity, MIDI.CH1);

			// var fifth = note.interval('P5');
			// fifth.octave = note.octave;
			// sendNote(fifth.midi(), velocity, MIDI.CH1);
			
		}


		else if(addr=="/keys_tilt_1") {
			var reverb = Math.map(data.y, 0.019, 0.458, 127, 0, true);
			// console.log("tilt keys: " + reverb);
			midiMessage = [MIDI.CH1.CONTROL, 5, reverb];
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
			var reverb = Math.map(data.y, 0.019, 0.458, 127, 0, true); 

			midiMessage = [MIDI.CH2.CONTROL, 5, reverb];
			output.sendMessage(midiMessage);
		}

		else if(addr.substring(0,15)=="/bass_keyboard_"){
			var velocity = data.on;


			var keyboardNumber = addr.substring(15, 16); //phone 1, phone 2, phone 3, phone 4?
			var scalePos = (data.note - 48); // re-map 48->54 (incoming midi note) to 0->4 (key position)
			var midiNote;
			

			switch(keyboardNumber){
				case '1':
					midiNote = scaleBass[scalePos].midi();
					// note.octave = 1;
					break;

				case '2':
					midiNote = scaleBass[scalePos + 3].midi();
					// note.octave = 1;
					break;

				case '3':
					midiNote = scaleBass[scalePos].midi() + 12;
					// note.octave = 2;
					break;

				case '4':
					midiNote = scaleBass[scalePos + 3].midi() + 12;
					// note.octave = 2;
					break;
			}
			// console.log(midiNote);
			sendNote(midiNote, velocity, MIDI.CH2);
		}

		// else if(addr=="/bass_keyboard_1") {
	

		//  ______   ______    __   __  __   __  _______ 
		// |      | |    _ |  |  | |  ||  |_|  ||       |
		// |  _    ||   | ||  |  | |  ||       ||  _____|
		// | | |   ||   |_||_ |  |_|  ||       || |_____ 
		// | |_|   ||    __  ||       ||       ||_____  |
		// |       ||   |  | ||       || ||_|| | _____| |
		// |______| |___|  |_||_______||_|   |_||_______|
		
		else if(addr=="/drums_tilt_1") {
			var reverb = Math.map(data.y, 0.019, 0.458, 127, 0, true);
			// console.log("drums tilt: " + reverb);
			midiMessage = [MIDI.CH3.CONTROL, 5, reverb];
			output.sendMessage(midiMessage);
		}

		
		else if(contains(addr, '/drums')){
			var drum = addr.charAt(addr.length - 1);

			if(drum == 0){//record button
				if(song == "2" || song == "3"){//summertearz
					output.sendMessage([MIDI.CH4.NOTEON, 127, 1]);
					// if(data.value==1){
					// 	console.log("start loop");
					// 	output.sendMessage([MIDI.CH4.NOTEON, 127, 1]);
					// }
					// else{
					// 	console.log("stop loop");
					// 	output.sendMessage([MIDI.CH4.CONTROL, 126, 0]);
					// }
				}
				else if(data.value==1){ // button down
					// console.log("record");
					if(!recording){
					// if(Date.now() - lastRecording > minTimeBetweenRecordings){
						console.log("RECORD");
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
				}
				else if(recording){
						console.log("STOP");
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
			else{ //actual triggers
				var keyPos = data.note - 48; //0 or 1
				if(data.on > 0){ 
					var note;
					console.log("drum: " + drum);
					switch(drum){
						case '1':
						 	if(keyPos == 0)		
						 		note = 42;						
							if(keyPos == 1) 
								note = 43;
							if(keyPos == 2) 
								note = 44;
							if(keyPos == 3) 
								note = 45;
							if(keyPos == 4) 
								note = 46;
							break;
						case '2':
							if(keyPos == 0) 
								note = 36;
							else 
								note = 37;
							break;
						case '3':
							if(keyPos == 0) 
								note = 38;
							else 
								note = 39;
							break;
						case '4':
							if(keyPos == 0) 
									note = 40;
								else 
									note = 41;
							if(songs[song].name = "summertearz"){//launch kick
								if(keyPos == 0){
									output.sendMessage([MIDI.CH3.NOTEON, 118, 127]);//launch
								}
								else if(keyPos == 1){
									output.sendMessage([MIDI.CH3.NOTEON, 113, 127]);//stop
								}
							}
								// output.sendMessage([MIDI.CH3.CONTROL, 118, 127]);
							break;
						case '5':
							if(keyPos == 0) 
								note = 42;
							else 
								note = 43;
							break;
					}
					
					console.log("note: " + note);
					var velocity = Math.map(data.on, 0, 100, 40, 127, true); 
					output.sendMessage([MIDI.CH3.NOTEON, note, velocity]);
					
				}
				else if(data.on==0){
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
/*
var stdin = process.stdin;
stdin.setRawMode( true );
stdin.resume();
stdin.setEncoding( 'utf8' ); // i don't want binary, do you?
stdin.on( 'data', function( key ){
	// PLAY!
	if(key==' ') {
		output.sendMessage([MIDI.CH15.CONTROL, 1, FULL_VELOCITY]);
	}

	//change song
	if(key=='1'){
		console.log("~~~~~~~~~~~~~~~~ SONG: 1. PINK CLOUD ~~~~~~~~~~~~~~~~");
		song = "1";
	}
	if(key=='2'){
		console.log("~~~~~~~~~~~~~~~~ SONG: 2. SUMMERTEARZ ~~~~~~~~~~~~~~~~");
		song = "2";
	}
	if(key=='3'){
		console.log("~~~~~~~~~~~~~~~~ SONG: 3. TEST ~~~~~~~~~~~~~~~~");
		song = "3";
	}
	if(key=='4'){
		console.log("~~~~~~~~~~~~~~~~ SONG: 4. PRETTY GIRLS ~~~~~~~~~~~~~~~~");
		song = "4";
	}
	if(key=='5'){
		console.log("~~~~~~~~~~~~~~~~ SONG: 5. TWICE ~~~~~~~~~~~~~~~~");
		song = "5";
	}


	//multipurpose
	if(key=='='){
		console.log("~~~~~~~~~~~~~~~~ current SONG: " + song + ". " + songs[song].name + "~~~~~~~~~~~~~~~~ ");
		// output.sendMessage([MIDI.CH3.NOTEON, 118, 127]);
		// output.sendMessage([MIDI.CH1.CONTROL, 10, 127]);
		// output.sendMessage([MIDI.CH1.CONTROL, 11, 127]);
	}

	//PROGRAM KEYS
	//grab button
	if(key=='6') {
		// output.sendMessage([MIDI.CH1.CONTROL, 119, 1]);
		output.sendMessage([MIDI.CH1.NOTEON, 119, 1]);
		output.sendMessage([MIDI.CH1.NOTEOFF, 119, 0]);
	}



	//multislider 
	if(key=='z') {
		output.sendMessage([MIDI.CH1.CONTROL, 1, 1]);
	}
	if(key=='x') {
		output.sendMessage([MIDI.CH1.CONTROL, 2, 1]);
	}
	if(key=='c') {
		output.sendMessage([MIDI.CH1.CONTROL, 3, 1]);
	}
	if(key=='v') {
		output.sendMessage([MIDI.CH1.CONTROL, 4, 1]);
	}

	//tilt
	if(key=='b') {
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
	// if(key=='z') {
	// 	output.sendMessage([MIDI.CH4.CONTROL, 1, 1]);
	// }
	// if(key=='x') {
	// 	output.sendMessage([MIDI.CH4.CONTROL, 2, 1]);
	// }
	

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
		output.sendMessage([MIDI.CH3.CONTROL, 5, 1]);
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
*/


// catch the uncaught errors that weren't wrapped in a domain or try catch statement
// do not use this in modules, but only in applications, as otherwise we could have multiple of these bound
process.on('uncaughtException', function(err) {
    // handle the error safely
    console.error(err);

	var err = new Error();
    console.error( err.stack );
})


