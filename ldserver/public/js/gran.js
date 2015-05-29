//INIT INTERFACE

var ldInterface;

nx.onload = function() {
		
  nx.sendsTo("js");
  nx.colorize("#00ff00");
  nx.colorize("accent", "#FF00FF");
  nx.colorize("fill", "#00FFFF");  
  
  nx.setViewport(0.5);
  
  switch(window.phone){
      case "1":
        createControl("range", 1);
        break;
      case "2":
        var controls = createControl("multislider", 1);
         
        controls.setNumberOfSliders(5);
        break;
      case "3":
        createControl("tilt", 1);
        break;
      case "4":
        createControl("button", 2);
        break;
      case "5":
        createControl("button", 3);
        break;
      case "6":
        createControl("button", 4);
        break;
      case "7":
        createControl("button", 5);
        break;
      case "8":
        createControl("button", 6);

      case "9":
        var controls = createControl("multislider", 1);
         
        controls.setNumberOfSliders(5);

        ldInterface = MultiSliderInterface({
          controller: controls
        });

        break;
        

      case "10":
        var controls = createControl("multislider", 1);
         
        controls.setNumberOfSliders(5);

        ldInterface = BlendParticles({
          controller: controls,
          spritePath: "/textures/hexagon.png", // "/textures/sphereNormal.png"
          numSpritesX: 20,
          spriteSize: 150,
          spriteBlending: 2,
          spriteOpacity: .45,
          c0: new THREE.Color( 0x34FFFF ),
          c1: new THREE.Color( 0xFF34FF ),
        });

        break;
          

      case "11":
        var controls = createControl("multislider", 1);
         
        controls.setNumberOfSliders(10);

        ldInterface = BlendParticles({
          controller: controls,
          spritePath: "/textures/sphereNormal.png",
          numSpritesX: 40,
          spriteSize: 60,
          spriteBlending: 2,
          spriteOpacity: .45,
          c0: new THREE.Color( 0x34FFFF ),
          c1: new THREE.Color( 0xFF34FF ),
          spriteNoiseAmount: 0
        });

        break;

        

      case "12":
        var controls = createControl("multislider", 1);
         
        controls.setNumberOfSliders(3);

        ldInterface = BlendParticles({
          controller: controls,
          spritePath: "/textures/hexagon.png", // "/textures/sphereNormal.png"
          numSpritesX: 50,
          spriteSize: 75,
          spriteBlending: 2,
          spriteOpacity: .35,
          c0: new THREE.Color( 0x34FFFF ),
          c1: new THREE.Color( 0xFF34FF ),
        });

        break;
      default:  
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
      ws.send(JSON.stringify(eventObject));
    });
    // widget.colors.fill("#F0F0F0");
    // widget.colorize("#F0F0F0"); 
    console.log(widget.colors.fill);
    return widget;
}



//INIT COMMUNICATION
var ws = new WebSocket(window.ws_addr);

ws.onopen = function()
{	
	console.log("opened connection");
};

ws.onmessage = function (evt) 
{
	var received_msg = evt.data;
	console.log("Message received: "+received_msg)
};

ws.onclose = function()
{ 
  // websocket is closed.
  console.log("Connection is closed..."); 
};


