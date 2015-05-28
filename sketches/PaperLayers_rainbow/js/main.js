//http://fbsisosurface:9876/?debug=true

/**
 * 
 */


var app;

$(window).bind("load", function() {
	var debug = getQuerystring('debug') == "true";
	app = new APP( debug );
	// app.begin();
});


function APP( _debug )
{
	/**
	 * FASTER TO TYPE FUNCTIONS
	 */
	var randf = THREE.Math.randFloat;
	var mapLinear = THREE.Math.mapLinear;
	var clamp = THREE.Math.clamp;
	var sin = Math.sin, cos = Math.cos;
	var PI = Math.PI, HALF_PI = PI * .5, TWO_PI = PI * 2;
	var v3 = function(x,y,z){	return new THREE.Vector3( x, y, z );}

	/**
	 * BASE VARIABLES
	 */
	var debug = _debug !== undefined ? _debug : true;

	// components and variables
	var container = document.getElementById( 'container' );
	var scene = new THREE.Scene(),
		clock = new THREE.Clock(),
		renderer, elapsedTime, camera, light;


	//loading
	var manager = new THREE.LoadingManager();


	

	//LIGHTS


	//load assets
	var manager = new THREE.LoadingManager();
	var textureLoader = new THREE.TextureLoader( manager );
	var objLoader = new THREE.OBJLoader( manager );

	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
	};

	manager.onLoad = function(){
		console.log( "\nmanager.onLoad\n\n" );

		begin();
	}


	//load images
	var debugImage;
	textureLoader.load( 'images/testPatternSquare.JPG', function ( t ) {
		// t.minFilter = THREE.LinearFilter;
		debugImage = t;
		console.log( "debugImage", debugImage );

		debugImage.wrapS = debugImage.wrapT = THREE.MirroredRepeatWrapping;
	});

	var colorRamp;
	textureLoader.load( 'images/colorRamp10.png', function ( t ) {
		// t.minFilter = THREE.LinearFilter;
		colorRamp = t;
		colorRamp.wrapS = colorRamp.wrapT = THREE.MirroredRepeatWrapping;
	});

	//TEXTURE PROJECTION
	// var projectionCamera = createOrthoCamera( );// 
	var projectionCamera = new THREE.PerspectiveCamera( 60, 1, 1, 1000 );

	projectionCamera.position.set( 0, 0, 350)
	// projectionCamera.rotation.set( -1, 0, 0 )

	projectionCamera.updateProjectionMatrix();
	projectionCamera.updateMatrixWorld();
	projectionCamera.matrixWorldInverse.getInverse( projectionCamera.matrixWorld );


	var mapProjectionMatrix = new THREE.Matrix4();

	// noise texture
	// var noiseRT = new THREE.WebGLRenderTarget( 2048, 1024, {} );

	/**
	 * SETUP
	 */
	var temp, cubes = [], cubeTweens = [];
	function setup()
	{
		console.log( "\nSETUP\n\n" );

		//SETUP CAMERAS
		camera = createOrthoCamera();//
		// camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 20, 10000 );
		camera.position.z = 1000;

		var g = new THREE.BoxGeometry(1, 1, 1);
		var mat = new ProjectionMaterial({
			map: debugImage,
			colorRamp: colorRamp,
			mapProjectionMatrix: mapProjectionMatrix
		});
		temp = new THREE.Mesh( g, mat );
		scene.add( temp );

		for(var i=0; i<20; i++)
		{
			for(var j=0; j< 10; j++)
			{
				var m = temp.clone();
				cubes.push( m );

				m.position.x = i * 100 - 950;
				m.position.y = j * 100 - 450;
				m.scale.multiplyScalar( 100 );

				scene.add( m );
			}
		}

		var guiContainer = $('<div>').css({
			position: "absolute",
			right: 10,
			top: 10
		})
		$(container).append(guiContainer);
		var gui = new dat.GUI();
		// dat.GUI.toggleHide();
		guiContainer.append($(gui.domElement));

		var projectionFolder = gui.addFolder("texture_projection");
		var pfRot = projectionFolder.addFolder( "rotation" );

		pfRot.add( projectionCamera.rotation, 'x', -PI, PI).step( .001 );
		pfRot.add( projectionCamera.rotation, 'y', -PI, PI).step( .001 );
		pfRot.add( projectionCamera.rotation, 'z', -PI, PI).step( .001 );

		var pfPos = projectionFolder.addFolder( "position" );
		pfPos.add( projectionCamera.position, 'x', -1000.0, 1000.0).step( .001 );
		pfPos.add( projectionCamera.position, 'y', -1000.0, 1000.0).step( .001 );
		pfPos.add( projectionCamera.position, 'z', 0.0, 1000.0).step( .001 );


		//
		setTimeout( triggerCubeRotations, 3000 );

	}	

	function stopCubeTweens()
	{
		for(var i=0; i<cubeTweens.length; i++)
		{
			cubeTweens[i].stop();
			TWEEN.remove(cubeTweens[i]);
		}

		// TWEEN.removeAll();
		cubeTweens = [];
	}

	function triggerCubeRotations()
	{	

		stopCubeTweens();

		for(var i=0; i<cubes.length; i++)
		{
			cubes[i].rotation.x = 0;
			cubes[i].rotation.y = 0;

			var startDelay = cubes[i].position.distanceTo( v3(0,0,0) ) * 3;
			startDelay = i * 10 + cubes[i].position.y;
			
			var tween = new TWEEN.Tween( cubes[i].rotation )
				.to({x: randf(-HALF_PI, HALF_PI), y: randf(-PI, PI)}, 400)
				.delay( 1000 )
				.repeat( 1000 )
				.yoyo( true )
				.easing( TWEEN.Easing.Quadratic.Out )
				.start( startDelay + elapsedTime * 1000);

			cubeTweens.push( tween );
		}
	}

	/**
	 * UPDATE
	 */
	function update()
	{
		elapsedTime = clock.getElapsedTime();

		projectionCamera.updateProjectionMatrix();
		projectionCamera.updateMatrixWorld();
		projectionCamera.matrixWorldInverse.getInverse( projectionCamera.matrixWorld );

		// projectionCamera.rotation.z = elapsedTime;

		mapProjectionMatrix.set( 0.5, 0.0, 0.0, 0.5,
								 0.0, 0.5, 0.0, 0.5,
								 0.0, 0.0, 0.5, 0.5,
								 0.0, 0.0, 0.0, 1.0 );

		mapProjectionMatrix.multiply( projectionCamera.projectionMatrix );
		mapProjectionMatrix.multiply( projectionCamera.matrixWorldInverse );

		temp.material.uniforms.time.value = elapsedTime;
		temp.material.uniforms.mapProjectionMatrix.value = mapProjectionMatrix;
	}

	/**
	 * DRAW
	 */
	function draw()
	{

		renderer.render( scene, camera, null, true );

	}


	/**
	 * get the dimensions for a rectangle that fills the screen at the origin(assumes the camera is looking at the origin)
	 * @param  {THREE.Camera} camera 
	 * @return {obj}        {width: number, height: number}
	 * @link http://stackoverflow.com/questions/13350875/three-js-width-of-view
	 */
	function getScreenSpaceDim( camera )
	{
		var vFOV = camera.fov * Math.PI / 180;        // convert vertical fov to radians
		var height = 2 * Math.tan( vFOV / 2 ) * camera.position.z; // visible height

		var aspect = window.innerWidth / window.innerHeight;
		var width = height * aspect;  

		return {width: width, height: height}
	} 

	function createOrthoCamera( w, h, d ) {

		w = w || window.innerWidth, h = h || window.innerHeight, d = d || 10000;

		return new THREE.OrthographicCamera( -w / 2, w / 2, h / 2, -h / 2, -1, d );
	}

	/**
	 * EVENTS
	 */
	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function onKeypressed( e )
	{
		switch(e.which)
		{
			case 116: /*t*/ 
				// showHUD = !showHUD;
				triggerCubeRotations();
				break;

			default:
				console.log( e );
				break;
		}
	}

	/**
	 * RENDERER SETUP
	 */
	function rendererSetup()
	{
		renderer = new THREE.WebGLRenderer( { antialias: true, devicePixelRatio: 1 } );
		
		renderer.setClearColor( 0x000000 );

		renderer.setPixelRatio( window.devicePixelRatio );

		renderer.sortObjects = true;
		
		renderer.setSize( window.innerWidth, window.innerHeight );

		renderer.autoClear = false;

		renderer.shadowMapEnabled = true;

		renderer.shadowMapType = THREE.PCFShadowMap;

		container.appendChild( renderer.domElement );
	}


	/**
	 * STATS
	 */
	var stats;
	if( debug )
	{	
		stats = new Stats();
		$(stats.domElement).css({
			position: "absolute",
			left: '20px',
			right: '20px'
		}).appendTo( container );
	}	

	/**
	 * ANIMATE
	 */
	function animate()
	{
		TWEEN.update();

		update();

		draw();

		if(stats)	stats.update();

		requestAnimationFrame(animate);
	}

	/**
	 * SETUP AND RUN THE APP
	 */
	function begin()
	{	
		//setup
		rendererSetup();
		setup();

		// events
		$(document).keypress( onKeypressed );
		window.addEventListener( 'resize', onWindowResize, false );

		//animate
		animate();	
	}

	return {
		begin: begin
	}
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