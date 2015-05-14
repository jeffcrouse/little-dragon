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
var host = "ws://luisaph.local:9998";
var ws = new WebSocket(host);

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

