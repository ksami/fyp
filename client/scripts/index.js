///////////////
// Constants //
///////////////
// 1m = 1 unit in any axis
var SPEED_MOVE      = 20;       // m/s
var SPEED_TURN      = Math.PI;  // rad/s
var LENGTH_HALL     = 150;      // m
var BREADTH_HALL    = 150;      // m
var HEIGHT_HALL     = 10;        // m
var LENGTH_ROOM     = 50;      // m
var BREADTH_ROOM    = 50;      // m
var HEIGHT_ROOM     = 9;        // m


/////////////HALL
// Globals //
/////////////
var container, scene, camera, renderer, controls;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
var collidableMeshList = [];
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
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1100);


    // Renderer
    if (Detector.webgl)
        renderer = new THREE.WebGLRenderer({antialias:true});
    else
        renderer = new THREE.CanvasRenderer(); 

    //note: window.innerWidth/2 and window.innerHeight/2 will give half resolution
    //useful for performance intensive
    renderer.setSize(window.innerWidth, window.innerHeight);

    container = document.getElementById("threejs");
    container.appendChild(renderer.domElement);


    //debug: Mouse Look
    controls = new THREE.OrbitControls(camera);
    controls.damping = 0.2;
    controls.addEventListener("change", render);


    // Lights
    var ambientLight = new THREE.AmbientLight(0xa0a0a0);
    scene.add(ambientLight);


    // Cube
    var cubeGeometry = new THREE.BoxGeometry(2,1,1);
    var cubeMaterial = new THREE.MeshPhongMaterial();
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(3,1,-5);
    scene.add(cube);

    camera.position.y = 5;
    camera.position.z = -5;
    camera.lookAt(new THREE.Vector3(0,0,4));
    cube.add(camera);

    // Hall Floor
    var floorGeometry = new THREE.PlaneGeometry(LENGTH_HALL, BREADTH_HALL);
    var floorMaterial = new THREE.MeshBasicMaterial({color: 0x444444});
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI/2;
    scene.add(floor);

    // Hall Walls
    drawRoom(new THREE.Vector3(0,0,0), LENGTH_HALL, HEIGHT_HALL, BREADTH_HALL);

    // Rooms
    drawRoom(new THREE.Vector3(LENGTH_HALL-LENGTH_ROOM, 0, BREADTH_HALL-BREADTH_ROOM), LENGTH_ROOM, HEIGHT_ROOM, BREADTH_ROOM);


    // Skybox
    var skyBoxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
    var skyBoxMaterial = new THREE.MeshBasicMaterial({color: 0x9999ff, side: THREE.BackSide});
    var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    scene.add(skyBox);

    // Load model
    // var jsonLoader = new THREE.JSONLoader();
    // jsonLoader.load("models/room.json", function(geometry, materials){
    //     var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
    //     scene.add(mesh);
    //     collidableMeshList.push(mesh);
    // });
}


///////////////////
// Loop at 60FPS //
///////////////////
function run(){
    requestAnimationFrame(run);
    update();
    render();
    //debug:
    controls.update();
}

/**
 * Render the scene
 */
function render(){
    renderer.render(scene, camera);
}

function update(){

    // delta = change in time since last call (seconds)
    var delta = clock.getDelta(); 
    var moveDistance = SPEED_MOVE * delta;
    var turnArc = SPEED_TURN * delta;

    var collisionResult = detectCollision(cube, collidableMeshList);
   
    // move forwards/backwards
    if(keyboard.pressed("w")){
        cube.translateZ(moveDistance);
        if(collisionResult.isCollided && collisionResult.sideToBlock === "front"){
            cube.translateZ(-moveDistance);
        }
    }
    if(keyboard.pressed("s")){
        cube.translateZ(-moveDistance);
        if(collisionResult.isCollided && collisionResult.sideToBlock === "back"){
            cube.translateZ(moveDistance);
        }
    }

    // rotate left/right
    if(keyboard.pressed("a")){
        cube.rotation.y += turnArc;
    }
    if(keyboard.pressed("d")){
        cube.rotation.y -= turnArc;
    }
    
}

/**
 * Detects if there is a collision between obj and a list
 * @param  {THREE.Mesh} obj - Object to test collisions on
 * @param  {THREE.Mesh[]} collidableMeshList - Array of meshes to test collision against
 * @return  {Object} result - Result of collision
 * @return  {boolean} result.isCollided - true if collision occurred
 * @return  {string} result.sideToBlock - Whether collision occurred on "front", "back" or "none"
 */
function detectCollision(obj, collidableMeshList){
    // collision detection:
    //   determines if any of the rays from the object's origin to each vertex
    //      intersects any face of a mesh in the array of target meshes
    //   for increased collision accuracy, add more vertices to the cube;
    //      for example, new THREE.CubeGeometry( 64, 64, 64, 8, 8, 8, wireMaterial )
    //   HOWEVER: when the origin of the ray is within the target mesh, collisions do not occur
    var originPoint = obj.position.clone();
    //todo: use bounding box of obj
    
    for (var vertexIndex = 0; vertexIndex < obj.geometry.vertices.length; vertexIndex++){       
        var localVertex = obj.geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4(obj.matrix);
        var directionVector = globalVertex.sub(obj.position);
        
        var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
        var collisionResults = ray.intersectObjects(collidableMeshList);

        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()){
            //collision for this ray from
            //origin to this vertex
            if(localVertex.z > 0){
                return {isCollided: true, sideToBlock: "front"};
            }
            else{
                return {isCollided: true, sideToBlock: "back"};
            }
        }
    }
    return {isCollided: false, sideToBlock: "none"};
}


/**
 * Creates 4 walls and a point light, adds walls to collidables list
 * @param  {THREE.Vector3} centre - Centre of the room
 * @param  {number} length - Length of the room in the x-axis
 * @param  {number} height - Height of the room in the y-axis
 * @param  {number} breadth - Breadth of the walls in the z-axis
 */
function drawRoom(centre, length, height, breadth){
    var offsetX = centre.x/2;
    var offsetY = centre.y/2;
    var offsetZ = centre.z/2;


    // Lights
    var pointLight = new THREE.PointLight(0x999999, 5, length*3/4);
    pointLight.position.set(offsetX, offsetY + 2*height, offsetZ);
    scene.add(pointLight);


    // Walls
    var moveX = length/2;
    var moveY = height/2;
    var moveZ = breadth/2;

    var wallLengthGeometry = new THREE.PlaneGeometry(length, height);
    var wallBreadthGeometry = new THREE.PlaneGeometry(breadth, height);
    var wallMaterial = new THREE.MeshPhongMaterial({color: 0x999999, side: THREE.DoubleSide});

    var walls = [];
    walls.push(new THREE.Mesh(wallLengthGeometry, wallMaterial));
    walls.push(new THREE.Mesh(wallLengthGeometry, wallMaterial));
    walls.push(new THREE.Mesh(wallBreadthGeometry, wallMaterial));
    walls.push(new THREE.Mesh(wallBreadthGeometry, wallMaterial));

    walls[2].rotation.y = Math.PI/2;
    walls[3].rotation.y = Math.PI/2;

    walls[0].position.set(offsetX, moveY+offsetY, moveZ+offsetZ);
    walls[1].position.set(offsetX, moveY+offsetY, -moveZ+offsetZ);
    walls[2].position.set(moveX+offsetX, moveY+offsetY, offsetZ);
    walls[3].position.set(-moveX+offsetX, moveY+offsetY, offsetZ);

    for (var i = 0; i < walls.length; i++) {
        scene.add(walls[i]);
        collidableMeshList.push(walls[i]);
    }
}


/////////////
// Execute //
/////////////
init();
run();