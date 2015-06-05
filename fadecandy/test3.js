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


var num_pixels = 320;
var pixels = [];
for(var i=0; i<num_pixels; i++) {
    var pixel = {
        pos: (i / num_pixels),
        r: 0,
        g: 0,
        b: 0,
        fade: function(deltaTime) {
            this.r -= deltaTime * 10;
            this.g -= deltaTime * 10;
            this.b -= deltaTime * 10;

            this.r = Math.clamp(this.r, 0, 255);
            this.g = Math.clamp(this.g, 0, 255);
            this.b = Math.clamp(this.b, 0, 255);

        }
    };
    pixels.push(pixel);
}


var lastParticle = new Date();
var particlePeriod = 1.0;
var particleSpeed = 1.0;
var particles = [];
var period = 5000;



var draw = function() {
    var now = new Date().getTime();
    var deltaTime = (now - lastFrame) / 1000.0;
    lastFrame = now;


    var elapsed = now - lastParticle;
    if(elapsed > period) {
        var particle = {
            pos: 0,
            width: 2/num_pixels.
            r: Math.random() * 255,
            g: Math.random() * 255,
            b: Math.random() * 255,
            update: function(deltaTime){
                this.pos += deltaTime / 5;
            },
            apply: function(pixels) {
                for(var p in pixels) {
                    var dist = Math.abs(pixels[p].pos - this.pos);
                    dist = Math.map(dist, 0, 0.5, 0.01, 0);
                    
                    pixels[p].r += this.r * dist;
                    pixels[p].g += this.g * dist;
                    pixels[p].b += this.b * dist;
                }
            }
        };
        particles.push( particle );
        lastParticle = now;
    }

    for(var p in particles) {
        particles[p].update( deltaTime );
        console.log(p, particles[p].pos);
        if(particles[p].pos > 1) {
            particles.splice(p, 1);
        } else 
            particles[p].apply(pixels);
    }

    for(var p in pixels) {
        pixels[p].fade(deltaTime);
        client.setPixel(p, pixels[p].r, pixels[p].g, pixels[p].b);
    }
    client.writePixels();
}

var lastFrame = new Date().getTime();
setInterval(draw, 10);
