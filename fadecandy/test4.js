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


// ------------------------------------------------------
var Pixel = function(i) {
	var pos = i;
	var r = 0;
	var g = 0;
	var b = 0;

	this.update = function(deltaTime) {
		var fade = Math.map(deltaTime, 0, 1000, 0, 255);
		this.r -= fade;
		this.g -= fade;
		this.b -= fade;
		this.r = Math.clamp(this.r, 0, 255);
		this.g = Math.clamp(this.g, 0, 255);
		this.b = Math.clamp(this.b, 0, 255);
	}
}


// ------------------------------------------------------
var Section = function(start, end) {

	// var r = Math.map(Math.random(), 0, 1, 100, 255);
	// var g = Math.map(Math.random(), 0, 1, 100, 255);
	// var b = Math.map(Math.random(), 0, 1, 100, 255);

	this.go = function() {
		var r = Math.map(Math.random(), 0, 1, 100, 255);
		var g = Math.map(Math.random(), 0, 1, 100, 255);
		var b = Math.map(Math.random(), 0, 1, 100, 255);

		for(var i=start; i<=end; i++) {
			pixels[i].r = r;
			pixels[i].g = g;
			pixels[i].b = b;
		}
	}
}


var NUM_PIXELS = 512;
var pixels = [];
for(var i=0; i<NUM_PIXELS; i++) {
    pixels.push(new Pixel(i));
}


var sections = [];
sections[0] = new Section(0, 30);
sections[1] = new Section(31, 60);
sections[2] = new Section(61, 90);
sections[3] = new Section(91, 120);
sections[4] = new Section(121, 150);
sections[5] = new Section(151, 180);
sections[6] = new Section(181, 210);
sections[7] = new Section(211, 240);

/**********************************************************************
██████╗ ██████╗  █████╗ ██╗    ██╗    ██╗      ██████╗  ██████╗ ██████╗ 
██╔══██╗██╔══██╗██╔══██╗██║    ██║    ██║     ██╔═══██╗██╔═══██╗██╔══██╗
██║  ██║██████╔╝███████║██║ █╗ ██║    ██║     ██║   ██║██║   ██║██████╔╝
██║  ██║██╔══██╗██╔══██║██║███╗██║    ██║     ██║   ██║██║   ██║██╔═══╝ 
██████╔╝██║  ██║██║  ██║╚███╔███╔╝    ███████╗╚██████╔╝╚██████╔╝██║     
╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚══╝╚══╝     ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝     
**********************************************************************/


var lastFrame = new Date().getTime();
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
setInterval(draw, 10);






/*****************************************************************
██╗  ██╗███████╗██╗   ██╗██████╗  ██████╗  █████╗ ██████╗ ██████╗ 
██║ ██╔╝██╔════╝╚██╗ ██╔╝██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██╔══██╗
█████╔╝ █████╗   ╚████╔╝ ██████╔╝██║   ██║███████║██████╔╝██║  ██║
██╔═██╗ ██╔══╝    ╚██╔╝  ██╔══██╗██║   ██║██╔══██║██╔══██╗██║  ██║
██║  ██╗███████╗   ██║   ██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝
╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ 
*****************************************************************/
var stdin = process.stdin;
stdin.setRawMode( true );
stdin.resume();
stdin.setEncoding( 'utf8' ); // i don't want binary, do you?
stdin.on( 'data', function( key ){

	if(key=='1') {
		sections[0].go();
	}
	if(key=='2') {
		sections[1].go();
	}
	if(key=='3') {
		sections[2].go();
	}
	if(key=='4') {
		sections[3].go();
	}
	if(key=='5') {
		sections[4].go();
	}
	if(key=='6') {
		sections[5].go();
	}
	if(key=='7') {
		sections[6].go();
	}
	if(key=='8') {
		sections[7].go();
	}
	// if(key=='9') {
	// 	sections[8].go();
	// }
	// if(key=='0') {
	// 	sections[9].go();
	// }
	
	// ctrl-c ( end of text )
	if ( key === '\u0003' ) {
		process.exit();
	}

	// write the key to stdout all normal like
	//process.stdout.write( key );
});

