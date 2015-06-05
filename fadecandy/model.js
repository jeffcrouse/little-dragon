var fs = require('fs');



/***
*	This script writes out the pixel map for the strips
*	
*/


Math.clamp = function(num, min, max) {
	if(min>max) console.warn("Math.clamp: min > max");
	return Math.min(Math.max(num, min), max);
};
Math.map = function (value, istart, istop, ostart, ostop, clamp) {
	var val = ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
	return clamp ? Math.clamp(val, Math.min(ostart, ostop), Math.max(ostart, ostop)) : val;
}





var model = [];
var pixel = 0;
var pixel_count_top = 345;
var pixel_count_inside = 305; // number of pixels in a single strip inside the structure


for(var i=0; i<pixel_count_top; i++) {
	var x = Math.map(i, 0, pixel_count_top, 0, 1, true);
	var y = 0;
	model[pixel] = { point: [x, y, 0] };
	pixel++;
}

for(var i=0; i<pixel_count_inside; i++) {
	var x = Math.map(i, 0, pixel_count_inside, 0, 1, true);
	var y = 0.5;
	model[pixel] = { point: [x, y, 0] };
	pixel++;
}

for(var i=0; i<pixel_count_inside; i++) {
	var x = Math.map(i, 0, pixel_count_inside, 0, 1, true);
	var y = 1;
	model[pixel] = { point: [x, y, 0] };
	pixel++;
}

fs.writeFile("model.json", JSON.stringify(model, null, 4), function(err) {
    if(err) {
		return console.log(err);
    }
    console.log("The file was saved!");
}); 