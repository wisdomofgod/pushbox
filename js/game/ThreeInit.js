class ThreeInit {
	constructor(options) {
		this.options = options;
		
		let url = location.href;
		if (url.substr(0,7) === 'file://') {
			this.options.location = true
		}

		this.height = 350;

		this.init();
		this.initLight();
		this.initObject();

		this.initControl();
		this.initParticle();

		//画网格
		this.initGrid();
		
		this.initStats();
		
		this.render();
	}

	init() {
		let width = window.innerWidth, height = window.innerHeight;
		let scene = this.scene = new THREE.Scene();
		let camera = this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
		let renderer = this.renderer = new THREE.WebGLRenderer({ antialias: true });


		camera.position.x = 0;
        camera.position.y = this.height + 800 * Math.tan(Math.PI / 180 * 30);	//z + this.height
        camera.position.z = 800;				//this.map.z

        camera.up.x = 0;
        camera.up.y = 1;		//y轴为正方向
        camera.up.z = 0;

        renderer.setSize(width, height);
        renderer.setClearColor(0xFFFFFF, 1.0);

		let container = document.createElement( 'div' );
        document.body.appendChild( container );
        container.appendChild( renderer.domElement );

        //var lookAt = new THREE.Vector3( 0, 0, 0 );
        camera.lookAt(this.scene.position);
        scene.add(camera);
	}

	initStats() {
		var stats = this.stats = new Stats();
		document.body.appendChild( stats.dom );
	}

	initLight() {
		let light = new THREE.AmbientLight(0x00FF00);
		light.position.set(100, 100, 200);
		this.scene.add(light);

		var dirLight = new THREE.DirectionalLight( 0xFF0000 );
        dirLight.position.set( 0, 0, 1 );

        this.scene.add( dirLight );
	}

	initControl() {
 		let controls = this.controls = new THREE.TrackballControls( this.camera );
 		
        controls.rotateSpeed = 5.0;
        controls.zoomSpeed = 5;
        controls.panSpeed = 2;

        controls.noZoom = false;
        controls.noPan = false;

        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
	}

	initGrid() {
		let helper = new THREE.GridHelper(1000, 100, 0x008800, 0x808080);
		this.scene.add(helper);
	}

	randomTween(particleSystem) {
		particleSystem.geometry.vertices.forEach((particle) => {
			let x = particle.x + particle.velocity.z;

			if (x > Math.sqrt(particle.pR) && particle.Quadrant == 1) {
				x = particle.x - particle.velocity.z;
				particle.Quadrant = 2;
			} else if (particle.Quadrant === 2) {
				x = particle.x - particle.velocity.z;
			}

			if (x  < -Math.sqrt(particle.pR) && particle.Quadrant == 2) {
				x = particle.x + particle.velocity.z;
				particle.Quadrant = 1;
			}

			let z = Math.sqrt(particle.pR - x * x);

			if (particle.Quadrant === 2) {
				z = -z;
			}

			particle.x = x;
			particle.z = z;
		})

		// particle.position.addVectors(particle.velocity);
		particleSystem.geometry.verticesNeedUpdate = true;
	}

	initParticle() {
		var particleCount = 100,
			particles = new THREE.Geometry(),
			pMaterial = new THREE.PointsMaterial({color: 0x8800, size: 10});

		// 依次创建单个粒子
		for(var p = 0; p < particleCount; p++) {
		  	// 粒子范围在-250到250之间
		  	var pX = Math.random() * 200 - 100,
		      pY = Math.random() * 500,
		      pZ = pX,
		      pR = 2 * pX * pX;

		     var particle = new THREE.Vector3(pX, pY, pZ);
		     particle.velocity = new THREE.Vector3(0, 0, Math.random() * 10);
		     particle.pR = pR;

		     if (pX >= 0) {
		     	particle.Quadrant = 1;
		     } else {
		     	particle.Quadrant = 2;
		     }

			// 将粒子加入粒子geometry
			particles.vertices.push(particle);
		}

		var particleSystem = this.particleSystem = new THREE.Points(particles,pMaterial);
		particleSystem.sortParticles = true;

		this.scene.add(particleSystem);
	}

	goUp(obj, z = 0, time = 1000) {
		this.go(obj, {z: z}, time);
	}

	go(obj, to, time) {
		new TWEEN.Tween( obj.position )
			.to(to, time).start();
	}

	updateCarme() {
		var MovingCube = this.people;
		var camera = this.camera;

		var relativeCameraOffset = new THREE.Vector3(0,300,0);
		var cameraOffset = relativeCameraOffset.applyMatrix4( MovingCube.matrixWorld );

		camera.position.x = cameraOffset.x;
		camera.position.z = cameraOffset.z;

		var Vector3 = new THREE.Vector3(0, 400, 0);
		let dir = this.peopleUp || 0;

		switch(dir) {
			case 0:
				Vector3.z = MovingCube.position.z - 400;
				Vector3.x = MovingCube.position.x;
				camera.position.z = cameraOffset.z + 150;
				break;
			case 1:
				Vector3.x = MovingCube.position.x - 400;
				Vector3.z = camera.position.z;
				camera.position.x = cameraOffset.x + 150;
				break;
			case 2:
				Vector3.z = MovingCube.position.z + 400;
				Vector3.x = MovingCube.position.x;
				camera.position.z = cameraOffset.z - 150;
				break;
			case 3:
				Vector3.x = MovingCube.position.x + 400;
				camera.position.x = cameraOffset.x - 150;
				Vector3.z = camera.position.z;
				break;
		}

		camera.lookAt( Vector3 );
	}

	getRandomColor() {
		let colorList = [0x808080, 0x404040, 0x202020, 0x606060, 0xA0A0A0, 0xC0C0C0, 0x080808, 0x040404, 0x020202, 0x060606]
		var material = new THREE.MeshBasicMaterial( { color: colorList[parseInt(Math.random() * 10)] } );
		console.log()
		return material
	}

	loadImageTexture(path, callback) {
		if (this.options.location) {
			//if location open the file
			return this.getRandomColor();
		}

		// instantiate a loader
		var loader = new THREE.TextureLoader();

		// load a resource
		loader.load(
			// resource URL
			path,
			// Function when resource is loaded
			function ( texture ) {
				// do something with the texture
				callback(texture);
			},
			// Function called when download progresses
			function ( xhr ) {
				console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
			},
			// Function called when download errors
			function ( xhr ) {
				console.log( 'An error happened' );
			}
		);
	}

	loadTexture( path ) {
		if (this.options.location) {
			//if location open the file
			return this.getRandomColor();
		}


		var texture_placeholder;
		var texture = new THREE.Texture( texture_placeholder );
		var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );

		var image = new Image();
		image.onload = function () {

			texture.image = this;
			texture.needsUpdate = true;

		};
		image.src = path;

		return material;
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
	}

	render() {

		requestAnimationFrame(() => {
			this.render();
		})

		TWEEN.update();
		
		this.controls.update();

		//this.updateCarme();

		//this.devices.update();

		this.randomTween(this.particleSystem);

		this.stats.update();

		this.renderer.render(this.scene, this.camera);
	}

}