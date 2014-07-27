/*global define:false */

define(['three', 'pubsub'], function (THREE, PubSub) {
  var mesh, spotLight;
  
  PubSub.subscribe('init-scene', function(msg, data) {
	var geometry = new THREE.CubeGeometry(200, 200, 200);
    var material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
		vertexColors: THREE.FaceColors
    });

	var face, color;
	
	for ( var i = 0; i < geometry.faces.length; i++ ) 
	{
		if(i % 2 === 0) {
			color = 0.8 * Math.random() + 0.2;
		}
	
		face = geometry.faces[i];
		face.color.setRGB(color, 0, 0);		
	}
	
    mesh = new THREE.Mesh(geometry, material);
	
	mesh.position.y = 100;
	
	mesh.castShadow = true;
	mesh.receiveShadow = false;
	
	var ambient = new THREE.AmbientLight( 0x101010 );
	data.scene.add( ambient );
	
	spotLight = new THREE.SpotLight( 0xffffff, 1.0 );
	spotLight.position.set( 1000, 1500, 1000 );
	spotLight.castShadow = true;
	spotLight.shadowMapWidth = 2048;
	spotLight.shadowMapHeight = 2048;
	//spotLight.shadowBias = 0.0001;
	spotLight.shadowDarkness = 0.3;
	//spotLight.shadowCameraNear = 500;
	//spotLight.shadowCameraFar = 4000;
	//spotLight.shadowCameraFov = 30;
	data.scene.add(spotLight);
	
	data.scene.add(mesh);
  });
  
  PubSub.subscribe('scene-frame', function() {
	//mesh.rotation.x += 0.01;
	//mesh.rotation.y += 0.02;
  });
});