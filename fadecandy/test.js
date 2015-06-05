
var OPC = new require('./opc');
var model = OPC.loadModel('model.json');
var client = new OPC('localhost', 7890);


Math.clamp = function(num, min, max) {
    if(min>max) console.warn("Math.clamp: min > max");
    return Math.min(Math.max(num, min), max);
};
Math.map = function (value, istart, istop, ostart, ostop, clamp) {
    var val = ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
    return clamp ? Math.clamp(val, Math.min(ostart, ostop), Math.max(ostart, ostop)) : val;
}

/**
*   Represents a single vertical bar (a phone)
*/
var Device = function(num) {

    var x_range = [num/NUM_DEVICES, (num+1)/NUM_DEVICES];
    console.log(x_range);
    var hue = 0.5;
    var saturation = 0.5;
    var value = 1.0;
    var sigma = Math.random();

    this.update = function(deltaTime) {
        sigma += Math.map(deltaTime, 0, 1000, 0, Math.PI);
        hue = Math.cos(sigma);
    }

    this.get_color = function() {
        return OPC.hsv(hue, saturation, value);
    }

    // lhs inclusive, rhs non-inclusive
    this.contains = function(x_pos) {
        return (x_pos >= x_range[0]) && (x_pos<x_range[1]);
    }
}



// Construct a bunch of devices
var NUM_DEVICES = 18;
var devices = [];
for(var i=0; i<NUM_DEVICES; i++) {
     devices[i] = new Device(i);
}




/**
*   Draw loop
*   This is likely very ineffecient - we should probably assign pixels to each "device" 
*   once at setup instead of testing whether they fall within the bounds of a device
*   in each frame.  Fine for a test, though...
*/
function draw()
{
    // Calculate deltaTime
    var now = new Date().getTime();
    var deltaTime = now - lastFrame;
    lastFrame = now;

    for(var i=0; i<NUM_DEVICES; i++) {  
        devices[i].update(deltaTime);
    }

    function shader(p)
    {
        var x = p.point[0];
        var y = p.point[1];
        var z = p.point[2];

        for(var i=0; i<NUM_DEVICES; i++) {
            if(devices[i].contains(x)) {
                return devices[i].get_color();
            }
        }

        console.error("shouldn't reach this!", x);
        return [1.0, 0.0, 0.0];
    }

    client.mapPixels(shader, model);
}



var lastFrame = new Date().getTime();
setInterval(draw, 10);