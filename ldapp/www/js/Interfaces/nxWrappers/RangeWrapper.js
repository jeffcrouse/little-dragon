// RangeWrapper.js

var LDRangeMaterial = function( params ) {

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
			weight: {type: 'f', value: params.u || 0 },
			falloff: {type: 'f', value: params.u || .5 },
			minWeight: {type: 'f', value: params.u || .7 },
			start: {type: 'f', value: params.start !== undefined ? params.start : .3 },
			stop: {type: 'f', value: params.stop !== undefined ? params.stop : .6 },
			fadeDistance: {type: 'f', value: params.fadeDistance !== undefined ? params.fadeDistance : .25 }
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

		'uniform float start;',

		'uniform float stop;',

		'uniform float fadeDistance;',

		'uniform float weight;',

		'uniform float minWeight;',

		'uniform float falloff;',

		'uniform vec3 color;',

		// 'uniform vec3 color2;',

		'varying vec2 vUv;',

		'float mapLinear( in float x, in float a1, in float a2, in float b1, in float b2 ) {',
		'	return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );',
		'}',

		'float smootherstep( float x ){',
		'    return x*x*x*(x*(x*6. - 15.) + 10.);',
		'}',

		'void main()',
		'{',

		'	float grad = 1.;',

		'	if(vUv.x < start)	grad = mapLinear( vUv.x, start-fadeDistance, start, 0., 1. );',

		'	else if(vUv.x > stop)	grad = mapLinear( vUv.x, stop, stop+fadeDistance, 1., 0. );',


		// '	float grad = vUv.x < start ? vUv.x / start : vUv.x > stop ? (1. - vUv.x) / (1. - stop) : 1. ;',

		'	grad = smootherstep( pow( max(0., grad), 1.5 ) );',

		'	gl_FragColor = vec4( vec3( grad ), 1. );',

		'}'
		].join('\n')

	}
	
	THREE.ShaderMaterial.call( this, matParams );
}

LDRangeMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );

function RangeWrapper( options )
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

	var NUM_SLIDERS = controller.sliders;

	var WIDTH = controller.width;
	var HEIGHT = controller.height;
	var ASPECT_RATIO = WIDTH / HEIGHT;

	var HALF_WIDTH = WIDTH * .5;
	var HALF_HEIGHT = HEIGHT * .5;

	var decay = .95;

	var camera = options.camera || new THREE.OrthographicCamera( -HALF_WIDTH, HALF_WIDTH, HALF_HEIGHT, -HALF_HEIGHT, -1000, 1000 ); // 

	var renderTarget = new THREE.WebGLRenderTarget( WIDTH * .25, HEIGHT * .25, {
		minFilter: THREE.LinearFilter
	} );

	var scene = new THREE.Scene();

	var autoClear = false;
	
	var m = new THREE.Mesh( new THREE.PlaneBufferGeometry( WIDTH, HEIGHT, 10, 10 ), new LDRangeMaterial() );

	scene.add( m );


	function draw( renderer )
	{
		renderer.render( scene, camera, renderTarget, autoClear );
	}

	scope.onHandleInput = function() {
		// console.log( "scope.onHandleInput" );
	}

	function handleInput( data )
	{
		m.material.uniforms.start.value = data.start;
		m.material.uniforms.stop.value = data.stop;

		scope.onHandleInput( data );
	}

	return {
		scene: scene,
		camera: camera,
		renderTarget: renderTarget,
		draw: draw,
		handleInput: handleInput,
		scope: scope
	}
}
