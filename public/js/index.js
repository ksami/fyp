if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

//////////////
// Requires //
//////////////
var _ = require('underscore');
var Utils = require('./utils');
var Person = require('./person');



/////////////
// Globals //
/////////////
// 1m = 1 unit in any axis
var SPEED_MOVE    = 10;     // m/s
var SPEED_TURN    = Math.PI;  // rad/s
var LENGTH_HALL   = 100;
var BREADTH_HALL  = 65;
var HEIGHT_HALL   = 10;
var NUM_ROOMS     = 4;
var LENGTH_ROOM   = 50;
var BREADTH_ROOM  = 25;
var HEIGHT_ROOM   = 10;
var LENGTH_CORRIDOR = LENGTH_HALL;
var BREADTH_CORRIDOR= 15;
var HEIGHT_CORRIDOR = 10; 

var _event, _user;
var _persons = [];  // all person/user ids in scene except self
var container, scene, camera, renderer, controls;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
var _collidableMeshList = [];
var person;


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
  var moveDistance = SPEED_MOVE * delta;
  var turnArc = SPEED_TURN * delta;

  var collisionResult = Utils.detectCollision(person, _collidableMeshList);

  // update controls
  controls.update();

  // Head copies camera's rotation
  person.getObjectByName('head').rotation.copy(camera.rotation);

  // move forwards/backwards
  if(keyboard.pressed('w')){
    if(!(collisionResult.isCollided && collisionResult.sideToBlock === 'front')){
      person.translateZ(-moveDistance);
    }
  }
  if(keyboard.pressed('s')){
    if(!(collisionResult.isCollided && collisionResult.sideToBlock === 'back')){
      person.translateZ(moveDistance);
    }
  }

  // rotate left/right
  if(keyboard.pressed('a')){
    person.rotation.y += turnArc;
  }
  if(keyboard.pressed('d')){
    person.rotation.y -= turnArc;
  }
  
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
  person = new Person(_user.id);
  person.position.set(12,1,12);
  camera.position.set(0,2,3);
  person.add(camera);
  scene.add(person);



  // 3rd Person Look
  controls = new THREE.OrbitControls(camera);
  controls.noPan = true;
  controls.noRotate = false;
  controls.minPolarAngle = Math.PI/3;
  controls.maxPolarAngle = 2*Math.PI/3;
  controls.minAzimuthAngle = -Math.PI/3;
  controls.maxAzimuthAngle = Math.PI/3;
  controls.target = new THREE.Vector3(0,1.2,0);
  // FPS Look
  // controls = new THREE.FirstPersonControls(person);
  // controls.movementSpeed = 3;
  // controls.lookSpeed = 0.04;
  // controls.lookVertical = false;
  // controls.constrainVertical = true;
  // controls.invertVertical = true;
  // controls.verticalMin = 1.3;
  // controls.verticalMax = 1.7;
  // controls.noFly = true;
  // controls.noFlyYLock = 1;


  // Rooms
  for(var i=0; i<NUM_ROOMS/2; i++){
    //create 2 rows with corridor in between
    var room = Utils.createRoom(new THREE.Vector3(i*LENGTH_ROOM,0,0), LENGTH_ROOM, HEIGHT_ROOM, BREADTH_ROOM, {numBooths: _event.rooms[i].booths.length});
    scene.add(room);
    _collidableMeshList = _collidableMeshList.concat(Utils.getMeshes(room));

    var room2 = Utils.createRoom(new THREE.Vector3(i*LENGTH_ROOM,0,BREADTH_ROOM+BREADTH_CORRIDOR), LENGTH_ROOM, HEIGHT_ROOM, BREADTH_ROOM, {numBooths: _event.rooms[i+1].booths.length, isMirror: true});
    scene.add(room2);
    _collidableMeshList = _collidableMeshList.concat(Utils.getMeshes(room2));
  }


  // Hall Floor
  var floorGeometry = new THREE.PlaneBufferGeometry(LENGTH_HALL, BREADTH_HALL);
  var floorMaterial = new THREE.MeshBasicMaterial({color: 0x444444});
  var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.set(LENGTH_HALL/2, 0, BREADTH_HALL/2);
  floor.rotation.x = -Math.PI/2;
  scene.add(floor);

  // Hall Walls
  var hall = Utils.createRoom(new THREE.Vector3(0,0,0), LENGTH_HALL, HEIGHT_HALL, BREADTH_HALL, {hasLight: false, hasBooths: false});
  scene.add(hall);
  _collidableMeshList = _collidableMeshList.concat(Utils.getMeshes(hall));


  // Skybox
  var skyBoxGeometry = new THREE.BoxGeometry(3000, 1000, 1000);
  var skyBoxMaterial = new THREE.MeshBasicMaterial({color: 0x9999ff, side: THREE.BackSide});
  var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
  scene.add(skyBox);

  // Load model
  // var jsonLoader = new THREE.JSONLoader();
  // jsonLoader.load('models/room.json', function(geometry, materials){
  //   var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
  //   scene.add(mesh);
  //   _collidableMeshList.push(mesh);
  // });
}


//////////////
// Socketio //
//////////////
var socket = io();
socket.on('syn', function(){
  socket.emit('ack');
});
socket.on('syn-ack', function(user){
  console.log('connected');
  _user = user;
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

socket.on('scene-state-change', function(update){
  if(scene){
    if(!(_.contains(_persons, update.person.user.id))){
      var newperson = new Person(update.person.user.id);
      newperson.position.copy(update.person.position);
      newperson.rotation.copy(update.person.rotation);
      scene.add(newperson);
      _persons.push(update.person.user.id);
    }
    else{
      var updateperson = scene.getObjectByName(update.person.user.id);
      updateperson.position.copy(update.person.position);
      updateperson.rotation.copy(update.person.rotation);
    }
  }
});

// Emit person state change every 30ms
var intervalUpdate = setInterval(function(){
  if(person){
    socket.emit('person-state-change', {
      user: _user,
      position: person.position,
      rotation: person.rotation
    });
  }
}, 30);