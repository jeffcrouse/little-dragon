
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

var pixels = [];
var led_sections = [];

var Pixel = function(i) {
	var pos = i;
	var r, g, b = 0;
	var fade_time = 200;

	this.fade = function(deltaTime) {
		var fade = Math.map(deltaTime, 0, fade_time, 0, 255);
		this.r = Math.clamp(this.r - fade, 0, 255);
		this.g = Math.clamp(this.g - fade, 0, 255);
		this.b = Math.clamp(this.b - fade, 0, 255);
	}
	this.set = function(_r, _g, _b) {
		this.r = _r; 
		this.g = _g; 
		this.b = _b;
	}
}

var InstrumentSection = function(start, end, color) {
	var r = color[0];
	var g = color[1];
	var b = color[2];
	this.blink = function() {
		for(var i=start; i<=end; i++) {
			pixels[i].set(r, g, b);
		}
	}
	this.update = function(deltaTime) {
		for(var i=start; i<=end; i++) {
			pixels[i].fade(deltaTime);
		}
	}
}

var LongStrip = function(start, end) {

	var stripes = [];
	var stripePeriod = 1000;
	var nextStripe = new Date().getTime();

	var Stripe = function() {
		var width = 5;
		var pos = start-width;
		var speed = 100.0;
		var r = Math.map(Math.random(), 0, 1, 100, 255);
		var g = Math.map(Math.random(), 0, 1, 10, 100);
		var b = Math.map(Math.random(), 0, 1, 10, 100);

		this.update = function(deltaTime) {
			pos += Math.map(deltaTime, 0, 1000, 0, speed);
			
			var from = Math.max(Math.round(pos), start);
			var to = Math.min(Math.round(pos+width), end);

			for(var i=from; i<to; i++) {
				pixels[i].set(r, g, b);
			}
		}
		this.isDone = function() {
			return pos > end;
		}
	}

	this.update = function(deltaTime) {
		var now = new Date().getTime();

		if(now > nextStripe) {	
			stripes.push( new Stripe() );
			nextStripe = now+stripePeriod;
		}

		var i = stripes.length;
		while(i--) {
			stripes[i].update(deltaTime);
	
			if(stripes[i].isDone()) 
				stripes.splice(i, 1);
		}

		for(var p in pixels) {
			pixels[p].fade(deltaTime);
		}
	}
}

for(var i=0; i<700; i++) {
    pixels.push( new Pixel(i) );
}

led_sections[0] = new InstrumentSection(0, 30, [210, 50, 10]);
led_sections[1] = new InstrumentSection(31, 60, [255, 100, 0]);
led_sections[2] = new InstrumentSection(61, 90, [240, 0, 60]);
led_sections[3] = new InstrumentSection(91, 120, [200, 50, 100]);

var top_ring = new LongStrip(0, 610);



/**********************************************************************
  _     _____ ____        _                      _                   
 | |   | ____|  _ \    __| |_ __ __ ___      __ | | ___   ___  _ __  
 | |   |  _| | | | |  / _` | '__/ _` \ \ /\ / / | |/ _ \ / _ \| '_ \ 
 | |___| |___| |_| | | (_| | | | (_| |\ V  V /  | | (_) | (_) | |_) |
 |_____|_____|____/   \__,_|_|  \__,_| \_/\_/   |_|\___/ \___/| .__/ 
                                                              |_|    
**********************************************************************/

var draw = function() {

    var now = new Date().getTime();
    var deltaTime = now - lastFrame;
    lastFrame = now;

    top_ring.update(deltaTime);

    for(var i in led_sections) {
    	led_sections[i].update(deltaTime);
    }

    for(var p in pixels) {
        client.setPixel(p, pixels[p].r, pixels[p].g, pixels[p].b);
    }
    client.writePixels();
}

var lastFrame = new Date().getTime();
var framerate = 1000 / 400.0;
console.log("LED framerate", framerate);
setInterval(draw, framerate);




module.exports.led_sections = led_sections;

