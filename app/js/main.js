/*global requirejs:false */

requirejs.config({
    baseUrl: 'js',
	paths: {
		three: 'vendor/three',
		pubsub: 'vendor/pubsub',
		tween: 'vendor/tween',
		jquery: 'vendor/colorpicker/jquery',
		'jquery.colorpicker': 'vendor/colorpicker/colorpicker'
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
		},
		jquery: {
			exports: '$'
		},
		'jquery.colorpicker': ['jquery']
	}
});

require(['three', 'pubsub', 'tween', 'block-side-definition', 'block-direction', 'block-group', 'block-definition', 'gun', 'block-manager', 'rotation-90', 'basecube',/*'floor', 'orbit','dof',*/ 'camera-rotator', 'block-highlight', 'control-setup'], function(THREE, PubSub, TWEEN, BlockSideDefinition, Direction, BlockGroup, BlockDefinition, Gun, BlockManager) {

	var camera, scene, renderer, group, gun, mouse = { coords: new THREE.Vector2(), button: false };

	init();
	animate();

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function onDocumentMouseMove(event) {
		event = event || window.event;
	
		event.preventDefault();

		mouse.coords.x = 2 * (event.clientX / window.innerWidth) - 1;
		mouse.coords.y = 1 - 2 * (event.clientY / window.innerHeight);
		
		//mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		//mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		
		return false;
	}
	
	function onDocumentMouseDown(event) {
		event = event || window.event;
		
		event.preventDefault();
		
		mouse.button = event.which || event.button;
		
		gun.mousePressed(mouse.button);
		
		return false;
	}
	
	function onDocumentMouseUp(event) {
		event = event || window.event;
		
		event.preventDefault();
		
		mouse.button = event.which || event.button;
		
		gun.mouseReleased(mouse.button);
		
		return false;
	}
	
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
		
		document.addEventListener('mousemove', onDocumentMouseMove, false);
		document.addEventListener('mousedown', onDocumentMouseDown, false);
		document.addEventListener('mouseup', onDocumentMouseUp, false);
		document.addEventListener('contextmenu', function(event) { event.preventDefault(); return false;}, false);
		
				//

		window.addEventListener('resize', onWindowResize, false);
		
		//-----------------------------------------------
		
		var definition = BlockManager.definition({
			TOP: 0xFFFFFF,
			BOTTOM: 0xFFFFFF,
			LEFT: 0xFFFFFF,
			RIGHT: 0xFFFFFF,
			FRONT: 0xFFFFFF,
			BACK: 0xFFFFFF
		});
		
		group = new BlockGroup(scene, definition, new THREE.Vector3());
		
		gun = new Gun([group]);
	}

	function animate(time) {
		// note: three.js includes requestAnimationFrame shim
		requestAnimationFrame(animate);
		TWEEN.update(time);
		
		group.onFrame();
		
		var evt = {
			scene: scene,
			camera: camera,
		};
		
		PubSub.publishSync('scene-frame', evt);
		
		gun.mouseMove(mouse.coords, evt.camera);
		
		scene.overrideMaterial = null;
		
		renderer.clear();
		
		evt = {
			scene: scene,
			camera: evt.camera,
			renderer: renderer
		};
		
		PubSub.publishSync('render-scene', evt);
		
		renderer.render(evt.scene, evt.camera);
	}
});
