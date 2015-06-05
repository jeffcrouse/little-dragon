// LinesMaterial.js
// 
// 
var LinesMaterial = function( params ) {

	params = params || {};

	var isLineShader = params.lineShader || false;

console.log( 'params', params );

	var matParams = {
		transparent: true,
		blending: params.blending || 0,
		depthTest: params.depthTest || true,
		depthWrite: params.depthWrite !== undefined ? params.depthWrite : true,
		side: params.side || 2,// 0 = backFaceCull, 1 = frontFaceCull, 2 = doubleSided
		linewidth: 1,

		// TODO: if radius is staying at 1 lets remove it

		uniforms: {
			map: {type: 't', value: params.map },

			pMap: {type: 't', value: params.pMap},

			colorRamp: {type: 't', value: params.colorRamp},

			color: {type: 'c', value: params.color || new THREE.Color( 1, 1, 1 ) },

			opacity: {type: 'f', value: params.opacity || 1.},

			lineLength: { type: 'f', value: params.lineLength || 20},

			lineWidth: { type: 'f', value: params.lineWidth || 4},

			time: {type: 'f', value: 0},

			noiseScale: {type: 'f', value: params.noiseScale || 0.005 },

			noiseAmount: {type: 'f', value: params.noiseAmount || 1 },

			spriteRotation: {type: 'f', value: params.spriteRotation || Math.PI * 2 }

		},

		vertexShader: [
		// 'uniform vec3 touches['+ params.touches.length+'];',
		'uniform vec3 color;',
		'uniform float lineLength;',
		'uniform float lineWidth;',
		'uniform float scale;',
		'uniform float time;',
		'uniform float noiseScale;',
		'uniform float noiseAmount;',
		'uniform float spriteRotation;',

		'uniform sampler2D pMap;',

		'uniform sampler2D colorRamp;',

		'attribute vec2 positions;',

		'varying vec3 vColor;',

		'varying float vAlpha;',

		'varying vec2 vUv;',

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

		'//rotate vector',
		'vec3 qrot(vec4 q, vec3 v){',
		'        return v + 2.0*cross(q.xyz, cross(q.xyz,v) + q.w*v);',
		'}',

		'//rotate vector (alternative)',
		'vec3 qrot_2(vec4 q, vec3 v){',
		'        return v*(q.w*q.w - dot(q.xyz,q.xyz)) + 2.0*q.xyz*dot(q.xyz,v) + 2.0*q.w*cross(q.xyz,v);',
		'}',

		'float toGrey(vec3 rgb){',
		'	return dot(rgb, vec3(0.299, 0.587, 0.114));',
		'}',

		'void main() {',

		'	vec2 fUv = ( uv / vec2( 1280., 720.) ) + .5;',

		'	float d = toGrey(texture2D( pMap, fUv ).xyz);',

		'	vec3 center = vec3( uv, 0.);',

		'	vec3 pos = vec3( vec2( lineLength, lineWidth ) * position.xy, 0.);',

		'	vUv = position.xy + .5;',


		'	vColor = texture2D( colorRamp, vec2(d) ).xyz;',
		'	vAlpha = 1.;//pow(max( max( vColor.x, vColor.y), vColor. z), 2.);',

		'	vec4 q;',
		'	float angle = d * spriteRotation + noiseAmount * noise3( center * noiseScale + vec3(0., time, 0.) );',
		'	q.x = 0.;',
		'	q.y = 0.;',
		'	q.z = sin(angle / 2.);',
		'	q.w = cos(angle / 2.);',

		'	center.z += d * 10.;',

		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( qrot_2(q, pos) + center, 1.0 );',


		'}'].join('\n'),

		fragmentShader: [

		'# define PI ' + Math.PI,
		'# define TWO_PI ' + (Math.PI * 2),

		'uniform sampler2D map;',

		'uniform sampler2D pMap;',

		'uniform float opacity;',

		'uniform vec3 color;',

		'varying float vAlpha;',

		'varying vec3 vColor;',

		'varying vec2 vUv;',

		'varying vec4 q;',

		'float mapLinear( in float x, in float a1, in float a2, in float b1, in float b2 ) {',
		'	return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );',
		'}',

		'void main()',
		'{',
		// '	float alpha = texture2D( map, vUv ).w * opacity * vAlpha;',

		'	gl_FragColor = vec4( vColor, 1.);',

		// '	vec2 uv = qrot_2(q, vec3(gl_PointCoord.xy * 2. - 1., 0.)).xy * .5 + .5;',

		// '	float alpha =  (cos( vAlpha * (uv.y * 6.28 ) * -2. - 1.)) * 3. * ( 1. - abs(uv.x * 2. - 1.)  ); //texture2D( map, uv ).w * opacity * vAlpha;',

		// '	gl_FragColor = vec4(vColor * color, alpha);',

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

LinesMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );