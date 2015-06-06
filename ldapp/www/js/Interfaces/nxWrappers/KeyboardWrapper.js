// KeyboardWrapper.js
// 

var LDKeyMaterial = function( params ) {

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
			color: {type: 'c', value: params.color || new THREE.Color() },
			opacity: {type: 'f', value: params.opacity || 1 },
			u: {type: 'f', value: params.u || Math.random() * .8 + .1 },
			weight: {type: 'f', value: params.weight || 0 },
			falloff: {type: 'f', value: params.falloff || .5 },
			minWeight: {type: 'f', value: params.minWeight || .25 }
		},

		vertexShader: [

		'varying vec2 vUv;',

		'void main() {',

		'	vUv = uv;',

		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

		'}'].join('\n'),

		fragmentShader: [

		'uniform float opacity;',

		'uniform float u;',

		'uniform float weight;',

		'uniform float minWeight;',

		'uniform float falloff;',

		'uniform vec3 color;',

		// 'uniform vec3 color2;',

		'varying vec2 vUv;',

		'float mapLinear( in float x, in float a1, in float a2, in float b1, in float b2 ) {',
		'	return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );',
		'}',

		'void main()',
		'{',

		'	float d = distance( vUv.y, u) / falloff;',

		'	float grad = mix( weight * pow( 1. - min( 1., d ), 3.), 1., max(0., weight - .7 ) );',

		'	gl_FragColor = vec4( color * grad, 1.);',

		'}'
		].join('\n')

	}
	
	THREE.ShaderMaterial.call( this, matParams );
}

LDKeyMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );

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
	var c1 = options.c1 || new THREE.Color( 0x000000 );

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
	// var keyMat = new THREE.MeshBasicMaterial( {
	// 	side: 2,
	// 	// transparent: true,
	// 	// opacity: .3,
	// 	color: 0xbbbbbb // 0x8899aa
	// } );


	var keyMap = {}
	for(var i in keys )
	{
		var mat = new LDKeyMaterial();

		var m = new THREE.Mesh( keyGeometry, mat );

		m.position.x = keys[i].x + keys[i].w * .5 - HALF_WIDTH;

		m.scale.x = keys[i].w;
		m.scale.y = keys[i].h;

		scene.add( m );

		keyMap[keys[i].note] = m;

		m.ld_on = 0;
	}

	function draw( renderer )
	{
		renderer.render( scene, camera, renderTarget, autoClear );
	}

	scope.onHandleInput = function() {
		// console.log( "scope.onHandleInput" );
	}


	var tweenMap = {};
	function handleInput( data )
	{
		console.log( 'data', data );

		scope.onHandleInput( data );
		
		var m = keyMap[ data.note];

		if(tweenMap[ data.note ]) {
			tweenMap[ data.note ].stop();
			TWEEN.remove( tweenMap[ data.note ] );
		}

		if(data.on) {
			m.material.uniforms.u.value = data.on / 128;	
			m.material.uniforms.weight.value = 1;

			tweenMap[ data.note ] = new TWEEN.Tween( m.material.uniforms.weight )
				.to({value: 1}, 200)
				.easing( TWEEN.Easing.Cubic.Out )
				.start();

		}else{
			tweenMap[ data.note ] = new TWEEN.Tween( m.material.uniforms.weight )
				.to({value: 0}, 1000)
				.easing( TWEEN.Easing.Cubic.Out )
				.start();	
		}

		m.ld_on = data.on;
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
