var scene = new THREE.Scene();

//args: fov, aspect ratio, near, far
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

//note: threejs has other renderers with fallbacks
var renderer = new THREE.WebGLRenderer();

//note: window.innerWidth/2 and window.innerHeight/2 will give half resolution
//useful for performance intensive
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);


///////////
// Setup //
///////////
var geometry = new THREE.BoxGeometry(1,1,1);
var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

cube.position.x = 3;
camera.position.y = 10;
camera.position.z = 15;
camera.lookAt(new THREE.Vector3(0,0,0));

var pointLight = new THREE.PointLight(0xffffff, 10, 15);
pointLight.position.set(0,0,3);
scene.add(pointLight);

var ambientLight = new THREE.AmbientLight(0x909090);
scene.add(ambientLight);


/////////////////
// Load Models //
/////////////////
var jsonLoader = new THREE.JSONLoader();
jsonLoader.load("models/room.json", function(geometry, materials){
    var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
    scene.add(mesh);
});



//////////////////////////
// Render Loop at 60FPS //
//////////////////////////
function render(){
    requestAnimationFrame(render);
    renderer.render(scene, camera);

    cube.rotation.x += 0.1;
    cube.rotation.y += 0.01;
}
render();