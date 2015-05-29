// MultSlider.js



console.log( "create three scene here", THREE );

function MultiSliderInterface ( options ) {

	var controller = options.controller;

	var NUM_SLIDERS = controller.sliders;

	var WIDTH = controller.width;
	var HEIGHT = controller.height;
	var ASPECT_RATIO = WIDTH / HEIGHT;

	var HALF_WIDTH = WIDTH * .5;
	var HALF_HEIGHT = HEIGHT * .5;

	console.log( 'controller', controller );

	var container = $("<div>", {id: "multisliderContainer"}).css({
		position: "absolute",
		left: 0,
		top: 0,
		width: WIDTH,
		height: HEIGHT,
		pointerEvents: "none",
		backgroundColor: "rgba( 255, 255, 255, 0)"
	}).appendTo( document.body );

	var renderer, scene, camera, light;



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
	var v3 = function(x,y,z){	return new THREE.Vector3( x, y, z );}
	var origin = v3(0,0,0);


	//
	//	SCENE
	//
	scene = new THREE.Scene();

	//
	//	CAMERA
	//
	
	camera = new THREE.OrthographicCamera( -HALF_WIDTH, HALF_WIDTH, HALF_HEIGHT, -HALF_HEIGHT, -1000, 1000 ); // 
	// camera = new THREE.PerspectiveCamera( 60, ASPECT_RATIO, 1, 10000 );
	// camera.position.z = 1000;
	camera.lookAt( origin );

	//
	//	LIGHT
	//
	light = new THREE.DirectionalLight( );
	light.position.set( 50, -30, 500);
	light.lookAt( origin );
	

	light.castShadow = true;
	light.shadowDarkness = 0.2;

	// light.onlyShadow = true;
	// light.shadowMapSize = new THREE.Vector2( 2048, 2048 ),
	light.shadowCameraLeft = -HALF_WIDTH;
	light.shadowCameraRight = HALF_WIDTH;
	light.shadowCameraTop = HALF_HEIGHT;
	light.shadowCameraBottom = -HALF_HEIGHT;

	scene.add( light );

	//
	//	INTERFACE COMPONENTS
	//	
	
	//	create the sliders
	var sliders = {};

	var bumpmap = THREE.ImageUtils.loadTexture( "/textures/paperNormal.jpg" );
	bumpmap.repeat = new THREE.Vector2( Math.max(2, 1 / NUM_SLIDERS), 6);
	bumpmap.wrapS = THREE.RepeatWrapping;
	bumpmap.wrapT = THREE.RepeatWrapping;

	var sliderMat = new THREE.MeshPhongMaterial( {
		color: new THREE.Color( 0x111419 ),
		bumpMap: bumpmap,
		bumpScale: 1,
		shininess: 4,
		specular: new THREE.Color( 0xFFFFFF )
	} );

	var sliderGeometry = new THREE.BoxGeometry(1,1,.01, 2, 10 );
	var g2 = new THREE.BoxGeometry( 1,1,1, 3, 5 );
	var g3 = new THREE.BoxGeometry( 1,1,1, 3, 5 );
	for(var i in g2.vertices){
		g2.vertices[i].x = mapLinear( g2.vertices[i].x, -.5, .5, -.5, -.499 );
		g3.vertices[i].y = mapLinear( g2.vertices[i].y, -.5, .5, .499, .5 );
	}
	sliderGeometry.merge( g2 );
	sliderGeometry.merge( g3 );

	var xStep = WIDTH / NUM_SLIDERS;

	for(var i=0; i<NUM_SLIDERS; i++)
	{	

		//	create a child mesh that is centered in the top half of the slider 
		var m = new THREE.Mesh( sliderGeometry, sliderMat.clone() );
		m.position.x = xStep * (i+.5) - HALF_WIDTH;
		m.position.y = HALF_HEIGHT;
		m.scale.x = xStep;
		m.scale.y = HEIGHT;
		m.scale.z = 100
		scene.add( m );

		m.castShadow = true;
		m.receiveShadow = true;

		var rgb = v3(randf(-1, 1), randf(-1, 1), randf(-1, 1) ).normalize().multiplyScalar( 1.2 );
		m.material.color.setRGB( Math.abs(rgb.x), Math.abs(rgb.y), Math.abs(rgb.z) );

		sliders[i] = m;
	}

	var c0 = new THREE.Color( 0xFF3344 ).getHSL();
	var c1 = new THREE.Color( 0x33DDFF ).getHSL();

	function setSliderHieght( index, value )
	{
		if(sliders[index])
		{
			// if( value == 0 )	value = .0001;
			// sliders[index].position.y = value - 1;
			sliders[index].position.y = (value - 1) * HEIGHT;
			var k = cos( value * PI ) * -.5 + .5;
			// var k = smootherstep( value );
			sliders[index].material.color.setHSL( lerp( c0.h, c1.h, k), lerp( c0.s, c1.s, k), lerp( c0.l, c1.l, k) );
		}
	}

	for(var i in controller.val)
	{
		setSliderHieght( i, controller.val[i] );
	}


	var backgroundPlane = new THREE.Mesh( new THREE.PlaneGeometry( WIDTH, HEIGHT ), sliderMat.clone() );
	backgroundPlane.material.color.setHex( 0x050911 );

	backgroundPlane.material.bumpMap = THREE.ImageUtils.loadTexture( "/textures/paperNormal.jpg" );
	backgroundPlane.material.bumpMap.repeat = new THREE.Vector2( 30, 20 );
	backgroundPlane.material.bumpMap.wrapS = THREE.RepeatWrapping;
	backgroundPlane.material.bumpMap.wrapT = THREE.RepeatWrapping;
	backgroundPlane.material.shininess = 2;

	backgroundPlane.receiveShadow = true;
	scene.add( backgroundPlane );

	backgroundPlane.position.z = -100;


	function setup()
	{

	}

	function update()
	{
	}

	function draw()
	{
		renderer.render( scene, camera, null, true );
	}

	function animate()
	{
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

		renderer.shadowMapEnabled = true;

		renderer.shadowMapType = THREE.PCFShadowMap;

		container.append( renderer.domElement );
	}

	function handleInput( e )
	{
		for( var i in e.data.list ) {
			setSliderHieght( i, e.data.list[i] );
		}
	}

	function begin(){
		rendererSetup();
		setup();

		animate();
	}

	begin();

	return {

		begin: begin,
		widgetEvent: handleInput
	}

}




