/**
 * @author jingpingji http://www.jingpingji.com
 */

/** Handle audio playback */
function AudioController(client){

  var audioController = {};

  var audioContext = window.AudioContext || window.webkitAudioContext;

  audioController.speakerContext = new audioContext();

  client.on('stream', function (stream) {
    audioController.nextTime = 0;
    var init = false;
    var audioCache = [];

    console.log('>>> Receiving Audio Stream');

    stream.on('data', function (data) {
      var array = new Float32Array(data);
      var buffer = audioController.speakerContext.createBuffer(1, 2048, 44100);
      buffer.copyToChannel(array, 0);

      audioCache.push(buffer);
      // make sure we put at least 5 chunks in the buffer before starting
      if ((init === true) || ((init === false) && (audioCache.length > 5))) { 
          init = true;
          audioController.playCache(audioCache);
      }
    });

    stream.on('end', function () {
      console.log('||| End of Audio Stream');    
    });

  });

  audioController.playCache = function (cache) {
    while (cache.length) {
      var buffer = cache.shift();
      var source    = audioController.speakerContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioController.speakerContext.destination);
      if (audioController.nextTime == 0) {
          // add a delay of 0.05 seconds
          audioController.nextTime = audioController.speakerContext.currentTime + 0.05;  
      }
      source.start(audioController.nextTime);
      // schedule buffers to be played consecutively
      audioController.nextTime+=source.buffer.duration;  
    }
  };

  return audioController;
}

module.exports = AudioController;