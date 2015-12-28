///////////////
// Constants //
///////////////
// 1m = 1 unit in any axis
var SPEED_MOVE      = 10;       // m/s
var SPEED_TURN      = Math.PI;  // rad/s
var LENGTH_HALL     = 100;
var BREADTH_HALL    = 65;
var HEIGHT_HALL     = 10;
var NUM_ROOMS       = 4;
var LENGTH_ROOM     = 50;
var BREADTH_ROOM    = 25;
var HEIGHT_ROOM     = 10;
var LENGTH_CORRIDOR = LENGTH_HALL;
var BREADTH_CORRIDOR= 15;
var HEIGHT_CORRIDOR = 10; 


/////////////
// Globals //
/////////////
var _event;
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
    let axisHelper = new THREE.AxisHelper(3);
    scene.add(axisHelper);


    // Camera
    //args: fov, aspect ratio, near, far
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);


    // Renderer
    if (Detector.webgl){
        renderer = new THREE.WebGLRenderer({antialias:true});
    }
    else{
        renderer = new THREE.CanvasRenderer(); 
    }

    //note: window.innerWidth/2 and window.innerHeight/2 will give half resolution
    //useful for performance intensive
    renderer.setSize(window.innerWidth, window.innerHeight);

    container = document.getElementById('threejs');
    container.appendChild(renderer.domElement);


    //debug: Mouse Look
    controls = new THREE.OrbitControls(camera);
    controls.damping = 0.2;
    controls.addEventListener('change', render);


    // Lights
    let ambientLight = new THREE.AmbientLight(0xa0a0a0);
    scene.add(ambientLight);


    // Person
    let cubeGeometry = new THREE.BoxGeometry(2,1,1);
    let cubeMaterial = new THREE.MeshPhongMaterial();
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(12,1,12);
    cube.rotation.y = Math.PI/2;
    scene.add(cube);

    camera.position.y = 5;
    camera.position.z = -5;
    camera.lookAt(new THREE.Vector3(0,0,4));
    cube.add(camera);


    // Rooms
    for(let i=0; i<NUM_ROOMS/2; i++){
        //create 2 rows with corridor in between
        let room = createRoom(new THREE.Vector3(i*LENGTH_ROOM,0,0), LENGTH_ROOM, HEIGHT_ROOM, BREADTH_ROOM);
        scene.add(room);
        collidableMeshList = collidableMeshList.concat(getMeshes(room));

        let room2 = createRoom(new THREE.Vector3(i*LENGTH_ROOM,0,BREADTH_ROOM+BREADTH_CORRIDOR), LENGTH_ROOM, HEIGHT_ROOM, BREADTH_ROOM);
        scene.add(room2);
        collidableMeshList = collidableMeshList.concat(getMeshes(room2));
    }


    // Hall Floor
    let floorGeometry = new THREE.PlaneBufferGeometry(LENGTH_HALL, BREADTH_HALL);
    let floorMaterial = new THREE.MeshBasicMaterial({color: 0x444444});
    let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.set(LENGTH_HALL/2, 0, BREADTH_HALL/2);
    floor.rotation.x = -Math.PI/2;
    scene.add(floor);

    // Hall Walls
    let hall = createRoom(new THREE.Vector3(0,0,0), LENGTH_HALL, HEIGHT_HALL, BREADTH_HALL, {light: false});
    scene.add(hall);
    collidableMeshList = collidableMeshList.concat(getMeshes(hall));


    // Skybox
    let skyBoxGeometry = new THREE.BoxGeometry(3000, 1000, 1000);
    let skyBoxMaterial = new THREE.MeshBasicMaterial({color: 0x9999ff, side: THREE.BackSide});
    let skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    scene.add(skyBox);

    // Load model
    // var jsonLoader = new THREE.JSONLoader();
    // jsonLoader.load('models/room.json', function(geometry, materials){
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

/**
 * Update state and handle keyboard input
 */
function update(){

    // delta = change in time since last call (seconds)
    let delta = clock.getDelta(); 
    let moveDistance = SPEED_MOVE * delta;
    let turnArc = SPEED_TURN * delta;

    let collisionResult = detectCollision(cube, collidableMeshList);
   
    // move forwards/backwards
    if(keyboard.pressed('w')){
        cube.translateZ(moveDistance);
        if(collisionResult.isCollided && collisionResult.sideToBlock === 'front'){
            cube.translateZ(-moveDistance);
        }
    }
    if(keyboard.pressed('s')){
        cube.translateZ(-moveDistance);
        if(collisionResult.isCollided && collisionResult.sideToBlock === 'back'){
            cube.translateZ(moveDistance);
        }
    }

    // rotate left/right
    if(keyboard.pressed('a')){
        cube.rotation.y += turnArc;
    }
    if(keyboard.pressed('d')){
        cube.rotation.y -= turnArc;
    }
    
}

/**
 * Detects if there is a collision between msh and a list
 * @param  {THREE.Mesh} msh - Object to test collisions on
 * @param  {THREE.Mesh[]} collidableMeshList - Array of meshes to test collision against
 * @return  {Object} result - Result of collision
 * @return  {boolean} result.isCollided - true if collision occurred
 * @return  {string} result.sideToBlock - Whether collision occurred on 'front', 'back' or 'none'
 */
function detectCollision(msh, collidableMeshList){
    // collision detection:
    //   determines if any of the rays from the object's origin to each vertex
    //      intersects any face of a mesh in the array of target meshes
    //   for increased collision accuracy, add more vertices to the cube;
    //      for example, new THREE.CubeGeometry( 64, 64, 64, 8, 8, 8, wireMaterial )
    //   HOWEVER: when the origin of the ray is within the target mesh, collisions do not occur
    let originPoint = msh.position.clone();
    //todo: use bounding box of msh
    
    for (let vertexIndex = 0; vertexIndex < msh.geometry.vertices.length; vertexIndex++){       
        let localVertex = msh.geometry.vertices[vertexIndex].clone();
        let globalVertex = localVertex.applyMatrix4(msh.matrix);
        let directionVector = globalVertex.sub(msh.position);
        
        let ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
        let collisionResults = ray.intersectObjects(collidableMeshList);

        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()){
            //collision for this ray from
            //origin to this vertex
            if(localVertex.z > 0){
                return {isCollided: true, sideToBlock: 'front'};
            }
            else{
                return {isCollided: true, sideToBlock: 'back'};
            }
        }
    }
    return {isCollided: false, sideToBlock: 'none'};
}

/**
 * Get child meshes from an Object3D
 * @param  {THREE.Object3D} obj - Parent object with child meshes
 * @return {THREE.Mesh[]} arr - Array of child meshes
 */
function getMeshes(obj){
    let arr = [];
    obj.traverse(function(node){
        if(node instanceof THREE.Mesh){
            arr.push(node);
        }
    });
    return arr;
}


/**
 * Creates 4 walls and a point light
 * @param  {THREE.Vector3} corner - Bottom left corner of the room
 * @param  {number} length - Length of the room in the x-axis
 * @param  {number} height - Height of the room in the y-axis
 * @param  {number} breadth - Breadth of the walls in the z-axis
 * @param {Object=} opts - Options for creating the room
 * @param {boolean} [opts.hasLight=true] - If true, creates a main light in the center of the room
 * @param {boolean} [opts.hasDoor=false] - If true, creates a door for the room
 * @return  {THREE.Object3D} room - Dummy room object to group walls and light
 */
function createRoom(corner, length, height, breadth, opts){
    opts = opts || {light: true, door: false};

    //TODO: leave space for door!
    let x = corner.x;
    let y = corner.y;
    let z = corner.z;


    let room = new THREE.Object3D();

    if(opts.hasOwnProperty('light') && opts['light']){
        // Light in the centre of the room
        let pointLight = new THREE.PointLight(0x999999, 5, length/4*3);
        pointLight.position.set(x+length/2,y+20,z+breadth/2);
        room.add(pointLight);
    }


    let wallLengthGeometry = new THREE.PlaneBufferGeometry(length, height);
    let wallBreadthGeometry = new THREE.PlaneBufferGeometry(breadth, height);
    let wallMaterial = new THREE.MeshPhongMaterial({color: 0x9999999, side: THREE.DoubleSide});
    let wallLength1 = new THREE.Mesh(wallLengthGeometry, wallMaterial);
    let wallLength2 = new THREE.Mesh(wallLengthGeometry, wallMaterial);
    let wallBreadth1 = new THREE.Mesh(wallBreadthGeometry, wallMaterial);
    let wallBreadth2 = new THREE.Mesh(wallBreadthGeometry, wallMaterial);

    //set corner at (0,0,0)
    wallLength1.position.set(x+length/2, y+height/2, z);
    wallLength2.position.set(x+length/2, y+height/2, z+breadth);
    wallBreadth1.position.set(x, y+height/2, z+breadth/2);
    wallBreadth2.position.set(x+length, y+height/2, z+breadth/2);

    //rotate about own origin
    wallBreadth1.rotation.y = Math.PI/2;
    wallBreadth2.rotation.y = Math.PI/2;

    room.add(wallLength1);
    room.add(wallLength2);
    room.add(wallBreadth1);
    room.add(wallBreadth2);


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
    _event = event;
    console.log('+++ eventDetails received');
    console.log(event);

    // get rid of loading message
    document.getElementById('loading').innerHTML = '';

    // constrain number of rooms to even number
    let num = parseInt(event.numRooms);
    NUM_ROOMS = (num%2) ? num+1 : num;
    LENGTH_HALL = LENGTH_ROOM * (NUM_ROOMS / 2);
    BREADTH_HALL = (BREADTH_ROOM * 2) + BREADTH_CORRIDOR;
    LENGTH_CORRIDOR = LENGTH_HALL;

    /////////////
    // Execute //
    /////////////
    init();
    run();
});