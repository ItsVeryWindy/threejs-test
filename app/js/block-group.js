/*global define:false */

define(['three', 'block-group-chunk', 'block-direction'], function (THREE, BlockGroupChunk, Direction) {
	function BlockGroup(scene, def, rot) {
		this._p = {
			node: new THREE.Object3D(),
			pos: new THREE.Vector3(0, 0, 0),
			chunks: [],
			dim: new THREE.Vector3(0, 0, 0),
			chunksSize: new THREE.Vector3(0, 0, 0)
		};
		
		scene.add(this._p.node);
		
		this._p.node.position.x = this._p.pos.x;
		this._p.node.position.y = this._p.pos.y;
		this._p.node.position.z = this._p.pos.z;

		setBlock.call(this, new THREE.Vector3(0, 0, 0), def, rot);
		//setBlock.call(this, new THREE.Vector3(0, -1, 0), def, rot);
		//setBlock.call(this, new THREE.Vector3(1, 0, 0), def, rot);
		//setBlock.call(this, new THREE.Vector3(-1, 0, 0), def, rot);
		//setBlock.call(this, new THREE.Vector3(1, 0, 1), def, rot);
//		setBlock.call(this, new THREE.Vector3(0, 0, 1), def, rot);
//		setBlock.call(this, new THREE.Vector3(1, 0, 1), def, rot);
		//setBlock.call(this, new THREE.Vector3(0, 1, 0), def, rot);
//		setBlock.call(this, new THREE.Vector3(0, 1, 1), def, rot);
	}
	
	BlockGroup.prototype = {
		chunk: function(index) {
			return this._p.chunks[index.x][index.y][index.z];
		},
		dimensions: function() {
			return this._p.dim;
		},
		chunksCount: function() {
			return this._p.chunksSize;
		},
		setBlock: function(instance, dir, def, rot) {
			var index = instance.index();

			switch (dir)
			{
				case Direction.TOP: index.y--; break;
				case Direction.BOTTOM: index.y++; break;
				case Direction.LEFT: index.x--; break;
				case Direction.RIGHT: index.x++; break;
				case Direction.FRONT: index.z++; break;
				case Direction.BACK: index.z--; break;
			}

			setBlock.call(this, index, def, rot);
		},
		node: function() {
			return this._p.node;
		},
		position: function() {
			return this._p.pos;
		},
		onFrame: function() {
			var curPos = this._p.node.position;

			if(this._p.pos !== curPos)
			{		
				this._p.node.position.x = this._p.pos.x * 100;
				this._p.node.position.y = this._p.pos.y * 100;
				this._p.node.position.z = this._p.pos.z * 100;
			}
		}
	};
	
	//function clearBlock()
	//{
	//	return false;
	//}

	function setBlock(index, def, rot) {
		resize.call(this, index, true);

		var chunk = this.chunk(new THREE.Vector3(Math.floor(index.x / BlockGroupChunk.CHUNK_SIZE), Math.floor(index.y / BlockGroupChunk.CHUNK_SIZE), Math.floor(index.z / BlockGroupChunk.CHUNK_SIZE)));

		if(chunk.setBlock(index, def, rot))
		{
			chunk.generate();

			return true;
		}

		return false;
	}
	
	function shiftX(value) {
		var amount = Math.abs(Math.floor(value / BlockGroupChunk.CHUNK_SIZE));

		var size = this._p.chunks.length;

		this._p.chunks.resize(size + amount, function () {
			return [];
		});

		for(var i = this._p.chunks.length - 1; i >= amount; i--) {
			this._p.chunks[i] = this._p.chunks[i - amount];
		}

		for(i = 0; i < amount; i++) {
			this._p.chunks[i] = [];
		}

		amount *= BlockGroupChunk.CHUNK_SIZE;

		this._p.pos.x -= amount;

		this._p.dim.x += amount;

		resizeX2.call(this);
		resizeY2.call(this);
		resizeZ2.call(this);

		return amount + value;
	}

	function shiftY(value) {
		var amount = Math.abs(Math.floor(value / BlockGroupChunk.CHUNK_SIZE));

		var returnArray = function() {
				return [];
		};
		
		for(var i = 0; i < this._p.chunks.length; i++)
		{
			var size = this._p.chunks[i].length;

			this._p.chunks[i].resize(size + amount, returnArray);

			for(var j = this._p.chunks[i].length - 1; j >= amount; j--)
			{
				this._p.chunks[i][j] = this._p.chunks[i][j - amount];
			}

			for(j = 0; j < amount; j++)
			{
				this._p.chunks[i][j] = [];
			}
		}

		amount *= BlockGroupChunk.CHUNK_SIZE;

		this._p.pos.y += amount;

		this._p.dim.y += amount;

		resizeY2.call(this);
		resizeZ2.call(this);

		return amount + value;
	}

	function shiftZ(value) {
		var amount = Math.abs(Math.floor(value / BlockGroupChunk.CHUNK_SIZE));

		var returnArray = function() {
				return [];
		};
		
		for(var i = 0; i < this._p.chunks.length; i++)
		{
			for(var j = 0; j < this._p.chunks[i].length; j++)
			{
				var size = this._p.chunks[i][j].length;

				this._p.chunks[i][j].resize(size + amount, returnArray);

				for(var k = this._p.chunks[i][j].length - 1; k >= amount; k--)
				{
					this._p.chunks[i][j][k] = this._p.chunks[i][j][k - amount];
				}

				for(k = 0; k < amount; k++)
				{
					this._p.chunks[i][j][k] = null;
				}
			}
		}

		amount *= BlockGroupChunk.CHUNK_SIZE;

		this._p.pos.z -= amount;

		this._p.dim.z += amount;

		resizeZ2.call(this);

		return amount + value;
	}

	function resize(index, ifSmaller) {
		if(index.x >= 0)
		{
			resizeX.call(this, index.x, ifSmaller);
		}
		else
		{
			index.x = shiftX.call(this, index.x);
		}

		if(index.y >= 0)
		{
			resizeY.call(this, index.y, ifSmaller);
		}
		else
		{
			index.y = shiftY.call(this, index.y);
		}

		if(index.z >= 0)
		{
			resizeZ.call(this, index.z, ifSmaller);
		}
		else
		{
			index.z = shiftZ.call(this, index.z);
		}
	}

	function resizeX(index, ifSmaller) {
		index++;

		if(ifSmaller && index <= this._p.dim.x) {
			return;
		}

		this._p.dim.x = index;

		resizeX2.call(this);
		resizeY2.call(this);
		resizeZ2.call(this);
	}

	function resizeY(index, ifSmaller) {
		index++;

		if(ifSmaller && index <= this._p.dim.y) {
			return;
		}

		this._p.dim.y = index;

		resizeY2.call(this);
		resizeZ2.call(this);
	}

	function resizeZ(index, ifSmaller) {
		index++;

		if(ifSmaller && index <= this._p.dim.z) {
			return;
		}

		this._p.dim.z = index;

		resizeZ2.call(this);
	}

	Array.prototype.resize = function(length, func) {
		this.length = length;
		
		for(var i = this.length - 1; i >= 0; i--) {
			if(!this[i]) {
				this[i] = func();
			} else {
				break;
			}
		}
	};
	
	function resizeX2() {
		this._p.chunksSize.x = Math.ceil(this._p.dim.x / BlockGroupChunk.CHUNK_SIZE);
		
		this._p.chunks.resize(this._p.chunksSize.x, function() {
			return [];
		});
	}

	function resizeY2() {
		this._p.chunksSize.y = Math.ceil(this._p.dim.y / BlockGroupChunk.CHUNK_SIZE);

		var returnArray = function() {
				return [];
		};
		
		for(var i = 0; i < this._p.chunksSize.x; i++)
		{
			this._p.chunks[i].resize(this._p.chunksSize.y, returnArray);
		}
	}

	function resizeZ2() {
		this._p.chunksSize.z = Math.ceil(this._p.dim.z / BlockGroupChunk.CHUNK_SIZE);

		var returnNull = function() {
				return null;
		};
		
		for(var i = 0; i < this._p.chunksSize.x; i++)
		{
			for(var j = 0; j < this._p.chunksSize.y; j++)
			{
				this._p.chunks[i][j].resize(this._p.chunksSize.z, returnNull);

				for(var k = 0; k < this._p.chunksSize.z; k++)
				{
					if(this._p.chunks[i][j][k] !== null)
					{
						this._p.chunks[i][j][k].index(new THREE.Vector3(i, j, k));
						continue;
					}

					this._p.chunks[i][j][k] = new BlockGroupChunk(this, this._p.node, new THREE.Vector3(i, j, k));
				}
			}
		}
	}
	
	return BlockGroup;
});