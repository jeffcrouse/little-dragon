

// var socket = io.connect();
// socket.emit('hello', { my: 'data' });

// socket.on('/keys_range_1', function (data) {
// 	console.log(data);
// });

$(window).bind("load", function() {

	console.log( " \n \n little dragon projection sketch \n \n " );
	
	var projection = ProjectionVisuals({
		lineLength: 32,
		lineWidth: 8,
		spacing: 10,
		spriteRotation: Math.PI * 2,
		noiseScale: .0075,
		noiseAmount: 1,
		timeScale: -1,
		spacing: 10,
		lineOpacity: 1,
		blending: 1
	});



	var guiControls = {
		lineWidth: parseFloat(projection.getLineWidth()),
		lineLength: parseFloat(projection.getLineLength()),
		lineOpacity: parseFloat(projection.getLineOpacity()),
		blending: parseInt(projection.getBlending()),
		rotation: parseFloat(projection.getRotation()),
		noiseScale: parseFloat(projection.getNoiseScale()),
		noiseAmount: parseFloat(projection.getNoiseAmount()),
		timeScale: parseFloat(projection.getTimeScale()),
		groupRotationX: parseFloat(projection.getGroupRotationX()),
		groupRotationY: parseFloat(projection.getGroupRotationY()),
		groupRotationZ: parseFloat(projection.getGroupRotationZ())
	}
	console.log( 'guiControls', guiControls );

	var gui = new dat.GUI();


	// gui.remember( guiControls );

	var guiContainer = $("<div>", {id: "GUIContainer"});
	guiContainer.css({
		position: "absolute",
		left: "20px",
		top: "20px",
		pointerEvents: "auto"
	});
	$(projection.container).append( guiContainer );

	//LINE WIDTH AND HEIGHT
	gui.add( guiControls, "lineWidth", 1, 100 ).listen().onChange( function( value ){
		projection.setLineWidth( value );
	})

	gui.add( guiControls, "lineLength", 1, 200 ).listen().onChange( function( value ){
		projection.setLineLength( value );
	})

	// LINE ROTATION & NOISE
	gui.add( guiControls, "rotation", 0, Math.PI * 4 ).listen().onChange( function( value ){
		projection.setRotation( value );
	});

	gui.add( guiControls, "noiseScale", .0001, .02 ).listen().onChange( function( value ){
		projection.setNoiseScale( value );
	});

	gui.add( guiControls, "noiseAmount", 0, 4 ).listen().onChange( function( value ){
		projection.setNoiseAmount( value );
	});

	gui.add( guiControls, "timeScale", -5.000, 5.000 ).listen().onChange( function(value) {
		projection.setTimeScale( value );
	})

	gui.add( guiControls, "groupRotationX", 0, Math.PI*3 ).step(.001).listen().onChange( function(value) {
		projection.setGroupRotationX( value );
	})


	gui.add( guiControls, "lineOpacity", 0.00, 1.00 ).listen().onChange( function( value ){
		projection.setLineOpacity( value );
	})

	gui.add( guiControls, "blending", { "0":0,"1":1, "2":2 } ).listen().onChange( function( value ){
		projection.setBlending( parseInt(value) );
	})

	// gui.add( guiControls, "groupRotationY", -Math.PI*2, Math.PI*2 ).step(.001).listen().onChange( function(value) {
	// 	projection.setGroupRotationY( value );
	// })

	// gui.add( guiControls, "groupRotationZ", -Math.PI*2, Math.PI*2 ).step(.001).listen().onChange( function(value) {
	// 	projection.setGroupRotationZ( value );
	// })



	// var projection = BlendParticles({
	//   controller: {
	//   	width: window.innerWidth,
	//   	height: window.innerHeight,
	//   	canvasID: "textureReference",
	//   	texturePath: "images/rainbowGalaxy.jpeg"
	//   },
	//   spritePath: "textures/hexagon.png",
	//   numSpritesX: 40,
	//   spriteSize: 40,
	//   spriteBlending: 2,
	//   spriteOpacity: .34,
	//   spriteRotation: Math.PI,
	//   c0: new THREE.Color( 0x34FFFF ),
	//   c1: new THREE.Color( 0xFF34FF ),
	//   useSideBars: false,
	//   showStats: false
	// });


	//
	//	Socket messages from MIDI controller and from phone data
	//
	var socket = io.connect();

	socket.on('/keys_range_1', function (data) {
		console.log(data);
	});
	socket.on('slider1', function (data) {
		var val = Math.map(data, 0, 1, 1, 100);
		guiControls.particleSize =  val;
		ldInterface.setParticleSize( val );
	});
	socket.on('slider2', function (data) {
		var val =  parseInt( Math.map(data, 0, 1, 10, 100) )
		guiControls.count =  val;
		ldInterface.setNumberOfParticles( val );
	});
	socket.on('slider3', function (data) {
		var val = Math.map(data, 0, 1, -1, 1);
		guiControls.spread = val;
		ldInterface.setSpread( val );
	});
	socket.on('slider4', function (data) {
		console.log("slider4", data);
	});
	socket.on('slider5', function (data) {
		console.log("slider5", data);
	});
	socket.on('slider6', function (data) {
		console.log("slider6", data);
	});
	socket.on('knob1', function(data){
		console.log("knob1", data);
	});
	socket.on('knob2', function(data){
		console.log("knob2", data);
	});
	socket.on('knob3', function(data){
		console.log("knob3", data);
	});
	socket.on('knob4', function(data){
		console.log("knob4", data);
	});
	socket.on('xfade', function(data){
		var val =  Math.map(data, 0, 1, -2.0001, 2.0001);
		guiControls.rotation = val;
		ldInterface.setRotation( val );
	});
	socket.on('x_axis', function(data){
		var val =  Math.map(data, 0, 1, -250.0, 250.00);
		guiControls.offsetX = val;
		ldInterface.setOffsetX( val );
	});
	socket.on('y_axis', function(data){
		var val =  Math.map(data, 0, 1, -250.0, 250.00);
		guiControls.offsetY = val;
		ldInterface.setOffsetY( val );
	});
	socket.on('button1', function(data){
		console.log("button1", data);
	});
	socket.on('button2', function(data){
		console.log("button2", data);
	});
	socket.on('button3', function(data){
		console.log("button3", data);
	});
	socket.on('button4', function(data){
		console.log("button4", data);
	});
	socket.on('button5', function(data){
		console.log("button5", data);
	});
	socket.on('button6', function(data){
		console.log("button6", data);
	});

});


