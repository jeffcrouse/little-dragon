
var oscSender = null;					// The OSC sender object (send to the server)
var oscListener = null;					// Receive OSC from the server
var myIP = null;
var ldInterface = null;					// WebGL layer (?)
var iface = getQueryVariable("iface"); // which interface should we show?


nx.onload = function() {

	nx.sendsTo("js");
	nx.colorize("#00ff00");
	nx.colorize("accent", "#FF00FF");
	nx.colorize("fill", "#00FFFF");  
	nx.setViewport(0.5);

	console.log("iface", iface);
	switch( iface ){		
		//  __   __  _______  ___   _______  _______ 
		// |  | |  ||       ||   | |       ||       |
		// |  |_|  ||   _   ||   | |       ||    ___|
		// |       ||  | |  ||   | |       ||   |___ 
		// |       ||  |_|  ||   | |      _||    ___|
		//  |     | |       ||   | |     |_ |   |___ 
		//   |___|  |_______||___| |_______||_______|
		   
		case "voicefx":
			var control = createControl("vocals", "multislider", 1);
			control.setNumberOfSliders(2);

			ldInterface = TouchLines({
			  controller: control,
			  colorRampPath: "textures/keys/key-1.jpg",
			  lineWidth: 4,
			  lineLength: 20,
			  rotation: 3,
			  noiseScale: .005
			});

			break;
			
		//  ___   _  _______  __   __  _______ 
		// |   | | ||       ||  | |  ||       |
		// |   |_| ||    ___||  |_|  ||  _____|
		// |      _||   |___ |       || |_____ 
		// |     |_ |    ___||_     _||_____  |
		// |    _  ||   |___   |   |   _____| |
		// |___| |_||_______|  |___|  |_______|
                      
		case "keyscontrols":
			var control = createControl("keys", "multislider", 1);
			control.setNumberOfSliders(4);

			ldInterface = TouchLines({
			  controller: control,
			  colorRampPath: "textures/keys/key-1.jpg",
			  lineWidth: 4,
			  lineLength: 20,
			  rotation: 3,
			  noiseScale: .005
			});
			
			break;

		case "keys2":
			var control = createControl("keys", "keyboard", 1);
			control.multitouch = true;
			control.octaves = 1;
			control.keypattern = ['w','w','w','w','w','w','w'];
			control.lineWidth = 20;
			control.init();

			ldInterface = TouchLines({
			  controller: control,
			  colorRampPath: "textures/keys/key-2.jpg",
			  lineWidth: 4,
			  lineLength: 20,
			  rotation: 3,
			  noiseScale: .005
			});

			break;

		case "keys3":
			var control = createControl("keys", "keyboard", 2);
			control.multitouch = true;
			control.octaves = 1;
			control.keypattern = ['w','w','w','w','w','w','w'];
			control.lineWidth = 20;
			control.init();

			ldInterface = TouchLines({
			  controller: control,
			  colorRampPath: "textures/keys/key-3.jpg",
			  lineWidth: 4,
			  lineLength: 20,
			  rotation: 3,
			  noiseScale: .005
			});

			break;

		case "keys4":

			var control = createControl("keys", "keyboard", 3);
			control.multitouch = true;
			control.octaves = 1;
			control.keypattern = ['w','w','w','w','w','w','w'];
			control.lineWidth = 20;
			control.init();

			ldInterface = TouchLines({
			  controller: control,
			  colorRampPath: "textures/keys/key-4.jpg",
			  lineWidth: 4,
			  lineLength: 20,
			  rotation: 3,
			  noiseScale: .005
			});

			break;

		case "keys5":
			var control = createControl("keys", "keyboard", 4);
			control.multitouch = true;
			control.octaves = 1;
			control.keypattern = ['w','w','w','w','w','w','w'];
			control.lineWidth = 20;
			control.init();

			ldInterface = TouchLines({
			  controller: control,
			  colorRampPath: "textures/keys/key-5.jpg",
			  lineWidth: 4,
			  lineLength: 20,
			  rotation: 3,
			  noiseScale: .005
			});

			break;

		case "keystilt":
			var control = createControl("keys", "tilt", 1);
			control.text = "pan";
			break;


		//  _______  _______  _______  _______ 
		// |  _    ||   _   ||       ||       |
		// | |_|   ||  |_|  ||  _____||  _____|
		// |       ||       || |_____ | |_____ 
		// |  _   | |       ||_____  ||_____  |
		// | |_|   ||   _   | _____| | _____| |
		// |_______||__| |__||_______||_______|
	
		case "basscontrols":
	 		var control = createControl("bass", "multislider", 1);
			control.setNumberOfSliders(4);
			
			ldInterface = TouchLines({
			  controller: control,
			  colorRampPath: "textures/bass/bass1.jpg",
			  lineWidth: 4,
			  lineLength: 20,
			  rotation: 3,
			  noiseScale: .005
			});

	 		break;

		case "bass1":
			var control = createControl("bass", "keyboard", 1);
			control.multitouch = true;
			control.octaves = 1;
			control.keypattern = ['w','w','w','w'];
			control.lineWidth = 20;
			control.init();

			ldInterface = TouchLines({
			  controller: control,
			  colorRampPath: "textures/bass/bass1.jpg",
			  lineWidth: 4,
			  lineLength: 20,
			  rotation: 3,
			  noiseScale: .005
			});
	 		
			break;

		case "bass2":
			var control = createControl("bass", "keyboard", 2);
	 		control.octaves = 1;
	 		control.multitouch = true;
	 		control.keypattern = ['w','w','w'];
			control.lineWidth = 20;
	 		control.init();
	 		
	 		ldInterface = TouchLines({
	 		  controller: control,
	 		  colorRampPath: "textures/bass/bass2.jpg",
	 		  lineWidth: 4,
	 		  lineLength: 20,
	 		  rotation: 3,
	 		  noiseScale: .005
	 		});

			break;

		case "bass3":
			var control = createControl("bass", "keyboard", 3);
	 		control.octaves = 1;
	 		control.multitouch = true;
	 		control.keypattern = ['w','w','w','w'];
			control.lineWidth = 20;
	 		control.init();

	 		ldInterface = TouchLines({
	 		  controller: control,
	 		  colorRampPath: "textures/bass/bass3.jpg",
	 		  lineWidth: 4,
	 		  lineLength: 20,
	 		  rotation: 3,
	 		  noiseScale: .005
	 		});

			break;
			  

		case "bass4":
			var control = createControl("bass", "keyboard", 4);
	 		control.octaves = 1;
	 		control.multitouch = true;
	 		control.keypattern = ['w','w','w'];
			control.lineWidth = 20;
	 		control.init();

	 		ldInterface = TouchLines({
	 		  controller: control,
	 		  colorRampPath: "textures/bass/bass4.jpg",
	 		  lineWidth: 4,
	 		  lineLength: 20,
	 		  rotation: 3,
	 		  noiseScale: .005
	 		});

			break;

		case "basstilt":
			var control = createControl("bass", "tilt", 1);
			control.text = "pan";
			break;


		//  ______   ______    __   __  __   __  _______ 
		// |      | |    _ |  |  | |  ||  |_|  ||       |
		// |  _    ||   | ||  |  | |  ||       ||  _____|
		// | | |   ||   |_||_ |  |_|  ||       || |_____ 
		// | |_|   ||    __  ||       ||       ||_____  |
		// |       ||   |  | ||       || ||_|| | _____| |
		// |______| |___|  |_||_______||_|   |_||_______|
	    
	    case "drumscontrols":
			var control = createControl("drum", "multislider", 4);
			 
			control.setNumberOfSliders(3);

			ldInterface = TouchLines({
			  controller: control,
			  colorRampPath: "textures/bass/bass1.jpg",
			  lineWidth: 4,
			  lineLength: 20,
			  rotation: 3,
			  noiseScale: .005
			});

		    break;

		case "drumstilt":
		    var control = createControl("drum", "tilt", 1);
		    control.text = "something";
		    break;

	    case "drums1":
		// case "drumsParticles":
		   // createControl("drum", "button", 1);
			
		    var control = createControl("drum", "button", 1);

				
			//http://odddivision.github.io/little-dragon/ldapp/www/instrument.html?iface=drums1&lineWidth=4&lineLength=20&rotation=3&noiseScale=.005&timeScale=1
			ldInterface = TouchLines({
			  controller: control,
			  colorRampPath: "textures/drums/drum-1.jpg",
			  lineWidth: 4,
			  lineLength: 16,
			  rotation: 3,
			  noiseScale: .005
			});
		   break;

	    case "drums2":
		    var control = createControl("drum", "button", 2);

		    ldInterface = TouchLines({
		      controller: control,
		      colorRampPath: "textures/drums/drum-2.jpg",
		      lineWidth: 4,
		      lineLength: 20,
		      rotation: 3,
		      noiseScale: .005
		    });
		    break;

		case "drums3":
		    var control = createControl("drum", "button", 3);

		    ldInterface = TouchLines({
		      controller: control,
		      colorRampPath: "textures/drums/drum-3.jpg",
		      lineWidth: 4,
		      lineLength: 20,
		      rotation: 3,
		      noiseScale: .005
		    });
		    break;

		case "drums4":
		    var control = createControl("drum", "button", 4);

		    ldInterface = TouchLines({
		      controller: control,
		      colorRampPath: "textures/drums/drum-4.jpg",
		      lineWidth: 4,
		      lineLength: 20,
		      rotation: 3,
		      noiseScale: .005
		    });
		    break;

		




		//  __   __  _______  _______  _______  ___      _______ 
		// |  | |  ||       ||       ||   _   ||   |    |       |
		// |  |_|  ||   _   ||       ||  |_|  ||   |    |  _____|
		// |       ||  | |  ||       ||       ||   |    | |_____ 
		// |       ||  |_|  ||      _||       ||   |___ |_____  |
		//  |     | |       ||     |_ |   _   ||       | _____| |
		//   |___|  |_______||_______||__| |__||_______||_______|




		 // __      _______ ___ ___ 
		 // \ \    / /_   _| __|__ \
		 //  \ \/\/ /  | | | _|  /_/
		 //   \_/\_/   |_| |_|  (_) 
		                         
	    default:
			var container = $("<div>", {id: "warning"}).css({
				position: "absolute",
				left: 0,
				height: "300px",
				width: "100%",
				"font-size": "250%",
				"text-align": "center",
				"vertical-align": "middle",
				"line-height": "90px"     
			}).appendTo( document.body );
			container.html("Not yet implemented.");
	   		break;
	}

}

// Round all of the floats in an object (for optimized network sending)
function roundFloats(obj) {
    for (var k in obj) {
        if (typeof obj[k] == "object" && obj[k] !== null) 
        	 roundFloats( obj[k] ); // recurse objects
        else if(typeof obj[k] == 'number' && obj[k] % 1 != 0)
        	obj[k] = parseFloat( obj[k].toFixed(3) );
    }
}

function createControl(instrument, type, number, options){
	var id = [instrument, type, number].join("_");
	var defaults = {"id": id, "parent":"controls", "w": "1280px", "h": "720px"};
	var settings = $.extend(defaults, options);

	var widget = nx.add(type, settings).on('*', function(data) {
		roundFloats(data);

		if(ldInterface){
			// var eventObject = {"event":id, "data":data};
			ldInterface.widgetEvent( data );
		}

		if(oscSender) {
			var addr = "/" + id;
			console.log(addr, JSON.stringify(data));
			oscSender.send(addr, JSON.stringify(data), null,
				function(err){ console.error( "oscSender.send", err ); } );
		} else {
			console.warn("oscSender not yet constructed!")
		}
	});
	// widget.colors.fill("#F0F0F0");
	// widget.colorize("#F0F0F0"); 
	console.log(widget.colors.fill);
	return widget;
}


// This kicks off all of the device-specific/Cordova stuff. 
var onDeviceReady = function() {
	// Print out some useful info
	console.log('deviceready');
	console.log( "navigator.userAgent", navigator.userAgent );
	console.log( "device.uuid", device.uuid );

	// Called when device is paused
	var onPause = function(e) {
		if(oscSender) {
			console.log("/leave", JSON.stringify({"ip": myIP, "iface": iface}));
			oscSender.send("/leave", JSON.stringify({"ip": myIP, "iface": iface}));
		}
	}

	// Called when device is resumed
	var onResume = function(e) {
		if(oscSender) {
			console.log("/join", JSON.stringify({"ip": myIP, "iface": iface}));
			oscSender.send("/join", JSON.stringify({"ip": myIP, "iface": iface}));
		}
	}

	// Called when ZeroConf gets a notification of an available service 
	var onZeroConf = function(event){
		console.log("ZeroConf service", event);

		if(event.action=="added" && event.service.addresses.length && 
			event.service.name=="ld-luisa" && oscSender==null) {
			var host =  event.service.addresses[0];
			var port =  event.service.port;

			// Construct the osc
			console.log("Found LittleDragon OSC server", host, port);
			oscSender = new window.OSCSender(host, port);

			// Now that we have an OSCSender, get the IP address of the device 
			// so that we can send a "/join" message to the server
			networkinterface.getIPAddress(onIPAddress);
		}
	}

	// Called when networkinterface gets the IP address of the device.
	// Announce to the server that we are here, 
	// also set up a listener to listen for messages from the server
	var onIPAddress = function (ip) { 
		myIP = ip;
		console.log("myIP", myIP);

		onResume();

		oscListener = new window.OSCListener(3333);
		var onSuccess =  function(){ console.log("listening for OSC on port", 3333); };
		var onError = function(){ console.error("failed to open OSC port for listening"); };
		oscListener.startListening(onSuccess, onError);
		oscListener.on("/tick", function(data){
			console.log("/tick", data);
		});
	}

	// Disable as many buttons as possible.
	var _stop = function(e){ e.preventDefault(); };
	document.addEventListener("backbutton", _stop, false);
	document.addEventListener("menubutton", _stop, false);
	document.addEventListener("searchbutton", _stop, false);
	document.addEventListener("startcallbutton", _stop, false);
	document.addEventListener("endcallbutton", _stop, false);
	document.addEventListener("pause", onPause, false);
	document.addEventListener("resume", onResume, false);


	// Listen for the OSC server to advertise itself
	var zeroConfAddr = "_osc._udp.local.";
	console.log("Listen for zeroconf service", zeroConfAddr);
	ZeroConf.watch(zeroConfAddr, onZeroConf);
}
document.addEventListener('deviceready', onDeviceReady, false);




/*

// CORDOVA LAUNCH STUFF
var app = {

    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);


    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
		app.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();
*/
