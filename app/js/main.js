/*global requirejs:false */

requirejs.config({
    baseUrl: 'js/vendor',
	paths: {
		floor: '../floor',
		basecube: '../basecube'
	},
	shim: {
		three: {
			exports: 'THREE'
		},
		pubsub: {
			exports: 'PubSub'
		}
	}
});

require(['three', 'pubsub', 'floor', 'basecube'], function(THREE, PubSub) {

var camera, scene, renderer;

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;
	camera.position.y = 300;

    scene = new THREE.Scene();

	PubSub.publish('init-scene', scene);
	
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;
	renderer.shadowMapType = THREE.PCFShadowMap;

    document.body.appendChild(renderer.domElement);
}

function animate() {

    // note: three.js includes requestAnimationFrame shim
    requestAnimationFrame(animate);

	PubSub.publish('scene-frame');
	
	renderer.clear();
    renderer.render(scene, camera);
}

});
