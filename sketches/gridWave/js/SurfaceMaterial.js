/*SurfaceMaterial.js*/

// var SurfaceMaterial = function( options ) {

// 	var parameters = {
// 		lights: true,
// 		uniforms: {
// 			time: {type: 'f', value: options.time || 0}
// 		}
// 	}

// 	THREE.ShaderMaterial.call( this, parameters );
// }

// SurfaceMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );

var SurfaceMaterial = function( params ) {

	params = params || {};

	this.type = 'ShaderMaterial';

	this.defines = {};
	this.uniforms = {};
	this.attributes = null;

	this.vertexShader = 'void main() {\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}';
	this.fragmentShader = 'void main() {\n\tgl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}';

	this.shading = THREE.SmoothShading;

	this.linewidth = 1;

	this.wireframe = false;
	this.wireframeLinewidth = 1;

	this.fog = false; // set to use scene fog

	this.lights = true; // set to use scene lights

	this.vertexColors = THREE.NoColors; // set to use "color" attribute stream

	this.skinning = false; // set to use skinning attribute streams

	this.morphTargets = false; // set to use morph targets
	this.morphNormals = false; // set to use morph normals

	// When rendered geometry doesn't include these attributes but the material does,
	// use these default values in WebGL. This avoids errors when buffer data is missing.
	this.defaultAttributeValues = {
		'color': [ 1, 1, 1 ],
		'uv': [ 0, 0 ],
		'uv2': [ 0, 0 ]
	};

	this.index0AttributeName = undefined;

	console.log( 'params.refractMap', params.refractMap );

	var uniforms = {
		color: {type: 'c', value: params.c0 || new THREE.Color( 0xFFFFFF )},
		time: {type: 'f', value: 0 },
		normalSmooth: {type: 'f', value: params.normalSmooth !== undefined ? params.normalSmooth : .5 },
		posScale: {type: 'f', value: params.posScale || 1 },
		map: {type: 't', value: params.map },
		refractMap: {type: 't', value: params.refractMap },
		displacement: {type: 'f', value: params.displacement || 5 },
		noiseSampleOffset: {type: 'f', value: params.noiseSampleOffset || 2 },
		meshDim: {type: 'v2', value: params.meshDim || new THREE.Vector2( 1000, 1000 ) },

		diffuse: {type: 'v3', value: params.diffuse || new THREE.Vector3(1,1,1) },
		emissive: {type: 'v3', value: params.emissive || new THREE.Vector3(0,0,0) },
		specular: {type: 'v3', value: params.specular || new THREE.Vector3(1,1,1).multiplyScalar(1) },
		shininess: {type: 'f', value: params.shininess || 32 },
		opacity: {type: 'f', value: params.opacity || 1 }
	};


	uniforms = THREE.UniformsUtils.merge( [ THREE.UniformsLib[ "lights" ], uniforms ] );

	uniforms.refractMap = {type: 't', value: params.refractMap };


	var matParams = {
		opacity: 1,
		transparent: true,
		blending: params.blending || 1,
		depthTest: true,
		depthWrite: true,
		lights: true,

		// blendEquation: THREE.AddEquation,
		// blendSrc: THREE.SrcColorFactor,
		// blendDst: THREE.SrcColorFactor,

		side: params.side || 2,// 0 = backFaceCull, 1 = frontFaceCull, 2 = doubleSided

		uniforms: uniforms,

		attributes: {
			faceCenter: {type: 'v3', value: params.faceCenters || [] }
		},

		vertexShader: [
		'uniform sampler2D map;',
		'uniform float time;',
		'uniform float radius;',
		'uniform float displacement;',
		'uniform float noiseSampleOffset;',
		'uniform float normalSmooth;',

		'uniform vec2 meshDim;',
		'uniform float posScale;',

		'varying vec3 eye;',
		'varying vec3 vNormal;',

		'varying vec3 vViewPosition;',
		'varying vec2 vUv;',

		'attribute vec3 faceCenter;',


		// '//rotate vector',
		// 'vec3 qrot(vec4 q, vec3 v){',
		// '        return v + 2.0*cross(q.xyz, cross(q.xyz,v) + q.w*v);',
		// '}',

		// '//rotate vector (alternative)',
		// 'vec3 qrot_2(vec4 q, vec3 v)     {',
		// '        return v*(q.w*q.w - dot(q.xyz,q.xyz)) + 2.0*q.xyz*dot(q.xyz,v) + 2.0*q.w*cross(q.xyz,v);',
		// '}',

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

		
		'vec3 normalFrom3Points( vec3 p0, vec3 p1, vec3 p2){',
		'	return normalize( cross( p2-p1, p0-p1 ) );',
		'}',

		'float getNoise( vec3 p ){',
		'	float n = noise3( p * .05 + vec3(0., 0., time) );',
		'	n += noise3( p * .025 + vec3(0., 0., time) );',
		'	return n * displacement;',
		'}',

		'float getDisplacement( vec2 p ){',
		'	return texture2D( map, p).x * displacement;',
		'}',

		'void main() {', 

		'	vUv = uv;',

		//vertex position
		// '	float positionScale = max(1., mod(time, 10.) );',
		'	vec3 vScl = vec3( posScale, posScale, 1.);',
		'	vec3 p = position * vScl;',
		'	p.z += getDisplacement( position.xy / meshDim + .5);',

		//faceted normal points, sampled at the face center
		'	vec3 f_pa = faceCenter * vScl;',
		'	vec3 f_pb = f_pa + vec3( noiseSampleOffset, noiseSampleOffset, 0 );',
		'	vec3 f_pc = f_pa + vec3( noiseSampleOffset, 0., 0 );',

		//smoothed normal
		'	vec3 pa = position * vScl;',
		'	vec3 pb = pa + vec3( noiseSampleOffset, noiseSampleOffset, 0 );',
		'	vec3 pc = pa + vec3( noiseSampleOffset, 0., 0 );',

		'	pa.z += getDisplacement( mix(f_pa.xy, pa.xy, vec2(normalSmooth)) / meshDim + .5);',
		'	pb.z += getDisplacement( mix(f_pb.xy, pb.xy, vec2(normalSmooth)) / meshDim + .5);',
		'	pc.z += getDisplacement( mix(f_pc.xy, pc.xy, vec2(normalSmooth)) / meshDim + .5);',

		'	vNormal = normalize( normalMatrix * normalFrom3Points(pa, pc, pb) );',

		'	vec4 mvPosition = modelViewMatrix * vec4( p, 1.);',

		'	eye = normalize(mvPosition.xyz);',
		'	vViewPosition = -mvPosition.xyz;',

		'	gl_Position = projectionMatrix * mvPosition;',


		'}',
		].join('\n'),


		fragmentShader: [

		'precision highp float;',
		'precision highp int;',


		'#define PHONG',

		'float mapLinear( in float x, in float a1, in float a2, in float b1, in float b2 ) {',
		'	return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );',
		'}',

		'#if MAX_POINT_LIGHTS > 0',

		'	uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];',

		'	uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];',
		'	uniform float pointLightDistance[ MAX_POINT_LIGHTS ];',
		'	uniform float pointLightDecay[ MAX_POINT_LIGHTS ];',

		'#endif',

		'float square( in float a ) { return a*a; }',
		'vec2  square( in vec2 a )  { return vec2( a.x*a.x, a.y*a.y ); }',
		'vec3  square( in vec3 a )  { return vec3( a.x*a.x, a.y*a.y, a.z*a.z ); }',
		'vec4  square( in vec4 a )  { return vec4( a.x*a.x, a.y*a.y, a.z*a.z, a.w*a.w ); }',
		'float saturate( in float a ) { return clamp( a, 0.0, 1.0 ); }',
		'vec2  saturate( in vec2 a )  { return clamp( a, 0.0, 1.0 ); }',
		'vec3  saturate( in vec3 a )  { return clamp( a, 0.0, 1.0 ); }',
		'vec4  saturate( in vec4 a )  { return clamp( a, 0.0, 1.0 ); }',
		'float average( in float a ) { return a; }',
		'float average( in vec2 a )  { return ( a.x + a.y) * 0.5; }',
		'float average( in vec3 a )  { return ( a.x + a.y + a.z) / 3.0; }',
		'float average( in vec4 a )  { return ( a.x + a.y + a.z + a.w) * 0.25; }',
		'float whiteCompliment( in float a ) { return saturate( 1.0 - a ); }',
		'vec2  whiteCompliment( in vec2 a )  { return saturate( vec2(1.0) - a ); }',
		'vec3  whiteCompliment( in vec3 a )  { return saturate( vec3(1.0) - a ); }',
		'vec4  whiteCompliment( in vec4 a )  { return saturate( vec4(1.0) - a ); }',
		'vec3 transformDirection( in vec3 normal, in mat4 matrix ) {',
		'	return normalize( ( matrix * vec4( normal, 0.0 ) ).xyz );',
		'}',
		'// http://en.wikibooks.org/wiki/GLSL_Programming/Applying_Matrix_Transformations',
		'vec3 inverseTransformDirection( in vec3 normal, in mat4 matrix ) {',
		'	return normalize( ( vec4( normal, 0.0 ) * matrix ).xyz );',
		'}',
		'vec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal) {',
		'	float distance = dot( planeNormal, point-pointOnPlane );',
		'	return point - distance * planeNormal;',
		'}',
		'float sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {',
		'	return sign( dot( point - pointOnPlane, planeNormal ) );',
		'}',
		'vec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {',
		'	return pointOnLine + lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) );',
		'}',
		'float calcLightAttenuation( float lightDistance, float cutoffDistance, float decayExponent ) {',
		'	if ( decayExponent > 0.0 ) {',
		'	  return pow( saturate( 1.0 - lightDistance / cutoffDistance ), decayExponent );',
		'	}',
		'	return 1.0;',
		'}',
	
	

		'uniform vec3 color;',

		'uniform vec3 diffuse;',
		'uniform vec3 emissive;',
		'uniform vec3 specular;',
		'uniform float shininess;',
		'uniform vec3 ambient;',
		'uniform float opacity;',

		'uniform sampler2D map;',
		'uniform sampler2D refractMap;',

		'varying vec3 vViewPosition;',
		'varying vec3 eye;',
		'varying vec3 vNormal;',
		'varying vec2 vUv;',

		'void main()',
		'{',	

		// '	vec3 n = normalize(vNormal);',
		// '	vec3 normal = normalize(texture2D( map, vUv).xyz * 2. - 1.);',
		'	vec3 normal = normalize( vNormal );',
		'	float fr = abs(dot(normal, normalize(eye)));',
		'	float mfr = 1. - fr;',


		'	gl_FragColor = vec4( 0., 0., 0., 1.);',

		'#if MAX_POINT_LIGHTS > 0',


		'	vec3 totalDiffuseLight = vec3( 0., 0., 0. );',
		'	vec3 totalSpecularLight = vec3( 0., 0., 0. );',
		'	float specularStrength = 1.0;',

		'	vec3 viewPosition = normalize( vViewPosition );',


		'	vec2 r_uv = refract( viewPosition, normal, .9 ).xy * -.5 + .5;',

		'	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {',

		'		vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );',
		'		vec3 lVector = lPosition.xyz + vViewPosition.xyz;',

		'		float attenuation = calcLightAttenuation( length( lVector ), pointLightDistance[ i ], pointLightDecay[ i ] );',

		'		lVector = normalize( lVector );',

				// diffuse

		'		float dotProduct = dot( normal, lVector );',

		'		float pointDiffuseWeight = max( dotProduct, 0.0 );',

		'		totalDiffuseLight += pointLightColor[ i ] * pointDiffuseWeight * attenuation;',
		

		'		vec3 pointHalfVector = normalize( lVector + viewPosition );',
		'		float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );',
		'		float pointSpecularWeight = specularStrength * max( pow( pointDotNormalHalf, shininess ), 0.0 );',

		'		float specularNormalization = ( shininess + 2.0 ) / 8.0;',

		'		vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, pointHalfVector ), 0.0 ), 5.0 );',
		'		totalSpecularLight += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * attenuation * specularNormalization;',
		'	}',

		// '	gl_FragColor.xyz += totalDiffuseLight;',

		'	vec3 r_color = texture2D(refractMap, r_uv).xyz * 1. - pow(fr, 6.);',
		'	gl_FragColor.xyz = (totalDiffuseLight + emissive) * r_color + mix(totalSpecularLight, min(totalSpecularLight, r_color), .5);',

		// '	gl_FragColor.xyz *= texture2D(refractMap, vUv).xyz;',

		'	#endif',
		// '	gl_FragColor = vec4( mix( vec3(1., 1., 1.), mapColor, pow(1. - fr, 2.)), pow(1. - fr, 2.) + .1);;',
		'}'
		].join('\n'),

	}
	
	THREE.ShaderMaterial.call( this, matParams );
}

SurfaceMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );
