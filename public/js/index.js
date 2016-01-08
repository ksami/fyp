if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

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
    setupScene();
}


///////////////////
// Loop at 60FPS //
///////////////////
function run(){
    requestAnimationFrame(run);
    update();
    render();
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
    var delta = clock.getDelta(); 
    // var moveDistance = SPEED_MOVE * delta;
    // var turnArc = SPEED_TURN * delta;

    var collisionResult = detectCollision(cube, collidableMeshList);
   
    // update mouse controls
    controls.update(delta);

    // // move forwards/backwards
    // if(keyboard.pressed('w')){
    //     cube.translateZ(moveDistance);
    //     if(collisionResult.isCollided && collisionResult.sideToBlock === 'front'){
    //         cube.translateZ(-moveDistance);
    //     }
    // }
    // if(keyboard.pressed('s')){
    //     cube.translateZ(-moveDistance);
    //     if(collisionResult.isCollided && collisionResult.sideToBlock === 'back'){
    //         cube.translateZ(moveDistance);
    //     }
    // }

    // // rotate left/right
    // if(keyboard.pressed('a')){
    //     cube.rotation.y += turnArc;
    // }
    // if(keyboard.pressed('d')){
    //     cube.rotation.y -= turnArc;
    // }
    
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
    var originPoint = msh.position.clone();
    //todo: use bounding box of msh
    
    for (var vertexIndex = 0; vertexIndex < msh.geometry.vertices.length; vertexIndex++){       
        var localVertex = msh.geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4(msh.matrix);
        var directionVector = globalVertex.sub(msh.position);
        
        var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
        var collisionResults = ray.intersectObjects(collidableMeshList);

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
    var arr = [];
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
 * @param {integer} [opts.numBooths=0] - Number of booths in the room that will be visible
 * @param {boolean} [opts.hasBooths=true] - If true, creates 10 booths
 * @param {boolean} [opts.hasLight=true] - If true, creates a main light in the center of the room
 * @param {boolean} [opts.hasDoor=false] - If true, creates a door for the room
 * @param {boolean} [opts.isMirror=false] If true, rotates room by PI
 * @return  {THREE.Object3D} room - Dummy room object to group walls and light
 */
function createRoom(corner, length, height, breadth, opts){
    opts = opts || {};
    opts.numBooths = opts.numBooths || 0;
    opts.hasBooths = typeof opts.hasBooths === 'undefined' ? true : opts.hasBooths;
    opts.hasLight = typeof opts.hasLight === 'undefined' ? true : opts.hasLight;
    opts.hasDoor = typeof opts.hasDoor === 'undefined' ? false : opts.hasDoor;
    opts.isMirror = typeof opts.isMirror === 'undefined' ? false : opts.isMirror;

    //TODO: leave space for door!
    var x = corner.x;
    var y = corner.y;
    var z = corner.z;


    var room = new THREE.Object3D();

    if(opts.hasLight){
        // Light in the centre of the room
        var pointLight = new THREE.PointLight(0x999999, 5, length/4*3);
        pointLight.position.set(x+length/2,y+20,z+breadth/2);
        room.add(pointLight);
    }

    var wallLengthGeometry = new THREE.PlaneBufferGeometry(length, height);
    var wallBreadthGeometry = new THREE.PlaneBufferGeometry(breadth, height);

    var wallMaterial = new THREE.MeshPhongMaterial({color: 0x999999, side: THREE.DoubleSide});

    var wallLength1 = new THREE.Mesh(wallLengthGeometry, wallMaterial);
    var wallLength2 = new THREE.Mesh(wallLengthGeometry, wallMaterial);
    var wallBreadth1 = new THREE.Mesh(wallBreadthGeometry, wallMaterial);
    var wallBreadth2 = new THREE.Mesh(wallBreadthGeometry, wallMaterial);

    // Booths
    //TODO: render booths along the 3 sides
    if(opts.hasBooths){
        var margin = 4;
        var poster = THREE.ImageUtils.loadTexture('../images/a4poster.png');
        poster.mapS = poster.mapT = THREE.RepeatWrapping;
        var boothGeometry = new THREE.PlaneBufferGeometry(9, height-3);
        var boothMaterial = new THREE.MeshBasicMaterial({map: poster});
        // var boothMaterial = new THREE.MeshPhongMaterial({color: 0xff0000, side: THREE.DoubleSide});
        var boothMaterialb = new THREE.MeshPhongMaterial({color: 0x00ff00, side: THREE.DoubleSide});
        
        for(var i=0; i<4; i++){
            var booth = new THREE.Mesh(boothGeometry, boothMaterial);
            booth.position.set(((i*length/4)-(length/2-5/2))+margin, 0.1, 0.1);
            wallLength1.add(booth);
        }

        // wall with door
        var booth8 = new THREE.Mesh(boothGeometry, boothMaterial);
        var booth9 = new THREE.Mesh(boothGeometry, boothMaterial);
        booth8.position.set(((0*length/4)-(length/2-5/2))+margin, 0.1, 0.1);
        booth9.position.set(((3*length/4)-(length/2-5/2))+margin, 0.1, 0.1);
        wallLength2.add(booth8);
        wallLength2.add(booth9);

        for(var i=0; i<2; i++){
            var booth = new THREE.Mesh(boothGeometry, boothMaterialb);
            booth.position.set(((i*breadth/2)-(breadth/2-5/2))+margin, 0.1, 0.1);
            wallBreadth1.add(booth);
        }

        for(var i=0; i<2; i++){
            var booth = new THREE.Mesh(boothGeometry, boothMaterialb);
            booth.position.set(((i*breadth/2)-(breadth/2-5/2))+margin, 0.1, 0.1);
            wallBreadth2.add(booth);
        }
    }

    //set corner at (0,0,0)
    wallBreadth1.position.set(x, y+height/2, z+breadth/2);
    wallBreadth2.position.set(x+length, y+height/2, z+breadth/2);

    //mirror room on other side of corridor
    if(opts.isMirror){
        wallLength1.position.set(x+length/2, y+height/2, z+breadth);
        wallLength2.position.set(x+length/2, y+height/2, z);
        wallLength1.rotation.y = Math.PI;
    }
    else{
        wallLength1.position.set(x+length/2, y+height/2, z);
        wallLength2.position.set(x+length/2, y+height/2, z+breadth);
        wallLength2.rotation.y = Math.PI;
    }


    //rotate about own origin
    wallBreadth1.rotation.y = Math.PI/2;
    wallBreadth2.rotation.y = -Math.PI/2;

    room.add(wallLength1);
    room.add(wallLength2);
    room.add(wallBreadth1);
    room.add(wallBreadth2);


    return room;
}


function setupScene(){
    // Scene
    scene = new THREE.Scene();

    //debug: Axis
    var axisHelper = new THREE.AxisHelper(3);
    axisHelper.position.set(12,1,12);
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


    // Lights
    var ambientLight = new THREE.AmbientLight(0xa0a0a0);
    scene.add(ambientLight);


    // Person
    var cubeGeometry = new THREE.BoxGeometry(1,2,1);
    var cubeMaterial = new THREE.MeshPhongMaterial();
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    // cube.position.set(12,1,12);
    // cube.rotation.y = Math.PI/2;
    // scene.add(cube);
    // cube.position.set(0,-2,2);  // relative to camera

    // camera.position.set(0,2,-1);  // relative to cube
    // camera.lookAt(new THREE.Vector3(12,2,13));  // look in z direction
    // cube.add(camera);
    // camera.position.set(12,3,12);
    var person = new THREE.Object3D();
    person.position.set(12,1,12);
    cube.position.set(0,0,0);
    camera.position.set(3,3,3);
    person.add(cube);
    person.add(camera);
    scene.add(person);


    //debug: Free Look
    // controls = new THREE.OrbitControls(camera);
    // controls.damping = 0.2;
    // controls.addEventListener('change', render);
    // FPS Look
    controls = new THREE.FirstPersonControls(person);
    controls.movementSpeed = 2;
    controls.lookSpeed = 0.04;
    controls.lookVertical = true;
    controls.constrainVertical = true;
    controls.verticalMin = 1.3;
    controls.verticalMax = 1.7;
    controls.noFly = true;
    controls.noFlyYLock = 1;


    // Rooms
    for(var i=0; i<NUM_ROOMS/2; i++){
        //create 2 rows with corridor in between
        var room = createRoom(new THREE.Vector3(i*LENGTH_ROOM,0,0), LENGTH_ROOM, HEIGHT_ROOM, BREADTH_ROOM, {numBooths: _event.rooms[i].booths.length});
        scene.add(room);
        collidableMeshList = collidableMeshList.concat(getMeshes(room));

        var room2 = createRoom(new THREE.Vector3(i*LENGTH_ROOM,0,BREADTH_ROOM+BREADTH_CORRIDOR), LENGTH_ROOM, HEIGHT_ROOM, BREADTH_ROOM, {numBooths: _event.rooms[i+1].booths.length, isMirror: true});
        scene.add(room2);
        collidableMeshList = collidableMeshList.concat(getMeshes(room2));
    }


    // Hall Floor
    var floorGeometry = new THREE.PlaneBufferGeometry(LENGTH_HALL, BREADTH_HALL);
    var floorMaterial = new THREE.MeshBasicMaterial({color: 0x444444});
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.set(LENGTH_HALL/2, 0, BREADTH_HALL/2);
    floor.rotation.x = -Math.PI/2;
    scene.add(floor);

    // Hall Walls
    var hall = createRoom(new THREE.Vector3(0,0,0), LENGTH_HALL, HEIGHT_HALL, BREADTH_HALL, {hasLight: false, hasBooths: false});
    scene.add(hall);
    collidableMeshList = collidableMeshList.concat(getMeshes(hall));


    // Skybox
    var skyBoxGeometry = new THREE.BoxGeometry(3000, 1000, 1000);
    var skyBoxMaterial = new THREE.MeshBasicMaterial({color: 0x9999ff, side: THREE.BackSide});
    var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    scene.add(skyBox);

    // Load model
    // var jsonLoader = new THREE.JSONLoader();
    // jsonLoader.load('models/room.json', function(geometry, materials){
    //     var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
    //     scene.add(mesh);
    //     collidableMeshList.push(mesh);
    // });
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
    var num = parseInt(event.numRooms);
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