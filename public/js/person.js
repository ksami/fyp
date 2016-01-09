/**
 * Creates Person object
 * @param {String} id - database _id of User to use as person.name
 * @return {THREE.Object3D} Person
 */
function Person(id){
  var cubeGeometry = new THREE.BoxGeometry(1,2,1);
  var cubeMaterial = new THREE.MeshPhongMaterial();
  var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

  // cube.position.set(12,1,12);
  // cube.rotation.y = Math.PI/2;
  // scene.add(cube);
  // cube.position.set(0,-2,2);  // relative to camera

  // camera.position.set(0,2,-1);  // relative to cube
  // camera.lookAt(new THREE.Vector3(12,2,13));  // look in z direction
  // cube.add(camera);
  // camera.position.set(12,3,12);
  
  var person = new THREE.Object3D();

  person.name = id;
  cube.name = 'body';
  cube.position.set(0,0,0);
  person.add(cube);

  return person;
}

module.exports = Person;