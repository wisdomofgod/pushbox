class Game extends MapInit {
	constructor(options = {}){
		super(options);

		//this.initLoader('/player.stl');
		
		this.initMyControl();
		
		this.initMap();

		this.printPlay();

		this.initFont();

	}


	initMap() {
		//var map = [[1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1]];
		var map = {
			size: {x: 5, y: 5},
			boxs: [{x: 3, y: 3}],
			walls: [{x: 1, y: 1}, {x: 1, y: 5}, {x: 2, y: 2}, {x: 5, y: 1}, {x: 5, y: 5}]
		}
		this.drawMap(map);
	}

	initMyControl() {
		myCtrol((code) => {
			let toObj;

			switch(code) {
				case "up":
					this.turnPlay(0);
					toObj = this.isGo(0, -1);
					break;
				case "down":
					this.turnPlay(2);
					toObj = this.isGo(0, 1);
					break;
				case "left":
					this.turnPlay(1);
					toObj = this.isGo(-1, 0);
					break;
				case "right":
					this.turnPlay(3);
					toObj = this.isGo(1, 0);
					break;
				case "r":
					this.printPlay();
					this.initMap();
					break;
				case "n":
					this.initMap(1);
					break;
			}

			if (toObj){
				this.go(this.people, toObj.play, 1000);
				//this.goCamera(toObj.play);
				toObj.box && this.go(this.box, toObj.box , 1000);

				if (this.boxSite.x === 3 && this.boxSite.y === 3) {
					this.go(this.winText, {y: 400}, 1000);
				}

				this.footAnimtion();

			}
		})
	}

	footAnimtion() {
		var obj = this.people.children[2], obj2 = this.people.children[5];
		new TWEEN.Tween( obj.rotation )
			.to({x: Math.PI / 180 * 60}, 333).start();
		new TWEEN.Tween( obj2.rotation )
			.to({x: Math.PI / 180 * -60}, 333).start();
		setTimeout(function() {
			new TWEEN.Tween( obj.rotation )
			.to({x: Math.PI / 180 * -60}, 333).start();
			new TWEEN.Tween( obj2.rotation )
			.to({x: Math.PI / 180 * 60}, 333).start();

			setTimeout(function() {
				new TWEEN.Tween( obj.rotation )
				.to({x: Math.PI / 180 * 0}, 334).start();
				new TWEEN.Tween( obj2.rotation )
				.to({x: Math.PI / 180 * 0}, 334).start();
			}, 333)

		}, 333)
	}

	printPlay() {
		var header = new THREE.SphereGeometry( 100, 80, 12);
		var material = this.loadTexture('/images/negz.jpg');
		var headerMesh = new THREE.Mesh(header, material);

		headerMesh.position.y = 400;

		var body = new THREE.CylinderGeometry(100, 100, 200, 18, 3);
		var material = this.loadTexture('/images/negx.jpg');
		var bodyMesh = new THREE.Mesh(body, material);

		bodyMesh.position.y = 200;

		var foot = new THREE.CylinderGeometry(30, 30, 200, 18, 3);
		var material = new THREE.MeshLambertMaterial( { color:0x440000} );
		var material = this.loadTexture('/images/negy.jpg');
		var footMesh = new THREE.Mesh(foot, material);
		var rightFootMesh = new THREE.Mesh(foot, material);

		footMesh.position.x = -50;
		rightFootMesh.position.x = 50;
		footMesh.position.y = 100;
		rightFootMesh.position.y = 100;

		var hang = new THREE.CylinderGeometry(20, 20, 100, 18, 3);
		var hangMesh = new THREE.Mesh(hang, material);
		var rightHangMesh = new THREE.Mesh(hang, material);

		hangMesh.position.y = 300;
		hangMesh.position.z = -120;
		hangMesh.position.x = 50;
		hangMesh.rotation.x = Math.PI / 180 * 1 * 90;
		
		rightHangMesh.position.y = 300;
		rightHangMesh.position.z = -120;
		rightHangMesh.position.x = -50;
		rightHangMesh.rotation.x = Math.PI / 180 * 1 * 90;


		var group = new THREE.Group();
		group.add( headerMesh );
		group.add( bodyMesh );
		group.add( footMesh );
		group.add( hangMesh );
		group.add(rightHangMesh);
		group.add(rightFootMesh);

		group.position.z = 50;

		if (this.people) {
			this.scene.remove(this.people);
		}

		this.people = group;

		this.scene.add(group);
	}

	turnPlay(dir) {
		if (this.peopleUp !== dir) {
			if (this.people.geometry){
				this.people.geometry.rotateY(Math.PI / 180 * (dir - this.peopleUp) * 90);
				//this.people.geometry.rotateY(Math.PI / 180 * (dir - this.peopleUp) * 90);
			} else {
				this.people.rotation.y = (Math.PI / 180 * (dir ) * 90);
				//this.people.rotation.y = (Math.PI / 180 * (dir - this.peopleUp) * 90);
			}
			this.peopleUp = dir;
		}
	}

	isGo(xStep, yStep) {
		let x = this.peopleSite.x + xStep;
		let y = this.peopleSite.y + yStep;

		if (x === this.boxSite.x && y === this.boxSite.y) {
			// 推到箱子
			if (this.mapList[x + xStep][y + yStep] === 0) {
				this.boxSite = {x: x + xStep, y: y + yStep};
				this.peopleSite = {x: x, y: y};
				if (xStep !== 0) {
					return { play: {x: ((x - 3) * 200)}, box: {x: ((x + xStep - 3) * 200)}};
				} else if (yStep !== 0) {
					return { play: {z: ((y - 3) * 200)}, box: {z: ((y + yStep - 3) * 200)}};
				}
			}
		} else {
			//没有箱子
			if (this.mapList[x][y] === 0) {
				this.peopleSite = {x: x, y: y};
				if (xStep !== 0) {
					return { play: {x: ((x - 3) * 200)}};
				} else if (yStep !== 0) {
					return { play: {z: ((y - 3) * 200)}};
				}
			}
		}
	}

	initLoader(path) {
		var loader = new THREE.STLLoader();
		var callbackCube = (geometry) => {
			if (geometry.hasColors) {
				material = new THREE.MeshPhongMaterial({ opacity: geometry.alpha, vertexColors: THREE.VertexColors });
			} else {
				var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
			}
			var object = this.people = new THREE.Mesh( geometry, material );
			
			geometry.translate(0, 0, 150);	//位置
			//geometry.scale(90, 90 , 90);
			geometry.rotateX(Math.PI / 180 * -90);
			geometry.rotateY(Math.PI);


			object.position.x = 0;
			object.position.y = 0;
			object.position.z = 0;

			this.scene.add(object);
			this.render();
		}
		loader.load(path, callbackCube);
	}

}