class MapInit extends ThreeInit {
	constructor(options) {
		super(options);

		this.initMapFooter();
	}

	initMapHeader(size, group) {
		this.loadImageTexture('textures/brick_diffuse.jpg', (texture) => {
			let width = size.x * 200 + 600, height = size.y * 200 + 600;

			var geometry = new THREE.CubeGeometry(width, 2000, height);
			geometry.scale( - 1, 1, 1 );

			var material = new THREE.MeshBasicMaterial({map: texture});

			var mesh = new THREE.Mesh(geometry, material);
			mesh.position.y = 499;
			group.add(mesh);
		});
	}

	initMapFooter() {
		this.loadImageTexture('textures/checker.png', (texture) => {
			texture.wrapS = THREE.RepeatWrapping;
		    texture.wrapT = THREE.RepeatWrapping;
		    texture.repeat = new THREE.Vector2(10, 10);
		    texture.anisotropy = this.renderer.getMaxAnisotropy();

		    var material = new THREE.MeshPhongMaterial({
		    	color: 0xffffff,
		        specular: 0xffffff,
		        shininess: 20,
		        shading: THREE.FlatShading,
		        map: texture
		      });

		      var geometry = new THREE.PlaneGeometry(2000, 2000);

		      var mesh = new THREE.Mesh(geometry, material);

		      mesh.rotation.x = -Math.PI / 2;
		      //mesh.rotation.x = -Math.PI / 2;
		      this.scene.add(mesh);
		});
	}

	initFont() {
		var material = new THREE.MeshPhongMaterial({    
                    color: 0xffff00,
                    specular:0xffff00,    
                    //指定该材质的光亮程度及其高光部分的颜色，如果设置成和color属性相同的颜色，则会得到另一个更加类似金属的材质，如果设置成grey灰色，则看起来像塑料
                    shininess:0        
                    //指定高光部分的亮度，默认值为30
                });

		if (this.options.location) {
			var text = new THREE.CubeGeometry(200, 50, 100);
			var mesh = this.winText = new THREE.Mesh(text, material);

			mesh.position.z = 200;
			mesh.position.y = -400;
			mesh.position.x = 0;

			this.scene.add(mesh);

			return
		}

		var loader = new THREE.FontLoader();
		loader.load( 'fonts/gentilis_bold.typeface.json', ( response ) => {
			var font = response;
			var text = new THREE.TextGeometry('You Win', {
						font: font,
                        size: 100,
                        height: 20
                    });
			var mesh = this.winText = new THREE.Mesh(text, material);

			mesh.position.z = 200;
			mesh.position.y = -400;
			mesh.position.x = -200;

			this.scene.add(mesh);

		} );
	}

	drawMap(map) {
		if (this.mapGroup) {
			this.scene.remove(this.mapGroup);
		}

		var mapGroup = this.mapGroup = new THREE.Group();
		if (typeof map === "object") {
			this.mapInfo = map;
			this.peopleSite = map.people || {x: 3, y: 3};
			this.boxSite = {x: 3, y: 2};
			this.peopleUp = 0;

			this.mapList = [];
			for (let i = 0; i <= map.size.x + 1; i++) {
				this.mapList[i] = [];
				for (let j = 0; j <= map.size.y + 1; j++) {
					if (i === 0 || j === 0 || (i === map.size.x + 1) || (j === map.size.y + 1)) {
						this.mapList[i][j] = -1;
						let x = (i - 3) * 200;
						let y = 150;
						let z = (j - 3) * 200;
						mapGroup.add(this.printWall(x, y, z));
					} else {
						this.mapList[i][j] = 0;
					}
				}
			}

			map.walls.forEach((wall) => {
				this.mapList[wall.x][wall.y] = 1;
				let x = (wall.x - 3) * 200;
				let y = 150;
				let z = (wall.y - 3) * 200;
				mapGroup.add(this.printWall(x, y, z));
			});

			this.initMapHeader(map.size, mapGroup);

			mapGroup.add(this.initObject());

			this.scene.add(mapGroup);

		} else if(typeof map === "array") {
			this.mapList = map;
			this.peopleSite = {x: 3, y: 3};
			this.boxSite = {x: 3, y: 2};
			this.peopleUp = 0;

			for (let i = 0; i < map.length; i++) {
				for (let j = 0; j < map[i].length; j++) {
					if (map[i][j] === 1) {
						let x = (i - 3 ) * 200;
						let y = 150;
						let z = (j - 3) * 200;
						this.printWall(x, y, z);
					} 
				}
			}
		}
	}

	printWall(x, y, z) {
		if (!this.wallMaterial) {
			var data = this.generateHeight( 1024, 1024 );
			var texture = new THREE.CanvasTexture( this.generateTexture( data, 1024, 1024 ) );
			this.wallGeometry = new THREE.SphereGeometry(150, 5, 5);
			this.wallMaterial = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
		}

		var material = this.wallMaterial;
		var geometry = this.wallGeometry;

		//var geometry = new THREE.CubeGeometry( 200, 500, 200,4,4);
		//var material = new THREE.MeshLambertMaterial( { color:0x008800} );
		var mesh = new THREE.Mesh( geometry,material);

		mesh.position.y = y;
		mesh.position.z = z;
		mesh.position.x = x;

		return mesh;
	}

	initObject() {
		var geometry = new THREE.CubeGeometry( 200, 300, 200,4,4);
		var material = new THREE.MeshLambertMaterial( { color:0x880000} );
		var mesh = this.box = new THREE.Mesh( geometry,material);
		mesh.position.y = 150;
		mesh.position.x = 0;
		mesh.position.z = -200;

		return mesh;
	}

	generateHeight( width, height ) {
		var data = new Uint8Array( width * height ), perlin = new ImprovedNoise(),
		size = width * height, quality = 2, z = Math.random() * 100;

		for ( var j = 0; j < 4; j ++ ) {
			quality *= 4;

			for ( var i = 0; i < size; i ++ ) {

				var x = i % width, y = ~~ ( i / width );
				data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * 0.5 ) * quality + 10;
			}
		}
		return data;
	}

	generateTexture( data, width, height ) {
		var canvas, context, image, imageData,
		level, diff, vector3, sun, shade;

		vector3 = new THREE.Vector3( 0, 0, 0 );

		sun = new THREE.Vector3( 1, 1, 1 );
		sun.normalize();

		canvas = document.createElement( 'canvas' );
		canvas.width = width;
		canvas.height = height;

		context = canvas.getContext( '2d' );
		context.fillStyle = '#000';
		context.fillRect( 0, 0, width, height );

		image = context.getImageData( 0, 0, width, height );
		imageData = image.data;

		for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++  ) {

			vector3.x = data[ j - 1 ] - data[ j + 1 ];
			vector3.y = 2;
			vector3.z = data[ j - width ] - data[ j + width ];
			vector3.normalize();

			shade = vector3.dot( sun );

			imageData[ i ] = ( 96 + shade * 128 ) * ( data[ j ] * 0.007 );
			imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( data[ j ] * 0.007 );
			imageData[ i + 2 ] = ( shade * 96 ) * ( data[ j ] * 0.007 );

		}

		context.putImageData( image, 0, 0 );

		return canvas;

	}
}