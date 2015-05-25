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
	var PI = Math.PI, halfPI = PI * .5, TWO_PI = PI * 2;
	var v3 = function(x,y,z){	return new THREE.Vector3( x, y, z );}

	/**
	 * BASE VARIABLES
	 */
	var debug = _debug !== undefined ? _debug : true;


	var debugImage = THREE.ImageUtils.loadTexture( "images/RCA_Indian_Head_test_pattern.JPG", null, function(t){
		debugImage = t;
		t.minFilter = THREE.LinearFilter;

		// if(gridMesh)
		// {
		// 	gridMesh.material.uniforms.refractMap.value = t;
		// }
	} )

	var tempPixels = [ 255, 0, 0, 255 ];
	var tempTexture = new THREE.DataTexture( new Uint8Array(tempPixels), 1, 1, THREE.RGBAFormat);
	tempTexture._needsUpdate = true;

	var container = document.getElementById( 'container' );
	var scene = new THREE.Scene(), group = new THREE.Group(), clock = new THREE.Clock(), renderer, elapsedTime;
	scene.add( group );


	//loading
	var manager = new THREE.LoadingManager();

	// guiding vars
	var galaxyAspect = 5.59 / 2.76;// 5.59" x 2.76"
	console.log( 'galaxyAspect: ' + galaxyAspect );


	//SETUP CAMERAS
	var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.z = 100;

	//LIGHTS
	var lightPos = v3(0, -75, 0),
		rotQuat = new THREE.Quaternion().setFromAxisAngle(v3(0,0,1), TWO_PI / 3),
		lightGroup = new THREE.Group();

	scene.add(lightGroup);

	var point1 = new THREE.PointLight();
	var point3 = new THREE.PointLight();
	var point2 = new THREE.PointLight();

	point1.position.copy( lightPos );
	

	lightPos.applyQuaternion( rotQuat );
	point2.position.copy( lightPos );

	lightPos.applyQuaternion( rotQuat );
	point3.position.copy( lightPos );

	point1.color.set( 0x41c0ff );
	point2.color.set( 0xFFFFFF );
	point3.color.set( 0xff31c2 );

	lightGroup.add( point1 );
	lightGroup.add( point2 );
	lightGroup.add( point3 );
	lightGroup.position.z = 5;


	//mesh
	var gridMesh;

	//render target
	var width = window.innerWidth, height = window.innerHeight;

	var rt = new THREE.WebGLRenderTarget( width, height, {
		format: THREE.RGBFormat,
		magFilter: THREE.LinearFilter,
		minFilter: THREE.LinearFilter,
		// wrapS: THREE.MirroredRepeatWrapping,
		// wrapT: THREE.MirroredRepeatWrapping,
		// // type: THREE.FloatType
		// depthBuffer: false
	} );

	var rtScene = new THREE.Scene();
	var rtCamera = new THREE.OrthographicCamera( -width / 2, width / 2, height / 2, -height / 2, -1000, 1000 );



	//	TEMP
	var debugPlane = new THREE.Mesh( new THREE.PlaneGeometry( width * .025, height * .025 ), new THREE.MeshBasicMaterial( {
		map: rt
	} ) );
	scene.add( debugPlane );



	//load or meshes
	var circleGeometry;

	var manager = new THREE.LoadingManager();

	manager.onProgress = function ( item, loaded, total )
	{
		console.log( item, loaded, total );
	};

	manager.onLoad = function(){
		console.log( "\nmanager.onLoad\n\n" );

		begin();
	}

	var mesh_paths = [ "circle.obj", "wave_thick.obj", "wave_thin.obj", "wave.obj" ];
	var meshes = {};
	
	var objLoader = new THREE.OBJLoader( manager );
	// objLoader.load( 'models/circle.obj', function ( object ) { 
	// 	circleGeometry = object.children[0].geometry;
	// } );

	for(var i in mesh_paths){

		var geometryName = mesh_paths[i].split('.')[0];
		var path = "models/" + mesh_paths[i];
		meshes[geometryName] = {
			geometry: undefined,
			path: path
		}
	}

	for(var i in meshes)
	{
		var test = meshes[i];
		objLoader.load( meshes[i].path, function( object ){
			this.geometry = object.children[0].geometry;
			circleGeometry = this.geometry
		}.bind( meshes[i] ) )
	}


	//load images
	var textureLoader = new THREE.TextureLoader( manager );
	var debugImage;

	textureLoader.load( 'images/RCA_Indian_Head_test_pattern.JPG', function ( t ) {
		t.minFilter = THREE.LinearFilter;
		// t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping
		debugImage = t;
	});

	/**
	 * SETUP
	 */
	var controls = {
			normalSmooth: gridMesh.material.uniforms.normalSmooth.value,
			cellScale: gridMesh.material.uniforms.posScale.value,
			shininess: gridMesh.material.uniforms.shininess.value,
			z_position: point1.position.z,
			displacement: gridMesh.material.uniforms.displacement.value,
			light1_color: point1.color.getHex(),
			light2_color: point2.color.getHex(),
			light3_color: point3.color.getHex()
		}

	function setup()
	{
		console.log( "\nSETUP\n\n" );

		//grid mesh
		gridMesh = getSceenPlaneGeometry();
		scene.add( gridMesh );


		//temp auto pilots
		rotateLights();

		function loopRadialHeightMesh(){
			addRadialHeightMesh();
			setTimeout(loopRadialHeightMesh, 1000)
		}


		function loopWaveHeightMesh(){
			addWaveHeightMesh();
			setTimeout(loopWaveHeightMesh, 500)
		}

		setTimeout(function(){
			loopRadialHeightMesh();
		}, 1000);
		setTimeout(function(){
			loopRadialHeightMesh();
		}, 1500);

		setTimeout(function(){
			loopWaveHeightMesh();
		}, 1000);

		//GUI
		var guiContainer = $("<div>", {id: "GUIContainer"});
		guiContainer.css({
			position: "absolute",
			left: "20px",
			top: "20px"
		});
		$(container).append(guiContainer);

		var gui = new dat.GUI();
		// dat.GUI.toggleHide();
		guiContainer.append($(gui.domElement));


		controls = {
			normalSmooth: gridMesh.material.uniforms.normalSmooth.value,
			cellScale: gridMesh.material.uniforms.posScale.value,
			shininess: gridMesh.material.uniforms.shininess.value,
			z_position: lightGroup.position.z,
			displacement: gridMesh.material.uniforms.displacement.value,
			light1_color: point1.color.getHex(),
			light2_color: point2.color.getHex(),
			light3_color: point3.color.getHex()
		}

		gui.remember( controls );

		var shaderFolder = gui.addFolder("shader");
		shaderFolder.add( controls, "displacement", 0, 50 ).onChange(function(e){
			gridMesh.material.uniforms.displacement.value = e;
		})
		shaderFolder.add( controls, "normalSmooth", 0, 1 ).onChange(function(e){
			gridMesh.material.uniforms.normalSmooth.value = e;
		})
		shaderFolder.add( controls, "cellScale", 1, 20 ).onChange(function(e){
			gridMesh.material.uniforms.posScale.value = e;
		})
		shaderFolder.add( controls, "shininess", 2, 100 ).onChange(function(e){
			gridMesh.material.uniforms.shininess.value = e;
		})


		var lightsFolder = gui.addFolder("lights");
		lightsFolder.add( controls, "z_position", 0, 50).onChange(function(e){
			lightGroup.position.z = e;
		})

		lightsFolder.addColor(controls, 'light1_color').onChange(function(e){
			point1.color.setHex( e );
		});

		lightsFolder.addColor(controls, 'light2_color').onChange(function(e){
			point2.color.setHex( e );
		});

		lightsFolder.addColor(controls, 'light3_color').onChange(function(e){
			point3.color.setHex( e );
		});
	}	

	/**
	 * UPDATE
	 */
	function update()
	{
		elapsedTime = clock.getElapsedTime();

		gridMesh.material.uniforms.time.value = elapsedTime * 2;
	}

	/**
	 * DRAW
	 */
	function draw()
	{
		renderer.render( rtScene, rtCamera, rt, true );

		renderer.render( scene, camera, null, true );

		if(stats)	stats.update();
	}

	function rotateLights()
	{
		new TWEEN.Tween( lightGroup.rotation )
			.to( {z: lightGroup.rotation.z + randf(-2, 2)}, 250)
			.delay( 1000 )
			.onComplete( rotateLights )
			.start()
	}

	function addWaveHeightMesh()
	{
		var g = meshes.wave.geometry;
		var mat = new HeightMapMaterial();
		var m = new THREE.Mesh( g, mat );
		rtScene.add( m );

		m.position.x = randf(-300, 100);
		m.position.y = randf(-300, 100);

		m.rotation.z = randf(-3, 3);

		var duration = 2000;

		var rad = randf( 100, 400 );
		m.scale.multiplyScalar( randf( 400, 1000) );

		mat.uniforms.weight.value = 1;
		new TWEEN.Tween( mat.uniforms.weight)
			.to({value: 0}, duration)
			.easing( TWEEN.Easing.Cubic.Out )
			.onComplete(function(){
				rtScene.remove( m );
				mat.dispose();
			})
			.start()
	}

	function addRadialHeightMesh()
	{
		var g = meshes.circle.geometry;// circle;
		var mat = new RadialUVGradient();
		var m = new THREE.Mesh( g, mat );
		rtScene.add( m );

		m.position.x = randf(-600, 300);
		m.position.y = randf(-600, 300);

		var duration = 1000;

		var rad = randf( 100, 400 );
		new TWEEN.Tween( m.scale )
			.to({x: rad , y: rad }, duration)
			.easing( TWEEN.Easing.Elastic.Out )
			.start()

		mat.uniforms.weight.value = 1;
		new TWEEN.Tween( mat.uniforms.weight)
			.to({value: 0}, duration)
			.easing( TWEEN.Easing.Cubic.In )
			.onComplete(function(){
				rtScene.remove( m );
				mat.dispose();
			})
			.start()

	}


	function getSceenPlaneGeometry()
	{
		var screenDim = getScreenSpaceDim( camera );

		var cellHeight = 5,
			cellWidth = cellHeight,
			// cellWidth = cellHeight / galaxyAspect, // 
			numX = Math.floor(window.innerWidth / cellWidth),
			numY = Math.floor(window.innerHeight / cellHeight);


		//create a buffer geometry with these vertex attributes:
		//	-position
		//	-uv
		//	-per face normal(quad face)... maybe we can do this in the shader
		//	-face center
		
		//TODO:: make the mesh on it's own with
		var g = new THREE.PlaneGeometry( screenDim.width, screenDim.height, numX, numY );

		var positions = new Float32Array( g.faces.length * 3 * 3 ); // 3 vertices per face and xyz per vertex
		var uv = new Float32Array( positions.length * 2 / 3 );
		var faceCenters = new Float32Array( positions.length ); 

		var f0, f1, v0, v1, v2,
			v = g.vertices,
			faceCenter = new THREE.Vector3(),
			index = 0, faceCenterIndex = 0, uvIndex = 0;
		
		function addVec3ToArray( v3, vArray, index )
		{
			vArray[ index ] = v3.x;
			vArray[ index+1 ] = v3.y;
			vArray[ index+2 ] = v3.z;
		}

		for(var i=0; i<g.faces.length; i = i + 2)
		{
			f0 = g.faces[i];
			f1 = g.faces[i+1];

			addVec3ToArray( v[f0.a], positions, index );
			index += 3;
			addVec3ToArray( v[f0.b], positions, index );
			index += 3;
			addVec3ToArray( v[f0.c], positions, index );
			index += 3;

			addVec3ToArray( v[f1.a], positions, index );
			index += 3;
			addVec3ToArray( v[f1.b], positions, index );
			index += 3;
			addVec3ToArray( v[f1.c], positions, index );
			index += 3;

			//face center
			faceCenter.copy( v[f0.a] ).add( v[f0.c] ).multiplyScalar( .5 );


			// faceCenter.copy( v[f0.a] ).add( v[f0.b] ).add( v[f0.c] ).divideScalar( 3 );
			addVec3ToArray( faceCenter, faceCenters, faceCenterIndex );
			faceCenterIndex += 3;
			addVec3ToArray( faceCenter, faceCenters, faceCenterIndex );
			faceCenterIndex += 3;
			addVec3ToArray( faceCenter, faceCenters, faceCenterIndex );
			faceCenterIndex += 3;

			// faceCenter.copy( v[f1.a] ).add( v[f1.b] ).add( v[f1.c] ).divideScalar( 3 );
			addVec3ToArray( faceCenter, faceCenters, faceCenterIndex );
			faceCenterIndex += 3;
			addVec3ToArray( faceCenter, faceCenters, faceCenterIndex );
			faceCenterIndex += 3;
			addVec3ToArray( faceCenter, faceCenters, faceCenterIndex );
			faceCenterIndex += 3;
		}

		var w = screenDim.width, h = screenDim.height, hw = w * .5, hh = h * .5;  
		for(var i=0, j=0; i<positions.length; i=i+3, j=j+2)
		{
			uv[j] = mapLinear(positions[i], -hw, hw, 0, 1);
			uv[j+1] = mapLinear(positions[i+1], -hh, hh, 0, 1);
		}

		//clean up
		g.dispose();

		//create & return the mesh
		var geometry = new THREE.BufferGeometry();
		geometry.addAttribute('position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.addAttribute('faceCenter', new THREE.BufferAttribute( faceCenters, 3 ) );
		geometry.addAttribute('uv', new THREE.BufferAttribute( uv, 2 ) );

		var material = new SurfaceMaterial({ 
			map: rt,
			refractMap: debugImage,
			meshDim: new THREE.Vector3( w, h ),
			normalSmooth: 1
		});
		// material.uniforms.refractMap.value = debugImage;

		var mesh = new THREE.Mesh(geometry, material);

		debugPlane.position.set( -hw + 25, hh - 25, 10 );


		return mesh;
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
		addRadialHeightMesh();

		switch(e.which)
		{
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
		// renderer.setClearColor( new THREE.Color().setRGB(.5, .5, 1) );
		renderer.sortObjects = false;
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.autoClear = false;
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