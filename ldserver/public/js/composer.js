//http://fbsisosurface:9876/?debug=true

/**
 * 
 */


var app;

$(window).bind("load", function() {
	var debug = getQuerystring('debug') == "true";
	app = new APP( debug );
});

function APP( _debug )
{

	var debugImage = THREE.ImageUtils.loadTexture( "images/RCA_Indian_Head_test_pattern.JPG", null, function(t){
		debugImage = t;
		t.minFilter = THREE.LinearFilter;
	} )

	var ldInterface = BlendParticles({
	  controller: {
	  	width: window.innerWidth,
	  	height: window.innerHeight,
	  	canvasID: "textureReference",
	  	texturePath: "images/rainbowGalaxy.jpeg"
	  },
	  spritePath: "textures/hexagon.png",
	  numSpritesX: 40,
	  spriteSize: 40,
	  spriteBlending: 2,
	  spriteOpacity: .34,
	  spriteRotation: Math.PI,
	  c0: new THREE.Color( 0x34FFFF ),
	  c1: new THREE.Color( 0xFF34FF ),
	  useSideBars: false,
	  showStats: false
	});


	var guiControls = {
		particleSize: ldInterface.getParticleSize(),
		particleOpacity: ldInterface.getParticleOpacity(),
		spread: ldInterface.getSpread(),
		offsetX: ldInterface.getOffsetX(),
		offsetY: ldInterface.getOffsetY(),
		count: ldInterface.getNumX(),
		rotation: 0.00,
		noiseScale: ldInterface.getNoiseScale(),
		colorA: ldInterface.getColorA().getHex(),
		colorB: ldInterface.getColorB().getHex(),
		colorC: ldInterface.getColorC().getHex(),
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
	$(ldInterface.container).append(guiContainer);


	var input = $("<input type='file'></input>")
	input.click( function(e){
		input.val('')
	}).css({
		position: "absolute",
		bottom: "-50px"
	});

	input.fileReaderJS( {
		dragClass: "drag",
		accept: false,
		readAsMap: { 'text/*' : 'Text'},

		// How to read any files not specified by readAsMap
		readAsDefault: 'DataURL', //  'Text', // 'DataURL',
		on: {
			error: function(e, file) { console.log( "ERROR", e ); },
			loadend: function( e, file ){
				THREE.ImageUtils.loadTexture( e.target.result, null, function(t){
					ldInterface.setImage( t );
				})
			},
		}
	} );

	$(gui.domElement).append( input )

	gui.add( guiControls, "particleSize", 1, 100 ).listen().onChange( function( value ){
		ldInterface.setParticleSize( value );
	})
	gui.add( guiControls, "particleOpacity", .001, 1.00 ).listen().onChange( function( value ){
		ldInterface.setParticleOpacity( value );
	})
	gui.add( guiControls, "spread", -.99, .99 ).listen().onChange( function( value ){
		ldInterface.setSpread( value );
	})

	gui.add( guiControls, "noiseScale", .0, 2.00 ).listen().onChange( function( value ){
		ldInterface.setNoiseScale( value );
	})

	gui.add( guiControls, "offsetX", -250.0, 250.00 ).listen().onChange( function( value ){
		ldInterface.setOffsetX( value );
	})

	gui.add( guiControls, "offsetY", -250.0, 250.00 ).listen().onChange( function( value ){
		ldInterface.setOffsetY( value );
	})

	gui.add( guiControls, "count", 10, 250 ).listen().onChange( function( value ){
		ldInterface.setNumberOfParticles( parseInt( value ) );
	})

	gui.add( guiControls, "rotation", -2.0001, 2.0001 ).listen().step( .001 ).onChange( function( value ){
		ldInterface.setRotation( value );
	})

	gui.addColor( guiControls, "colorA" ).listen().onChange( function( value ){
		ldInterface.setColorA( value );
	})

	gui.addColor( guiControls, "colorB" ).listen().onChange( function( value ){
		ldInterface.setColorB( value );
	})

	gui.addColor( guiControls, "colorC" ).listen().onChange( function( value ){
		ldInterface.setColorC( value );
	})

	// dat.GUI.toggleHide();
	// 
	guiContainer.append($(gui.domElement));



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
}


Math.clamp = function(num, min, max) {
	if(min>max) console.warn("Math.clamp: min > max");
	return Math.min(Math.max(num, min), max);
};
Math.map = function (value, istart, istop, ostart, ostop, clamp) {
	var val = ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
	return clamp ? Math.clamp(val, Math.min(ostart, ostop), Math.max(ostart, ostop)) : val;
}

function getQuerystring(key, default_)
{
	if (default_==null) default_=""; 
	key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
	var qs = regex.exec(window.location.href);
	if(qs == null)
		return default_;
	else
		return qs[1];
}