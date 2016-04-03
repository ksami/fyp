/* utils */

var Booth = require('./booth');

/**
 * Detects if there is a collision between a THREE.Object3D and a list of THREE.Mesh
 * @param  {THREE.Object3D} obj - Object with child mesh to test collision on
 * @param  {THREE.Mesh[]} collidableMeshList - Array of meshes to test collision against
 * @return  {Object} result - Result of collision
 * @return  {boolean} result.isCollided - true if collision occurred
 * @return  {string} result.sideToBlock - Whether collision occurred on 'front', 'back' or 'none'
 */
module.exports.detectCollision = function(obj, collidableMeshList){
    // collision detection:
    //   determines if any of the rays from the object's origin to each vertex
    //      intersects any face of a mesh in the array of target meshes
    //   for increased collision accuracy, add more vertices to the cube;
    //      for example, new THREE.CubeGeometry( 64, 64, 64, 8, 8, 8, wireMaterial )
    //   HOWEVER: when the origin of the ray is within the target mesh, collisions do not occur
    var originPoint = obj.position.clone();
    var msh;
    obj.traverse(function(node){
        if(node instanceof THREE.Mesh){
            msh = node;
        }
    });
    
    for (var vertexIndex = 0; vertexIndex < msh.geometry.vertices.length; vertexIndex++){       
        var localVertex = msh.geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4(obj.matrix);
        var directionVector = globalVertex.sub(obj.position);
        
        var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
        var collisionResults = ray.intersectObjects(collidableMeshList);

        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()){
            //collision for this ray from
            //origin to this vertex
            if(localVertex.z > 0){
                return {isCollided: true, sideToBlock: 'front'};
            }
            else{
                return {isCollided: true, sideToBlock: 'back'};
            }
        }
    }
    return {isCollided: false, sideToBlock: 'none'};
}

/**
 * Get child meshes from an Object3D
 * @param  {THREE.Object3D} obj - Parent object with child meshes
 * @return {THREE.Mesh[]} arr - Array of child meshes
 */
module.exports.getMeshes = function(obj){
    var arr = [];
    obj.traverse(function(node){
        if(node instanceof THREE.Mesh){
            arr.push(node);
        }
    });
    return arr;
}


/**
 * Creates 4 walls and a point light
 * @param  {THREE.Vector3} corner - Bottom left corner of the room
 * @param  {number} length - Length of the room in the x-axis
 * @param  {number} height - Height of the room in the y-axis
 * @param  {number} breadth - Breadth of the walls in the z-axis
 * @param {Object=} opts - Options for creating the room
 * @param {boolean} [opts.hasBooths=true] - If true, creates 10 booths
 * @param {boolean} [opts.hasLight=true] - If true, creates a main light in the center of the room
 * @param {boolean} [opts.isMirror=false] If true, rotates room by PI
 * @param {[String]} [opts.booths=[]] - Booths with name, poster/audio/video URL
 * @return  {THREE.Object3D} room - Dummy room object to group walls and light
 */
module.exports.createRoom = function(corner, length, height, breadth, opts){
    opts = opts || {};
    opts.booths = opts.booths || [];
    opts.hasBooths = typeof opts.hasBooths === 'undefined' ? true : opts.hasBooths;
    opts.hasLight = typeof opts.hasLight === 'undefined' ? true : opts.hasLight;
    opts.isMirror = typeof opts.isMirror === 'undefined' ? false : opts.isMirror;

    var x = corner.x;
    var y = corner.y;
    var z = corner.z;


    var room = new THREE.Object3D();

    if(opts.hasLight){
        // Light in the centre of the room
        var pointLight = new THREE.PointLight(0x999999, 5, length/4*3);
        pointLight.position.set(x+length/2,y+20,z+breadth/2);
        room.add(pointLight);
    }
    var doorWidth = 6;

    var wallLengthGeometry = new THREE.PlaneBufferGeometry(length, height);
    var wallLength2Geometry = new THREE.PlaneBufferGeometry((length-doorWidth*2)/2, height);
    var wallBreadthGeometry = new THREE.PlaneBufferGeometry(breadth, height);

    var wallMaterial = new THREE.MeshPhongMaterial({color: 0x999999, side: THREE.DoubleSide});

    var wallLength1 = new THREE.Mesh(wallLengthGeometry, wallMaterial);

    var wallLength2 = new THREE.Object3D();
    var halfWall1 = new THREE.Mesh(wallLength2Geometry, wallMaterial);
    var halfWall2 = new THREE.Mesh(wallLength2Geometry, wallMaterial);
    halfWall1.position.set(-(doorWidth+((length-doorWidth*2)/4)), 0, 0);
    halfWall2.position.set(doorWidth+((length-doorWidth*2)/4), 0, 0);
    wallLength2.add(halfWall1);
    wallLength2.add(halfWall2);

    var wallBreadth1 = new THREE.Mesh(wallBreadthGeometry, wallMaterial);
    var wallBreadth2 = new THREE.Mesh(wallBreadthGeometry, wallMaterial);

    // Booths
    if(opts.hasBooths && opts.booths.length>0){
        var margin = 4;
        var boothIdx = 0;
        var booths = opts.booths;
      
        for(var i=0; i<4 && boothIdx<booths.length; i++){
            var booth = new Booth(booths[boothIdx++]);
            booth.position.set(((i*length/4)-(length/2-5/2))+margin, 0.1, 0.1);
            wallLength1.add(booth);
        }

        for(var i=0; i<2 && boothIdx<booths.length; i++){
            var booth = new Booth(booths[boothIdx++]);
            booth.position.set(((i*breadth/2)-(breadth/2-5/2))+margin, 0.1, 0.1);
            wallBreadth1.add(booth);
        }

        for(var i=0; i<2 && boothIdx<booths.length; i++){
            var booth = new Booth(booths[boothIdx++]);
            booth.position.set(((i*breadth/2)-(breadth/2-5/2))+margin, 0.1, 0.1);
            wallBreadth2.add(booth);
        }

        // wall with door
        for(var i=0; i<2 && boothIdx<booths.length; i++){
            var booth = new Booth(booths[boothIdx++]);
            booth.position.set((((i*3)*length/4)-(length/2-5/2))+margin, 0.1, 0.1);
            wallLength2.add(booth);   
        }
    }

    //set corner at (0,0,0)
    wallBreadth1.position.set(x, y+height/2, z+breadth/2);
    wallBreadth2.position.set(x+length, y+height/2, z+breadth/2);

    //mirror room on other side of corridor
    if(opts.isMirror){
        wallLength1.position.set(x+length/2, y+height/2, z+breadth);
        wallLength2.position.set(x+length/2, y+height/2, z);
        wallLength1.rotation.y = Math.PI;
    }
    else{
        wallLength1.position.set(x+length/2, y+height/2, z);
        wallLength2.position.set(x+length/2, y+height/2, z+breadth);
        wallLength2.rotation.y = Math.PI;
    }


    //rotate about own origin
    wallBreadth1.rotation.y = Math.PI/2;
    wallBreadth2.rotation.y = -Math.PI/2;

    room.add(wallLength1);
    room.add(wallLength2);
    room.add(wallBreadth1);
    room.add(wallBreadth2);

    
    if(opts.hasBooths){
        // add directory icon outside room
        THREE.ImageUtils.crossOrigin = '';
        var dirTexture = THREE.ImageUtils.loadTexture('../images/icon-directory.png');
        dirTexture.mapS = dirTexture.mapT = THREE.RepeatWrapping;
        dirTexture.minFilter = THREE.NearestFilter;

        var dirGeometry = new THREE.PlaneBufferGeometry(1,1);
        var dirMaterial = new THREE.MeshBasicMaterial({map: dirTexture});
        var dir = new THREE.Mesh(dirGeometry, dirMaterial);

        dir.name = 'directory';
        dir.rotation.y = Math.PI;
        dir.position.set(doorWidth+1.5,0,-0.1);
        wallLength2.add(dir);


        // room name above room
        var canvas1 = document.createElement('canvas');
        var context1 = canvas1.getContext('2d');
        context1.font = 'Bold 36px Arial';
        context1.fillStyle = 'rgba(0,0,0,0.95)';
        context1.fillText('Hello, world!', 0, 50);
        
        var texture1 = new THREE.Texture(canvas1);
        texture1.needsUpdate = true;
        texture1.minFilter = THREE.NearestFilter;
          
        var material1 = new THREE.MeshBasicMaterial({map: texture1, side:THREE.DoubleSide});
        material1.transparent = true;

        var roomNameTag = new THREE.Mesh(new THREE.PlaneGeometry(canvas1.width, canvas1.height), material1);
        roomNameTag.position.set(x+length/2, y+height+2, z+breadth/2);
        roomNameTag.scale.set(0.1,0.1,0.1);
        if(opts.isMirror){
            roomNameTag.rotation.y = Math.PI;
        }
        
        room.add(roomNameTag);
    }

    return room;
}