WebGL
=====
## Intro
A JavaScript API for rendering interactive 3D computer graphics and 2D graphics within any compatible web browser without the use of plug-ins.[1](https://en.wikipedia.org/wiki/WebGL)  
The WebGL API may be too tedious to use directly without some utility libraries.


## Libraries
- 3D: three.js, O3D, OSG.JS, CopperLicht and GLGE
- 2D: Cocos2d-x or Pixi.js
- Game Engine: Unreal 4 and Unity 5
- [List of WebGL frameworks](https://en.wikipedia.org/wiki/List_of_WebGL_frameworks)


## Creation of Models
- Authored in traditional 3D modelling software like Blender using [Blend4Web](https://en.wikipedia.org/wiki/Blend4Web) or Autodesk Maya then exported to a WebGL-readable format.
- In WebGL-specific software [CopperCube](https://en.wikipedia.org/wiki/CopperCube) and [Clara.io](https://en.wikipedia.org/wiki/Clara.io)


## Support

### Desktop
- Chrome: on all platforms with capable graphics card
- Firefox: on all platforms with capable graphics card
- Safari: on OS X Mountain Lion, Lion and Snow Leopard
- Opera: in Opera 11 and 12 but disabled by default
- Internet Explorer: partially supported in IE11, can be manually added to earlier versions using third-party plugins
- Edge: initial stable release supports WebGL 0.95

### Mobile
- Internet Explorer: on Windows Phone 8.1
- Firefox for mobile: since Firefox 4
- Chrome: since Chrome 25
- Opera Mobile: since Opera Mobile 12 (on Android only)
- iOS: in mobile Safari since iOS8


## 3D Requirements for the project
- No collision detection or physics needed
- No shaders or high quality rendering needed
- Walls only for visual representation of categories
- Simple user models to replicate popularity of a certain presentation?
- Custom textures for static posters
- Custom video textures or full-screen video for video posters
- Positional audio
- Ability to render at least 50? cubes (users, posters, walls) on screen at once


## Library chosen to fulfill requirements
- three.js
- Just a small Javascript library
    + Steep learning curve
    + Very flexible
    + Can write unit tests
    + Can use plugins for more advanced features eg. [Physijs](http://chandlerprall.github.io/Physijs/)
- Popularly used worldwide
    + Lots of examples and support
    + [Documentation](http://threejs.org/docs/)
- Performance
    + 6-11 FPS with [5000 static objects](http://mrdoob.github.io/three.js/examples/#webgl_performance_static)
    + 4-9 FPS with [5000 moving objects](http://mrdoob.github.io/three.js/examples/#webgl_performance)
- Uses JSON format for models
    + [Editor](http://threejs.org/editor/)
    + [Exporters for 3D programs](https://github.com/mrdoob/three.js/tree/master/utils/exporters)
    + [Converters from file formats](https://github.com/mrdoob/three.js/tree/master/utils/converters)
- Easy to add support for VR in the future
