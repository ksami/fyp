/**
 * @author jingpingji http://www.jingpingji.com
 */

/** Handle recording */
function MicController(client){
  //initializing variables;
  var micController = {};
  micController.recording = false;

  var audioContext = window.AudioContext || window.webkitAudioContext;

  navigator.mediaDevices = navigator.mediaDevices || 
     ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia) ? {
       getUserMedia: function(c) {
         return new Promise(function(y, n) {
           (navigator.mozGetUserMedia ||
            navigator.webkitGetUserMedia).call(navigator, c, y, n);
         });
       }
  } : null);

  if (!navigator.mediaDevices) {
    console.log("getUserMedia() not supported.");
  }

  micController.device = navigator.mediaDevices.getUserMedia({ audio: true, 
    video: false });

  micController.device.then(function (stream) {
    var context = new audioContext();
    var audioInput = context.createMediaStreamSource(stream);
    var bufferSize = 2048;
    // create a javascript node
    micController.recorder = context.createScriptProcessor(bufferSize, 1, 1);
    // specify the processing function
    micController.recorder.onaudioprocess = micController.recorderProcess;
    // connect stream to our recorder
    audioInput.connect(micController.recorder);
    // connect our recorder to the previous destination
    micController.recorder.connect(context.destination);
  });

  micController.device.catch(function (err) {
    console.log("The following error occured: " + err.name);
  });

  function convertFloat32ToInt16(buffer) {
    l = buffer.length;
    buf = new Int16Array(l);
    while (l--) {
      buf[l] = Math.min(1, buffer[l])*0x7FFF;
    }
    return buf.buffer;
  }

  micController.recorderProcess = function (e) {
    var left = e.inputBuffer.getChannelData(0);
    if (micController.recording === true) {
      // var chunk = convertFloat32ToInt16(left);
      var chunk = left;
      // console.dir(chunk);
      micController.stream.write(chunk);
    }
  };

  micController.startRecording = function () {

    if (micController.recording === false) {
      console.log('>>> Start Recording');

      //open binary stream
      micController.stream = client.createStream({data: 'audio'});
      micController.recording = true;
    }

  };

  micController.stopRecording = function () {
    
    if (micController.recording === true) {
      console.log('||| Stop Recording');

      micController.recording = false;

      //close binary stream
      micController.stream.end();
    }
  };

  return micController;
}

module.exports = MicController;