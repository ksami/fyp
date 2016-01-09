/**
 * Creates Person object
 * @param {String} id - database _id of User to use as person.name
 * @return {THREE.Object3D} Person
 */
function Person(id){
  var bodyGeometry = new THREE.BoxGeometry(1,2,1);
  var headGeometry = new THREE.BoxGeometry(0.5,0.5,0.5);
  var bodyMaterial = new THREE.MeshPhongMaterial();
  var body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  var head = new THREE.Mesh(headGeometry, bodyMaterial);

  // body.position.set(12,1,12);
  // body.rotation.y = Math.PI/2;
  // scene.add(body);
  // body.position.set(0,-2,2);  // relative to camera

  // camera.position.set(0,2,-1);  // relative to body
  // camera.lookAt(new THREE.Vector3(12,2,13));  // look in z direction
  // body.add(camera);
  // camera.position.set(12,3,12);
  
  var person = new THREE.Object3D();

  person.name = id;
  body.name = 'body';
  head.name = 'head';
  body.position.set(0,0,0);
  head.position.set(0,1.5,0);
  person.add(body);
  person.add(head);

  return person;
}

module.exports = Person;