if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

//////////////
// Requires //
//////////////
var _ = require('underscore');
var Utils = require('./utils');
var Person = require('./person');
var MicController = require('./micController');
var AudioController = require('./audioController');



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
var keyboard = new THREEx.KeyboardState(document.getElementById('threejs'));
var mouse = new THREE.Vector3();
var raycaster = new THREE.Raycaster();
var clock = new THREE.Clock();
var _collidableMeshList = [];
var person;

var _mic, _audio;


///////////
// Setup //
///////////
function init(){
  setupScene();

  $('#threejs').on('click', function(){
    this.focus();
  });
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
    person.translateZ(-moveDistance);
    if(collisionResult.isCollided && collisionResult.sideToBlock === 'front'){
      person.translateZ(moveDistance);
    }
  }
  if(keyboard.pressed('s')){
    person.translateZ(moveDistance);
    if(collisionResult.isCollided && collisionResult.sideToBlock === 'back'){
      person.translateZ(-moveDistance);
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


function onMouseDown(event){
  // update the picking ray with the camera and mouse position
  var canvas = document.getElementsByTagName('canvas')[0];
  mouse.set( (event.clientX - canvas.offsetLeft) /canvas.width * 2 - 1, - (event.clientY - canvas.offsetTop) / canvas.height * 2 + 1 , 0.5);
  mouse.unproject(camera);
  var vector = new THREE.Vector3();
  camera.updateMatrixWorld();
  vector.setFromMatrixPosition(camera.matrixWorld);
  raycaster.set(vector, mouse.sub(vector).normalize()); 

  // calculate objects intersecting the picking ray
  var intersects = raycaster.intersectObjects(_collidableMeshList, true);

  //debug:
  if(intersects.length>0){
    var material = new THREE.LineBasicMaterial({color: 0xff0000});
    var geometry = new THREE.Geometry();
    geometry.vertices.push(vector, intersects[0].point);
    var line = new THREE.Line(geometry, material);
    scene.add(line);
  }

  if( intersects.length>0 && typeof intersects[0].object.name !== 'undefined' &&
    (intersects[0].object.name === 'audio' || intersects[0].object.name === 'video' || intersects[0].object.name === 'directory') ){
    console.log('click');
    window.open(intersects[0].object.url);
  }
}

window.addEventListener('mousedown', onMouseDown, false);



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

  // set size of canvas
  renderer.setSize(window.innerWidth-10, window.innerHeight-150);

  container = document.getElementById('threejs');
  container.appendChild(renderer.domElement);


  // Lights
  var ambientLight = new THREE.AmbientLight(0xa0a0a0);
  scene.add(ambientLight);


  // Person
  person = new Person(_user.id, _user.name);
  person.position.set(12,1,12);
  camera.position.set(0,2,3);
  person.add(camera);
  scene.add(person);


  // 3rd Person Look
  controls = new THREE.OrbitControls(camera, document.getElementById('threejs'));
  controls.noPan = true;
  controls.noRotate = false;
  controls.minPolarAngle = Math.PI/3;
  controls.maxPolarAngle = 2*Math.PI/3;
  controls.minAzimuthAngle = -Math.PI/3;
  controls.maxAzimuthAngle = Math.PI/3;
  controls.target = new THREE.Vector3(0,1.2,0);


  // Rooms
  for(var i=0; i<NUM_ROOMS/2; i++){
    //create 2 rows with corridor in between
    var room = Utils.createRoom(new THREE.Vector3(i*LENGTH_ROOM,0,0), LENGTH_ROOM, HEIGHT_ROOM, BREADTH_ROOM, {booths: _event.rooms[i].booths});
    scene.add(room);
    _collidableMeshList = _collidableMeshList.concat(Utils.getMeshes(room));

    var room2 = Utils.createRoom(new THREE.Vector3(i*LENGTH_ROOM,0,BREADTH_ROOM+BREADTH_CORRIDOR), LENGTH_ROOM, HEIGHT_ROOM, BREADTH_ROOM, {booths: _event.rooms[i+1].booths, isMirror: true});
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
  _user.socketid = socket.id;
});
socket.on('disconnect', function(){
  console.log('disconnected');
  _mic.stopRecording();
});

socket.on('event-details', function(event){
  _event = event;
  console.log('+++ event details received');
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
    if(!(_.contains(_persons, update.person.user.socketid))){
      var newperson = new Person(update.person.user.socketid, update.person.user.name);
      newperson.position.copy(update.person.position);
      newperson.rotation.copy(update.person.rotation);
      newperson.getObjectByName('head').rotation.copy(update.person.headRotation);
      scene.add(newperson);
      _persons.push(update.person.user.socketid);
    }
    else{
      var updateperson = scene.getObjectByName(update.person.user.socketid);
      updateperson.position.copy(update.person.position);
      updateperson.rotation.copy(update.person.rotation);
      updateperson.getObjectByName('head').rotation.copy(update.person.headRotation);
    }
  }
});

socket.on('scene-person-disconnect', function(id){
  if(_.contains(_persons, id)){
    console.log(_persons);
    var toRemove = scene.getObjectByName(id);
    scene.remove(toRemove);
    _persons = _.without(_persons, id);
    console.log(_persons);
  }
});

// Emit person state change every 30ms
var intervalUpdate = setInterval(function(){
  if(person){
    socket.emit('person-state-change', {
      user: _user,
      position: person.position,
      rotation: person.rotation,
      headRotation: person.getObjectByName('head').rotation
    });
  }
}, 30);


//////////
// Chat //
//////////
socket.on('chat-text-receive', function(text){
  if(typeof text.class === 'undefined') {
    $('#chatmessages').append($('<li>').text(text.sender+'> '+text.msg));  
  }
  else {
    $('#chatmessages').append($('<li>').text(text.sender+'> '+text.msg).addClass(text.class));
  }
  scrollToBottom('#chatmessages');
});

$(function(){
  $('#chatsubmit').submit(function(){
    var msg = $('#chat').val();
    msg = msg.trim();

    if(msg === ''){
      $('#threejs').focus();
      return false;
    }

    //echo everything typed in, whitespaced trimmed
    $('#chatmessages').append($('<li>').text(_user.name+'> '+ msg));
    scrollToBottom('#chatmessages');
    
    socket.emit('chat-text-send', {sender: _user.name, msg: msg});

    $('#chat').val('');
    return false;
  });

});

function scrollToBottom(id) {
  var buffer = 500;
  if( $(id + ' li').length > buffer*2) {
    $(id + ' li').slice(0,buffer).remove();
  }
  $(id).scrollTop($(id)[0].scrollHeight);
}


//////////////
// Binaryjs //
//////////////

// Connect to Binary.js server
var binaryclient = new BinaryClient(location.origin.replace(/^http/, 'ws') + '/binary-endpoint');
_mic = new MicController(binaryclient);
_audio = new AudioController(binaryclient);

$('#record').mousedown(function(){
  //todo: when to start recording?
  _mic.startRecording();
});
$('#record').mouseup(function(){
  _mic.stopRecording();
});