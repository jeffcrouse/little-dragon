
// Load this stuff from somewhere remote
var settings = {
	osc_host: "192.168.0.107",
	osc_port: 3333,
	device_map: {
		"76ec865819c137ff": { id: 1, ui: 10 },
		"9f7e53d36f8ed9e9": { id: 2, ui: 11 },
		"95f05e26df84e87f": { id: 3, ui: 12 },
		"cc24d0c197a5d420": { id: 4, ui: 4 },
		"61adc6d72a141a6f": { id: 5, ui: 5 },
		"cc6558defee3fb4": 	{ id: 6, ui: 6 },
	}
}



/*
var loop = function() {
	navigator.vibrate(100);
	osc.send("/test", [1, 2, 3, 4, new Date()]);
	setTimeout(loop, 1000);
}
loop();
*/

var osc = null;		// The OSC sender object
var _device = null;	// All device-specific information (determined by UUID)
var ldInterface = null;

var onDeviceReady = function() {
	console.log('deviceready');
	console.log( navigator.userAgent );
	console.log( device.uuid )


	var onSuccess = function(){ console.log("!! We are awake!"); }
	var onError = function(){ console.error("!! Couldn't keep device awake!"); }
	window.plugins.insomnia.keepAwake(onSuccess, onError);

	_device = settings.device_map[device.uuid];
	osc = new window.OSCSender(settings.osc_host, settings.osc_port);


	nx.sendsTo("js");
	nx.colorize("#00ff00");
	nx.colorize("accent", "#FF00FF");
	nx.colorize("fill", "#00FFFF");  
	nx.setViewport(0.5);

	switch( _device.ui ){
	
	  case 1:
	    createControl("range", 1);
	    break;

	  case 2:
	    var controls = createControl("multislider", 1);
	     
	    controls.setNumberOfSliders(5);
	    break;
	  case 3:
	    createControl("tilt", 1);
	    break;

	  case 4:
	    createControl("button", 2);
	    break;

	  case 5:
	    createControl("button", 3);
	    break;

	  case 6:
	    createControl("button", 4);
	    break;

	  case 7:
	    createControl("button", 5);
	    break;

	  case 8:
	    createControl("button", 6);

	  case 9:
	    var controls = createControl("multislider", 1);
	     
	    controls.setNumberOfSliders(5);

	    ldInterface = MultiSliderInterface({
			controller: controls
	    });

	    break;

	  case 10:
	    var controls = createControl("multislider", 1);
	     
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
	      

	  case 11:
	    var controls = createControl("multislider", 1);
	     
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

	  
	  case 12:

	    var controls = createControl("multislider", 1);
	     
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

	    default:
	    	// to do - show some kind of warning message
	   		break;
	}

}


nx.onload = function() {
	document.addEventListener('deviceready', onDeviceReady, false);

	var _stop = function(e){ e.preventDefault(); };
	document.addEventListener("backbutton", _stop, false);
	document.addEventListener("menubutton", _stop, false);
	document.addEventListener("searchbutton", _stop, false);
	document.addEventListener("startcallbutton", _stop, false);
	document.addEventListener("endcallbutton", _stop, false);
}


function createControl(controlType, controlNumber){
  var id = "gran_" + controlType + "_" + controlNumber;
  var settings = {
                    "id": id, 
                    "parent":"controls",
                    "w": "1280px", //window.innerWidth, // 
                    "h": "800px" //window.innerHeight, // 
                  }
  var widget = nx.add(controlType, settings)
    .on('*', function(data) {
      // console.log(data);
      var eventObject = {"event":id, 
                          "data":data};

      if(ldInterface){
        ldInterface.widgetEvent( eventObject );
      }
      navigator.vibrate(100);
      var addr = "/"+id;

      osc.send(addr, JSON.stringify(data));
    });
    // widget.colors.fill("#F0F0F0");
    // widget.colorize("#F0F0F0"); 
    console.log(widget.colors.fill);
    return widget;
}







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

		console.log( navigator.userAgent );

		var onSuccess = function(){ console.log("We are awake!"); }
		var onError = function(){ console.error("!! Couldn't keep device awake!"); }
		window.plugins.insomnia.keepAwake(onSuccess, onError);

		// console.log( device.uuid )
		_device = DEVICE_MAP[device.uuid];

		nx.onload = setup_neuxus;

		osc = new window.OSCSender(OSC_HOST, OSC_PORT);
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        // var parentElement = document.getElementById(id);
        // var listeningElement = parentElement.querySelector('.listening');
        // var receivedElement = parentElement.querySelector('.received');

        // listeningElement.setAttribute('style', 'display:none;');
        // receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();
*/