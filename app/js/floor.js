/*global define:false */

define(['three', 'pubsub'], function (THREE, PubSub) {
  PubSub.subscribe('init-scene', function(msg, data) {
	var geometry = new THREE.PlaneGeometry(1000, 1000 );
	var material = new THREE.MeshBasicMaterial( {color: 0xB8DBFF, side: THREE.DoubleSide} );
	var plane = new THREE.Mesh( geometry, material );
	
	plane.receiveShadow = true;
	
	plane.rotateX(90 * Math.PI / 180);
	data.scene.add( plane );
  });
});