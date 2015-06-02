var osc = require('node-osc');

var oscClient = function(options) {
	var ip = options.ip;
	var client = new osc.Client(ip, 3333);
	var loop_i = setInterval(function(){
		client.send("/tick", JSON.stringify({"time": new Date()}));
	}, 1000);


	this.send = function(addr, message) {
		client.send(addr, message);
	}

	this.close = function() {
		if(loop_i) clearInterval(loop_i);
	}
}

module.exports = oscClient;