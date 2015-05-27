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

	/**
	 * SETUP
	 */
	var temp;

	var curves = [];


	var controls;
	
	function setup()
	{
		console.log( "\nSETUP\n\n" );

		//SETUP CAMERAS
		camera = createOrthoCamera();//
		// camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 20, 10000 );
		camera.position.z = 1000;

		controls = new THREE.OrbitControls( camera );

		var g = new THREE.BoxGeometry(100, 100, 100);
		var mat = new THREE.MeshNormalMaterial({
			wireframe: true
		});
		temp = new THREE.Mesh( g, mat );
		scene.add( temp );


		//GUI
		var guiContainer = $('<div>').css({
			position: "absolute",
			right: 10,
			top: 10
		})
		$(container).append(guiContainer);
		var gui = new dat.GUI();
		// dat.GUI.toggleHide();
		guiContainer.append($(gui.domElement));


		//RIBBON
		var points = LittleDragon.getTubeProfile( 200, 30 );

		var profilePoints = LittleDragon.getTubeProfile( 40, 6 );

 		for(var i in profilePoints)	profilePoints[i].y *= Math.min( 5 / Math.abs(profilePoints[i].y), 1);

		var ribbon = new LittleDragon.Ribbon({
			points: points,
			profile: profilePoints,
			subdivisions: 30
		});
		scene.add( ribbon );

		console.log( ribbon );

		var lineGeometry = new THREE.Geometry();
		var normalGeometry = new THREE.Geometry();

		var subd = 100, step = 1 / (subd - 1);
		for(var i = 0; i < subd; i++)
		{
			var u = i * step;

			lineGeometry.vertices.push( ribbon.parallelTransport.spline.getPoint( u ) );
			normalGeometry.vertices.push( ribbon.parallelTransport.normalSpline.getPoint( u ) );
		}

		var curve = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( {color: "magenta"} ) );
		var nomralCurve = new THREE.Line( normalGeometry, new THREE.LineBasicMaterial( {color: "cyan"} ) );

		scene.add( curve );
		scene.add( nomralCurve );

	}	

	/**
	 * UPDATE
	 */
	function update()
	{
		elapsedTime = clock.getElapsedTime();

		controls.update();

		temp.rotation.x = elapsedTime * .1;
		temp.rotation.y = elapsedTime * .2;
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