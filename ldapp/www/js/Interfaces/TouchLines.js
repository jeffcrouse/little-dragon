// TouchLines.js

function TouchLines( options )
{
	console.log( "touch lines" );

	var WIDGET_TYPE = undefined;

	var WIDGETS = {
		BUTTON: 0,
		MULTISLIDER: 1,
		SYNTH: 2,
		TILT: 3
	}

	var lineLength = getQueryVariable("lineLength") || options.lineLength || 20;

	var lineWidth = getQueryVariable("lineWidth") || options.lineWidth || 4;	

	var spacing = getQueryVariable("spacing") || options.spacing || 10;

	var spriteRotation = getQueryVariable("rotation") || options.spriteRotation || Math.PI;

	var noiseScale = getQueryVariable("noiseScale") || options.noiseScale || .005;

	var noiseAmount = getQueryVariable("noiseAmount") || options.noiseAmount || 0;

	var timeScale = getQueryVariable("timeScale") || options.timeScale || 2;

	var spread = options.spread !== undefined ? options.spread : 0;

	var spreadOffset = options.spreadOffset || new THREE.Vector2( 0, 0 );

	var spriteBlending = options.spriteBlending || 2;

	var spriteOpacity = options.spriteOpacity || .34;

	var spriteNoiseAmount = options.spriteNoiseAmount !== undefined ? options.spriteNoiseAmount : 1;

	var controller = options.controller;

	var colorRampPath = options.colorRampPath || "textures/bwGradient.png";


	// widthOverride: 1280,
	// heightOverride: 720,

	var WIDTH = options.widthOverride || options.controller.width || 1280; 
	var HEIGHT = options.heightOverride || options.controller.height || 720; 
	var ASPECT_RATIO = WIDTH / HEIGHT;
	var HALF_WIDTH = WIDTH * .5, HALF_HEIGHT = HEIGHT * .5;

	var stats = undefined;

	var container = $("<div>", {id: "linesContainer"}).css({
		position: "absolute",
		left: 0,
		top: 0,
		width: WIDTH, // 1280, // WIDTH,
		height: HEIGHT, // 800, // HEIGHT,
		pointerEvents: "none",
		backgroundColor: "rgba( 0, 0, 0, 1)",
		borderRadius: "0px" // TODO: I think this gets over-written by nexus
	}).appendTo( document.body );

	// var edgeTopColor = new THREE.Color("magenta");
	// var edgeBottomColor = new THREE.Color("cyan");

	var renderer, scene, camera, light, clock = new THREE.Clock();

	//
	//DEBUG
	//
	var debugMat = new THREE.MeshNormalMaterial({
		side: 2,
		wireframe: true,
		wireframeLinewidth: 2
	});

	var randf = THREE.Math.randFloat;
	var mapLinear = THREE.Math.mapLinear;
	var clamp = THREE.Math.clamp;
	function lerp( a, b, k ){return a + (b-a) * k};
	function smootherstep( x )
	{
	    return x*x*x*(x*(x*6 - 15) + 10);
	}
	var sin = Math.sin, cos = Math.cos;
	var PI = Math.PI, HALF_PI = PI * .5, TWO_PI = PI * 2;
	var v2 = function(x,y){	return new THREE.Vector3( x, y );}
	var v3 = function(x,y,z){	return new THREE.Vector3( x, y, z );}
	var origin = v3(0,0,0);


	//WIDGET
	var widget, controlID = controller.canvasID, numSpacers = 0;

	if(controlID.indexOf( "multislider" ) > -1) {

		WIDGET_TYPE = WIDGETS.MULTISLIDER;

		widget = MultiSliderWrapper( options ); 

		numSpacers = options.controller.sliders;

	}	

	else if(controlID.indexOf( "button" ) > -1) {

		WIDGET_TYPE = WIDGETS.BUTTON;

		widget = ButtonWrapper( options ); 
	}

	else  if( controlID.indexOf( "keyboard" ) > -1 ) {

		WIDGET_TYPE = WIDGETS.SYNTH;

		widget = KeyboardWrapper( options );

		numSpacers = options.controller.keys.length;

	}

	else  if( controlID.indexOf( "tilt" ) > -1 ) {

		WIDGET_TYPE = WIDGETS.TILT;

		widget = TiltWrapper( options );

	}

	else {

		console.log( "controlID: ", controlID );

		widget = {

			renderTarget: THREE.WebGLRenderTarget( WIDTH * .25, HEIGHT * .25, {
				minFilter: THREE.LinearFilter
			} ),

			draw: function(){
				// console.log( "widget no set recoginzes" );
			},

			handleInput: function( data ){
				console.log( data, "little dragon:: widget not recognized" );
			}
		}
	}

	//
	//	SCENE
	//
	scene = new THREE.Scene();

	//
	//	CAMERA
	//
	
	camera = new THREE.OrthographicCamera( -HALF_WIDTH, HALF_WIDTH, HALF_HEIGHT, -HALF_HEIGHT, -1000, 1000 ); // 

	// //EDGE COLOR BLOCKS
	// var edgeTop = new THREE.Mesh( new THREE.BoxGeometry( WIDTH, 10, 100), new THREE.MeshBasicMaterial( {
	// 	color: edgeTopColor,
	// 	depthTest: true,
	// 	depthWrite: true,
	// 	transparent: false

	// } ) );
	// var edgeBottom = new THREE.Mesh( edgeTop.geometry, new THREE.MeshBasicMaterial( {
	// 	color: edgeBottomColor,
	// 	depthTest: true,
	// 	depthWrite: true,
	// 	transparent: false
	// } ) );


	// edgeTop.position.set( 0, HALF_HEIGHT - 5, 0 );
	// edgeBottom.position.set( 0, -HALF_HEIGHT+5, 0 );

	// scene.add( edgeTop );
	// scene.add( edgeBottom );


	//LOADING

	var manager = new THREE.LoadingManager();
	var textureLoader = new THREE.TextureLoader( manager );
	// var objLoader = new THREE.OBJLoader( manager );

	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
	};

	manager.onLoad = function(){
		console.log( "\nmanager.onLoad\n\n" );

		begin();
	}

	console.log( 'manager', manager );


	//load images
	var debugImage;
	textureLoader.load( 'textures/hexagon.png', function ( t ) {
		debugImage = t;
	});

	var colorRamp;
	textureLoader.load( colorRampPath, function ( t ) {
		colorRamp = t;
	});


	// var touches = [];

	// for(var i=0; i<5; i++) {
	// 	touches[i] = v3(0,0,0);
	// }

	function getLineGeometry( g ) {

		if( g === undefined )	g = new THREE.BufferGeometry();

		var numX = Math.ceil( WIDTH / spacing );
		var numY = Math.ceil( HEIGHT / spacing );

		var numFaces = (numX + 1) * (numY + 1);

		var positions = new Float32Array( numFaces * 3 * 6   );
		var uvs = new Float32Array( numFaces * 2 * 6  );		

		var squarePos = [ -.5,-.5, 0,
						  -.5, .5, 0,
						   .5, .5, 0,

						  -.5,-.5, 0,
						   .5, .5, 0,
						   .5, -.5, 0
						 ];

		var spacersStep = 1;
		if(numSpacers)	spacersStep = numX / numSpacers;

		for(var i = 0, j=0, k=0, x=0, y=0, index=0; i<=numX; i++ ) {

			x = i * spacing - HALF_WIDTH;

			if(numSpacers && (i % spacersStep) < 1)
			{
				x += 100000;
			}

			for(j=0; j<=numY; j++ ) {

				for( k=0; k<squarePos.length; k++ ) {

					positions[index + k] = squarePos[k];

				}

				y = j * spacing - HALF_HEIGHT;

				for( k=0; k<squarePos.length; k += 2) {

					uvs[ index * 2 / 3 + k] = x;
					uvs[ index * 2 / 3 + k + 1] = y;
				}

				index += squarePos.length;
			}
		}

		g.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		g.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
		g.computeBoundingBox();

		return g;
	}

	var linesGeometry, linesMat;
	function setup()
	{

		// for(var i in touches ){
		// 	new TWEEN.Tween( touches[i] )
		// 		.to( {z : 1}, 50 )
		// 		.delay( randf( 1500, 2500) )
		// 		.repeat( 100 )
		// 		.start();
		// }


		//	LINES
		linesGeometry = getLineGeometry();
		linesMat = new LinesMaterial({
			pMap: widget.renderTarget || debugImage,
			lineLength: lineLength,
			lineWidth: lineWidth,
			spriteRotation: spriteRotation,
			colorRamp: colorRamp,
			noiseScale: noiseScale,
			noiseAmount: noiseAmount,
			WIDTH: WIDTH,
			HEIGHT: HEIGHT
		});

		var linesMesh = new THREE.Mesh( linesGeometry, linesMat );

		scene.add( linesMesh );
	}

	function update()
	{

		var elapsedTime = clock.getElapsedTime();

		if(linesMat) {
			linesMat.uniforms.time.value = elapsedTime * timeScale;
		}

		// if( widget.setTilt )	widget.setTilt( sin(elapsedTime ) * .5 + .5 );

	}

	function draw()
	{

		widget.draw( renderer );
		renderer.render( scene, camera, null, true );

		// renderer.render( widget.scene, widget.camera, null, true );
	}

	function animate()
	{
		if(stats)	stats.update();

		TWEEN.update();
		
		update();

		draw();

		requestAnimationFrame(animate);
	}

	function rendererSetup()
	{
		renderer = new THREE.WebGLRenderer( { 
			antialias: true,
			devicePixelRatio: 1,
			alpha: true 
		} );
		
		renderer.setClearColor( 0x000000, 0 );

		// renderer.setPixelRatio( window.devicePixelRatio );

		renderer.sortObjects = true;
		
		renderer.setSize( WIDTH, HEIGHT );

		renderer.autoClear = false;

		container.append( renderer.domElement );
	}


	stats = new Stats();
	$(stats.domElement).css({
		position: "absolute",
		left: '20px',
		right: '20px'
	}).appendTo( container );

	function begin(){
		rendererSetup();
		setup();

		animate();
	}

	// begin();

	return {

		begin: begin,

		widgetEvent: widget.handleInput,

		// setEdgeColorTop: function( hex ){
		// 	edgeTopColor.set( hex );
		// },

		// setEdgeColorBottom: function( hex ){
		// 	edgeBottomColor.set( hex );
		// },
	}
}