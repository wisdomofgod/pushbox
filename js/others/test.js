    var container, stats;
    var camera, controls, scene, renderer;
    var cross;
    init();
    animate();

    function init() {
        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 1e10 );
        camera.position.z = 0.2;
        // controls = new THREE.TrackballControls( camera );

        // controls.rotateSpeed = 5.0;
        // controls.zoomSpeed = 5;
        // controls.panSpeed = 2;

        // controls.noZoom = false;
        // controls.noPan = false;

        // controls.staticMoving = true;
        // controls.dynamicDampingFactor = 0.3;

        scene = new THREE.Scene();
        scene.add( camera );

        // light
        var dirLight = new THREE.DirectionalLight( 0xffffff );
        dirLight.position.set( 200, 200, 1000 ).normalize();

        camera.add( dirLight );
        camera.add( dirLight.target );
// A begin
        var material = new THREE.MeshLambertMaterial( { color:0xffffff, side: THREE.DoubleSide } );
        var loader = new THREE.STLLoader();
        var callback = function ( event ) {
            var geometry = event.content;
            var mesh = new THREE.Mesh( geometry, material );
            mesh.position.setY( - 0.09 );
            scene.add( mesh );
        };
        loader.load( "人偶.stl" , callback);
// A end
        // renderer
        renderer = new THREE.WebGLRenderer( { antialias: false } );
        renderer.setClearColorHex( 0x000000, 1 );
        renderer.setSize( window.innerWidth, window.innerHeight );
        container = document.createElement( 'div' );
        document.body.appendChild( container );
        container.appendChild( renderer.domElement );

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        container.appendChild( stats.domElement );
        //
        window.addEventListener( 'resize', onWindowResize, false );
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        controls.handleResize();
    }

    function animate() {
        requestAnimationFrame( animate );
        controls.update();
        renderer.render( scene, camera );
        stats.update();
    }