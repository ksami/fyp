function Booth(posterTextureUrl){
  var url;
  if(typeof posterTextureUrl === 'undefined' || posterTextureUrl === ''){
    url = '../images/a4poster.png';
  }
  else{
    url = posterTextureUrl;
  }

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