

// var socket = io.connect();
// socket.emit('hello', { my: 'data' });

// socket.on('/keys_range_1', function (data) {
// 	console.log(data);
// });

$(window).bind("load", function() {

	console.log( " \n \n little dragon projection sketch \n \n " );
	
	var projection = ProjectionVisuals({
		lineLength: 32,
		lineWidth: 8,
		spacing: 10,
		spriteRotation: Math.PI * 2,
		noiseScale: .0075,
		noiseAmount: 1,
		timeScale: -1,
		spacing: 10,
		lineOpacity: 1,
		blending: 1
	});



	var guiControls = {
		lineWidth: parseFloat(projection.getLineWidth()),
		lineLength: parseFloat(projection.getLineLength()),
		lineOpacity: parseFloat(projection.getLineOpacity()),
		blending: parseInt(projection.getBlending()),
		rotation: parseFloat(projection.getRotation()),
		noiseScale: parseFloat(projection.getNoiseScale()),
		noiseAmount: parseFloat(projection.getNoiseAmount()),
		timeScale: parseFloat( projection.getTimeScale() ) + .000,
		groupRotationX: parseFloat(projection.getGroupRotationX()),
		groupRotationY: parseFloat(projection.getGroupRotationY()),
		groupRotationZ: parseFloat(projection.getGroupRotationZ())
	}

	var gui = new dat.GUI();


	// gui.remember( guiControls );

	var guiContainer = $("<div>", {id: "GUIContainer"});
	guiContainer.css({
		position: "absolute",
		left: "20px",
		top: "20px",
		pointerEvents: "auto"
	});
	$(projection.container).append( guiContainer );

	//LINE WIDTH AND HEIGHT
	gui.add( guiControls, "lineWidth", 1, 100 ).listen().onChange( function( value ){
		projection.setLineWidth( value );
	})

	gui.add( guiControls, "lineLength", 1, 200 ).listen().onChange( function( value ){
		projection.setLineLength( value );
	})

	// LINE ROTATION & NOISE
	gui.add( guiControls, "rotation", 0, Math.PI * 4 ).listen().onChange( function( value ){
		projection.setRotation( value );
	});

	gui.add( guiControls, "noiseScale", .0001, .02 ).listen().onChange( function( value ){
		projection.setNoiseScale( value );
	});

	gui.add( guiControls, "noiseAmount", 0, 4 ).listen().onChange( function( value ){
		projection.setNoiseAmount( value );
	});

	gui.add( guiControls, "timeScale", -5.000, 5.000 ).step(.001).listen().onChange( function(value) {
		projection.setTimeScale( value );
	})

	gui.add( guiControls, "groupRotationX", 0, Math.PI*3 ).step(.001).listen().onChange( function(value) {
		projection.setGroupRotationX( value );
	})


	gui.add( guiControls, "lineOpacity", 0.00, 1.00 ).listen().onChange( function( value ){
		projection.setLineOpacity( value );
	})

	gui.add( guiControls, "blending", { "0":0,"1":1, "2":2 } ).listen().onChange( function( value ){
		projection.setBlending( parseInt(value) );
	})

	// //SOCKETS
	// //
	// socket.on('/keys_range_1', function (data) {
	// 	console.log(data);
	// });
	
	
	
	setInterval( function(){
		projection.handleOSC( "/keys_keyboard_2", {"on":64,"note":50,"midi":"50 1"} );
	}, 500);

	setInterval( function(){
		projection.handleOSC( "/keys_keyboard_2", {"on":0,"note":50,"midi":"50 0"} );
	}, 750);


	setInterval( function(){
		projection.handleOSC( "/bass_keyboard_1", {"on":64,"note":49,"midi":"50 1"} );
	}, 250);

	setInterval( function(){
		projection.handleOSC( "/bass_keyboard_1", {"on":0,"note":49,"midi":"50 0"} );
	}, 850);

	
	setInterval( function(){
		projection.handleOSC( "/drums_button_2", {"press":1} );
	}, 500);

	setInterval( function(){
		projection.handleOSC( "/drums_button_2", {"press":0} );
	}, 750);

	setTimeout( function(){

		setInterval( function(){
			projection.handleOSC( "/drums_button_3", {"press":1} );
		}, 500);

		setInterval( function(){
			projection.handleOSC( "/drums_button_3", {"press":0} );
		}, 750);	
	}, 250)

});


Math.clamp = function(num, min, max) {
	if(min>max) console.warn("Math.clamp: min > max");
	return Math.min(Math.max(num, min), max);
};
Math.map = function (value, istart, istop, ostart, ostop, clamp) {
	var val = ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
	return clamp ? Math.clamp(val, Math.min(ostart, ostop), Math.max(ostart, ostop)) : val;
}
