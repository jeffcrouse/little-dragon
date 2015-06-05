// TouchLines.js


var pSize = getQueryVariable("pSize");

console.log( 'pSize: ' + pSize );

function TouchLines( options )
{
	console.log( "touch lines" );

	var WIDGET_TYPE = undefined;

	var WIDGETS = {
		BUTTON: 0,
		MULTISLIDER: 1,
		SYNTH: 2
	}

	var lineLength = getQueryVariable("lineLength") || options.lineLength || 20;

	var lineWidth = getQueryVariable("lineWidth") || options.lineWidth || 4;	

	var spacing = getQueryVariable("spacing") || options.spacing || 10;

	var spriteRotation = getQueryVariable("rotation") || options.spriteRotation || Math.PI;

	var noiseScale = getQueryVariable("noiseScale") || options.noiseScale || .005;

	var spriteSize = pSize || options.spriteSize || 100;

	var spread = options.spread !== undefined ? options.spread : 0;

	var spreadOffset = options.spreadOffset || new THREE.Vector2( 0, 0 );

	var spriteBlending = options.spriteBlending || 2;

	var spriteOpacity = options.spriteOpacity || .34;

	var spriteNoiseAmount = options.spriteNoiseAmount !== undefined ? options.spriteNoiseAmount : 1;

	var controller = options.controller;

	var colorRampPath = options.colorRampPath || "textures/bwGradient.png";

	var WIDTH = options.width || 1280; 
	var HEIGHT = options.height || 720; 
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

	var edgeTopColor = new THREE.Color("magenta");
	var edgeBottomColor = new THREE.Color("cyan");

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
	var widget, controlID = controller.canvasID;

	if(controlID.indexOf( "multislider" ) > -1)
	{
		console.log( "multislider" );
		WIDGET_TYPE = WIDGETS.MULTISLIDER;

		widget = MultiSliderWrapper( options ); 
	}	
	else if(controlID.indexOf( "button" ) > -1)
	{
		console.log( "button" );
		WIDGET_TYPE = WIDGETS.BUTTON;

		widget = ButtonWrapper( options ); 
	}
	else  if( controlID.indexOf( "keyboard" ) > -1 )
	{
		console.log( "keyboard" );
		WIDGET_TYPE = WIDGETS.SYNTH;

		widget = KeyboardWrapper( options );

	}
	else 
	{
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

	console.log( 'widget', widget );

	//
	//	SCENE
	//
	scene = new THREE.Scene();

	//
	//	CAMERA
	//
	
	camera = new THREE.OrthographicCamera( -HALF_WIDTH, HALF_WIDTH, HALF_HEIGHT, -HALF_HEIGHT, -1000, 1000 ); // 
	
	// camera = new THREE.PerspectiveCamera( 60, ASPECT_RATIO, 1, 10000 );
	// camera.position.z = 100;
	// camera.lookAt( origin );


	//EDGE COLOR BLOCKS
	var edgeTop = new THREE.Mesh( new THREE.BoxGeometry( WIDTH, 10, 100), new THREE.MeshBasicMaterial( {
		color: edgeTopColor,
		depthTest: true,
		depthWrite: true,
		transparent: false

	} ) );
	var edgeBottom = new THREE.Mesh( edgeTop.geometry, new THREE.MeshBasicMaterial( {
		color: edgeBottomColor,
		depthTest: true,
		depthWrite: true,
		transparent: false
	} ) );


	edgeTop.position.set( 0, HALF_HEIGHT - 5, 0 );
	edgeBottom.position.set( 0, -HALF_HEIGHT+5, 0 );

	scene.add( edgeTop );
	scene.add( edgeBottom );


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
	textureLoader.load( 'textures/gradients_debug.png', function ( t ) {
		// t.minFilter = THREE.LinearFilter;
		debugImage = t;
		// debugImage.wrapS = debugImage.wrapT = THREE.MirroredRepeatWrapping;
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

		for(var i = 0, j=0, k=0, x=0, y=0, index=0; i<=numX; i++ ) {

			x = i * spacing - HALF_WIDTH;

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
			noiseScale: noiseScale
		});

		var linesMesh = new THREE.Mesh( linesGeometry, linesMat );

		scene.add( linesMesh );
	}

	function update()
	{
		if(stats)	stats.update();

		var elapsedTime = clock.getElapsedTime();

		if(linesMat) {
			linesMat.uniforms.time.value = elapsedTime * .5;
		}

		// // points.material.uniforms.time.value += .003;
		// // 
		// for(var i=0; i<touches.length; i++) {

		// 	touches[i].x = (i + .5) * WIDTH / touches.length - HALF_WIDTH;
		// 	touches[i].y = cos( i + elapsedTime ) * 300;
		// 	touches[i].z *= .95;
		// }
	}

	function draw()
	{
		widget.draw( renderer );
		renderer.render( scene, camera, null, true );

		// renderer.render( widget.scene, widget.camera, null, true );
	}

	function animate()
	{
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

		setEdgeColorTop: function( hex ){
			edgeTopColor.set( hex );
		},

		setEdgeColorBottom: function( hex ){
			edgeBottomColor.set( hex );
		},
	}
}