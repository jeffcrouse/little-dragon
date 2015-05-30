

// Just for testing -- not used for anything.
var onDeviceReady = function() {
	var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    console.log('Connection type: ' + states[networkState]);

	// Just for testing -- not used for anything.
	console.log("Watching for _osc._udp.local.");
	ZeroConf.watch("_osc._udp.local.", function(event){
		console.log("ZeroConf service");
		console.log(event);
		if(event.action=="added" && event.service.name=="ld") {
			console.log("Found LittleDragon OSC server", event.service.addresses[0], event.service.port);
		}
	});   
	

	// Keep the phone awake
	var onSuccess = function(){ console.log("!! We are awake!"); }
	var onError = function(){ console.error("!! Couldn't keep device awake!"); }
	window.plugins.insomnia.keepAwake(onSuccess, onError); 
}
document.addEventListener('deviceready', onDeviceReady, false);

