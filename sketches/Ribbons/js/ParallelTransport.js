// ParallelTransport.js


var ParallelTransport = function( options ) {

	options = options || {};

	this.startNormal = new THREE.Vector3( 0, 0, 1 );

	this.points = options.points || [];

	this.spline = new THREE.SplineCurve3( this.points );

	this.normalSpline = new THREE.SplineCurve3([]);

	this.radius = options.radius || 10;

	this.twistTransform = new THREE.Matrix4();

	this.updateCurves();
}

ParallelTransport.prototype = {

	constructor: ParallelTransport ,


	getSplineTanget: function( spline, u, pos ) {

		return spline.getPoint( Math.max(u - .005, 0) ).sub( spline.getPoint( Math.min(1, u + .005) ) );
	},

	//ripped from THREE.TubeGeometry
	setInitialNormal: function() {	

		console.log( "setInitialNormal" );

		var position = this.spline.points[0];
		var tangent = this.getSplineTanget( this.spline, 0, position );

		var smallest = Number.MAX_VALUE;
		tx = Math.abs( tangent.x );
		ty = Math.abs( tangent.y );
		tz = Math.abs( tangent.z );

		if ( tx <= smallest ) {
			smallest = tx;
			this.startNormal.set( 1, 0, 0 );
		}

		if ( ty <= smallest ) {
			smallest = ty;
			this.startNormal.set( 0, 1, 0 );
		}

		if ( tz <= smallest ) {
			this.startNormal.set( 0, 0, 1 );
		}
	},

	updateCurves: function() {
		
		this.setInitialNormal();

		var position, tangent, up = new THREE.Vector3(), side = this.startNormal.clone();

		var u = 0, step = 1 / (this.points.length - 1);

		this.normalSpline.points.length = this.points.length;

		for (var i=0; i<this.points.length; i++) {

			u = step * i;

			position = this.points[i];
			
			//get the tangent and up vectors
			tangent = this.getSplineTanget( this.spline, u, position );
			up.crossVectors( tangent, side ).normalize();
			side.crossVectors( tangent.multiplyScalar(-1), up ).normalize();

			// add the control points if the aren't created yet
			if ( this.normalSpline.points[i] === undefined )	this.normalSpline.points[i] = new THREE.Vector3();

			this.normalSpline.points[i].copy( up ).multiplyScalar( this.radius ).add( position );
		}
	},

	getScaleTwistTransform: function( m, u ){
		var twist = u * Math.PI;
		var scl = Math.sin(u * Math.PI) * 2 + 1;

		m.makeRotationZ( twist );
		m.scale( new THREE.Vector3( scl,scl,scl ) );
	},

	getFrame: function( m4, u )
	{
		u = THREE.Math.clamp( u, 0, 1 );

		var eye = this.spline.getPoint( u );
		var up = this.normalSpline.getPoint( u );

		m4.setPosition( eye );
		m4.lookAt( eye, eye.clone().add( this.getSplineTanget( this.spline, u, eye ) ), up );

		this.getScaleTwistTransform( this.twistTransform, u );

		m4.multiplyMatrices( m4, this.twistTransform );
	}
}