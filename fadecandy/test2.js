#!/usr/bin/env node

var OPC = new require('./opc');
var client = new OPC('localhost', 7890);


Math.clamp = function(num, min, max) {
    if(min>max) console.warn("Math.clamp: min > max");
    return Math.min(Math.max(num, min), max);
};
Math.map = function (value, istart, istop, ostart, ostop, clamp) {
    var val = ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
    return clamp ? Math.clamp(val, Math.min(ostart, ostop), Math.max(ostart, ostop)) : val;
}

var sigma = 0;
var draw = function() {
    var now = new Date().getTime();
    var deltaTime = now - lastFrame;
    lastFrame = now;

    sigma += deltaTime / 1000;
   
    var val = Math.map(Math.cos(sigma), -1, 1, 0, 255);
    for (var pixel = 0; pixel < 512; pixel++)
    {
        client.setPixel(pixel, val, val, val);
    }
    client.writePixels();
}

var lastFrame = new Date().getTime();
setInterval(draw, 10);
