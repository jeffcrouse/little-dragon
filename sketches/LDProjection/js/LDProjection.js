

// var socket = io.connect();
// socket.emit('hello', { my: 'data' });

// socket.on('/keys_range_1', function (data) {
// 	console.log(data);
// });

$(window).bind("load", function() {
	
	var projection = ProjectionVisuals();

});

var LDProjectionKeyMaterial = function( params ) {

	params = params || {};

	var isLineShader = params.lineShader || false;

	var matParams = {
		transparent: true,
		blending: params.blending || 2,
		depthTest: params.depthTest || false,
		depthWrite: params.depthWrite !== undefined ? params.depthWrite : false,
		side: params.side || 0,// 0 = backFaceCull, 1 = frontFaceCull, 2 = doubleSided
		linewidth: 1,

		// TODO: if radius is staying at 1 lets remove it

		uniforms: {
			color: {type: 'c', value: new THREE.Color( params.color || "white" ) },
			fade_color: {type: 'c', value: new THREE.Color( 0x0A0749 ) },
			fade: {type: 'f', value: params.fade !== undefined ? params.fade : 0 },
			opacity: {type: 'f', value: params.opacity || 1 },
		},

		vertexShader: [

		'varying vec2 vUv;',

		'void main() {',

		'	vUv = uv * 2. - 1.;',

		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

		'}'].join('\n'),

		fragmentShader: [

		'uniform float opacity;',

		'uniform float fade;',

		'uniform vec3 color;',

		'uniform vec3 fade_color;',

		'varying vec2 vUv;',

		'float mapLinear( in float x, in float a1, in float a2, in float b1, in float b2 ) {',
		'	return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );',
		'}',

		'float smootherstep( float x ){',
		'    return x*x*x*(x*(x*6. - 15.) + 10.);',
		'}',

		'void main()',
		'{',

		'	vec3 c = mix( fade_color, color, (1. - smootherstep( abs( vUv.y ) ) * .9) * fade);',

		// '	vec3 c = mix( fade_color, color * min( pow(sin( vUv.y * 3.14), 2.) + .25, 1.), fade);',

		'	gl_FragColor = vec4( c, opacity );',

		// '	float grad = 1.;',

		// '	if(vUv.x < start)	grad = mapLinear( vUv.x, start-fadeDistance, start, 0., 1. );',

		// '	else if(vUv.x > stop)	grad = mapLinear( vUv.x, stop, stop+fadeDistance, 1., 0. );',


		// // '	float grad = vUv.x < start ? vUv.x / start : vUv.x > stop ? (1. - vUv.x) / (1. - stop) : 1. ;',

		// '	grad = smootherstep( pow( max(0., grad), 1.5 ) );',

		// '	gl_FragColor = vec4( vec3( grad ), 1. );',

		'}'
		].join('\n')

	}
	
	THREE.ShaderMaterial.call( this, matParams );
}

LDProjectionKeyMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );



function ProjectionVisuals( options ) {

	options = options || {};

	var lineLength = getQueryVariable("lineLength") || options.lineLength || 100;

	var lineWidth = getQueryVariable("lineWidth") || options.lineWidth || 4;	

	var spacing = getQueryVariable("spacing") || options.spacing || 10;

	var spriteRotation = getQueryVariable("rotation") || options.spriteRotation || Math.PI * 2;

	var noiseScale = getQueryVariable("noiseScale") || options.noiseScale || .0075;

	var noiseAmount = getQueryVariable("noiseAmount") || options.noiseAmount || 2;

	var timeScale = getQueryVariable("timeScale") || options.timeScale || -1;

	var numSpacers = 0;

	var PROJECTOR_NUM = options.num || 1;

	var WIDTH = 1280;// options.width || window.innerWidth;
	var HEIGHT = 720;//options.height || window.innerHeight;
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
	var scene, renderer, renderTarget, camera, group, clock = new THREE.Clock();

	if( PROJECTOR_NUM === 1) {

		camera = new THREE.OrthographicCamera( -HALF_WIDTH, HALF_WIDTH, HALF_HEIGHT, -HALF_HEIGHT, -1000, 1000 ); // 	

	} else {

		camera = new THREE.OrthographicCamera( HALF_WIDTH, -HALF_WIDTH, HALF_HEIGHT, -HALF_HEIGHT, -1000, 1000 ); // 

	}
	
	// camera = new THREE.PerspectiveCamera( 60, ASPECT_RATIO, 1, 10000 );
	// camera.position.z = -100;
	// camera.lookAt( v3( 0, 0, 0 ) );

	//render target
	var rtScene = new THREE.Scene();
	var rt = new THREE.WebGLRenderTarget( HALF_WIDTH, HALF_HEIGHT );
	rt.minFilter = THREE.LinearFilter;

	// group
	scene = new THREE.Scene();

	group = new THREE.Group();

	scene.add( group );


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
	textureLoader.load( "textures/cyanMagentaGradient.png", function ( t ) {
		// t.minFilter = THREE.LinearFilter;
		debugImage = t;
		debugImage.wrapS = debugImage.wrapT = THREE.MirroredRepeatWrapping;
	});

	// OBJECTS
	var boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );
	var baseColor = 0x111455;
	// Keys
	// keys1: Controls - multislider( 4 sliders )
	// keys2: Interface_1 - keys( 7 keys )
	// keys3: Interface_2 - keys( 7 keys )
	// keys4: Interface_3 - keys( 7 keys )
	// keys5: Interface_4 - keys( 7 keys )
	// keys6: Tilt - tilt
	
	var keyboards = {

		Interface_1: {
			color: 0xD5F7FA,
			count: 7,
			keys: [],
			group: new THREE.Group()
		},

		Interface_2: {
			color: 0xC1F4F9,
			count: 7,
			keys: [],
			group: new THREE.Group()
		},

		Interface_3: {
			color: 0xB0F2FA,
			count: 7,
			keys: [],
			group: new THREE.Group()
		},

		Interface_4: {
			color: 0x9CF1FA,
			count: 7,
			keys: [],
			group: new THREE.Group()
		},

	}

	console.log( 'keyboards', keyboards );
	
	var keysGroup = new THREE.Group();

	group.add( keysGroup );

	var key_index = 0;
	for(var i in keyboards ) {

		keysGroup.add( keyboards[i].group );

		for(var j=0; j<keyboards[i].count; j++ ) {

			var m = new THREE.Mesh( boxGeometry, new LDProjectionKeyMaterial( {
				color: keyboards[i].color 
			} ) );

			m.fadeTween = new TWEEN.Tween( m.material.uniforms.fade )
				.to( {value: 1}, randf( 30, 150 ) )
				.repeat( 100 )
				.delay( randf( 250, 1000) )
				.yoyo( true )
				.onUpdate( function( value ) {
					this.scale.z = 1. + this.material.uniforms.fade.value;
				}.bind( m ))
				.start();

			m.scale.x = .9;

			m.position.x = key_index + .5;

			keyboards[i].keys.push( m );

			keyboards[i].group.add( m );

			key_index++;
		}

	}

	//	transform the keys as a whole
	keysGroup.position.x -= HALF_WIDTH;
	keysGroup.position.y -= HEIGHT / 3;

	keysGroup.scale.x = WIDTH / key_index;
	keysGroup.scale.y = HEIGHT * 2 / 3;
	keysGroup.scale.z = HEIGHT * .5;

	// Bass
	// bass1: Controls - multislider( 4 sliders )
	// bass2: Interface_1 - keys( 4 keys )
	// bass3: Interface_2 - keys( 3 keys )
	// bass4: Interface_3 - keys( 4 keys )
	// bass5: Interface_4 - keys( 3 keys )
	// bass6: Tilt - tilt
	
	var bass = {

		Interface_1: {
			color: 0x2BFCB7,
			count: 4,
			keys: [],
			group: new THREE.Group()
		},

		Interface_2: {
			color: 0x2BFECA,
			count: 3,
			keys: [],
			group: new THREE.Group()
		},

		Interface_3: {
			color: 0x2CFEDD,
			count: 4,
			keys: [],
			group: new THREE.Group()
		},

		Interface_4: {
			color: 0x2DFFFE,
			count: 3,
			keys: [],
			group: new THREE.Group()
		},
	}

	var bassGroup = new THREE.Group();
	group.add( bassGroup );

	bass_index = 0;
	for(var i in bass) {

		bassGroup.add( bass[i].group );

		for(var j=0; j<bass[i].count; j++ ) {

			var m = new THREE.Mesh( boxGeometry, new LDProjectionKeyMaterial( {
				color: bass[i].color 
			} ) );


			m.fadeTween = new TWEEN.Tween( m.material.uniforms.fade )
				.to( {value: 1}, randf( 100, 250 ) )
				.repeat( 100 )
				.delay( randf( 250, 1000) )
				.yoyo( true )
				.onUpdate( function( value ) {
					this.scale.z = 1. + this.material.uniforms.fade.value;
				}.bind( m ))
				.start();

			m.scale.x = .9;

			m.position.x = bass_index + .5;

			bass[i].keys.push( m );

			bass[i].group.add( m );

			bass_index++;
		}

	}

	//	transform the keys as a whole
	bassGroup.position.x -= HALF_WIDTH;

	bassGroup.scale.x = WIDTH / bass_index;
	bassGroup.scale.y = HEIGHT;// / 3;
	bassGroup.scale.z = HEIGHT * .5;

	// Drums
	// drums1: Interface_1 - toggle
	// drums2: Interface_2 - button
	// drums3: Interface_3 - button
	// drums4: Interface_4 - button
	// drums5: Controls - mulitslider ( 15 sliders )
	// drums6: Tilt - tilt
	// 
	var drums = {

		Interface_1: {
			color: 0xF70D1B,
			count: 1,
			keys: [],
			group: new THREE.Group()
		},

		Interface_2: {
			color: 0xF71B24,
			count: 1,
			keys: [],
			group: new THREE.Group()
		},

		Interface_3: {
			color: 0xF72C32,
			count: 1,
			keys: [],
			group: new THREE.Group()
		},

		Interface_4: {
			color: 0xF73E42,
			count: 1,
			keys: [],
			group: new THREE.Group()
		},
	}

	var drumGroup = new THREE.Group();
	group.add( drumGroup );

	drum_index = 0;
	for(var i in drums) {

		drumGroup.add( drums[i].group );

		for(var j=0; j<drums[i].count; j++ ) {

			var m = new THREE.Mesh( boxGeometry, new LDProjectionKeyMaterial( {
				color: drums[i].color 
			} ) );

			m.scale.x = .9;

			m.position.x = drum_index + .5;

			m.fadeTween = new TWEEN.Tween( m.material.uniforms.fade )
				.to( {value: 1}, (drum_index + 1) * 50 )
				.repeat( 100 )
				.delay( (drum_index + 1) * 200 )
				.yoyo( true )
				.onUpdate( function( value ) {
					this.scale.z = 1. + this.material.uniforms.fade.value;
				}.bind( m ))

				.start();

			drums[i].keys.push( m );

			drums[i].group.add( m );

			drum_index++;
		}


	}

	//	transform the keys as a whole
	drumGroup.position.x -= HALF_WIDTH;
	drumGroup.position.y += HEIGHT / 3;

	drumGroup.scale.x = WIDTH / drum_index;
	drumGroup.scale.y = HEIGHT * 2 / 3;
	drumGroup.scale.z = HEIGHT * .5;

	group.scale.y = -1;

	rtScene.add( group );


	// Vocals
	// voicefx: FX

	// Pre_Sampled Drums
	// pre_drums1: Trigger_1
	// pre_drums2: Trigger_2
	// pre_drums3: Trigger_3
	// pre_drums4: Trigger_4
	// pre_drums5: Trigger_5
	// pre_drums6: Tilt

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

	function setup() {

		//	LINES
		linesGeometry = getLineGeometry();

		var linesMatOptions = {
			pMap: rt,
			lineLength: lineLength,
			lineWidth: lineWidth,
			spriteRotation: spriteRotation,
			noiseScale: noiseScale,
			noiseAmount: noiseAmount,
			WIDTH: WIDTH,
			HEIGHT: HEIGHT,
			opacity: 1
		}

		linesMat = new ProjectionLinesMaterial( linesMatOptions);

		var linesMesh = new THREE.Mesh( linesGeometry, linesMat );
		// var linesMesh1 = new THREE.Mesh( linesGeometry, new ProjectionLinesMaterial( linesMatOptions) );
		// var linesMesh2 = new THREE.Mesh( linesGeometry, new ProjectionLinesMaterial( linesMatOptions) );

		// linesMesh.material.uniforms.color.value.setRGB( 0, 0, 1 );
		// linesMesh1.material.uniforms.color.value.setRGB( 0, 1, 0 );
		// linesMesh2.material.uniforms.color.value.setRGB( 1, 0, 0 );

		scene.add( linesMesh );
		// scene.add( linesMesh1 );
		// scene.add( linesMesh2 );

	}

	function update() {

		var elapsedTime = clock.getElapsedTime();

		if(linesMat)	linesMat.uniforms.time.value = elapsedTime * timeScale;

		// group.rotation.y += Math.pow(Math.abs(sin( elapsedTime )), 2 ) * .01;

	}

	function draw() {

		renderer.render( rtScene, camera, rt, true );

		renderer.render( scene, camera, null, true );

	}

	function animate() {

		TWEEN.update();

		update();

		draw();

		requestAnimationFrame(animate);

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

	// function getRadialInstrument ( options ) {

	// 	console.log( options );

	// 	var m = new THREE.Mesh( circleGeometry, new THREE.MeshBasicMaterial( {
	// 		map: debugImage,
	// 		side: 2
	// 	} ) );

	// 	m.scale.multiplyScalar( options.radius || 100 );

	// 	return m;
	// }

	/**
	 * RENDERER SETUP
	 */
	function rendererSetup()
	{
		renderer = new THREE.WebGLRenderer( { antialias: true, devicePixelRatio: 1 } );
		
		renderer.setClearColor( 0x000000, 1 );

		renderer.setPixelRatio( window.devicePixelRatio );

		renderer.sortObjects = true;
		
		renderer.setSize( WIDTH, HEIGHT );

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

	var key_map = { 113 : "q", 119 : "w", 101 : "e", 114 : "r", 116 : "t", 121 : "y", 97 : "a", 115 : "s", 100 : "d", 102 : "f", 103 : "g", 104 : "h", 122 : "z", 120 : "x", 99 : "c", 118 : "v", 98 : "b", 110 : "n" };
	

	function onKeypressed( e )
	{
		switch(key_map[e.which])
		{
			case undefined:
				console.log( e.which  + " not in key_map.");	
				break;

			default:
				console.log(key_map[e.which]);	
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
