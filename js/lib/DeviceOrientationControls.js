/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.DeviceOrientationControls = function( object ) {

	var scope = this;

	this.object = object;
	this.object.rotation.reorder( "YXZ" );

	this.enabled = true;

	this.deviceOrientation = {};
	this.screenOrientation = 0;

	this.alpha = 0;
	this.alphaOffsetAngle = 0;

	var oldAccY = 0, oldV = 0, oldA;
	var s = 0

	var count = 0, err1 = 0, err2 = 0, dirErr = 0, errZero = 0, dir = 0, stopErr = 0;

	var onMotionHandlerEvent = function( event ) {
		var t = event.interval;
		var accGravity = event.accelerationIncludingGravity;

		var maxAcc = 0, maxKey = 'x', str = "";

		for (var key in accGravity) {
			if (Math.abs(accGravity[key]) > maxAcc) {
				maxAcc = Math.abs(accGravity[key]);
				maxKey = key;
			}
			
			str += key + ":" + Math.abs(accGravity[key]) + "   ";
		}

		maxKey = 'z';

		let newA = accGravity[maxKey];

		if (!oldA) {
			oldA = newA;
			return;
		}

		let newV = oldV + (newA - oldA) * t;
		oldA = newA;

		let error = (newV - oldV) * t / 2;
		oldV = newV;

		s += Math.abs(error) * 700000 * 10;

		scope.motionHandler = 0;

		if (dir === 0) {
			if (error > 0.0002) {
				// alert(error);
				// window.removeEventListener("devicemotion", onMotionHandlerEvent, false);
				dir = 1;
			} else if (error < -0.0002) {
				// alert(error);
				// window.removeEventListener("devicemotion", onMotionHandlerEvent, false);
				dir = -1;
			} else {

			}
		} else {
			if (dir === 1) {
				//scope.motionHandler = -Math.abs(error) * 700000 * 10;
				alert(stopErr);
				window.removeEventListener("devicemotion", onMotionHandlerEvent, false);
				stopErr++;
				if (stopErr > 100) {
					alert(stopErr);
					window.removeEventListener("devicemotion", onMotionHandlerEvent, false);
					stopErr = 0;
					dir = 0;
					scope.motionHandler = -200;
				}
				// if (error < 0) {
				// 	stopErr++;
				// 	if (stopErr > 100) {
				// 		stopErr = 0;
				// 		dir = 0;
				// 		scope.motionHandler = -200;
				// 	}
				// }
			} else {

				stopErr++;
				if (stopErr > 100) {
					stopErr = 0;
					dir = 0;
					scope.motionHandler = 200;
				}

				//scope.motionHandler = Math.abs(error) * 700000 * 10;
				// if (error > 0) {
				// 	stopErr++;
				// 	if (stopErr > 100) {
				// 		stopErr = 0;
				// 		dir = 0;
				// 		scope.motionHandler = 200;
				// 	}
				// }
			}
		}

		//scope.motionHandler = Math.abs(error) * 700000 * 10;

		document.getElementById('CanvasBody').innerHTML = " 正：" + (newV) + "   long: " + s;

	}

	var onDeviceOrientationChangeEvent = function( event ) {

		scope.deviceOrientation = event;

	};

	var onScreenOrientationChangeEvent = function() {

		scope.screenOrientation = window.orientation || 0;

	};

	// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

	var setObjectQuaternion = function() {

		var zee = new THREE.Vector3( 0, 0, 1 );

		var euler = new THREE.Euler();

		var q0 = new THREE.Quaternion();

		var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

		return function( quaternion, alpha, beta, gamma, orient, acc ) {

			euler.set( beta, alpha, - gamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us

			quaternion.setFromEuler( euler ); // orient the device

			quaternion.multiply( q1 ); // camera looks out the back of the device, not the top

			quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) ); // adjust for screen orientation

			if (acc){
				object.position.z += acc;
			}
		}

	}();

	this.connect = function() {

		onScreenOrientationChangeEvent(); // run once on load

		window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		if (window.DeviceMotionEvent){
			window.addEventListener("devicemotion", onMotionHandlerEvent, false);
		}

		scope.enabled = true;

	};

	this.disconnect = function() {

		window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		if (window.DeviceMotionEvent)
			window.addEventListener("devicemotion", onMotionHandlerEvent, false);

		scope.enabled = false;

	};

	this.update = function() {

		if ( scope.enabled === false ) return;

		var alpha = scope.deviceOrientation.alpha ? THREE.Math.degToRad( scope.deviceOrientation.alpha ) + this.alphaOffsetAngle : 0; // Z
		var beta = scope.deviceOrientation.beta ? THREE.Math.degToRad( scope.deviceOrientation.beta ) : 0; // X'
		var gamma = scope.deviceOrientation.gamma ? THREE.Math.degToRad( scope.deviceOrientation.gamma ) : 0; // Y''
		var orient = scope.screenOrientation ? THREE.Math.degToRad( scope.screenOrientation ) : 0; // O

		var acc = scope.motionHandler ? THREE.Math.degToRad( scope.motionHandler ) : 0;

		setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient, acc );
		this.alpha = alpha;

	};

	this.updateAlphaOffsetAngle = function( angle ) {

		this.alphaOffsetAngle = angle;
		this.update();

	};

	this.dispose = function() {

		this.disconnect();

	};

	this.connect();

};