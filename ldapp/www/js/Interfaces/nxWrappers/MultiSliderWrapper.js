// MultiSliderWrapper.js

function MultiSliderWrapper( options )
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

	var NUM_SLIDERS = controller.sliders;

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


	//sliders
	sliders = [];

	var sliderMat = new THREE.MeshBasicMaterial( { color: "white" } );

	var sliderGeometry = new THREE.BoxGeometry(1,1,.1, 2, 10 );

	var xStep = WIDTH / NUM_SLIDERS;

	for(var i=0; i<NUM_SLIDERS; i++)
	{	
		//	create a child mesh that is centered in the top half of the slider 
		var m = new THREE.Mesh( sliderGeometry, sliderMat.clone() );
		m.position.x = xStep * (i+.5) - HALF_WIDTH;
		m.position.y = HEIGHT;
		m.scale.x = xStep;
		m.scale.y = HEIGHT;
		m.scale.z = 100
		scene.add( m );

		// var rgb = v3(randf(-1, 1), randf(-1, 1), randf(-1, 1) ).normalize().multiplyScalar( 1.2 );
		// m.material.color.setRGB( Math.abs(rgb.x), Math.abs(rgb.y), Math.abs(rgb.z) );

		sliders[i] = m;

		if( i%2 )
		{
			m.material.color.r *= .75;
			m.material.color.g *= .75;
			m.material.color.b *= .75;
		} 
	}


	function draw( renderer )
	{
		renderer.render( scene, camera, renderTarget, autoClear );
	}

	function setSliderHieght( index, value )
	{
		if(sliders[index])
		{
			sliders[index].position.y = (value - 1) * HEIGHT;
			// var k = cos( value * PI ) * -.5 + .5;
			var k = value;//  1. - smootherstep( 1. - value );

			sliders[index].material.color.copy( c0 ).lerp( c1, k );
		}
	}


	scope.onHandleInput = function() {
		// console.log( "scope.onHandleInput" );
	}


	function handleInput( data )
	{
		scope.onHandleInput( data );

		for( var i in data.list ) {
			setSliderHieght( i, data.list[i] );
		}
	}

	return {
		scene: scene,
		camera: camera,
		renderTarget: renderTarget,
		draw: draw,
		setSliderHieght: setSliderHieght,
		c0: c0,
		c1: c1,
		handleInput: handleInput,
		scope: scope
	}
}
