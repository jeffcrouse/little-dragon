// ProjectionMaterial.js


var ProjectionMaterial = function(params)
{
	params = params || {};

	var matParams = {
		opacity: 1,
		transparent: true,
		blending: params.blending || 1,
		depthTest: true,
		depthWrite: true,
		// blendEquation: THREE.AddEquation,
		// blendSrc: THREE.SrcAlphaFactor,
		// blendDst: THREE.OneMinusSrcAlphaFactor,

		side: params.side || 0,// 0 = backFaceCull, 1 = frontFaceCull, 2 = doubleSided

		uniforms: {
			time: {type: 'f', value: 0 },
			facingRatio: {type: 'f', value: .25 },
			map: {type: 't', value: params.map },
			colorRamp: {type: 't', value: params.colorRamp },
			textureOffset: {type: 'v2', value: params.textureOffset || new THREE.Vector2() },
			porjectionScale: {type: 'f', value: params.porjectionScale || 1 },
			mapProjectionMatrix: {type: 'm4', value: params.mapProjectionMatrix || new THREE.Matrix4() }
		},

		// attributes: {
		// 	tangent: {type: 'v3', value: params.tangent || [] },
		// 	// bitangent: {type: 'v3', value: params.bitangent || [] },
		// },

		vertexShader: [
		'uniform mat4 mapProjectionMatrix;',

		'uniform float porjectionScale;',

		'uniform float time;',

		'varying vec4 mvPosition;',

		'varying vec3 vNormal;',

		'varying vec2 vUv;',

		// 'uniform mat4 textureMatrixProj; // for projective texturing',
		'varying vec4 texCoordProj; // for projective texturing',

		'void main() {', 

		'	vUv = uv;',

		'	vNormal = normalize(normalMatrix * normal);',

		'	vec4 mPosition = modelMatrix * vec4( position, 1.);',

		'	mvPosition = viewMatrix * mPosition;',

		'	gl_Position = projectionMatrix * mvPosition;',

		'	texCoordProj = mapProjectionMatrix * mPosition * vec4(vec2(porjectionScale), 1., 1.);',

		'}',
		].join('\n'),

		fragmentShader: [

		'uniform sampler2D map;',
		'uniform sampler2D colorRamp;',

		'uniform vec2 textureOffset;',
		'uniform float facingRatio;',
		'uniform float time;',

		'varying vec4 mvPosition;',
		'varying vec3 vNormal;',
		'varying vec2 vUv;',
		'varying vec4 texCoordProj;',

		'float invPow( float x, float exp){',
		'	return 1. - pow(1. - x, exp);',
		'}',

		'float hash( float n ) { return fract(sin(n)*43758.5453123); }',

		'float noise3( in vec3 x )',
		'{',
		'    vec3 p = floor(x);',
		'    vec3 f = fract(x);',
		'    f = f*f*(3.0-2.0*f);',
		'	',
		'    float n = p.x + p.y*157.0 + 113.0*p.z;',
		'    return mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),',
		'                   mix( hash(n+157.0), hash(n+158.0),f.x),f.y),',
		'               mix(mix( hash(n+113.0), hash(n+114.0),f.x),',
		'                   mix( hash(n+270.0), hash(n+271.0),f.x),f.y),f.z) * .5 + .5;',
		'}',


		'float getNoise( vec3 p ){',
		'	float n = noise3( p * 2. + vec3(time, 0., 0.) );',
		'	n += noise3( p * .5 + vec3(time, 0., 0.) );',
		'	n += noise3( p + vec3(time, 0., 0.) );',
		'	return n / 3.;',
		'}',

		'float mapLinear( in float x, in float a1, in float a2, in float b1, in float b2 ) {',
		'	return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );',
		'}',

		'void main()',
		'{',	
		'	vec3 normal = normalize(vNormal);',

		'	float fr = max(0., dot(normalize(mvPosition.xyz), -normal ) );',

		// '	gl_FragColor = texture2DProj( map, texCoordProj );',
		'	vec2 uv = texCoordProj.xy / abs(texCoordProj.w) + textureOffset;',

		'	gl_FragColor = texture2D( map, uv );',

		'	gl_FragColor.xyz *= mix( 1. - facingRatio, 1., fr);',

		'	float fog = min( abs(texCoordProj.w * .002), 1.);',

		'	gl_FragColor.xyz = mix( vec3(1.), gl_FragColor.xyz, invPow(fog, 2.) * 2.);',

		'	float rampStep = .1;',

		'}'
		].join('\n'),

	}

	THREE.ShaderMaterial.call( this, matParams );
}


ProjectionMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );
