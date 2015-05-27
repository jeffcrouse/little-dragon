// Ribbon.js

var LittleDragon = LittleDragon || {};


LittleDragon.getTubeProfile = function( radius, segments ) {

	var angle =  Math.PI * 2 / segments;	
	var p = new THREE.Vector3( 0, radius, 0 );
	var q = new THREE.Quaternion().setFromAxisAngle ( new THREE.Vector3( 0, 0, 1 ), angle );

	var profilePoints = [ p.clone() ];

	for(var i = 0; i<segments; i++)
	{
		p.applyQuaternion( q );

		profilePoints.push( p.clone() );
	}

	return profilePoints;
}



LittleDragon.Ribbon = function( options )
{

	THREE.Object3D.call( this );

	options = options || {};

	this.profile = options.profile || LittleDragon.getTubeProfile( 50, 3 );

	//parallel transport frame
	this.points = options.points || [];

	this.frame = new THREE.Matrix4();

	this.parallelTransport = new ParallelTransport({
		points: this.points
	})

	this.subdivisions = Math.max( 2, options.subdivisions || this.points.length );




	// setup our mesh
	this.updateMesh();
}

LittleDragon.Ribbon.prototype = Object.create( THREE.Object3D.prototype );

LittleDragon.Ribbon.prototype.createGeometry = function() {

	var g = new THREE.Geometry();

	var v = g.vertices;

	var numPro = this.profile.length;

	// create the vertices
	for(var i=0; i<this.subdivisions * this.profile.length; i++) {
		g.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
	}

	// create the faces and do a fast normal compute
	var f0, f1;

	for(var i=0, j=0; i<v.length - numPro; i += numPro )
	{	
		for( j=i; j< i + numPro - 1; j++)
		{
			f0 = new THREE.Face3( j, j+numPro+1, j+numPro );
			f1 = new THREE.Face3( j, j+1, j+numPro+1 );

			g.faces.push( f0 );
			g.faces.push( f1 );
		}
	}	

	return g;
},


LittleDragon.Ribbon.prototype.updateMesh = function() {

	//create the geometry if we need to
	if( this.ribbonGeometry === undefined )
	{
		this.ribbonGeometry = this.createGeometry();

		// create and add our mesh
		this.mesh = new THREE.Mesh( this.ribbonGeometry, new THREE.MeshNormalMaterial({side: 2}) );
		this.add( this.mesh );
	}


	// update the vertices with parallel transport frames
	var step = 1 / (this.subdivisions - 1);
	var	g = this.ribbonGeometry;
	var	v = g.vertices;

	for(var i=0, index = 0; i<this.subdivisions; i++) {

		this.parallelTransport.getFrame( this.frame, i * step );

		for(var j=0; j<this.profile.length; j++){

			v[index].copy( this.profile[j] ).applyMatrix4( this.frame );

			index++;
		}
	}

	//do a fast normal coompute
	var f0, f1, vA, vB;
	var vC = new THREE.Vector3( 0, 0, 0 );
	var cb = new THREE.Vector3();
	var ab = new THREE.Vector3();

	for(var i=0, j=1; i<g.faces.length-1; i+=2, j+=2 )
	{	
		f0 = g.faces[i]
		f1 = g.faces[j]

		vA = v[ f0.a ];
		vB = v[ f1.b ];
		vC.addVectors( v[ f0.b ], v[ f0.c ] ).multiplyScalar( .5 );

		cb.subVectors( vC, vB );
		ab.subVectors( vA, vB );
		cb.cross( ab );

		cb.normalize();

		f0.normal.copy( cb );
		f1.normal.copy( cb );
	}	

	// three normal compute
	// g.computeFaceNormals();

	// for(var i=0; i<g.faces.length; i += 2) {

	// 	g.faces[i].normal.add( g.faces[i+1].normal ).multiplyScalar( .5 );

	// 	g.faces[i+1].normal.copy(g.faces[i].normal);
	// }
}

