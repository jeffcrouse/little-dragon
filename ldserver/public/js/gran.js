//INIT INTERFACE
nx.onload = function() {
		
  nx.sendsTo("js");
  nx.setViewport(0.5);
  multislider1.setNumberOfSliders(5);
  
  //grain width and pos selector
  range1.on('*', function(data) {
    console.log(data);
    var eventObject = {"event":"grainWidthPos", 
                        "data":data};
    ws.send(JSON.stringify(eventObject));
  });

  //"grab"  (should be momentary button not toggle)
  button1.on('*', function(data) {
    console.log(data);
    var eventObject = {"event":"grab", 
                        "data":data};
    ws.send(JSON.stringify(eventObject));
  });
  
  //ADSR
  envelope1.on('*', function(data) {
    console.log(data);
    var eventObject = {"event":"ADSR", 
                        "data":data};
    ws.send(JSON.stringify(eventObject));
  });

  //...what are the sliders for?   
  multislider1.on('*', function(data) {
    console.log(data);
    ws.send(JSON.stringify(data));
  });

  tilt1.on('*', function(data) {
    console.log(data);
    ws.send(JSON.stringify(data));
  });

  // listen only to the 'x' parameter
  // position1.on('x', function(data) {

  // })
	
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
  alert("Connection is closed..."); 
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

