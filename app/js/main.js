/*global requirejs:false */

requirejs.config({
    baseUrl: 'js/vendor',
	paths: {
		floor: '../floor',
		basecube: '../basecube',
		dof: '../dof',
		orbit: '../orbit',
		cameraRotator: '../camera-rotator',
		postRenderer: '../post-renderer'
	},
	shim: {
		three: {
			exports: 'THREE'
		},
		pubsub: {
			exports: 'PubSub'
		},
		tween: {
			exports: 'TWEEN'
		}
	}
});

require(['three', 'pubsub', 'tween', 'floor', 'basecube', /*'dof', 'orbit',*/ 'cameraRotator'], function(THREE, PubSub, TWEEN) {

var camera, scene, renderer;

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;
	camera.position.y = 300;

    scene = new THREE.Scene();

	PubSub.publishSync('init-scene', { scene: scene, camera: camera });
	
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;
	renderer.shadowMapType = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement);
}

function animate(time) {

    // note: three.js includes requestAnimationFrame shim
    requestAnimationFrame(animate);
	TWEEN.update(time);
	
	var evt = {
		scene: scene,
		camera: camera,
	};
	
	PubSub.publishSync('scene-frame', evt);
	
	scene.overrideMaterial = null;
	
	renderer.clear();
    
	evt = {
		scene: scene,
		camera: camera,
		renderer: renderer
	};
	
	PubSub.publishSync('render-scene', evt);
	
	renderer.render(evt.scene, evt.camera);
}

});
