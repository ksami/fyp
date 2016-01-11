/**
 * Creates Person object
 * @param {String} id - database _id of User to use as person.name
 * @return {THREE.Object3D} Person
 */
function Person(id){
  var bodyGeometry = new THREE.BoxGeometry(0.75,1.25,0.75);
  var headGeometry = new THREE.BoxGeometry(0.5,0.5,0.5);
  var bodyMaterial = new THREE.MeshPhongMaterial({color: 0x336633});
  var headMaterial = new THREE.MeshPhongMaterial({color: 0x336633});
  var body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  var head = new THREE.Mesh(headGeometry, headMaterial);
  
  var person = new THREE.Object3D();

  person.name = id;
  body.name = 'body';
  head.name = 'head';
  body.position.set(0,0,0);
  head.position.set(0,0.875,0);
  person.add(body);
  person.add(head);

  return person;
}

module.exports = Person;