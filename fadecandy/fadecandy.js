var fs = require('fs');



/***
*	This script writes out the fcserver config file.
*	
*	Run it with ./fcserver-osx fadecandy.json 
*
*	It turns all 5 fadecandy controllers into one long string of lights.
*	The mapping of the long string of lights into 3 contiguous rows of 
*	lights happens elsewhere in the client code.
*/





/**************************************************
 ██████╗ ██╗      ██████╗ ██████╗  █████╗ ██╗     
██╔════╝ ██║     ██╔═══██╗██╔══██╗██╔══██╗██║     
██║  ███╗██║     ██║   ██║██████╔╝███████║██║     
██║   ██║██║     ██║   ██║██╔══██╗██╔══██║██║     
╚██████╔╝███████╗╚██████╔╝██████╔╝██║  ██║███████╗
 ╚═════╝ ╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
**************************************************/

var settings = {
	"listen": ["127.0.0.1", 7890],
	"verbose": true,

	"color": {
		"gamma": 2.5,
		"whitepoint": [1.0, 1.0, 1.0]
	},
	"devices": []
};





/****************************************************
██████╗ ███████╗██╗   ██╗██╗ ██████╗███████╗███████╗
██╔══██╗██╔════╝██║   ██║██║██╔════╝██╔════╝██╔════╝
██║  ██║█████╗  ██║   ██║██║██║     █████╗  ███████╗
██║  ██║██╔══╝  ╚██╗ ██╔╝██║██║     ██╔══╝  ╚════██║
██████╔╝███████╗ ╚████╔╝ ██║╚██████╗███████╗███████║
╚═════╝ ╚══════╝  ╚═══╝  ╚═╝ ╚═════╝╚══════╝╚══════╝
****************************************************/


// I coulnd't find any way to use other channels...
var channel = 0;

// How the pixels will be referred to by the code
var first_opc_pixel = 0;

// For Fadecandy devices, output pixels are numbered from 0 through 511. 
// Strand 1 begins at index 0, strand 2 begins at index 64, etc.
// This should probably always be 0 (??)
var first_output_pixel = 0; 

// How many pixels total?
var pixel_count = 512;



// 
//	Acrylic top
//

var acrylic = {
	"type": "fadecandy",
	"serial": "FFFFFFFFFFFF00180017200214134D44",
	"led": false,
	"map": [
		[ channel, first_opc_pixel, first_output_pixel, pixel_count ]
	]
};



// 
//	Up-facing ring
//
first_opc_pixel+=pixel_count;
pixel_count = 512;	// change this to the actual number of pixels
var up_facing1 = {
	"type": "fadecandy",
	"serial": "FFFFFFFFFFFF00180017200214134D44",
	"led": false,
	"map": [
		[ channel, first_opc_pixel, first_output_pixel, pixel_count ]
	]
};

first_opc_pixel+=pixel_count;
pixel_count = 512;	// change this to the actual number of pixels
var up_facing2 = {
	"type": "fadecandy",
	"serial": "FFFFFFFFFFFF00180017200214134D44",
	"led": false,
	"map": [
		[ channel, first_opc_pixel, first_output_pixel, pixel_count ]
	]
};



// 
//	Down-facing ring
//
first_opc_pixel+=pixel_count;
pixel_count = 512; 		// change this to the actual number of pixels
var down_facing1 = {
	"type": "fadecandy",
	"serial": "FFFFFFFFFFFF00180017200214134D44",
	"led": false,
	"map": [
		[ channel, first_opc_pixel, first_output_pixel, pixel_count ]
	]
};


first_opc_pixel+=pixel_count;
pixel_count = 512; 		// change this to the actual number of pixels
var down_facing2 = {
	"type": "fadecandy",
	"serial": "FFFFFFFFFFFF00180017200214134D44",
	"led": false,
	"map": [
		[ channel, first_opc_pixel, first_output_pixel, pixel_count ]
	]
};





settings.devices.push( acrylic ); 
settings.devices.push( up_facing1 ); 
settings.devices.push( up_facing2 ); 
settings.devices.push( down_facing1 ); 
settings.devices.push( down_facing2 ); 


var text = JSON.stringify(settings, null, 4);
fs.writeFile("fadecandy.json", text, function(err) {
    if(err) {
		return console.log(err);
    }
    console.log("The file was saved!");
}); 