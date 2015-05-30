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
var interface = parseInt(getQueryVariable("interface")); // which interface should we show?


nx.onload = function() {

	nx.sendsTo("js");
	nx.colorize("#00ff00");
	nx.colorize("accent", "#FF00FF");
	nx.colorize("fill", "#00FFFF");  
	nx.setViewport(0.5);

	switch( interface ){
	
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
	    break;

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
	console.log("interface", interface);

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