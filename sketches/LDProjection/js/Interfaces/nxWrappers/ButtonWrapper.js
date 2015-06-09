// ButtonWrapper.js

var LDButtonMaterial = function( params ) {

	params = params || {};

	var isLineShader = params.lineShader || false;

	var matParams = {
		transparent: true,
		blending: params.blending || 1,
		depthTest: params.depthTest || false,
		depthWrite: params.depthWrite !== undefined ? params.depthWrite : false,
		side: params.side || 2,// 0 = backFaceCull, 1 = frontFaceCull, 2 = doubleSided
		linewidth: 1,

		// TODO: if radius is staying at 1 lets remove it

		uniforms: {
			color1: {type: 'c', value: params.color || new THREE.Color( 1, 1, 1 ) },
			color2: {type: 'c', value: params.color || new THREE.Color( 0, 0, 0 ) },
			opacity: {type: 'f', value: params.opacity || 1 },
			exponent: {type: 'f', value: params.opacity || 2 },
		},

		vertexShader: [

		'varying vec2 vUv;',

		'void main() {',

		'	vUv = vec2( length(position.xy), 1. );',

		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

		'}'].join('\n'),

		fragmentShader: [

		'uniform float opacity;',

		'uniform float exponent;',

		'uniform vec3 color1;',

		'uniform vec3 color2;',

		'varying vec2 vUv;',

		'float mapLinear( in float x, in float a1, in float a2, in float b1, in float b2 ) {',
		'	return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );',
		'}',

		'void main()',
		'{',

		'	float u = pow(vUv.x, exponent);',



		'	gl_FragColor = vec4( mix( color2, color1, u ), opacity);',

		'}'
		].join('\n')

	}
	
	THREE.ShaderMaterial.call( this, matParams );
}

LDButtonMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );


function ButtonWrapper( options )
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

	var WIDTH = 1280; // controller.width;
	var HEIGHT = 720; // controller.height;
	var ASPECT_RATIO = WIDTH / HEIGHT;

	var HALF_WIDTH = WIDTH * .5;
	var HALF_HEIGHT = HEIGHT * .5;

	var center = new THREE.Vector2( controller.center.x, controller.center.y );

	var radius = center.y - 30; // should probably do somehting better to scale it

	var decay = .025;

	var camera = options.camera || new THREE.OrthographicCamera( -HALF_WIDTH, HALF_WIDTH, HALF_HEIGHT, -HALF_HEIGHT, -1000, 1000 ); // 

	var renderTarget = new THREE.WebGLRenderTarget( WIDTH * .25, HEIGHT * .25, {
		minFilter: THREE.LinearFilter
	} );

	var scene = new THREE.Scene();

	var group = new THREE.Group();
	scene.add( group );

	// group.position.x -= HALF_WIDTH * .5
	// group.position.y += HALF_HEIGHT * .5

	var autoClear = false;
	
	var clearingMesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( WIDTH, HEIGHT, 10, 10 ), new THREE.MeshBasicMaterial( {
		transparent: true,
		opacity: decay,
		color: "black",
		side: 2,
		depthTest: false,
		depthWrite: true,
	} ) );


	group.add( clearingMesh );

	var buttonMesh = new THREE.Mesh( new THREE.SphereGeometry( 1, 10, 32 ), new LDButtonMaterial( ) );

	buttonMesh.scale.set( radius, radius, 10 );

	group.add( buttonMesh )


	var tween;
	scope.onHandleInput = function( data ) {
		// console.log( e );
	
		if(tween) {
			tween.stop();

			TWEEN.remove( tween );
		}
		
		if(data.press == 1)
		{

			tween = new TWEEN.Tween( buttonMesh.material.uniforms.color2.value )
				.to( {r: 1, g: 1, b: 1}, 200)
				.easing( TWEEN.Easing.Bounce.Out )
				.start()	
		} else {

			tween = new TWEEN.Tween( buttonMesh.material.uniforms.color2.value )
				.to( {r: 0, g: 0, b: 0}, 1000)
				.easing( TWEEN.Easing.Bounce.Out )
				.start()
		}
	}

	function draw( renderer )
	{
		// renderer.render( scene, camera, null, true );
		renderer.render( scene, camera, renderTarget, autoClear );
	}

	function handleInput( data )
	{
		scope.onHandleInput( data );
		// console.log( e );
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
