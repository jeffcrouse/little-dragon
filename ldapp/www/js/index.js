console.log("Watching for _osc._udp.local.");
ZeroConf.watch("_osc._udp.local.", function(event){
	console.log("ZeroConf service");
	console.log(event);
	if(event.action=="added" && event.service.name=="ld") {
		console.log("Found LittleDragon OSC server", event.service.addresses[0], event.service.port);
	}
});