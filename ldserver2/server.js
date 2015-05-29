var path = require('path');
var util = require('util');
var express = require('express');


var http_port = 3000;
var http_addr = null;
var osc_port = 3333;
require('dns').lookup(require('os').hostname(), function (err, addr, fam) {
	http_addr = util.format("http://%s:%s", addr, http_port);
	console.log('http_addr', http_addr);
	console.log("osc", addr, osc_port);
});


/********************************************************
███████╗██╗  ██╗██████╗ ██████╗ ███████╗███████╗███████╗
██╔════╝╚██╗██╔╝██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝
█████╗   ╚███╔╝ ██████╔╝██████╔╝█████╗  ███████╗███████╗
██╔══╝   ██╔██╗ ██╔═══╝ ██╔══██╗██╔══╝  ╚════██║╚════██║
███████╗██╔╝ ██╗██║     ██║  ██║███████╗███████║███████║
╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
********************************************************/

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res) {
	var data = {"title": 'Little Dragon Server'};
	res.render('index', data);
});

app.listen(http_port);


/************************
 ██████╗ ███████╗ ██████╗
██╔═══██╗██╔════╝██╔════╝
██║   ██║███████╗██║     
██║   ██║╚════██║██║     
╚██████╔╝███████║╚██████╗
 ╚═════╝ ╚══════╝ ╚═════╝
*************************/

var osc = require('node-osc');

var oscServer = new osc.Server(osc_port, "0.0.0.0");

oscServer.on("message", function (msg, rinfo) {
	console.log(msg);
	var addr = msg.shift();
	if(addr=="/touch") {

	}
});