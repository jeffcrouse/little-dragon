/*
var loop = function() {
	navigator.vibrate(100);
	osc.send("/test", [1, 2, 3, 4, new Date()]);
	setTimeout(loop, 1000);
}
loop();
*/

var osc = null;				// The OSC sender object
var ldInterface = null;		// WebGL layer (?)
var iface = getQueryVariable("iface"); // which interface should we show?


nx.onload = function() {

	nx.sendsTo("js");
	nx.colorize("#00ff00");
	nx.colorize("accent", "#FF00FF");
	nx.colorize("fill", "#00FFFF");  
	nx.setViewport(0.5);

	console.log("iface", iface);
	switch( iface ){
			
		 //   ___                   _            ___          _   _    
		 //  / __|_ _ __ _ _ _ _  _| |__ _ _ _  / __|_  _ _ _| |_| |_  
		 // | (_ | '_/ _` | ' \ || | / _` | '_| \__ \ || | ' \  _| ' \ 
		 //  \___|_| \__,_|_||_\_,_|_\__,_|_|   |___/\_, |_||_\__|_||_|
		 //                                          |__/              
		case "gran1":
			createControl("gran", "range", 1);
			break;

		case "gran2":
			var controls = createControl("gran", "multislider", 1);
			controls.setNumberOfSliders(5);
			break;

		case "gran3":
			createControl("button", 4);
			break;

		case "gran4":
			createControl("gran", "button", 3);
			break;

		case "gran5":
			createControl("gran", "button", 2);
			break;

		case "grantilt":
			createControl("gran", "tilt", 1);
			break;



		 //  ___          _   _           _            
		 // / __|_  _ _ _| |_| |_  ___ __(_)______ _ _ 
		 // \__ \ || | ' \  _| ' \/ -_|_-< |_ / -_) '_|
		 // |___/\_, |_||_\__|_||_\___/__/_/__\___|_|  
		 //      |__/                                  

		case "synth1":
			var control = createControl("synth", "keyboard", 1);
			control.octaves = 2;
			control.init();
			break;

		case "synth2":
			createControl("synth", "button", 6);
			break;

		case "synth3":
			var controls = createControl("synth", "multislider", 1);
			 
			controls.setNumberOfSliders(5);

			ldInterface = MultiSliderInterface({
				controller: controls
			});

			break;

		case "synth4":
			var controls = createControl("synth", "multislider", 2);
			 
			controls.setNumberOfSliders(5);

			ldInterface = BlendParticles({
				controller: controls,
				spritePath: "textures/hexagon.png", // "/textures/sphereNormal.png"
				numSpritesX: 20,
				spriteSize: 150,
				spriteBlending: 2,
				spriteOpacity: .45,
				c0: new THREE.Color( 0x34FFFF ),
				c1: new THREE.Color( 0xFF34FF ),
			});

			break;
			  

		case "synth5":
			var controls = createControl("synth", "multislider", 3);
			 
			controls.setNumberOfSliders(10);

			ldInterface = BlendParticles({
				controller: controls,
				spritePath: "textures/sphereNormal.png",
				numSpritesX: 40,
				spriteSize: 60,
				spriteBlending: 2,
				spriteOpacity: .45,
				c0: new THREE.Color( 0x34FFFF ),
				c1: new THREE.Color( 0xFF34FF ),
				spriteNoiseAmount: 0
			});

			break;


		case "synthtilt":

			var controls = createControl("synth", "multislider", 4);
			 
			controls.setNumberOfSliders(3);

			ldInterface = BlendParticles({
				controller: controls,
				spritePath: "textures/hexagon.png", // "/textures/sphereNormal.png"
				numSpritesX: 50,
				spriteSize: 75,
				spriteBlending: 2,
				spriteOpacity: .35,
				c0: new THREE.Color( 0x34FFFF ),
				c1: new THREE.Color( 0xFF34FF ),
			});

			break;


		 //  ___                    
		 // |   \ _ _ _  _ _ __  ___
		 // | |) | '_| || | '  \(_-<
		 // |___/|_|  \_,_|_|_|_/__/
		                         
	    case "drums1":
		    createControl("drum", "button", 1);
		    break;

	    case "drums2":
		    createControl("drum", "button", 2);
		    break;

		case "drums3":
		    createControl("drum", "button", 3);
		    break;

		case "drums4":
		    createControl("drum", "button", 4);
		    break;

		case "drums5":
		    createControl("drum", "button", 5);
		    break;

		case "drumstilt":
		    createControl("drum", "tilt", 1);
		    break;
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

function createControl(instrument, type, number){
  var id = [instrument, type, number].join("_");
  var settings = {
                    "id": id, 
                    "parent":"controls",
                    "w": "1280px", //window.innerWidth, // 
                    "h": "800px" //window.innerHeight, // 
                  }
  var widget = nx.add(type, settings)
    .on('*', function(data) {
      // console.log(data);
      var eventObject = {"event":id, 
                          "data":data};

      if(ldInterface){
        ldInterface.widgetEvent( eventObject );
      }
      navigator.vibrate(100);
      var addr = "/"+id;

      if(osc) osc.send(addr, JSON.stringify(data));
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
	console.log( navigator.userAgent );
	console.log( device.uuid );

	// Disable as many buttons as possible.
	var _stop = function(e){ e.preventDefault(); };
	document.addEventListener("backbutton", _stop, false);
	document.addEventListener("menubutton", _stop, false);
	document.addEventListener("searchbutton", _stop, false);
	document.addEventListener("startcallbutton", _stop, false);
	document.addEventListener("endcallbutton", _stop, false);


	// Keep the phone awake
	var onSuccess = function(){ console.log("!! We are awake!"); }
	var onError = function(){ console.error("!! Couldn't keep device awake!"); }
	window.plugins.insomnia.keepAwake(onSuccess, onError);

	// Listen for the OSC server to advertise itself
	console.log("Watching for _osc._udp.local.");
	ZeroConf.watch("_osc._udp.local.", function(event){
		console.log("ZeroConf service", event);
		if(event.action=="added" && event.service.name=="ld") {
			var host =  event.service.addresses[0];
			var port =  event.service.port;
			console.log("Found LittleDragon OSC server", host, port);
			osc = new window.OSCSender(host, port);
		}
	});
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
