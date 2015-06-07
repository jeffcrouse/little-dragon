#!/usr/bin/env node

var OPC = new require('./opc');
var client = new OPC('localhost', 7890);

Math.clamp = function(num, min, max) {
    if(min>max) console.warn("Math.clamp: min > max");
    return Math.min(Math.max(num, min), max);
}
Math.map = function (value, istart, istop, ostart, ostop, clamp) {
    var val = ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
    return clamp ? Math.clamp(val, Math.min(ostart, ostop), Math.max(ostart, ostop)) : val;
}

var pixels = [];

var Pixel = function(i) {
	var pos = i;
	var r, g, b = 0;
	var fade_time = 100;

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


var LongStrip = function(start, end) {

	var stripes = [];
	var stripePeriod = 200;
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

for(var i=0; i<640; i++) {
    pixels.push( new Pixel(i) );
}



var top_ring = new LongStrip(0, 640);



var draw = function() {

    var now = new Date().getTime();
    var deltaTime = now - lastFrame;
    lastFrame = now;

    top_ring.update(deltaTime);

    for(var p in pixels) {
        client.setPixel(p, pixels[p].r, pixels[p].g, pixels[p].b);
    }
    client.writePixels();
}

var lastFrame = new Date().getTime();
var framerate = 1000 / 400.0;
console.log("LED framerate", framerate);
setInterval(draw, framerate);
