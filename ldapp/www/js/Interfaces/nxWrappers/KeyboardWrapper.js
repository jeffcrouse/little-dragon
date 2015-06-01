// KeyboardWrapper.js

function KeyboardWrapper( options )
{

	var scope = this;

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

	var controller = options.controller;
	//colors
	var c0 = options.c0 || new THREE.Color( 0xFFFFFF );
	var c1 = options.c1 || new THREE.Color( 0x33FF88 );

	// var NUM_SLIDERS = controller.sliders;
	var keys = controller.keys;

	var WIDTH = 1280; // controller.width;
	var HEIGHT = 720; // controller.height;
	var ASPECT_RATIO = WIDTH / HEIGHT;

	var HALF_WIDTH = WIDTH * .5;
	var HALF_HEIGHT = HEIGHT * .5;

	var decay = .025;

	var camera = options.camera || new THREE.OrthographicCamera( -HALF_WIDTH, HALF_WIDTH, HALF_HEIGHT, -HALF_HEIGHT, -1000, 1000 ); // 

	var renderTarget = new THREE.WebGLRenderTarget( WIDTH * .25, HEIGHT * .25, {
		minFilter: THREE.LinearFilter
	} );

	var scene = new THREE.Scene();

	var autoClear = false;
	
	var clearingMesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( WIDTH, HEIGHT, 10, 10 ), new THREE.MeshBasicMaterial( {
		transparent: true,
		opacity: decay,
		color: "black",
		side: 2,
		depthTest: false,
		depthWrite: true,
	} ) );

	scene.add( clearingMesh );


	var keyGeometry = new THREE.BoxGeometry( 1, 1, .1 );
	var keyMat = new THREE.MeshBasicMaterial( {
		side: 2,
		// transparent: true,
		// opacity: .3,
		color: 0xbbbbbb // 0x8899aa
	} );


	var keyMap = {}
	for(var i in keys )
	{
		var mat = keyMat.clone();
		var m = new THREE.Mesh( keyGeometry, mat );

		m.position.x = keys[i].x + keys[i].w * .5 - HALF_WIDTH;

		m.scale.x = keys[i].w;
		m.scale.y = keys[i].h;

		scene.add( m );

		keyMap[keys[i].note] = m;

		if(keys[i].h !== HEIGHT)
		{
			m.material.color.setRGB( m.material.color.r * .5,  m.material.color.r * .5,  m.material.color.b * .5 );		
			m.position.y = keys[i].y + (HEIGHT - keys[i].h) * .5  + 10;
		}

		m.orig_color = m.material.color.clone();

		m.ld_on = 0;
	}

	function draw( renderer )
	{
		for(var i in keyMap )
		{
			if(keyMap[i].ld_on == 0)	keyMap[i].material.color.lerp( keyMap[i].orig_color, .1 );
		}
		renderer.render( scene, camera, renderTarget, autoClear );
	}

	scope.onHandleInput = function() {
		// console.log( "scope.onHandleInput" );
	}


	function handleInput( event )
	{
		scope.onHandleInput( event );
		
		var m = keyMap[event.data.note];

		m.ld_on = event.data.on;

		m.material.color.setRGB( 1, 1, 1 );

		// new TWEEN.Tween( m.material.color )
		// 	.to({r: 1, g: 1, b: 1}, 250)
		// 	.onComplete( function (){
		// 		new TWEEN.Tween( m.material.color )
		// 			.to(m.orig_color, 250)
		// 			.start()
		// 	})
		// 	.start()
	}

	return {
		scene: scene,
		camera: camera,
		renderTarget: renderTarget,
		draw: draw,
		c0: c0,
		c1: c1,
		handleInput: handleInput,
		scope: scope
	}
}
