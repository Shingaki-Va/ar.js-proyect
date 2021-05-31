
//////////////////////////////////////////////////////////////////////////////////
//		Init
//////////////////////////////////////////////////////////////////////////////////


var renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    precision: 'mediump',
});

var clock = new THREE.Clock();

var mixers = [];

renderer.setPixelRatio(window.devicePixelRatio);

renderer.setClearColor(new THREE.Color('lightgrey'), 0)
renderer.setSize( 640, 480 );
renderer.domElement.style.position = 'absolute'
renderer.domElement.style.top = '0px'
renderer.domElement.style.left = '0px'
document.body.appendChild( renderer.domElement );

// init scene and camera
var scene = new THREE.Scene();

//////////////////////////////////////////////////////////////////////////////////
//		Initialize a basic camera
//////////////////////////////////////////////////////////////////////////////////

// Create a camera
var camera = new THREE.Camera();
scene.add(camera);

/////orbit controlos
//const controls = new OrbitControls( camera, renderer.domElement );


var light = new THREE.AmbientLight(0xffffff);
scene.add(light);

////////////////////////////////////////////////////////////////////////////////
//          handle arToolkitSource
////////////////////////////////////////////////////////////////////////////////

var arToolkitSource = new THREEx.ArToolkitSource({
    sourceType : 'webcam',
    //sourceWidth: 1024,
    //sourceHeight: 900,
})

arToolkitSource.init(function onReady(){
    // use a resize to fullscreen mobile devices
    setTimeout(function() {
        onResize()
    }, 1000);
})

// handle resize
window.addEventListener('resize', function(){
    onResize()
})

// listener for end loading of NFT marker
window.addEventListener('arjs-nft-loaded', function(ev){
  console.log(ev);
})

function onResize(){
    arToolkitSource.onResizeElement()
    arToolkitSource.copyElementSizeTo(renderer.domElement)
    if( arToolkitContext.arController !== null ){
        arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
    }
}

////////////////////////////////////////////////////////////////////////////////
//          initialize arToolkitContext
////////////////////////////////////////////////////////////////////////////////

// create atToolkitContext
var arToolkitContext = new THREEx.ArToolkitContext({
    detectionMode: 'mono',
    canvasWidth: 480,
    canvasHeight: 640,
}, {
    sourceWidth: 480,
    sourceHeight: 640,
})

// initialize it
arToolkitContext.init(function onCompleted(){
    // copy projection matrix to camera
    camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
})

////////////////////////////////////////////////////////////////////////////////
//          Create a ArMarkerControls
////////////////////////////////////////////////////////////////////////////////

// init controls for camera
var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
    type : 'nft',
    descriptorsUrl : 'data/dataNFT/comics',
    changeMatrixMode: 'cameraTransformMatrix'
})

scene.visible = false

var root = new THREE.Object3D();
scene.add(root);

//////////////////////////////////////////////////////////////////////////////////
//		add an object in the scene
//////////////////////////////////////////////////////////////////////////////////

var threeGLTFLoader = new THREE.GLTFLoader();
var model;

threeGLTFLoader.load("./resources/flower.glb", function (gltf) {
    model = gltf.scene.children[0];
    model.name = 'Flamingo';
    model.scale.set(20,20,20);

    /* var animation = gltf.animations[0];
    var mixer = new THREE.AnimationMixer(model);
    mixers.push(mixer);
    var action = mixer.clipAction(animation);
    action.play(); */

    root.matrixAutoUpdate = false;
    root.add(model);

    model.position.z = -100;
    model.position.x = 110;
    model.position.y = 100;
  //  model.rotation.z = 5;
   // model.rotation.y = -5;

    


    //////////////////////////////////////////////////////////////////////////////////
    //		render the whole thing on the page
    //////////////////////////////////////////////////////////////////////////////////

    var animate = function() {

        //controls.update();


        requestAnimationFrame(animate);
        //model.rotation.y += 0.03;
        //model.rotation.x += 0.02;


        if (mixers.length > 0) {
            for (var i = 0; i < mixers.length; i++) {
                mixers[i].update(clock.getDelta());
            }
        }

        if (!arToolkitSource.ready) {
            return;
        }

        arToolkitContext.update( arToolkitSource.domElement )

        // update scene.visible if the marker is seen
        scene.visible = camera.visible;

        renderer.render(scene, camera);
    };

    requestAnimationFrame(animate);
}
);
