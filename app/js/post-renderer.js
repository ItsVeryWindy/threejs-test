/*global define:false */

define(['three'], function (THREE) {
	function PostRenderer(shader, setup, render, defines)
	{
		defines = defines || {};
	
		this.scene = new THREE.Scene();
		
		this.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2,  window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
		this.camera.position.z = 100;
		
		this.scene.add(this.camera);
		
		var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };

		this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);

		setup(this.uniforms, function() { return new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, pars); });

		var material = new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			defines: defines
		});

		var quad = new THREE.Mesh(new THREE.PlaneGeometry(window.innerWidth, window.innerHeight), material);
		quad.position.z = - 500;
		this.scene.add(quad);
		
		this.renderFunc = render;
	}
	
	PostRenderer.prototype = {
		render: function(data) {
		
			this.renderFunc(this.uniforms, function(overrideMaterial, texture) {
				data.scene.overrideMaterial = overrideMaterial;
				data.renderer.render(data.scene, data.camera, texture, true );
			});
		
			data.scene = this.scene;
			data.camera = this.camera;
		}
	};
	
	return PostRenderer;
});