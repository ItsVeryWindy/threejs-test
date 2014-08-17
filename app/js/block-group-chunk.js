/*global define:false */

define(['three', 'model-group', 'block-direction', 'block-merge-iterator', 'block-instance'], function (THREE, ModelGroup, Direction, BlockMergeIterator, BlockInstance, undefined) {
	function BlockGroupChunk(group, node, index)
	{
		this._p = {		
			group: group,
			node: new THREE.Object3D(),
			geo: new ModelGroup(),
			blocks: []
		};
		
		node.add(this._p.node);
		
		this.index(index);
		
		this._p.blocks.length = BlockGroupChunk.CHUNK_SIZE;
		
		for(var i = 0; i < BlockGroupChunk.CHUNK_SIZE; i++) {
			this._p.blocks[i] = [];
			this._p.blocks[i].length = BlockGroupChunk.CHUNK_SIZE;
			
			for(var j = 0; j < BlockGroupChunk.CHUNK_SIZE; j++) {
				this._p.blocks[i][j] = [];
				this._p.blocks[i][j].length = BlockGroupChunk.CHUNK_SIZE;
			
				for(var k = 0; k < BlockGroupChunk.CHUNK_SIZE; k++) {
					this._p.blocks[i][j][k] = null;
				}
			}
		}
	}
	
	BlockGroupChunk.CHUNK_SIZE = 32;

	BlockGroupChunk.prototype = {
		block: function(index) {
			return this._p.blocks[index.x][index.y][index.z];
		},
		convertToLocal: function(index) {
			return new THREE.Vector3(index.x % BlockGroupChunk.CHUNK_SIZE, index.y % BlockGroupChunk.CHUNK_SIZE, index.z % BlockGroupChunk.CHUNK_SIZE);
		},
		getMeshPartDimensions: function(blockCheck, side, start) {
			var it = new BlockMergeIterator(this._p.blocks, blockCheck, side, start, new THREE.Vector3(BlockGroupChunk.CHUNK_SIZE - 1, BlockGroupChunk.CHUNK_SIZE - 1, BlockGroupChunk.CHUNK_SIZE - 1));

			var stored = new THREE.Vector3(-1, -1, -1);

			var relHIndex = side.horizontal(); // Index3(1,0,0);
			//var relVIndex = side.vertical();   // Index3(0,0,1);

			while(it.hasNext())
			{
				var index = it.fetch();

				if(it.isLastHorizontal())
				{
					if(stored.x >= 0 && stored.y >= 0 && stored.z >= 0)
					{
						var area = new THREE.Vector3(
							relHIndex.x > 0 ? Math.min(stored.x, index.x) : Math.max(stored.x, index.x),
							relHIndex.y > 0 ? Math.min(stored.y, index.y) : Math.max(stored.y, index.y),
							relHIndex.z > 0 ? Math.min(stored.z, index.z) : Math.max(stored.z, index.z));

						var areaA = (area.x + 1) * (area.y + 1) * (area.z + 1);

						var areaB = (stored.x + 1) * (stored.y + 1) * (stored.z + 1);

						if(areaA < areaB)
						{
							return stored;
						}
					}

					stored = index;

					if(!it.gotoNextVertical())
					{
						return stored;
					}
				}
				else
				{
					it.next();
				}
			}

			return stored;
		},
		generateMeshPart: function(blockCheck, x, y, z) {
			var block = this._p.blocks[x][y][z];

			if(block === null) {
				return;
			}

			var def = block.blockDefinition();

			for(var i = 0; i < def.sidesCount(); i++)
			{
				var side = def.sideByIndex(i);

				var dir = side.directions();

				/*jshint bitwise: false*/
				if((blockCheck[x][y][z] & dir) === dir) {
					continue;
				}
				/*jshint bitwise: true*/

				var start = new THREE.Vector3(x, y, z);

				var dim = this.getMeshPartDimensions(blockCheck, side, start);

				var it = new BlockMergeIterator(this._p.blocks, blockCheck, side, start, dim);

				while(it.hasNext())
				{
					var index = it.fetch();

					var cur = blockCheck[index.x][index.y][index.z];

					/*jshint bitwise: false*/
					blockCheck[index.x][index.y][index.z] = cur | dir;
					/*jshint bitwise: true*/
					
					it.next();
				}

				var defDim = def.dimensions();

				var center = new THREE.Vector3((start.x + (dim.x - start.x) / 2.0 + defDim.x / 2.0) * 100, (-(start.y + (dim.y - start.y) / 2.0) - defDim.y / 2.0) * 100, (start.z + (dim.z - start.z) / 2.0 + defDim.z / 2.0) * 100);

				var scale = new THREE.Vector3(dim.x - start.x + 1, dim.y - start.y + 1, dim.z - start.z + 1);
			
				scale.multiplyScalar(0.5);

				var ent = side.createEntity('', false);

				this._p.geo.add(ent, center, new THREE.Quaternion(), scale);
			}
		},
		generate: function() {
			var blockCheck = [], i, j, k;

			for(i = 0; i < BlockGroupChunk.CHUNK_SIZE; i++) {
				blockCheck[i] = [];
				
				for(j = 0; j < BlockGroupChunk.CHUNK_SIZE; j++) {
					blockCheck[i][j] = [];
				
					for(k = 0; k < BlockGroupChunk.CHUNK_SIZE; k++) {
						blockCheck[i][j][k] = Direction.NONE;

						if(this._p.blocks[i][j][k] === null) {
							continue;
						}

						if(i > 0) {
							var leftBlock = this._p.blocks[i - 1][j][k];

							if(leftBlock !== null && leftBlock.blockDefinition().sideByDirection(Direction.RIGHT).isSolid()) {
								blockCheck[i][j][k] |= Direction.LEFT;
							}
						}
						
						if(i < BlockGroupChunk.CHUNK_SIZE - 1) {
							var rightBlock = this._p.blocks[i + 1][j][k];

							if(rightBlock !== null && rightBlock.blockDefinition().sideByDirection(Direction.LEFT).isSolid()) {
								blockCheck[i][j][k] |= Direction.RIGHT;
							}
						}
						
						if(j > 0) {
							var aboveBlock = this._p.blocks[i][j - 1][k];

							if(aboveBlock !== null && aboveBlock.blockDefinition().sideByDirection(Direction.BOTTOM).isSolid()) {
								blockCheck[i][j][k] |= Direction.TOP;
							}
						}

						if(j < BlockGroupChunk.CHUNK_SIZE - 1) {
							var bottomBlock = this._p.blocks[i][j + 1][k];

							if(bottomBlock !== null && bottomBlock.blockDefinition().sideByDirection(Direction.TOP).isSolid()) {
								blockCheck[i][j][k] |= Direction.BOTTOM;
							}
						}
						
						if(k > 0) {
							var frontBlock = this._p.blocks[i][j][k - 1];

							if(frontBlock !== null && frontBlock.blockDefinition().sideByDirection(Direction.FRONT).isSolid()) {
								blockCheck[i][j][k] |= Direction.BACK;
							}
						}
						
						if(k < BlockGroupChunk.CHUNK_SIZE - 1) {
							var backBlock = this._p.blocks[i][j][k + 1];

							if(backBlock !== null && backBlock.blockDefinition().sideByDirection(Direction.BACK).isSolid()) {
								blockCheck[i][j][k] |= Direction.FRONT;
							}
						}
					}
				}
			}

			for(i = 0; i < BlockGroupChunk.CHUNK_SIZE; i++) {
				for(j = 0; j < BlockGroupChunk.CHUNK_SIZE; j++) {
					for(k = 0; k < BlockGroupChunk.CHUNK_SIZE; k++) {
						if(this._p.blocks[i][j][k] === null) {
							continue;
						}

						this.generateMeshPart(blockCheck, i, j, k);
					}
				}
			}

			this._p.geo.build(this._p.node);
		},
		clearBlock: function(index) {
			index = this.convertToLocal(index);

			var oldValue = this._p.blocks[index.x][index.y][index.z];

			this._p.blocks[index.x][index.y][index.z] = null;

			if(oldValue !== null) {
				this.generate();
			}
			
			return oldValue !== null;
		},
		setBlock: function(index, def, rot) {
			index = this.convertToLocal(index);

			this._p.blocks[index.x][index.y][index.z] = new BlockInstance(this, index, def, rot);

			return true;
		},
		group: function() {
			return this._p.group;
		},
		index: function(value) {
			if(value !== undefined) {
				this._p.index = value;
				this._p.node.position.x = this._p.index.x * BlockGroupChunk.CHUNK_SIZE * 100;
				this._p.node.position.y = -this._p.index.y * BlockGroupChunk.CHUNK_SIZE * 100;
				this._p.node.position.z = this._p.index.z * BlockGroupChunk.CHUNK_SIZE * 100;
				return;
			}
			
			return this._p.index;
		}
	};
	
	return BlockGroupChunk;
});