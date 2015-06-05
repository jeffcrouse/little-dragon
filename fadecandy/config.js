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



var pixel_count_top = 345;
var pixel_count_inside = 305; // number of pixels in a single strip inside the structure

// 
//	Acrylic top
//

var acrylic = {
	"type": "fadecandy",
	"serial": "EEIYNZRLRLOJAVUB",
	"led": false,
	"map": [
		[ channel, first_opc_pixel, first_output_pixel, pixel_count_top ]
	]
};
first_opc_pixel+=pixel_count_top;


// 
//	Up-facing ring
//

var up_facing1 = {
	"type": "fadecandy",
	"serial": "MKAWEKHJBZSFKREH",
	"led": false,
	"map": [
		[ channel, first_opc_pixel, first_output_pixel, pixel_count_inside ]
	]
};
first_opc_pixel+=pixel_count_inside;

var up_facing2 = {
	"type": "fadecandy",
	"serial": "RRBFXZFLTHWLEFMN",
	"led": false,
	"map": [
		[ channel, first_opc_pixel, first_output_pixel, pixel_count_inside ]
	]
};



// 
//	Down-facing ring
//
first_opc_pixel+=pixel_count_inside;

var down_facing1 = {
	"type": "fadecandy",
	"serial": "CUMKRFUWZZSPETUZ",
	"led": false,
	"map": [
		[ channel, first_opc_pixel, first_output_pixel, pixel_count_inside ]
	]
};


first_opc_pixel+=pixel_count_inside;

var down_facing2 = {
	"type": "fadecandy",
	"serial": "FFFFFFFFFFFF00180017200214134D44",
	"led": false,
	"map": [
		[ channel, first_opc_pixel, first_output_pixel, pixel_count_inside ]
	]
};



settings.devices.push( acrylic ); 
settings.devices.push( up_facing1 ); 
settings.devices.push( up_facing2 ); 
settings.devices.push( down_facing1 ); 
settings.devices.push( down_facing2 ); 


var text = JSON.stringify(settings, null, 4);
fs.writeFile("config.json", text, function(err) {
    if(err) {
		return console.log(err);
    }
    console.log("The file was saved!");
}); 