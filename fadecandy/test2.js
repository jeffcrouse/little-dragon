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

var red = Math.random();
var green = Math.random();
var blue = Math.random();

var draw = function() {
    var now = new Date().getTime();
    var deltaTime = now - lastFrame;
    lastFrame = now;

    red += deltaTime / 300;
    green += deltaTime / 400;
    blue += deltaTime / 500;

    var r = Math.map(Math.cos(red), -1, 1, 50, 255);
    var g = Math.map(Math.cos(green), -1, 1, 50, 255);
    var b = Math.map(Math.cos(blue), -1, 1, 50, 255);

    for (var pixel = 0; pixel < 600; pixel++)
    {
        client.setPixel(pixel, r, g, b);
    }
    client.writePixels();
}

var lastFrame = new Date().getTime();
setInterval(draw, 10);
