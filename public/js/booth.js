function Booth(obj){
  var posterUrl = obj.poster || '../images/a4poster.png';
  var audioUrl = obj.audio || '';
  var videoUrl = obj.video || '';

  THREE.ImageUtils.crossOrigin = '';
  var posterTexture = THREE.ImageUtils.loadTexture(posterUrl);
  var audioTexture = THREE.ImageUtils.loadTexture('../images/icon-audio.png');
  var videoTexture = THREE.ImageUtils.loadTexture('../images/icon-video.png');
  posterTexture.mapS = posterTexture.mapT = THREE.RepeatWrapping;
  audioTexture.mapS = audioTexture.mapT = THREE.RepeatWrapping;
  videoTexture.mapS = videoTexture.mapT = THREE.RepeatWrapping;
  posterTexture.minFilter = THREE.NearestFilter;
  audioTexture.minFilter = THREE.NearestFilter;
  videoTexture.minFilter = THREE.NearestFilter;

  var posterGeometry = new THREE.PlaneBufferGeometry(9, 8);
  var posterMaterial = new THREE.MeshBasicMaterial({map: posterTexture});
  var poster = new THREE.Mesh(posterGeometry, posterMaterial);

  var iconGeometry = new THREE.PlaneBufferGeometry(1,1);
  var audioMaterial = new THREE.MeshBasicMaterial({map: audioTexture});
  var videoMaterial = new THREE.MeshBasicMaterial({map: videoTexture});
  var audio = new THREE.Mesh(iconGeometry, audioMaterial);
  var video = new THREE.Mesh(iconGeometry, videoMaterial);
  audio.url = audioUrl;
  audio.name = 'audio';
  video.url = videoUrl;
  video.name = 'video';
  
  var booth = new THREE.Object3D();
  booth.add(poster);
  booth.add(audio);
  booth.add(video);
  audio.position.set(-4,-4.5,0);
  video.position.set(-3,-4.5,0);

  return booth;
}

module.exports = Booth;