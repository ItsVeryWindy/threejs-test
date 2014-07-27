/*global define:false */

define(['three', 'pubsub'], function (THREE, PubSub) {
  var mesh;
  
  PubSub.subscribe('init-scene', function(msg, scene) {
	var geometry = new THREE.CubeGeometry(200, 200, 200);
    var material = new THREE.MeshLambertMaterial({
        color: 0xff0000
    });

    mesh = new THREE.Mesh(geometry, material);
	
	mesh.position.y = 100;
	
	mesh.castShadow = true;
	mesh.receiveShadow = false;
	
	var ambient = new THREE.AmbientLight( 0x101010 );
	scene.add( ambient );
	
	var spotLight = new THREE.SpotLight( 0xffffff, 2.0 );
	spotLight.position.set( 1000, 1500, 100 );
	spotLight.castShadow = true;
	spotLight.shadowMapWidth = 1024;
	spotLight.shadowMapHeight = 1024;
	spotLight.shadowCameraNear = 500;
	spotLight.shadowCameraFar = 4000;
	spotLight.shadowCameraFov = 30;
	scene.add(spotLight);
	
	scene.add(mesh);
  });
  
  PubSub.subscribe('scene-frame', function() {
	//mesh.rotation.x += 0.01;
	//mesh.rotation.y += 0.02;
  });
});