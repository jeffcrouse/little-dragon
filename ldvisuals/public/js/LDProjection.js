
/**
 * NICE PRESETS:

 &lineLength=128.25215918712954&lineWidth=8.510922946655377&lineOpacity=0.270956816257409&spacing=10&rotation=8.171865056585812&noiseScale=0.0075&noiseAmount=3.0347163420829806&timeScale=-3.48264182895851

 &lineLength=7.470448772226926&lineWidth=3.1459779847586793&lineOpacity=1&spacing=10&rotation=8.171865056585812&noiseScale=0.0075&noiseAmount=3.0347163420829806&timeScale=-1.6401354784081286

 &lineLength=39.822692633361555&lineWidth=34.262658763759525&lineOpacity=0.15173581710414902&spacing=10&rotation=0.6809887547154844&noiseScale=0.005707722269263337&noiseAmount=3.5549534292972056&timeScale=-0.881456392887384

 */



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

		'	gl_FragColor = vec4( c, opacity );',

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

	var lineOpacity = getQueryVariable("lineOpacity") || options.lineOpacity || 1;	

	var spacing = getQueryVariable("spacing") || options.spacing || 10;

	var spriteRotation = getQueryVariable("rotation") || options.spriteRotation || Math.PI * 2;

	var noiseScale = getQueryVariable("noiseScale") || options.noiseScale || .0075;

	var noiseAmount = getQueryVariable("noiseAmount") || options.noiseAmount || 2;

	var timeScale = getQueryVariable("timeScale") || options.timeScale || -1;

	var blending = getQueryVariable("blending") || options.blending || 1;

	var numSpacers = 0;

	var PROJECTOR_NUM = options.num || 1;

	var WIDTH =  options.width || window.innerWidth; // 1280;//
	var HEIGHT = options.height || window.innerHeight; // 720;//
	var LEFT = options.left || 0;
	var TOP = options.top || 0;
	var ASPECT_RATIO = WIDTH / HEIGHT;
	console.log("LEFT", LEFT, "TOP", TOP);


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
	var container = $("<div>", {id: "container"}).css({
		position: "absolute",
		width: WIDTH, // 1280, // WIDTH,
		height: HEIGHT, // 800, // HEIGHT,
		pointerEvents: "none",
		backgroundColor: "rgba( 0, 0, 0, 1)"
	}).appendTo( document.body );

	container.offset({ top: TOP, left: LEFT})

	//THREE
	var scene, renderer, renderTarget, camera, group, clock = new THREE.Clock();

	if( PROJECTOR_NUM === 1) {

		camera = new THREE.OrthographicCamera( -HALF_WIDTH, HALF_WIDTH, HALF_HEIGHT, -HALF_HEIGHT, -1000, 1000 ); // 	

	} else {

		camera = new THREE.OrthographicCamera( HALF_WIDTH, -HALF_WIDTH, HALF_HEIGHT, -HALF_HEIGHT, -1000, 1000 ); // 

	}

	var cameraZoom = 1, minZoom = .1, maxZoom = 1;


	function setCameraPositionX( value ){
		camera.position.x = value * (1. - cameraZoom);//lerp( value, 0, cameraZoom );

		camera.updateProjectionMatrix();
	}

	function setCameraPositionY( value ){
		// camera.position.y = value;
		camera.position.y = value * (1. - cameraZoom);//lerp( value, 0, cameraZoom );

		camera.updateProjectionMatrix();
	}

	function setCameraZoom( zoom ) {
		cameraZoom = clamp( zoom, minZoom, maxZoom );

		camera.left = -HALF_WIDTH * cameraZoom;
		camera.right = HALF_WIDTH * cameraZoom;
		camera.top = HALF_HEIGHT * cameraZoom;
		camera.bottom = -HALF_HEIGHT * cameraZoom;

		setCameraPositionX( camera.position.x );
		setCameraPositionY( camera.position.y );


		// if( PROJECTOR_NUM === 1) {
		// 	camera.left = HALF_WIDTH * cameraZoom;
		// 	camera.right = -HALF_WIDTH * cameraZoom;
		// } 

		camera.updateProjectionMatrix();
		
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

	var distortionMaps = {}, distortionMapPaths = [ 'blur.jpg', 'circles.png', 'face.png', 'noiseDark.png', 'lines.gif', 'noise.jpg' ];

	for(var i=0; i<distortionMapPaths.length; i++) {
		textureLoader.load( "textures/distortionMaps/" + distortionMapPaths[i], function ( t, data ) {

			// t.minFilter = THREE.LinearFilter;
			// debugImage = t;
			// t.wrapS = THREE.MirroredRepeatWrapping;  
			t.wrapT = THREE.MirroredRepeatWrapping;  

			var name = t.image.currentSrc.split('/');
			name = name[name.length - 1];

			distortionMaps[name] = t;
		});
	}


	// OBJECTS
	var boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );
	var baseColor = 0x111455;

	var keyWidthScale = 1.;

	var oscMap = {};

	var bRandomTriggers = getQueryVariable( "randomPattern" );

	// Keys
	// keys1: Controls - multislider( 4 sliders )
	// keys2: Interface_1 - keys( 7 keys )
	// keys3: Interface_2 - keys( 7 keys )
	// keys4: Interface_3 - keys( 7 keys )
	// keys5: Interface_4 - keys( 7 keys )
	// keys6: Tilt - tilt
	
	var keyboards = {

		'/keys_keyboard_2': {
			color: 0xD5F7FA,
			count: 7,
			keys: {},
			group: new THREE.Group(),
			firstNote: 48
		},

		'/keys_keyboard_3': {
			color: 0xC1F4F9,
			count: 7,
			keys: {},
			group: new THREE.Group(),
			firstNote: 48
		},

		// Interface_3: {
		// 	color: 0xB0F2FA,
		// 	count: 7,
		// 	keys: [],
		// 	group: new THREE.Group()
		// },

		// Interface_4: {
		// 	color: 0x9CF1FA,
		// 	count: 7,
		// 	keys: [],
		// 	group: new THREE.Group()
		// },

	}

	var rndDelay = getQueryVariable('rndDelay') || 300;
	var rndSpeed = getQueryVariable('rndSpeed') || 200;

	function tweenRandomPress( m ){

		m.fadeTween = new TWEEN.Tween( m.material.uniforms.fade )
			.to( {value: 1}, rndSpeed )
			.repeat( 1000 )
			.delay( randf( 200, 400) )
			.yoyo( true )
			.onUpdate( function( value ) {
				this.scale.z = 1. + this.material.uniforms.fade.value;
			}.bind( m ))
			.start(randf( 100, 10000));
	}


	
	var keysGroup = new THREE.Group();

	group.add( keysGroup );

	var key_index = 0;
	for(var i in keyboards ) {

		keysGroup.add( keyboards[i].group );

		for(var j=keyboards[i].firstNote; j<keyboards[i].firstNote + keyboards[i].count; j++ ) {

			var m = new THREE.Mesh( boxGeometry, new LDProjectionKeyMaterial( {
				color: keyboards[i].color 
			} ) );

			m.material.uniforms.fade.value = 0;

			m.scale.x = keyWidthScale;

			m.position.x = key_index + .5;

			keyboards[i].keys[j] = m;

			keyboards[i].group.add( m );

			key_index++;


			//debugging
			if(bRandomTriggers) {

				tweenRandomPress( m );
					
			}

		}

	}

	//	transform the keys as a whole
	keysGroup.position.x -= HALF_WIDTH;
	keysGroup.position.y -= HEIGHT / 3;

	keysGroup.scale.x = WIDTH / key_index;
	keysGroup.scale.y = HEIGHT * 2 / 3;
	keysGroup.scale.z = HEIGHT * .5;

	//keep them in the larger osc map
	for(var i in keyboards)	oscMap[i] = keyboards[i];

	// Bass
	// bass1: Controls - multislider( 4 sliders )
	// bass2: Interface_1 - keys( 4 keys )
	// bass3: Interface_2 - keys( 3 keys )
	// bass4: Interface_3 - keys( 4 keys )
	// bass5: Interface_4 - keys( 3 keys )
	// bass6: Tilt - tilt
	
	
	
	
	
	
	
	


	var bass = {

		"/bass_keyboard_1": {
			// color: 0x2BFCB7,
			color: 0xF71B24,
			count: 3,
			keys: {},
			group: new THREE.Group(),
			firstNote: 48
		},

		"/bass_keyboard_2": {
			// color: 0x2BFECA,
			color: 0xF72C32,
			count: 4,
			keys: {},
			group: new THREE.Group(),
			firstNote: 48
		},

		"/bass_keyboard_3": {
			// color: 0x2CFEDD,
			color: 0xF73E42,
			count: 3,
			keys: {},
			group: new THREE.Group(),
			firstNote: 48
		},

		"/bass_keyboard_4": {
			// color: 0x2DFFFE,
			color: 0xF73E42,
			count: 4,
			keys: {},
			group: new THREE.Group(),
			firstNote: 48
		},
	}

	var bassGroup = new THREE.Group();
	group.add( bassGroup );

	bass_index = 0;
	for(var i in bass) {

		bassGroup.add( bass[i].group );

		for(var j=bass[i].firstNote; j<bass[i].firstNote + bass[i].count; j++ ) {

			var m = new THREE.Mesh( boxGeometry, new LDProjectionKeyMaterial( {
				color: bass[i].color 
			} ) );

			m.material.uniforms.fade.value = 0;

			m.scale.x = keyWidthScale;

			m.position.x = bass_index + .5;

			bass[i].keys[j] = m;

			bass[i].group.add( m );

			bass_index++;


			//debugging
			if(bRandomTriggers) {

				tweenRandomPress( m );
					
			}
		}

	}

	//	transform the keys as a whole
	bassGroup.position.x -= HALF_WIDTH;
	bassGroup.position.y += HEIGHT / 3;

	bassGroup.scale.x = WIDTH / bass_index;
	bassGroup.scale.y = HEIGHT * 2 / 3;
	bassGroup.scale.z = HEIGHT * .5;

	for(var i in bass)	oscMap[i] = bass[i];

	// Drums
	// drums1: Interface_1 - keyboard
	// drums2: Interface_2 - keyboard
	// drums3: Interface_3 - keyboard
	// drums4: Interface_4 - keyboard
	// drums5: Controls - mulitslider ( 15 sliders )
	// drums6: Tilt - tilt


	var drums = {

		"/drums_keyboard_1": {
			color: 0x2BFCB7,
			// color: 0xF71B24,
			count: 5,
			keys: {},
			group: new THREE.Group(),
			firstNote: 48
		},

		"/drums_keyboard_2": {
			color: 0x2BFECA,
			// color: 0xF72C32,
			count: 2,
			keys: {},
			group: new THREE.Group(),
			firstNote: 48
		},

		"/drums_keyboard_3": {
			color: 0x2CFEDD,
			// color: 0xF73E42,
			count: 2,
			keys: {},
			group: new THREE.Group(),
			firstNote: 48
		},

		"/drums_keyboard_4": {
			color: 0x2DFFFE,
			// color: 0xF73E42,
			count: 2,
			keys: {},
			group: new THREE.Group(),
			firstNote: 48
		},
	}




	var drumGroup = new THREE.Group();
	group.add( drumGroup );

	drum_index = 0;
	for(var i in drums) {

		drumGroup.add( drums[i].group );

		for(var j=drums[i].firstNote; j<drums[i].firstNote + drums[i].count; j++ ) {

			var m = new THREE.Mesh( boxGeometry, new LDProjectionKeyMaterial( {
				color: drums[i].color 
			} ) );

			m.material.uniforms.fade.value = 0;

			m.scale.x = keyWidthScale;

			m.position.x = drum_index + .5;

			drums[i].keys[j] = m;

			drums[i].group.add( m );

			drum_index++;

			//debugging
			if(bRandomTriggers) {

				tweenRandomPress( m );
					
			}
		}

	}

	//	transform the keys as a whole for secret reasons
	drumGroup.position.x -= HALF_WIDTH;
	// drumGroup.position.y += HEIGHT / 3;

	drumGroup.scale.x = WIDTH / drum_index;
	drumGroup.scale.y = HEIGHT;// * 2 / 3;
	drumGroup.scale.z = HEIGHT * .5;


	for(var i in drums)	oscMap[i] = drums[i];

	group.scale.y = -1;

	rtScene.add( group );

	console.log( 'oscMap', oscMap );

	/**
	 * handle incoming osc messages
	 * @param  {string} phoneName [description]
	 * @param  {object} data      {[description]}
	 */
	function handleOSC( phoneName, data ) {

		data = data || {};


		// if(p === undefined) {

		// 	console.log( "couldn't find instrument named " + phoneName );

		// 	return;

		// }

		switch ( phoneName ) {

			case '/keys_keyboard_2':
			case '/keys_keyboard_3':

				//get the object
				var p = oscMap[phoneName].keys[ data.note ]

				//set it's value
				// if(p)	p.material.uniforms.fade.value = parseFloat( data.on > 0 ? 1. : 0 );
				// else console.log(  "couldn't find instrument named " + phoneName  );
				// break;
				
				//set it's value
				if(p)	{

					//kill existing tween
					if(p.tween) {
						p.tween.stop();
						TWEEN.remove( p.tween );
					}

					if( data.on > 0 ) {

						// p.material.uniforms.fade.value = 1.;
						p.tween = new TWEEN.Tween(p.material.uniforms.fade )
							.to({value: 1}, 50)
							.start()

					} else {
						p.tween = new TWEEN.Tween(p.material.uniforms.fade )
							.to({value: 0}, 150)
							.start()
					}

					
				}
				else {
					console.log(  "couldn't find instrument named " + phoneName  );
				}

				break;
			
			case '/bass_keyboard_1':
			case '/bass_keyboard_2':
			case '/bass_keyboard_3':
			case '/bass_keyboard_4':

				// get the object
				var p = oscMap[phoneName].keys[ data.note ]

				//	set it's value
				// if(p)	p.material.uniforms.fade.value = parseFloat( data.on > 0 ? 1. : 0 );
				// else console.log(  "couldn't find instrument named " + phoneName  );
				// break;
				
				//set it's value
				if(p)	{

					//kill existing tween
					if(p.tween) {
						p.tween.stop();
						TWEEN.remove( p.tween );
					}

					if( data.on > 0 ) {

						// p.material.uniforms.fade.value = 1.;
						p.tween = new TWEEN.Tween(p.material.uniforms.fade )
							.to({value: 1}, 50)
							.start()

					} else {
						p.tween = new TWEEN.Tween(p.material.uniforms.fade )
							.to({value: 0}, 150)
							.start()
					}

					
				}
				else {
					console.log(  "couldn't find instrument named " + phoneName  );
				}

				break;

			// case '/drums_toggle_1':
			case '/drums_keyboard_1':
			case '/drums_keyboard_2':
			case '/drums_keyboard_3':
			case '/drums_keyboard_4':

				// get the object
				var p = oscMap[phoneName].keys[ data.note ];

				//	set it's value
				// if(p)	p.material.uniforms.fade.value = parseFloat( data.on > 0 ? 1. : 0 );
				// else console.log(  "couldn't find instrument named " + phoneName  );
				// break;
				
				//set it's value
				if(p)	{

					//kill existing tween
					if(p.tween) {
						p.tween.stop();
						TWEEN.remove( p.tween );
					}

					if( data.on > 0 ) {

						// p.material.uniforms.fade.value = 1.;
						p.tween = new TWEEN.Tween(p.material.uniforms.fade )
							.to({value: 1}, 50)
							.start()

					} else {
						p.tween = new TWEEN.Tween(p.material.uniforms.fade )
							.to({value: 0}, 150)
							.start()
					}

					
				}
				else {
					console.log(  "couldn't find instrument named " + phoneName  );
				}

				break;

			case '/keys_button_1':

				//get the object
				var p = oscMap[phoneName];

				//set it's value
				p.m.material.uniforms.fade.value = parseFloat( data.press || 0 );

				break;

			default:
				break;
		}
	}

	/**
	 * [getLineGeometry description]
	 * @param  {[type]} g [description]
	 * @return {[type]}   [description]
	 */
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

	var linesMatOptions = {
		pMap: rt,
		lineLength: lineLength,
		lineWidth: lineWidth,
		spriteRotation: spriteRotation,
		noiseScale: noiseScale,
		noiseAmount: noiseAmount,
		WIDTH: WIDTH,
		HEIGHT: HEIGHT,
		opacity: lineOpacity,
		blending: blending
	}

	linesMat = new ProjectionLinesMaterial( linesMatOptions);

	function setup() {

		linesMat.uniforms.distortionMap.value = distortionMaps["blur.jpg"];

		//	LINES
		linesGeometry = getLineGeometry();

		var linesMesh = new THREE.Mesh( linesGeometry, linesMat );
		linesMesh.frustumCulled = false;
		
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

		linesMat.uniforms.time.value += timeScale / 60;

		// group.rotation.y += Math.pow(Math.abs(sin( elapsedTime )), 2 ) * .01;

	}

	function draw() {

		renderer.render( rtScene, camera, rt, true );

		renderer.render( scene, camera, null, true );
		
		// renderer.render( rtScene, camera, null, true );

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

	function logQueryStrings() {

		var str = "";

		str += "&lineLength=" + lineLength;
		str += "&lineWidth=" + lineWidth;
		str += "&lineOpacity=" + lineOpacity;
		str += "&spacing=" + spacing;
		str += "&rotation=" + spriteRotation;
		str += "&noiseScale=" + noiseScale;
		str += "&noiseAmount=" + noiseAmount;
		str += "&timeScale=" + timeScale;

		console.log( str );

	}




	function begin() {

		rendererSetup();

		setup();

		animate();
	}

	function onKeypressed( e ) {

		switch( e.which ) {

			case 112: //'p'
				logQueryStrings();
				break;

			default:
				console.log( e.which );	
				break;
		}
	}


	$(document).keypress( onKeypressed );

	return {

		scope: scope,

		begin: begin,

		container: container,

		handleOSC: handleOSC,

		setLineWidth: function( value ) {
			linesMat.uniforms.lineWidth.value = lineWidth = value;
		},

		getLineWidth: function(){
			return lineWidth;
		},

		setLineLength: function( value ) {
			linesMat.uniforms.lineLength.value = lineLength = value;
		},

		getLineLength: function(){
			return lineLength;
		},

		setLineOpacity: function( value ) {
			linesMat.uniforms.opacity.value = lineOpacity = value;
		},

		getLineOpacity: function(){
			return linesMat.uniforms.opacity.value;
		},

		setBlending: function( value ) {
			linesMat.blending = value;
			console.log( linesMat );
		},

		getBlending: function(){
			return linesMat.blending;
		},

		setRotation: function( value ) {
			linesMat.uniforms.spriteRotation.value = spriteRotation = value;
		},

		getRotation: function(){
			return spriteRotation;
		},

		setNoiseScale: function( value ) {
			noiseScale = linesMat.uniforms.noiseScale.value = value;
		},

		getNoiseScale: function() {
			return noiseScale;
		},

		setNoiseAmount: function( value ) {
			noiseAmount = linesMat.uniforms.noiseAmount.value = value;
		},

		getNoiseAmount: function() {
			return noiseAmount;
		},

		setTimeScale: function( value ) {
			timeScale = value;
		},

		getTimeScale: function() {
			return timeScale;
		},

		setGroupRotationX: function( value ) {
			group.rotation.x = value;
		},

		getGroupRotationX: function() {
			return group.rotation.x;
		},

		setGroupRotationY: function( value ) {
			group.rotation.y = value;
		},

		getGroupRotationY: function() {
			return group.rotation.y;
		},

		setGroupRotationZ: function( value ) {
			group.rotation.z = value;
		},

		getGroupRotationZ: function() {
			return group.rotation.z;
		},

		getCameraZoom: function(){
			return cameraZoom;
		},

		setCameraZoom: setCameraZoom,

		setDistortionMap: function( mapName ) {

		},

		getDistortionMaps: function(){
			return distortionMaps
		},

		setDistortionMap: function( index ){
			var count = 0;
			for(var i in distortionMaps) {
				if(count == index){
					linesMat.uniforms.distortionMap.value = distortionMaps[i];
				}
				count ++;
			}
		},

		getCameraPositionX: function(){
			return camera.position.x;
		},

		getCameraPositionY: function(){
			return camera.position.y;
		},

		setCameraPositionX: setCameraPositionX,

		setCameraPositionY: setCameraPositionY

	}
}
