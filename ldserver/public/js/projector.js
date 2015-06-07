

var socket = io.connect();
socket.emit('hello', { my: 'data' });

socket.on('/keys_range_1', function (data) {
	console.log(data);
});

$(window).bind("load", function() {
	
	var projection = ProjectionVisuals();

});



function ProjectionVisuals( options ) {

	options = options || {};

	var WIDTH = options.width || window.innerWidth;
	var HEIGHT = options.height || window.innerHeight;
	var ASPECT_RATIO = WIDTH / HEIGHT;

	var HALF_WIDTH = WIDTH * .5;
	var HALF_HEIGHT = HEIGHT * .5;

	var scope = this;

	//SIMPLIFYING THINGS
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

	//CONTAINER
	var container = $("<div>", {id: "contianer"}).css({
		position: "absolute",
		left: 0,
		top: 0,
		width: WIDTH, // 1280, // WIDTH,
		height: HEIGHT, // 800, // HEIGHT,
		pointerEvents: "none",
		backgroundColor: "rgba( 0, 0, 0, 1)"
	}).appendTo( document.body );

	//THREE
	var scene, renderer, renderTarget, camera, group;

	camera = new THREE.PerspectiveCamera( 60, ASPECT_RATIO, 1, 10000 );
	camera.position.z = -100;
	camera.lookAt( v3( 0, 0, 0 ) );

	scene = new THREE.Scene();

	group = new THREE.Group();


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


	//load images
	var debugImage;
	textureLoader.load( "/textures/cyanMagentaGradient.png", function ( t ) {
		// t.minFilter = THREE.LinearFilter;
		debugImage = t;
		debugImage.wrapS = debugImage.wrapT = THREE.MirroredRepeatWrapping;
	});

	// OBJECTS

	function setup() {

		var debugCube = new THREE.Mesh( new THREE.BoxGeometry( 10, 10, 10), new THREE.MeshNormalMaterial({
			wireframe: true,
			side: 2 
		}) )

		scene.add( debugCube );

		//testing
		var m = addInsrtrument( "test", "test", { radius: 10 });

		console.log( 'm', m );

		scene.add( m );

	}

	function update() {

	}

	function draw() {

		renderer.render( scene, camera, null, true );

	}

	function animate() {

		TWEEN.update();

		update();

		draw();

	}

	/**
	 * INSTRUMENTS COMPOSITION
	 */
	var instruments = {};

	function getCircleGeometry ( options ) {

		options = options || {}

		var r = options.radius || 1;
		var segments = options.segments || 45;
		var step = TWO_PI / (segments);

		var numVertices = (segments + 2);
		var positions = new Float32Array( numVertices * 3 );
		var uvs = new Float32Array( numVertices * 2 );


		//POSITIONS & UVS
		positions[0] = positions[1] = positions[2] = 0;
		uvs[0] = uvs[1] = 0;

		for(var i=2; i<uvs.length; i++)	uvs[i] = 1;

		for( var i=0, count = 3; i<=segments; i++, count += 3) {

			var u = i * step;

			positions[count] = sin( u ) * r;
			positions[count + 1] = cos( u ) * r;
			// positions[count + 2] = 0;
			
			// uvs[count] = positions[count] * .5 + .5;
			// uvs[count + 1] = positions[count+1] * .5 + .5;
		}

		//INDICES
		var indices = new Uint32Array( (segments) * 3 );

		for(var i=0, j=1; i<indices.length; i+=3, j++) {

			indices[i] = 0;
			indices[i+1] = j;
			indices[i+2] = (j+1) % positions.length;

		}


		var geometry = new THREE.BufferGeometry();
		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
		geometry.addAttribute( 'index', new THREE.BufferAttribute( indices, 1 ) );
		geometry.computeBoundingBox();

		return geometry;
	}


	var circleGeometry = getCircleGeometry();

	function getRadialInstrument ( options ) {

		console.log( options );

		var m = new THREE.Mesh( circleGeometry, new THREE.MeshBasicMaterial( {
			map: debugImage,
			side: 2
		} ) );

		m.scale.multiplyScalar( options.radius || 100 );

		return m;
	}

	function addInsrtrument( id, instrument_type, options ) {
		
		options = options || {};

		switch (instrument_type) {

			default:
				instruments[ id ] = getRadialInstrument( options );
				break;
		}

		return instruments[ id ];
	}

	/**
	 * RENDERER SETUP
	 */
	function rendererSetup()
	{
		renderer = new THREE.WebGLRenderer( { antialias: true, devicePixelRatio: 1 } );
		
		renderer.setClearColor( 0x000000, 1 );

		renderer.setPixelRatio( window.devicePixelRatio );

		renderer.sortObjects = true;
		
		renderer.setSize( window.innerWidth, window.innerHeight );

		renderer.autoClear = false;

		container.append( renderer.domElement );
	}

	function savePreset() {

	}


	function begin() {

		rendererSetup();

		setup();

		animate();
	}

	var key_map = {
		113 : "q",
		119 : "w",
		101 : "e",
		114 : "r",
		116 : "t",
		121 : "y",
		97 : "a",
		115 : "s",
		100 : "d",
		102 : "f",
		103 : "g",
		104 : "h",
		122 : "z",
		120 : "x",
		99 : "c",
		118 : "v",
		98 : "b",
		110 : "n"
	}
	

	function onKeypressed( e )
	{
		switch(key_map[e.which])
		{
			case 'q':
				break;
				console.log( key_map[e.which] );
				break;
			// case 116: /*t*/ 
			// 	// showHUD = !showHUD;
			// 	triggerCubeRotations();
			// 	break;

			default:
				console.log( e.which );
				break;
		}
	}


	$(document).keypress( onKeypressed );

	return {
		scope: scope,

		begin: begin,

		onMessage: function ( e ) {
			console.log( onMessage );
		}

	}
}
