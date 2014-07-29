/*global define:false */

define(['three', 'pubsub', 'tween', 'postRenderer'], function (THREE, PubSub, TWEEN, PostRenderer) {
	var yaw = 0, pitch = 0, currentTween = null, postRenderer,
		keyPressed = {};
	
	/**
	* @author zz85 / http://www.lab4games.net/zz85/blog
	*
	* Two pass Gaussian blur filter (horizontal and vertical blur shaders)
	* - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
	* and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
	*
	* - 9 samples per pass
	* - standard deviation 2.7
	* - 'h' and 'v' parameters should be set to '1 / width' and '1 / height'
	*/

	THREE.HorizontalBlurShader = {
		uniforms: {
			'tDiffuse': { type: 't', value: null },
			'h': { type: 'f', value: 1.0 / 512.0 }
		},
		vertexShader: [
			'varying vec2 vUv;',
			'void main() {',
			'vUv = uv;',
			'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
			'}'
		].join('\n'),

		fragmentShader: [
			'uniform sampler2D tDiffuse;',
			'uniform float h;',

			'varying vec2 vUv;',

			'void main() {',

			'vec4 sum = vec4( 0.0 );',

			'sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;',
			'sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;',
			'sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;',
			'sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;',
			'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;',
			'sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;',
			'sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;',
			'sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;',
			'sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;',

			'gl_FragColor = sum;',

			'}'
		].join('\n')
	};
	
	function onKeyDown(event) {
		var LEFT = 37, UP = 38, RIGHT = 39, BOTTOM = 40;

		if(keyPressed[event.keyCode.toString()]) {
			return;
		}

		var yawDir = 0;
		var pitchDir = 0;
		
		switch (event.keyCode) {
			case UP:
				if(pitch >= 0) {
					pitchDir = -90;
				}
			break;
			case BOTTOM:
				if(pitch <= 0) {
					pitchDir = 90;
				}
			break;
			case LEFT:
				yawDir = 90;
			break;
			case RIGHT:
				yawDir = -90;
			break;
		}
		
		if(!currentTween && (pitchDir !== 0 || yawDir !== 0)) {
			currentTween = new TWEEN.Tween( { x: yaw, y: pitch } )
				.to( { x: yaw + yawDir, y: pitch + pitchDir }, 1000 )
				.easing(TWEEN.Easing.Exponential.Out)
				.onUpdate(function () {
					yaw = this.x;
					pitch = this.y;
				})
				.onComplete(function () {
					currentTween = null;
				})
				.start();
		}
		
		keyPressed[event.keyCode.toString()] = true;
	}

	function onKeyUp(event) {
		delete keyPressed[event.keyCode.toString()];
	}
  
  PubSub.subscribe('init-scene', function() {
	
	postRenderer = new PostRenderer(
		THREE.HorizontalBlurShader,
		function(uniforms, target) {
			uniforms.tDiffuse.value = target();
			//uniforms.h.value = 1.0 / window.innerWidth;
		},
		function(uniforms, render) {
			render(null, uniforms.tDiffuse.value);
		});
	
	window.addEventListener('keydown', onKeyDown, false);
	window.addEventListener('keyup', onKeyUp, false);
  });
  
  PubSub.subscribe('render-scene', function(msg, data) {
	var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);

	camera.translateX(0);
	camera.translateY(0);
	camera.translateZ(0);

	camera.rotateY(yaw * Math.PI / 180);
	camera.rotateX(pitch * Math.PI / 180);
	camera.rotateZ(0 * Math.PI / 180);

	camera.translateZ(1000);
	
	data.camera = camera;
	
	if(currentTween) {
		postRenderer.render(data);
	}
  });
});