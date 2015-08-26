///////////////
// Constants //
///////////////
// 1m = 1 unit in any axis
var SPEED_MOVE = 1;         // m/s
var SPEED_TURN = Math.PI;   // rad/s


/////////////
// Globals //
/////////////
var container, scene, camera, renderer, controls;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
var cube;


///////////
// Setup //
///////////
function init(){
    // Scene
    scene = new THREE.Scene();

    //debug: Axis
    var axisHelper = new THREE.AxisHelper(3);
    scene.add(axisHelper);


    // Camera
    //args: fov, aspect ratio, near, far
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);


    // Renderer
    //note: threejs has other renderers with fallbacks
    renderer = new THREE.WebGLRenderer();

    //note: window.innerWidth/2 and window.innerHeight/2 will give half resolution
    //useful for performance intensive
    renderer.setSize(window.innerWidth, window.innerHeight);

    container = document.getElementById('threejs');
    container.appendChild(renderer.domElement);


    // Controls: Mouse Look
    controls = new THREE.OrbitControls(camera);
    controls.damping = 0.2;
    controls.addEventListener('change', render);



    // Lights
    var ambientLight = new THREE.AmbientLight(0x909090);
    scene.add(ambientLight);
    
    var pointLight = new THREE.PointLight(0xffffff, 10, 15);
    pointLight.position.set(0,3,0);
    scene.add(pointLight);


    // Cube
    var geometry = new THREE.BoxGeometry(2,1,1);
    var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    cube.position.x = 3;
    camera.position.y = 10;
    camera.position.z = 15;
    camera.lookAt(new THREE.Vector3(0,0,0));


    // Load model
    var jsonLoader = new THREE.JSONLoader();
    jsonLoader.load("models/room.json", function(geometry, materials){
        var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        scene.add(mesh);
    });
}


///////////////////
// Loop at 60FPS //
///////////////////
function run(){
    requestAnimationFrame(run);
    render();
    update();
    controls.update();
}

function render(){
    renderer.render(scene, camera);
}

function update(){

    // delta = change in time since last call (seconds)
    var delta = clock.getDelta(); 
    var moveDistance = SPEED_MOVE * delta;
    var turnArc = SPEED_TURN * delta;
    
    // move forwards/backwards
    if(keyboard.pressed("s"))
        cube.translateZ(-moveDistance);
    if(keyboard.pressed("w"))
        cube.translateZ(moveDistance);
    // strafe left/right
    if(keyboard.pressed("a"))
        cube.translateX(moveDistance);
    if(keyboard.pressed("d"))
        cube.translateX(-moveDistance);
    // rotate left/right
    if(keyboard.pressed("q"))
        cube.rotation.y += turnArc;
    if(keyboard.pressed("e"))
        cube.rotation.y -= turnArc; 
}


/////////////
// Execute //
/////////////
init();
run();