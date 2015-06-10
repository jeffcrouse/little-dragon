

// var socket = io.connect();
// socket.emit('hello', { my: 'data' });

// socket.on('/keys_range_1', function (data) {
// 	console.log(data);
// });

$(window).bind("load", function() {

	console.log( " \n \n little dragon projection sketch \n \n " );
	
	var projection = ProjectionVisuals({
		lineLength: 20,
		lineWidth: 4,
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
		lineWidth: parseFloat( projection.getLineWidth() ),
		lineLength: parseFloat( projection.getLineLength() ),
		lineOpacity: parseFloat( projection.getLineOpacity() ),
		blending: parseInt( projection.getBlending() ),
		rotation: parseFloat( projection.getRotation() ),
		noiseScale: parseFloat( projection.getNoiseScale() ),
		noiseAmount: parseFloat( projection.getNoiseAmount() ),
		timeScale: parseFloat( projection.getTimeScale() ),
		groupRotationX: parseFloat( projection.getGroupRotationX() ),
		groupRotationY: parseFloat( projection.getGroupRotationY() ),
		groupRotationZ: parseFloat( projection.getGroupRotationZ() ),
		cameraPositionX: parseFloat( projection.getCameraPositionX() ),
		cameraPositionY: parseFloat( projection.getCameraPositionY() ),
		cameraZoom: parseFloat( projection.getCameraZoom() ),
		distortionMaps: projection.getDistortionMaps()
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

	gui.add( guiControls, "cameraZoom", 0.1, 1.00 ).listen().onChange( function( value ){
		projection.setCameraZoom( value );
	})

	gui.add( guiControls, "cameraPositionX", -512, 512 ).listen().onChange( function( value ){
		projection.setCameraPositionX( value );
	})

	
	gui.add( guiControls, "cameraPositionY", -256, 256 ).listen().onChange( function( value ){
		projection.setCameraPositionY( value );
	})
	gui.add( guiControls, "blending", { "0":0,"1":1, "2":2 } ).listen().onChange( function( value ){
		projection.setBlending( parseInt(value) );
	})

	gui.add( guiControls, "distortionMaps", { "0":0,"1":1, "2":2, "3":3, "4":4, "5":5 } ).listen().onChange( function( value ){
		projection.setDistortionMap( parseInt(value) );
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


/*
setInterval( function(){
	projection.handleOSC( "/keys_keyboard_2", {"on":64,"note":50,"midi":"50 1"} );
}, 500);
=======
// setInterval( function(){
// 	projection.handleOSC( "/keys_keyboard_2", {"on":64,"note":50,"midi":"50 1"} );
// }, 500);
>>>>>>> edec331fe4b0b6f19dac04d319b6497c76d64701

// setTimeout( function(){
// 	setInterval( function(){
// 		projection.handleOSC( "/keys_keyboard_2", {"on":0,"note":50,"midi":"50 1"} );
// 	}, 500);
// }, 300 )

// setInterval( function(){
// 	projection.handleOSC( "/bass_keyboard_2", {"on":64,"note":50,"midi":"50 1"} );
// }, 500);

// setTimeout( function(){
// 	setInterval( function(){
// 		projection.handleOSC( "/bass_keyboard_2", {"on":0,"note":50,"midi":"50 1"} );
// 	}, 500);
// }, 300 )


// setInterval( function(){
// 	projection.handleOSC( "/drums_keyboard_2", {"on":64,"note":48,"midi":"50 1"} );
// }, 500);

setTimeout( function(){
	setInterval( function(){
		projection.handleOSC( "/drums_keyboard_2", {"on":0,"note":48,"midi":"50 1"} );
	}, 500);
}, 300 )
*/


	//
	//	Socket messages from MIDI controller and from phone data
	//
	var socket = io.connect();
	socket.on('/keys_keyboard_1', function (data) {
		projection.handleOSC( "/keys_keyboard_1", data );
	});
	socket.on('/keys_keyboard_2', function (data) {
		projection.handleOSC( "/keys_keyboard_2", data );
	});
	socket.on('/keys_keyboard_3', function (data) {
		projection.handleOSC( "/keys_keyboard_3", data );
	});
	socket.on('/bass_keyboard_1', function (data) {
		projection.handleOSC( "/bass_keyboard_1", data );
	});
	socket.on('/bass_keyboard_2', function (data) {
		projection.handleOSC( "/bass_keyboard_2", data );
	});
	socket.on('/bass_keyboard_3', function (data) {
		projection.handleOSC( "/bass_keyboard_3", data );
	});
	socket.on('/bass_keyboard_4', function (data) {
		projection.handleOSC( "/bass_keyboard_4", data );
	});
	socket.on('/drums_keyboard_1', function (data) {
		projection.handleOSC( "/drums_keyboard_1", data );
	});
	socket.on('/drums_keyboard_2', function (data) {
		projection.handleOSC( "/drums_keyboard_2", data );
	});
	socket.on('/drums_keyboard_3', function (data) {
		projection.handleOSC( "/drums_keyboard_3", data );
	});
	socket.on('/drums_keyboard_4', function (data) {
		projection.handleOSC( "/drums_keyboard_4", data );
	});


	socket.on('slider1', function (data) {
		var value = Math.map(data, 0, 1, 2, 20);
		guiControls.lineWidth =  value;
		projection.setLineWidth( value );
	});
	socket.on('slider2', function (data) {
		var value = Math.map(data, 0, 1, 1, 200);
		guiControls.lineLength =  value;
		projection.setLineLength( value );
	});
	socket.on('slider3', function (data) {
		var value = Math.map(data, 0, 1, 0.5, 1.00);
		guiControls.lineOpacity =  value;
		projection.setLineOpacity( value );

	});
	socket.on('slider4', function (data) {
		var value = Math.map(data, 0, 1, 0, Math.PI * 4);
		guiControls.rotation = value;
		projection.setRotation( value );
	});
	socket.on('slider5', function (data) {
		//console.log("slider5", data);
		var value = Math.map(data, 0, 1, .0001, .02 );
		guiControls.noiseScale = value;
		projection.setNoiseScale( value );
	});
	socket.on('slider6', function (data) {
		//console.log("slider6", data);
		var value = Math.map(data, 0, 1, 0, 4 );
		guiControls.noiseAmount = value;
		projection.setNoiseAmount( value );
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
		var value = Math.map(data, 0, 1, -10, 10 );
		guiControls.timeScale = value;
		projection.setTimeScale( value );
	});
	socket.on('x_axis', function(data){
		var value = Math.map(data, 0, 1, 0, Math.PI*3 );
		guiControls.groupRotationX = value;
		projection.setGroupRotationX( value );
	});
	
	/*
	socket.on('y_axis', function(data){

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
	*/

});

Math.clamp = function(num, min, max) {
	if(min>max) console.warn("Math.clamp: min > max");
	return Math.min(Math.max(num, min), max);
};
Math.map = function (value, istart, istop, ostart, ostop, clamp) {
	var val = ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
	return clamp ? Math.clamp(val, Math.min(ostart, ostop), Math.max(ostart, ostop)) : val;
}

