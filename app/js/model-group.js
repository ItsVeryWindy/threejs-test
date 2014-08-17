/*global define:false */

define(function () {
	function ModelGroup() {
		this.models = [];
	}
	
	ModelGroup.prototype = {
		add: function(ent, position, orientation, scale) {
			this.models.push({
				ent: ent,
				orientation: orientation,
				position: position,
				scale: scale
			});
		},
		build: function(node) {
			node.children.length = 0;

			var geometry = new THREE.Geometry();
			var vertexOffset = 0;
			var materials = [];
			
			for(var i = 0; i < this.models.length; i++) {
				var details = this.models[i];

				materials.push(details.ent.material);
				
				for(var j = 0; j < details.ent.geometry.vertices.length; j++) {
					var vector = multiplyVector(details, j);
					
					geometry.vertices.push(vector);
				}
				
				for(j = 0; j < details.ent.geometry.faces.length; j++) {
					var origFace = details.ent.geometry.faces[j];
				
					var face = origFace.clone();
					
					face.a += vertexOffset;
					face.b += vertexOffset;
					face.c += vertexOffset;
					face.materialIndex = i;
					
					geometry.faces.push(face);
				}
				
				vertexOffset += details.ent.geometry.vertices.length;
			}

			geometry.computeFaceNormals();
			geometry.computeVertexNormals();
			
			//var box = new THREE.BoxGeometry(200, 200, 200);
			
			var mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, [
				//new THREE.MeshLambertMaterial( { color: 0xffffff} ),
				//new THREE.MeshBasicMaterial( { color: 0xfffff, wireframe: true} )
				new THREE.MeshFaceMaterial(materials)
			]);
			
			//var material = new THREE.MeshLambertMaterial( { color: 0xffffff } );
			
			//var mesh = new THREE.Mesh(geometry, material);
			
			mesh.castShadow = true;
			mesh.receiveShadow = false;
			
			node.add(mesh);

			this.models.length = 0;
		}
	};
	
	function multiplyVector(details, faceIndex) {
		var vector = details.ent.geometry.vertices[faceIndex].clone();
 
		vector.multiply(details.scale);
		vector.applyQuaternion(details.orientation);
		vector.add(details.position);
 
		return vector;
	}
	
	return ModelGroup;
});