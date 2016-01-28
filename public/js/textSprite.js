/**
 * @author https://stemkoski.github.io/Three.js/Sprite-Text-Labels.html
 * @author edited by ksami update to threejs r73
 */

/** Makes a 2D text sprite */
function TextSprite( message, parameters )
{
  if ( parameters === undefined ) parameters = {};
  
  var fontface = parameters.hasOwnProperty("fontface") ? 
    parameters["fontface"] : "Arial";
  
  var fontsize = parameters.hasOwnProperty("fontsize") ? 
    parameters["fontsize"] : 32;
  
  var color = parameters.hasOwnProperty("color") ?
    parameters["color"] : { r:0, g:255, b:255, a:1.0 };

    
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  context.font = "Bold " + fontsize + "px " + fontface;
  context.textAlign = "center";
    
  // get size data (height depends only on font size)
  var metrics = context.measureText( message );
  var textWidth = metrics.width;
  

  // text color
  context.fillStyle = "rgba(" + color.r + "," + color.g + ","
                  + color.b + "," + color.a + ")";

  context.fillText( message, canvas.width/2, fontsize );
  
  // canvas contents will be used for a texture
  var texture = new THREE.Texture(canvas) 
  texture.needsUpdate = true;
  texture.minFilter = THREE.NearestFilter;

  var spriteMaterial = new THREE.SpriteMaterial({map: texture});
  var sprite = new THREE.Sprite( spriteMaterial );

  return sprite;  
}

module.exports = TextSprite;