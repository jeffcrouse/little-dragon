//INIT INTERFACE

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
        createControl("multislider", 1)
          .setNumberOfSliders(5);
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
        break;
  }
	
}

function createControl(controlType, controlNumber){
  var id = "gran_" + controlType + "_" + controlNumber;
  var settings = {
                    "id": id, 
                    "parent":"controls",
                    "w":"1280px",
                    "h":"800px"
                  }
  var widget = nx.add(controlType, settings)
    .on('*', function(data) {
      console.log(data);
      var eventObject = {"event":id, 
                          "data":data};
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



// INIT MISC
function isFullScreen() {
  return doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
}
function setFullScreen(fullscren) {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if(fullscren) {
    requestFullScreen.call(docEl);
  } else {
    cancelFullScreen.call(doc);
  }
}
// Keep this around in case we want any raw touch events
document.body.addEventListener('touchstart', function(event) {
  if(!isFullScreen()) {
    toggleFullScreen(true);
  } 
  
  if (event.targetTouches.length == 1) {
    // var touch = event.targetTouches[0];
    // ws.send(JSON.stringify({"event": "single"}));
  } else if (event.targetTouches.length == 2) {
    // var touch = event.targetTouches[0];
    // ws.send(JSON.stringify({"event": "double"}));
  }
}, false);

