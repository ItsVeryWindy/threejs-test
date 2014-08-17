/*global define:false */

define(['three'], function (THREE) {

	function BlockSideDefinition(mesh, horiz, vert, dir, solid) {
		this._p = {
			mesh: mesh,
			horiz: horiz,
			vert: vert,
			dir: dir,
			solid: solid
		};
	}

	BlockSideDefinition.prototype = {
		horizontal: function() {
			return this._p.horiz;
		},
		vertical: function() {
			return this._p.vert;
		},
		directions: function() {
			return this._p.dir;
		},
		createEntity: function(scene, tex, trans) {
			var ent;
		
			if(!tex && trans) {
				var material = this._p.mesh.material.clone();
				
				material.tranparent = true;
				material.opacity = 0.5;
			
				ent = new THREE.Mesh(this._p.mesh.geometry, material);
			} else {
				ent = new THREE.Mesh(this._p.mesh.geometry, this._p.mesh.material);
			}
			
			return ent;
		},
		isSolid: function() {
			return this._p.solid;
		}
	};
	
	return BlockSideDefinition;
});