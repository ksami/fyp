function Booth(obj){
  var posterUrl = (!obj.poster || obj.poster==='') ? '../images/a4poster.png' : obj.poster;
  var audioUrl = (!obj.audio || obj.audio==='') ? '' : obj.audio;
  var videoUrl = (!obj.video || obj.video==='') ? '' : obj.video;

  THREE.ImageUtils.crossOrigin = '';
  var posterTexture = THREE.ImageUtils.loadTexture(posterUrl);
  posterTexture.mapS = posterTexture.mapT = THREE.RepeatWrapping;
  posterTexture.minFilter = THREE.NearestFilter;

  var posterGeometry = new THREE.PlaneBufferGeometry(9, 8);
  var posterMaterial = new THREE.MeshBasicMaterial({map: posterTexture});
  var poster = new THREE.Mesh(posterGeometry, posterMaterial);

  var booth = new THREE.Object3D();
  booth.add(poster);

  var iconGeometry = new THREE.PlaneBufferGeometry(1,1);
  if(audioUrl !== ''){
    var audioTexture = THREE.ImageUtils.loadTexture('../images/icon-audio.png');
    audioTexture.mapS = audioTexture.mapT = THREE.RepeatWrapping;
    audioTexture.minFilter = THREE.NearestFilter;

    var audioMaterial = new THREE.MeshBasicMaterial({map: audioTexture});
    var audio = new THREE.Mesh(iconGeometry, audioMaterial);
    audio.url = audioUrl;
    audio.name = 'audio';
    booth.add(audio);
    audio.position.set(-3,-4.5,0);
  }
  if(videoUrl !== ''){
    var videoTexture = THREE.ImageUtils.loadTexture('../images/icon-video.png');
    videoTexture.mapS = videoTexture.mapT = THREE.RepeatWrapping;
    videoTexture.minFilter = THREE.NearestFilter;

    var videoMaterial = new THREE.MeshBasicMaterial({map: videoTexture});
    var video = new THREE.Mesh(iconGeometry, videoMaterial);
    video.url = videoUrl;
    video.name = 'video';
    booth.add(video);
    video.position.set(-4,-4.5,0);
  }
  var chatTexture = THREE.ImageUtils.loadTexture('../images/icon-chat.png');
  chatTexture.mapS = chatTexture.mapT = THREE.RepeatWrapping;
  chatTexture.minFilter = THREE.NearestFilter;

  var chatMaterial = new THREE.MeshBasicMaterial({map: chatTexture});
  var chat = new THREE.Mesh(iconGeometry, chatMaterial);
  chat.room = obj._id;
  chat.name = 'chat';
  booth.add(chat);
  chat.position.set(4,-4.5,0);
  
  return booth;
}

module.exports = Booth;