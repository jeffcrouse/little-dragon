var path = require('path');
var util = require('util');
var express = require('express');
var osc = require('node-osc');
var midi = require('midi');
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
	console.log("osc", addr, osc_port);

	var oscServer = new osc.Server(osc_port, addr);
	var oscClients = {};

	oscServer.on("message", function (msg, rinfo) {
		console.log(msg);
		
		var addr = msg.shift();
		var data = JSON.parse(msg.shift());
		var midiMessage;
		

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

		else if(addr=="/keys_button_1"){
			if(data.press == 1) 
				midiMessage = [MIDI.CH1.NOTEON, 64, 127];
			else 
				midiMessage = [MIDI.CH1.NOTEON, 64, 0];//note off
			output.sendMessage(midiMessage);
		}

		else if(addr=="/keys_button_2"){
			if(data.press == 1) 
				midiMessage = [MIDI.CH1.NOTEON, 66, 127];
			else 
				midiMessage = [MIDI.CH1.NOTEON, 66, 0];//note off
			output.sendMessage(midiMessage);
		}

		else if(addr=="/keys_button_3"){
			if(data.press == 1) 
				midiMessage = [MIDI.CH1.NOTEON, 67, 127];
			else 
				midiMessage = [MIDI.CH1.NOTEON, 67, 0];//note off
			output.sendMessage(midiMessage);
		}

		else if(addr=="/keys_button_4"){
			if(data.press == 1) 
				midiMessage = [MIDI.CH1.NOTEON, 69, 127];
			else 
				midiMessage = [MIDI.CH1.NOTEON, 69, 0];//note off
			output.sendMessage(midiMessage);
		}

		else if(addr=="/keys_button_5"){
			if(data.press == 1) 
				midiMessage = [MIDI.CH1.NOTEON, 71, 127];
			else 
				midiMessage = [MIDI.CH1.NOTEON, 71, 0];//note off
			output.sendMessage(midiMessage);
		}

		else if(addr=="/keys_range_1") {
			//filePos		
			midiMessage = [MIDI.CH1.CONTROL, 22, data.start * 100];
			output.sendMessage(midiMessage);
			//grain
			midiMessage = [MIDI.CH1.CONTROL, 24, (data.stop - data.start) * 150];
			// console.log(json.data.stop - json.data.start);
			output.sendMessage(midiMessage);
		}

		else if(addr=="/keys_multislider_1") {	
			var slider = Object.keys(data)[0];
			var value = parseFloat(data[slider]);
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
			midiMessage = [MIDI.CH1.CONTROL, control, value * 127];
			output.sendMessage(midiMessage);
		}

		else if(addr=="/pan") {	
			//TODO: use x, y and z.	
			midiMessage = [MIDI.CH1.CONTROL, 29, data.y];
			output.sendMessage(midiMessage);
		}



		//  _______  _______  _______  _______ 
		// |  _    ||   _   ||       ||       |
		// | |_|   ||  |_|  ||  _____||  _____|
		// |       ||       || |_____ | |_____ 
		// |  _   | |       ||_____  ||_____  |
		// | |_|   ||   _   | _____| | _____| |
		// |_______||__| |__||_______||_______|

		else if(addr=="/bass_keyboard_1") {
			if(data.on==0) {
				midiMessage = [MIDI.CH2.NOTEOFF, data.note, 0];
			} else {
				var velocity = Math.map(data.on, 0, 127, 65, 127); // re-map 0->127 to 65->127
				midiMessage = [MIDI.CH2.NOTEON, data.note, velocity];
			}
			output.sendMessage(midiMessage);
		}

		else if(addr=="/bass_multislider_1") {
			var reverb = data.list["0"] * FULL_VELOCITY;
			var delay = data.list["1"] * FULL_VELOCITY;
			output.sendMessage([MIDI.CH2.CONTROL, 1, reverb]);
			output.sendMessage([MIDI.CH2.CONTROL, 2, delay]);
		}

		else if(addr=="/bass_button_1") {
			if(data.press==1) {
				console.log("Record!");
				// On and then Off toggles recording on
				output.sendMessage([MIDI.CH2.NOTEON, 29, 1]);
				output.sendMessage([MIDI.CH2.NOTEOFF, 29, 1]);
			} else {
				console.log("Stop recording")

				// On and then off toggles it off again.
				output.sendMessage([MIDI.CH2.NOTEON, 29, 1]);
				output.sendMessage([MIDI.CH2.NOTEOFF, 29, 1]);
			}
		}
		else if(addr=="/bass_tilt_1") {
			var tilt = Math.map(data.y, 0, 0.3, 127, 0, true);
			output.sendMessage([MIDI.CH2.CONTROL, 31, tilt]);
		}


		//  ______   ______    __   __  __   __  _______ 
		// |      | |    _ |  |  | |  ||  |_|  ||       |
		// |  _    ||   | ||  |  | |  ||       ||  _____|
		// | | |   ||   |_||_ |  |_|  ||       || |_____ 
		// | |_|   ||    __  ||       ||       ||_____  |
		// |       ||   |  | ||       || ||_|| | _____| |
		// |______| |___|  |_||_______||_|   |_||_______|




		//  __   __  _______  _______  _______  ___      _______ 
		// |  | |  ||       ||       ||   _   ||   |    |       |
		// |  |_|  ||   _   ||       ||  |_|  ||   |    |  _____|
		// |       ||  | |  ||       ||       ||   |    | |_____ 
		// |       ||  |_|  ||      _||       ||   |___ |_____  |
		//  |     | |       ||     |_ |   _   ||       | _____| |
		//   |___|  |_______||_______||__| |__||_______||_______|

	});
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
var ad = mdns.createAdvertisement(mdns.udp('osc'), osc_port, {name: "ld-jeff"});
ad.start();





/********************************************************
███████╗██╗  ██╗██████╗ ██████╗ ███████╗███████╗███████╗
██╔════╝╚██╗██╔╝██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝
█████╗   ╚███╔╝ ██████╔╝██████╔╝█████╗  ███████╗███████╗
██╔══╝   ██╔██╗ ██╔═══╝ ██╔══██╗██╔══╝  ╚════██║╚════██║
███████╗██╔╝ ██╗██║     ██║  ██║███████╗███████║███████║
╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
********************************************************/

// Just keeping this around in case we want the phones to load some amount
// of information from the server 

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
	var data = {"title": 'Little Dragon Server'};
	res.render('index', data);
});

app.listen(http_port);





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
		var message = [MIDI.CH1.CONTROL, 22, 1];
		output.sendMessage(message);
		console.log(message);
	}

	if(key=='n') {
		output.sendMessage([MIDI.CH2.NOTEON, 28, 1]);
	}
	if(key=='r') {
		output.sendMessage([MIDI.CH2.CONTROL, 29, 1]);
	}
	if(key=='p') {
		output.sendMessage([MIDI.CH2.CONTROL, 30, 1]);
	}

	// ctrl-c ( end of text )
	if ( key === '\u0003' ) {
		output.closePort();
		process.exit();
	}

	// write the key to stdout all normal like
	//process.stdout.write( key );
});



// catch the uncaught errors that weren't wrapped in a domain or try catch statement
// do not use this in modules, but only in applications, as otherwise we could have multiple of these bound
process.on('uncaughtException', function(err) {
    // handle the error safely
    console.error(err)
})


