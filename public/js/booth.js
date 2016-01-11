function Booth(posterTextureUrl){
  var url = posterTextureUrl || '../images/a4poster.png';

  THREE.ImageUtils.crossOrigin = '';
  var posterTexture = THREE.ImageUtils.loadTexture(url);
  posterTexture.mapS = posterTexture.mapT = THREE.RepeatWrapping;
  posterTexture.minFilter = THREE.NearestFilter;

  var boothGeometry = new THREE.PlaneBufferGeometry(9, 8);
  var boothMaterial = new THREE.MeshBasicMaterial({map: posterTexture});
  
  var booth = new THREE.Object3D();

  var poster = new THREE.Mesh(boothGeometry, boothMaterial);
  booth.add(poster);

  return booth;
}

module.exports = Booth;