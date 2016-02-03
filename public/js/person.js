var TextSprite = require('./textSprite');

/**
 * Creates Person object
 * @param {String} id - database _id of User to use as person.name
 * @return {THREE.Object3D} Person
 */
function Person(id, name){
  var username = name || '<unknown>';

  var bodyGeometry = new THREE.BoxGeometry(0.75,1.25,0.75);
  var bodyMaterial = new THREE.MeshPhongMaterial({color: 0x336633});

  var headGeometry = new THREE.BoxGeometry(0.5,0.5,0.5);
  var headTexture = THREE.ImageUtils.loadTexture('../images/hero.png');
  // headTexture.mapS = headTexture.mapT = THREE.RepeatWrapping;
  headTexture.minFilter = THREE.NearestFilter;
  headTexture.magFilter = THREE.NearestFilter;
  var headMaterial = new THREE.MeshPhongMaterial({map: headTexture});


  // var top = box(0,0);
  // var bottom = box(0,1);
  // var right = box(1,0);
  // var front = box(1,1);
  // var left = box(2,0);
  // var back = box(2,1);


  var top = box(1,7);
  var bottom = box(2,7);
  var right = box(0,6);
  var front = box(1,6);
  var left = box(2,6);
  var back = box(3,6);

  headGeometry.faceVertexUvs[0] = [];

  headGeometry.faceVertexUvs[0][0] = [ right[0], right[1], right[3] ];
  headGeometry.faceVertexUvs[0][1] = [ right[1], right[2], right[3] ];
    
  headGeometry.faceVertexUvs[0][2] = [ left[0], left[1], left[3] ];
  headGeometry.faceVertexUvs[0][3] = [ left[1], left[2], left[3] ];
    
  headGeometry.faceVertexUvs[0][4] = [ top[0], top[1], top[3] ];
  headGeometry.faceVertexUvs[0][5] = [ top[1], top[2], top[3] ];
    
  headGeometry.faceVertexUvs[0][6] = [ bottom[0], bottom[1], bottom[3] ];
  headGeometry.faceVertexUvs[0][7] = [ bottom[1], bottom[2], bottom[3] ];
    
  headGeometry.faceVertexUvs[0][8] = [ back[0], back[1], back[3] ];
  headGeometry.faceVertexUvs[0][9] = [ back[1], back[2], back[3] ];
    
  headGeometry.faceVertexUvs[0][10] = [ front[0], front[1], front[3] ];
  headGeometry.faceVertexUvs[0][11] = [ front[1], front[2], front[3] ];


  var body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  var head = new THREE.Mesh(headGeometry, headMaterial);
  
  var person = new THREE.Object3D();
  
  var style = {
    color: {r:255,g:255,b:0,a:1.0},
    fontsize: 32
  };
  if(username.search(/admin/i) !== -1){
    style.color = {r:255,g:0,b:0,a:1.0};
  }
  var nametag = new TextSprite(username, style);

  person.name = id;
  body.name = 'body';
  head.name = 'head';
  body.position.set(0,0,0);
  head.position.set(0,0.875,0);
  nametag.position.set(0,1.1,0);
  person.add(body);
  person.add(head);
  person.add(nametag);

  return person;
}

var divs = 8;
var units = [];
for(var i=0; i<=divs; i++){
  units.push(i/divs);
}

function box(col, row){
  var topleft = new THREE.Vector2(units[col], units[row+1]);
  var topright = new THREE.Vector2(units[col+1], units[row+1]);
  var btmright = new THREE.Vector2(units[col+1], units[row]);
  var btmleft = new THREE.Vector2(units[col], units[row]);

  return [topleft, btmleft, btmright, topright];
}

module.exports = Person;