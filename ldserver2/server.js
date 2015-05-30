var path = require('path');
var util = require('util');
var express = require('express');
var osc = require('node-osc');



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
	oscServer.on("message", function (msg, rinfo) {
		console.log(msg);
		try {
			var addr = msg.shift();
			var data = JSON.parse(msg.shift());
			var midiMessage;
			
			if(addr=="gran_button_2"){
				if(data.press == 1) 
					midiMessage = [NOTEON, 64, 127];
				else 
					midiMessage = [NOTEON, 64, 0];//note off
				output.sendMessage(midiMessage);
			}

			if(addr=="gran_button_3"){
				if(data.press == 1) 
					midiMessage = [NOTEON, 66, 127];
				else 
					midiMessage = [NOTEON, 66, 0];//note off
				output.sendMessage(midiMessage);
			}

			if(addr=="gran_button_4"){
				if(data.press == 1) 
					midiMessage = [NOTEON, 67, 127];
				else 
					midiMessage = [NOTEON, 67, 0];//note off
				output.sendMessage(midiMessage);
			}

			if(addr=="gran_button_5"){
				if(data.press == 1) 
					midiMessage = [NOTEON, 69, 127];
				else 
					midiMessage = [NOTEON, 69, 0];//note off
				output.sendMessage(midiMessage);
			}

			if(addr=="gran_button_6"){
				if(data.press == 1) 
					midiMessage = [NOTEON, 71, 127];
				else 
					midiMessage = [NOTEON, 71, 0];//note off
				output.sendMessage(midiMessage);
			}

			if(addr=="gran_range_1") {
				//filePos		
				midiMessage = [CONTROL, 22, data.start * 100];
				output.sendMessage(midiMessage);
				//grain
				midiMessage = [CONTROL, 24, (data.stop - data.start) * 150];
				// console.log(json.data.stop - json.data.start);
				output.sendMessage(midiMessage);
			}

			if(addr=="gran_multislider_1") {	
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
				midiMessage = [CONTROL, control, value * 127];
				output.sendMessage(midiMessage);
			}

			if(addr=="pan") {	
				//TODO: use x, y and z.	
				midiMessage = [CONTROL, 29, data.y];
				output.sendMessage(midiMessage);
			}

		} catch(e){
       		console.error("Invalid message from WebSocket client.")
   		}

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
var ad = mdns.createAdvertisement(mdns.udp('osc'), osc_port, {name: "ld"});
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






