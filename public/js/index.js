///////////////
// Constants //
///////////////
// 1m = 1 unit in any axis
var SPEED_MOVE      = 20;       // m/s
var SPEED_TURN      = Math.PI;  // rad/s
var LENGTH_HALL     = 300;      // m
var BREADTH_HALL    = 150;      // m
var HEIGHT_HALL     = 10;        // m
var NUM_ROOMS       = 4;        // default value
var LENGTH_ROOM     = 100;
var BREADTH_ROOM    = 50;
var HEIGHT_ROOM     = 9;        // m


/////////////
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
    cube.position.set(25,1,25);
    cube.rotation.y = Math.PI/2;
    scene.add(cube);

    camera.position.y = 5;
    camera.position.z = -5;
    camera.lookAt(new THREE.Vector3(0,0,4));
    cube.add(camera);


    // Rooms
    var room = createRoom(new THREE.Vector3(0,0,0), LENGTH_ROOM, HEIGHT_ROOM, BREADTH_ROOM);
    scene.add(room);



/*
    // Hall Floor
    var floorGeometry = new THREE.PlaneGeometry(LENGTH_HALL, BREADTH_HALL);
    var floorMaterial = new THREE.MeshBasicMaterial({color: 0x444444});
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI/2;
    scene.add(floor);

    // Hall Walls
    drawRoom(new THREE.Vector3(0,0,0), LENGTH_HALL, HEIGHT_HALL, BREADTH_HALL);

    // Rooms
    for (var i = (-NUM_ROOMS/2)+1; i < NUM_ROOMS/2; i+=2){
        var centre = new THREE.Vector3((i*LENGTH_ROOM)/2, 0, ((BREADTH_HALL/2) - (BREADTH_ROOM/2)));
        drawRoom(centre, LENGTH_ROOM, HEIGHT_ROOM, BREADTH_ROOM);
        centre.z = -((BREADTH_HALL/2) - (BREADTH_ROOM/2));
        drawRoom(centre, LENGTH_ROOM, HEIGHT_ROOM, BREADTH_ROOM);
    }
*/

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
 * Creates 4 walls and a point light
 * @param  {THREE.Vector3} corner - Centre of the room
 * @param  {number} length - Length of the room in the x-axis
 * @param  {number} height - Height of the room in the y-axis
 * @param  {number} breadth - Breadth of the walls in the z-axis
 * @return {THREE.Object3D} room - Dummy room object to group walls and light
 */
function createRoom(corner, length, height, breadth){
    //TODO: leave space for door!
    var x = corner.x;
    var y = corner.y;
    var z = corner.z;


    var room = new THREE.Object3D();

    // Lights
    var pointLight = new THREE.PointLight(0x999999, 5, 100);
    pointLight.position.set(breadth/2,20,length/2);
    room.add(pointLight);

    var wallLengthGeometry = new THREE.PlaneBufferGeometry(length, height);
    var wallBreadthGeometry = new THREE.PlaneBufferGeometry(breadth, height);
    var wallMaterial = new THREE.MeshPhongMaterial({color: 0x9999999, side: THREE.DoubleSide});
    var wallLength1 = new THREE.Mesh(wallLengthGeometry, wallMaterial);
    var wallLength2 = new THREE.Mesh(wallLengthGeometry, wallMaterial);
    var wallBreadth1 = new THREE.Mesh(wallBreadthGeometry, wallMaterial);
    var wallBreadth2 = new THREE.Mesh(wallBreadthGeometry, wallMaterial);
    //set corner at (0,0,0)
    wallLength1.position.set(0,height/2,length/2);
    wallLength2.position.set(breadth,height/2,length/2);
    wallBreadth1.position.set(breadth/2,height/2,0);
    wallBreadth2.position.set(breadth/2,height/2,length);
    //rotate about own origin
    wallLength1.rotation.y = Math.PI/2;
    wallLength2.rotation.y = Math.PI/2;
    // wallBreadth1.rotation.y = Math.PI/2;
    room.add(wallLength1);
    room.add(wallLength2);
    room.add(wallBreadth1);
    room.add(wallBreadth2);

    //TODO: add to collidables

    return room;
}


//////////////
// Socketio //
//////////////
var socket = io();
socket.on('syn', function(){
    socket.emit('ack');
});
socket.on('syn-ack', function(){
    console.log('connected');
});
socket.on('disconnect', function(){
    console.log('disconnected');
});

socket.on('eventDetails', function(event){
    console.log('+++ eventDetails received');
    console.log(event);

    // get rid of loading message
    document.getElementById('loading').innerHTML = '';

    // constrain number of rooms to even number
    var num = parseInt(event.num);
    NUM_ROOMS = (num%2) ? num+1 : num;
    // LENGTH_ROOM = LENGTH_HALL/(NUM_ROOMS/2);
    // BREADTH_ROOM = BREADTH_HALL/3;

    /////////////
    // Execute //
    /////////////
    init();
    run();
});