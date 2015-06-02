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
var lighten = function(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

var px = function(num){ return num+"px"; }


nx.onload = function() {

	nx.sendsTo("js");
	nx.colorize("#00ff00");
	nx.colorize("accent", "#FF00FF");
	nx.colorize("fill", "#00FFFF");  
	nx.setViewport(0.5);

	console.log("iface", iface);
	switch( iface ){
			
		//  ___   _  _______  __   __  _______ 
		// |   | | ||       ||  | |  ||       |
		// |   |_| ||    ___||  |_|  ||  _____|
		// |      _||   |___ |       || |_____ 
		// |     |_ |    ___||_     _||_____  |
		// |    _  ||   |___   |   |   _____| |
		// |___| |_||_______|  |___|  |_______|
                      
		case "keys1":
			createControl("keys", "range", 1);
			break;

		case "keys2":
			var controls = createControl("keys", "multislider", 1);
			controls.setNumberOfSliders(5);
			break;

		case "keys3":
			var controls = createControl("keys", "keyboard", 1);
			controls.multitouch = true;
			controls.octaves = 1;
			controls.keypattern = ['w','w','w','w'];
			controls.lineWidth = 20;
			controls.init();
			break;

		case "keys4":
			createControl("keys", "button", 3);
			break;

		case "keys5":
			createControl("keys", "button", 2);
			break;

		case "keystilt":
			createControl("keys", "tilt", 1);
			break;



		//  _______  _______  _______  _______ 
		// |  _    ||   _   ||       ||       |
		// | |_|   ||  |_|  ||  _____||  _____|
		// |       ||       || |_____ | |_____ 
		// |  _   | |       ||_____  ||_____  |
		// | |_|   ||   _   | _____| | _____| |
		// |_______||__| |__||_______||_______|
	
		case "bass1":
	 	case "bassParticles":

	 		var control = createControl("bass", "keyboard", 3);
	 		control.octaves = 1;
	 		control.multitouch = true;
	 		control.init();

	 		ldInterface = BlendParticles({
	 			controller: control,
	 			spritePath: "textures/hexagon.png", // "/textures/sphereNormal.png"
	 			numSpritesX: 40,
	 			spriteSize: 75,
	 			spriteNoiseAmount: .1,
	 			spriteOpacity: .5,
	 			spread: 0,
	 			spreadOffset: new THREE.Vector2( 0, 0 ),
	 			c0: new THREE.Color( 0x44CCDD),
	 			c1: new THREE.Color( 0xCC44DD ),
	 		});
	 		break;


		case "bass2":
			var controls = createControl("bass", "multislider", 1);
			 
			controls.setNumberOfSliders(2);

			ldInterface = MultiSliderInterface({
				controller: controls
			});

			break;

		case "bass3":
			createControl("bass", "button", 1);

			break;

		case "bass4":

			var controls = createControl("bass", "multislider", 3);
			 
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
			  

		case "bass5":
			var controls = createControl("bass", "multislider", 4);
			 
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

		case "basstilt":
			createControl("bass", "tilt", 1);

			break;


		//  ______   ______    __   __  __   __  _______ 
		// |      | |    _ |  |  | |  ||  |_|  ||       |
		// |  _    ||   | ||  |  | |  ||       ||  _____|
		// | | |   ||   |_||_ |  |_|  ||       || |_____ 
		// | |_|   ||    __  ||       ||       ||_____  |
		// |       ||   |  | ||       || ||_|| | _____| |
		// |______| |___|  |_||_______||_|   |_||_______|
	    
	    case "drums1":
		case "drumsParticles":

		   var control = createControl("drum", "button", 4);

		   ldInterface = BlendParticles({
		     controller: control,
		     spritePath: "textures/hexagon.png", // "/textures/sphereNormal.png"
		     numSpritesX: 30,
		     spriteSize: 150,
		     spriteBlending: 2,
		     spriteOpacity: .34,
		     spread: .2,
		     c0: new THREE.Color( 0x34FFFF ),
		     c1: new THREE.Color( 0xFF34FF ),
		   });

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
			var controls = createControl("drum", "multislider", 4);
			 
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

		case "drumstilt":
		    var control = createControl("drum", "tilt", 1);
		    control.text = "something";
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



function createControl(instrument, type, number, options){
	var id = [instrument, type, number].join("_");
	var defaults = {"id": id, "parent":"controls", "w": "1280px", "h": "720px"};
	var settings = $.extend(defaults, options);

	var widget = nx.add(type, settings).on('*', function(data) {
		// console.log(data);
		if(ldInterface){
			var eventObject = {"event":id, "data":data};
			ldInterface.widgetEvent( eventObject );
		}
		if(osc) {
			var addr = "/" + id;
			osc.send(addr, JSON.stringify(data));
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
