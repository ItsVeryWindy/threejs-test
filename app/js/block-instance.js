/*global define:false */

define(['three', 'block-settings'], function (THREE, BlockSettings, undefined) {
	function BlockInstance(chunk, index, def, rot) {
		this._p = {
			chunk: chunk,
			index: index,
			def: def,
			rot: rot			
		};
	}

	BlockInstance.prototype = {
		setBlock: function(dir, blockDef, rot) {
			this._p.chunk.group().setBlock(this, dir, blockDef, rot);
		},
		blockDefinition: function(value) {
			if(value === undefined) {
				return this._p.def;
			}
			
			this._p.def = value;
			
			this._p.chunk.generate();
		},
		index: function() {
			var chunkIndex = this._p.chunk.index();

			return new THREE.Vector3(chunkIndex.x * BlockSettings.CHUNK_SIZE + this._p.index.x, chunkIndex.y * BlockSettings.CHUNK_SIZE + this._p.index.y, chunkIndex.z * BlockSettings.CHUNK_SIZE + this._p.index.z);
		},
		chunk: function() {
			return this._p.chunk;
		},
		clear: function() {
			this._p.chunk.clearBlock(this._p.index);
		}
	};
	
	return BlockInstance;
});