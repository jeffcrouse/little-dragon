// BlendParticleMaterial.js
// 
// 
var BlendParticleMaterial = function( params ) {

	params = params || {};

	var isLineShader = params.lineShader || false;

	var matParams = {
		transparent: true,
		blending: params.blending || 0,
		depthTest: params.depthTest || false,
		depthWrite: params.depthWrite !== undefined ? params.depthWrite : false,
		side: params.side || 2,// 0 = backFaceCull, 1 = frontFaceCull, 2 = doubleSided
		linewidth: 1,

		// TODO: if radius is staying at 1 lets remove it

		uniforms: {
			map: {type: 't', value: params.map },
			pMap: {type: 't', value: params.pMap},
			color: {type: 'c', value: params.color || new THREE.Color( 1, 1, 1 ) },
			opacity: {type: 'f', value: params.opacity || 1.},
			size: { type: 'f', value: params.size || 10},
			time: {type: 'f', value: 0},
			noiseScale: {type: 'f', value: params.noiseScale || 0 },
			spriteRotation: {type: 'f', value: params.spriteRotation || 0 }
		},

		vertexShader: [
		'uniform vec3 color;',
		'uniform float size;',
		'uniform float scale;',
		'uniform float time;',
		'uniform float noiseScale;',
		'uniform float spriteRotation;',


		'uniform sampler2D pMap;',

		'varying vec3 vColor;',

		'varying float vAlpha;',

		'varying vec2 vUv;',

		'varying vec4 q;',

		'# define PI ' + Math.PI,
		'# define TWO_PI ' + (Math.PI * 2),

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
		'                   mix( hash(n+270.0), hash(n+271.0),f.x),f.y),f.z);',
		'}',

		'float mapLinear( in float x, in float a1, in float a2, in float b1, in float b2 ) {',
		'	return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );',
		'}',

		'void main() {',

		'	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',

		'	vAlpha = .5;',

		'	vec4 particleMap = texture2D( pMap, uv );',
		'	vColor = particleMap.xyz;',
		'	vAlpha = pow(max( max( vColor.x, vColor.y), vColor. z), 2.);',

		'	gl_PointSize =  size * vAlpha + (pow(noise3( position + vec3(0., time, 0.) ),2.) * size) * noiseScale;',

		// '	vec4 q;',
		'	float angle = vAlpha * sin(position.x * .5 ) * cos(position.y * .5 + time * .5) * 2. * spriteRotation;',
		'	q.x = 0.;',
		'	q.y = 0.;',
		'	q.z = sin(angle / 2.);',
		'	q.w = cos(angle / 2.);',


		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',


		'}'].join('\n'),

		fragmentShader: [

		'# define PI ' + Math.PI,
		'# define TWO_PI ' + (Math.PI * 2),

		'uniform sampler2D map;',

		'uniform float opacity;',

		'uniform vec3 color;',

		'varying float vAlpha;',

		'varying vec3 vColor;',

		'varying vec4 q;',

		'float mapLinear( in float x, in float a1, in float a2, in float b1, in float b2 ) {',
		'	return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );',
		'}',


		'//rotate vector',
		'vec3 qrot(vec4 q, vec3 v){',
		'        return v + 2.0*cross(q.xyz, cross(q.xyz,v) + q.w*v);',
		'}',

		'//rotate vector (alternative)',
		'vec3 qrot_2(vec4 q, vec3 v){',
		'        return v*(q.w*q.w - dot(q.xyz,q.xyz)) + 2.0*q.xyz*dot(q.xyz,v) + 2.0*q.w*cross(q.xyz,v);',
		'}',

		'void main()',
		'{',

		'	vec2 uv = qrot_2(q, vec3(gl_PointCoord.xy * 2. - 1., 0.)).xy * .5 + .5;',

		'	float alpha = texture2D( map, uv ).w * opacity * vAlpha;',

		'	float centerDecay = length(uv*2. - 1.) * .5 + .5;',

		'	gl_FragColor = vec4(vColor * color, alpha * centerDecay);',

		// '	vec2 uv = gl_PointCoord.xy * 2. - 1.;',

		// //	CIRCLES
		// '	float uvLength = dot(uv, uv);',
		// // '	float uvLength = length(uv);',

		// '	float alphaThreshold = .75;',
		
		// '	float alpha = uvLength < alphaThreshold ? 1. : mapLinear(uvLength, alphaThreshold, 1., 1., 0.);',

		// '	vec3 c = color;',

		// '	gl_FragColor = vec4( c, alpha );',

		'}'
		].join('\n')

	}
	
	THREE.ShaderMaterial.call( this, matParams );
}

BlendParticleMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );