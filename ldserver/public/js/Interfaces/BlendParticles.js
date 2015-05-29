// BlendParticles.js


function BlendParticles( options )
{
	var spritePath = options.spritePath || "/textures/hexagon.png"; // "/textures/sphereNormal.png"

	var numSpritesX = options.numSpritesX || 30;

	var spriteSize = options.spriteSize || 100;

	var spread = options.spread || .02;

	var spreadOffset = options.spreadOffset || new THREE.Vector2( 0, 0);

	var spriteRotation = options.spriteRotation || 0;

	var spriteBlending = options.spriteBlending || 1;

	var spriteOpacity = options.spriteOpacity || .34;

	var spriteNoiseAmount = options.spriteNoiseAmount !== undefined ? options.spriteNoiseAmount : 1;

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
		backgroundColor: "rgba( 0, 0, 0, 1)"
	}).appendTo( document.body );

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
	var widget = MultiSliderWrapper( options ); 

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


	var debug_widgetTextureMesh = new THREE.Mesh( new THREE.BoxGeometry( WIDTH * .25, HEIGHT * .25, 10), new THREE.MeshBasicMaterial( {
		map: widget.renderTarget
	} ) );

	debug_widgetTextureMesh.visible = false;

	scene.add( debug_widgetTextureMesh );

	//
	//	PARTICLES
	//	
	var pointsGeometry = new THREE.Geometry(), v = pointsGeometry.vertices;


	var spacing = WIDTH / numSpritesX, 
		numX = Math.ceil( WIDTH / spacing ),
		numY	= Math.ceil( HEIGHT / spacing ),
		numPoints = (numX + 2) * (numY + 2),
		halfSpacing = spacing;

	var geometry = new THREE.BufferGeometry();
	
	var positions = new Float32Array( numPoints*3 );
	var uvs = new Float32Array( numPoints*2 );

	for(var x=-1, i3=0, i2=0; x<=numX; x++)
	{
		for(var y=-1; y<=numY; y++)
		{
			var uv = v2(x / (numX-1), y / (numY - 1));
			// var c = new THREE.Color().setHSL( uv.x, uv.y, .5 );
			
			positions[i3] = x * spacing - HALF_WIDTH;
			positions[i3+1] = (y + (x%2) * .5) * spacing - HALF_HEIGHT;
			positions[i3+2] = 0;

			uvs[i2] = uv.x;
			uvs[i2+1] = uv.y;

			i2 += 2;
			i3 += 3;
		}
	}


	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
	geometry.computeBoundingBox();

	// var spriteTexture = THREE.ImageUtils.loadTexture( "/textures/hexagon.png" ); "/textures/sphereNormal.png"
	var spriteTexture = THREE.ImageUtils.loadTexture( spritePath );

	var particleMat = new BlendParticleMaterial({
		map: spriteTexture,
		pMap: widget.renderTarget,
		opacity: spriteOpacity,
		size: spriteSize,
		blending: spriteBlending,
		color: new THREE.Color( 0x0000FF ),
		noiseScale: spriteNoiseAmount,
		spriteRotation: spriteRotation
	} )

	var points = new THREE.PointCloud( geometry, particleMat );

	points.frustumCulled = false;

	scene.add( points );

	var p2 = points.clone();
	p2.material = particleMat.clone();
	scene.add( p2 );

	p2.material.uniforms.color.value.set( 0x00FF00 );
	p2.material.uniforms.map.value = spriteTexture;


	var p3 = points.clone();
	p3.material = particleMat.clone();
	scene.add( p3 );

	p3.material.uniforms.color.value.set( 0xFF0000 );
	p3.material.uniforms.map.value = spriteTexture;

	p2.material.uniforms.time = p3.material.uniforms.time = points.material.uniforms.time;

	// COLOR SPREAD
	p2.scale.multiplyScalar( 1 + spread );
	p3.scale.multiplyScalar( 1 + spread * 2);

	p2.position.x += spreadOffset.x * .5;
	p2.position.y += spreadOffset.y * .5;

	p3.position.x += spreadOffset.x ;
	p3.position.y += spreadOffset.y ;



	function addToParticleOffset( x )
	{
		points.material.uniforms.time.value += x || .1;
	}

	function handleInput( event )
	{
		addToParticleOffset( .05 );

		widget.handleInput( event );
	}

	function setup()
	{

	}

	function update()
	{
		var elapsedTime = clock.getElapsedTime();

		addToParticleOffset( .002 );
	}

	function draw()
	{
		widget.draw( renderer );
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

		// renderer.shadowMapEnabled = true;

		// renderer.shadowMapType = THREE.PCFShadowMap;

		container.append( renderer.domElement );
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