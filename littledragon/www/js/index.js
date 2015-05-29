/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

console.log( navigator.userAgent );

var doWebGL = function() {
	var stats;

	var camera, controls, scene, renderer;

	init();
	render();

	function animate() {
		requestAnimationFrame(animate);
		controls.update();
	}

	function init() {

		camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.z = 500;

		controls = new THREE.OrbitControls( camera );
		controls.damping = 0.2;
		controls.addEventListener( 'change', render );

		scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

		// world

		var geometry = new THREE.CylinderGeometry( 0, 10, 30, 4, 1 );
		var material =  new THREE.MeshLambertMaterial( { color:0xffffff, shading: THREE.FlatShading } );

		for ( var i = 0; i < 500; i ++ ) {

			var mesh = new THREE.Mesh( geometry, material );
			mesh.position.x = ( Math.random() - 0.5 ) * 1000;
			mesh.position.y = ( Math.random() - 0.5 ) * 1000;
			mesh.position.z = ( Math.random() - 0.5 ) * 1000;
			mesh.updateMatrix();
			mesh.matrixAutoUpdate = false;
			scene.add( mesh );

		}


		// lights

		light = new THREE.DirectionalLight( 0xffffff );
		light.position.set( 1, 1, 1 );
		scene.add( light );

		light = new THREE.DirectionalLight( 0x002288 );
		light.position.set( -1, -1, -1 );
		scene.add( light );

		light = new THREE.AmbientLight( 0x222222 );
		scene.add( light );


		// renderer

		renderer = new THREE.WebGLRenderer( { antialias: false } );
		renderer.setClearColor( scene.fog.color );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );

		document.body.appendChild( renderer.domElement );

		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		stats.domElement.style.zIndex = 100;
		document.body.appendChild( stats.domElement );

		//

		window.addEventListener( 'resize', onWindowResize, false );

		animate();

	}

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

		render();
	}

	function render() {
		renderer.render( scene, camera );
		stats.update();
	}


	var sender = new window.OSCSender("192.168.0.106", 3333);
	var loop = function() {
		navigator.vibrate(100);

		sender.send("/test", [1, 2, 3, 4, new Date()]);

		setTimeout(loop, 1000);
	}
	loop();
}

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);

        var _stop = function(e){ e.preventDefault(); };
		document.addEventListener("backbutton", _stop, false);
		document.addEventListener("menubutton", _stop, false);
		document.addEventListener("searchbutton", _stop, false);
		document.addEventListener("startcallbutton", _stop, false);
		document.addEventListener("endcallbutton", _stop, false);
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

        doWebGL();
        //document.querySelector("#user-agent").innerHTML = navigator.userAgent;
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};

app.initialize();