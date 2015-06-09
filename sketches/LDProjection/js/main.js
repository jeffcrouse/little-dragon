

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

});
