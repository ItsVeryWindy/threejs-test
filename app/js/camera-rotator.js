/*global define:false */

define(['three', 'pubsub', 'tween', 'postRenderer'], function (THREE, PubSub, TWEEN, PostRenderer) {
	var yaw = 0, pitch = 0, currentTween = null, postRendererH, postRendererV,
		keyPressed = {}, hBlur = 0, vBlur = 0, spotLight;
	
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
	
	/**
	 * @author zz85 / http://www.lab4games.net/zz85/blog
	 *
	 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
	 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
	 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
	 *
	 * - 9 samples per pass
	 * - standard deviation 2.7
	 * - 'h' and 'v' parameters should be set to '1 / width' and '1 / height'
	 */

	THREE.VerticalBlurShader = {
		uniforms: {
			'tDiffuse': { type: 't', value: null },
			'v':        { type: 'f', value: 1.0 / 512.0 }
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
			'uniform float v;',
			'varying vec2 vUv;',
			'void main() {',
				'vec4 sum = vec4( 0.0 );',

				'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;',
				'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;',
				'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;',
				'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;',
				'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;',
				'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;',
				'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;',
				'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;',
				'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;',

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
		
		if(vBlur === 0 && (event.keyCode === UP || event.keyCode === BOTTOM)) {
			pitch = Math.round(pitch / 90) * 90;
		}
		
		if(hBlur === 0 && (event.keyCode === LEFT || event.keyCode === RIGHT)) {
			yaw = Math.round(yaw / 90) * 90;
		}
		
		function tween(valueDir, getValue, setValue, setBlur) {
			var newValue = getValue() + valueDir;
			var pValue = 0;
			var oldValue = getValue();
			
			currentTween = new TWEEN.Tween( { x: 0 } )
				.to( { x: valueDir }, 1000 )
				.easing(TWEEN.Easing.Exponential.Out)
				.onUpdate(function () {
					setValue(getValue() + this.x - pValue);
					pValue = this.x;
					setBlur(Math.abs(newValue - oldValue - this.x) / 90 * 16);
				})
				.onComplete(function () {
					currentTween = null;
				})
				.start();
		}
		
		switch (event.keyCode) {
			case UP:
				//if(pitch >= 0) {
					pitchDir = -90;
				//}
			break;
			case BOTTOM:
				//if(pitch <= 0) {
					pitchDir = 90;
				//}
			break;
			case LEFT:
				yawDir = 90;
			break;
			case RIGHT:
				yawDir = -90;
			break;
		}
		
		if(yawDir !== 0) {
			tween(yawDir, function() { return yaw; }, function(value) { yaw = value; }, function(value) { hBlur = value; });
		}
		
		if(pitchDir !== 0) {
			tween(pitchDir, function() { return pitch; }, function(value) {
				pitch = value;
				pitch = Math.min(pitch, 90);
				pitch = Math.max(pitch, -90);
			}, function(value) { vBlur = value; });
		}
		
		keyPressed[event.keyCode.toString()] = true;
	}

	function onKeyUp(event) {
		delete keyPressed[event.keyCode.toString()];
	}
  
  PubSub.subscribe('init-scene', function(msg, data) {
	
	postRendererH = new PostRenderer(
		THREE.HorizontalBlurShader,
		function(uniforms, target) {
			uniforms.tDiffuse.value = target();
			uniforms.h.value = hBlur / window.innerWidth;
		},
		function(uniforms, render) {
			render(null, uniforms.tDiffuse.value);
			uniforms.h.value = hBlur / window.innerWidth;
		});
		
	postRendererV = new PostRenderer(
		THREE.VerticalBlurShader,
		function(uniforms, target) {
			uniforms.tDiffuse.value = target();
			uniforms.v.value = vBlur / window.innerWidth;
		},
		function(uniforms, render) {
			render(null, uniforms.tDiffuse.value);
			uniforms.v.value = vBlur / window.innerWidth;
		});
	
	spotLight = new THREE.SpotLight( 0xffffff, 0.5 );
	spotLight.position.set(data.camera.x, data.camera.y, data.camera.z);
	spotLight.castShadow = true;
	spotLight.shadowMapWidth = 1024;
	spotLight.shadowMapHeight = 1024;
	spotLight.shadowCameraNear = 500;
	spotLight.shadowCameraFar = 4000;
	spotLight.shadowCameraFov = 30;
	data.scene.add(spotLight);
	
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
	
	spotLight.position.x = camera.position.x;
	spotLight.position.y = camera.position.y;
	spotLight.position.z = camera.position.z;
	
	data.camera = camera;
	
	if(vBlur === 0) {
		pitch = Math.round(pitch / 90) * 90;
	}
	
	if(hBlur === 0) {
		yaw = Math.round(yaw / 90) * 90;
	}
	
	if(hBlur) {
		postRendererH.render(data);
	}
	
	if(vBlur) {
		postRendererV.render(data);
	}
  });
});