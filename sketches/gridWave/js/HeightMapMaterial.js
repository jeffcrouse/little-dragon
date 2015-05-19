/**
 * HeightMapMaterial.js
 */


var HeightMapMaterial = function(params)
{
	params = params || {};

	var qTangent = new THREE.Quaternion(), qBitangent = new THREE.Quaternion();
	qTangent.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), .1 );
	qBitangent.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), .1 );

	var matParams = {
		opacity: 1,
		transparent: true,
		blending: params.blending || 5,
		depthTest: false,
		depthWrite: false,
		blendEquation: THREE.AddEquation,
		blendSrc: THREE.SrcAlphaFactor,
		blendDst: THREE.OneMinusSrcAlphaFactor,
		// blendSrc: THREE.SrcAlphaFactor,
		// blendDst: THREE.SrcAlphaFactor,

		side: params.side || 2,// 0 = backFaceCull, 1 = frontFaceCull, 2 = doubleSided

		uniforms: {
			opacity: {type: 'f', value: params.opacity || 1.},
			weight: {type: 'f', value: params.weight || 1.},
			time: {type: 'f', value: 0 },
			map: {type: 't', value: params.map }
		},

		// attributes: {
		// 	tangent: {type: 'v3', value: params.tangent || [] },
		// 	// bitangent: {type: 'v3', value: params.bitangent || [] },
		// },

		vertexShader: [
		'uniform float time;',

		'varying vec3 pos;',

		'varying vec2 vUv;',

		'void main() {', 

		'	vUv = uv;',
		'	pos = position;',

		'	vec4 mvPosition = modelViewMatrix * vec4( position, 1.);',

		'	gl_Position = projectionMatrix * mvPosition;',

		'}',
		].join('\n'),

		fragmentShader: [

		'float mapLinear( in float x, in float a1, in float a2, in float b1, in float b2 ) {',
		'	return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );',
		'}',

		'uniform sampler2D map;',

		'uniform float opacity;',

		'uniform float weight;',

		'varying vec3 pos;',

		'varying vec2 vUv;',

		'float PI = ' + Math.PI + ';',
		'float TWO_PI = ' + (2 * Math.PI) + ';',

		'float invPow( float x, float exp){',
		'	return 1. - pow(1. - x, exp);',
		'}',

		'void main()',
		'{',	
		'	float u = pow(sin(vUv.x * PI), 1.5);',
		'	u *= sin( (vUv.y + weight) * PI * 4. );',
		'	gl_FragColor = vec4( 1., 1., 1., u * invPow(weight, 10.) );',

		'}'
		].join('\n'),

	}

	THREE.ShaderMaterial.call( this, matParams );
}


HeightMapMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );