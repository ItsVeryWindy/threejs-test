/*global define:false */

define(['three', 'pubsub', 'block-direction', 'block-group-chunk', 'block-manager', 'block-settings'], function (THREE, PubSub, Direction, BlockGroupChunk, BlockManager, BlockSettings) {
	function Gun(groups) {
		this._p = {
			groups: groups,
			info: {
				block: null,
				dir: null,
				index: null
			},
			button: false,
			isDown: false,
			lastClearIndex: null
		};
	}
	
	Gun.prototype = {
		mouseMove: function(mouse, cam) {
			var info = [];//intersecting.call(this, mouse, cam, 0, 0, 0, 1, 1, 1);
			var isSingle = true;
			var i, item;
			
			if(info.length === 0) {
				info = intersecting.call(this, mouse, cam, 100, 100, 100, 3, 3, 3);
				
				for(i = 0; i < info.length; i++) {
					item = info[i];
					
					if(!(item.grid.x === 1 || item.grid.y === 1 || item.grid.z === 1)) {
						info.splice(i, 1);
						i--;
					}
				}
				
				isSingle = false;
			}
			
			if(info.length > 0) {
				PubSub.publishSync('block-highlighted', info);
				this._p.info = info;
			} else if(this._p.info) {
				PubSub.publishSync('block-diminished');
				this._p.info = null;
			}
			
			if(this._p.isDown && info.length > 0) {
				if(this._p.button === 3) {
					for(i = 0; i < info.length; i++) {
						item = info[i]; var propA, propB;
						
						switch(item.dir) {
							case Direction.FRONT:
							case Direction.BACK:
								propA = 'x'; propB = 'y'; break;
							case Direction.TOP:
							case Direction.BOTTOM:
								propA = 'x'; propB = 'z'; break;
							case Direction.LEFT:
							case Direction.RIGHT:
								propA = 'y'; propB = 'z'; break;
						}	
						
						var blockIndex = item.block.index();
						
						if((this._p.lastClearIndex === null || this._p.lastClearIndex[propA] !== blockIndex[propA] || this._p.lastClearIndex[propB] !== blockIndex[propB]) && item.grid[propA] === 1 && item.grid[propB] === 1) {
							item.block.clear();
							this._p.lastClearIndex = blockIndex;
							return;
						}
					}
				}
				
				info = info[0];
				
				var dir = info.dir;
				var grid = info.grid;
				var definition;
			
				switch(dir) {
					case Direction.FRONT:
					case Direction.BACK:
						if(grid.x === 1 && grid.y === 1) {
							definition = setupDefinition(dir, info.block);
							info.block.blockDefinition(definition);
							return;
						}
						
						if(grid.x !== 1) {
							dir = grid.x > 0 ? Direction.RIGHT : Direction.LEFT;
						} else {
							dir = grid.y > 0 ? Direction.BOTTOM : Direction.TOP;
						}
					break;
					case Direction.TOP:
					case Direction.BOTTOM:
						if(grid.x === 1 && grid.z === 1) {
							definition = setupDefinition(dir, info.block);
							info.block.blockDefinition(definition);
							return;
						}
					
						if(grid.x !== 1) {
							dir = grid.x > 0 ? Direction.RIGHT : Direction.LEFT;
						} else {
							dir = grid.z > 0 ? Direction.FRONT : Direction.BACK;
						}
					break;
					case Direction.LEFT:
					case Direction.RIGHT:
						if(grid.y === 1 && grid.z === 1) {
							definition = setupDefinition(dir, info.block);
							info.block.blockDefinition(definition);
							return;
						}
						
						if(grid.z !== 1) {
							dir = grid.z > 0 ? Direction.FRONT : Direction.BACK;
						} else {
							dir = grid.y > 0 ? Direction.BOTTOM : Direction.TOP;
						}
					break;
				}
		
				if(this._p.button === 1) {
					definition = setupDefinition();
					info.block.setBlock(dir, definition, new THREE.Vector3());
				}
			}
		},
		mousePressed: function(button) {
			this._p.isDown = true;
			this._p.button = button;
		},
		mouseReleased: function() {
			this._p.isDown = false;
			this._p.lastClearIndex = null;
		}
	};
	
	function setupDefinition(dir, block) {
		var defSetup = {
			TOP: null,
			BOTTOM: null,
			LEFT: null,
			RIGHT: null,
			FRONT: null,
			BACK: null
		};
		
		switch(dir) {
			case Direction.FRONT: defSetup.FRONT = BlockSettings.Color; break;
			case Direction.BACK: defSetup.BACK = BlockSettings.Color; break;
			case Direction.TOP: defSetup.TOP = BlockSettings.Color; break;
			case Direction.BOTTOM: defSetup.BOTTOM = BlockSettings.Color; break;
			case Direction.LEFT: defSetup.LEFT = BlockSettings.Color; break;
			case Direction.RIGHT: defSetup.RIGHT = BlockSettings.Color; break;
			default:
				defSetup.TOP = BlockSettings.Color;
				defSetup.BOTTOM = BlockSettings.Color;
				defSetup.LEFT = BlockSettings.Color;
				defSetup.RIGHT = BlockSettings.Color;
				defSetup.FRONT = BlockSettings.Color;
				defSetup.BACK = BlockSettings.Color;
		}
		
		var definition = BlockManager.definition(defSetup, block);

		return definition;
	}
	
	function intersecting(mouse, cam, x, y, z, gX, gY, gZ) {
		mouse = mouse.clone();
		var offset = new THREE.Vector3(x, y, z);
		var grid = new THREE.Vector3(gX, gY, gZ);
					
		var mousePos = new THREE.Vector3(mouse.x, mouse.y, 0.5);
		
		var blockGroups = intersectingGroups.call(this, cam, mousePos, offset);
		
		var blocks = [];
		
		var mGrid = grid.clone().addScalar(-1).divideScalar(2);
		
		var ensureBlock = function(pGroup, nGroup) {
			return (pGroup.dist === nGroup.dist && pGroup.group.grid.distanceTo(mGrid) > nGroup.group.grid.distanceTo(mGrid)) || pGroup.dist > nGroup.dist;
		};
		
		for(var i = 0; i < blockGroups.length; i++) {
			var group = blockGroups[i];

			var chunks = intersectingGroupChunks(group.group, cam, mousePos, offset);

			for(var j = 0; j < chunks.length; j++) {
				var chunk = chunks[j];

				var block = intersectingBlock(chunk.group, cam, mousePos, offset);

				for(var k = 0; k < block.length; k++) {
					var result = intersectingDirection(block[k].group, cam, mousePos, offset, grid);
					
					ensureInsert(blocks, ensureBlock, {group: result, dist: block[k].dist });
				}
			}
		}

		return blocks.map(function(item) {
			return item.group;
		});
	}	
	
	var projector = new THREE.Projector();
	
	function createRay(cam, camPos, mousePos) {
		cam = cam.clone();
		cam.position.copy(camPos);
		cam.updateMatrixWorld();
		
		mousePos = mousePos.clone();
		
		return projector.pickingRay(mousePos, cam).ray;
	}
	
	function ensureInsert(arr, func, value) {
		for(var i = 0; i < arr.length; i++) {
			if(func(arr[i], value)) {
				break;
			}	
		}
		
		arr.splice(i, 0, value);
	}
	
	function calcGroupPosition(cam, group) {
		var camPos = cam.position.clone();
		
		var groupPos = group.position().clone();
		
		groupPos.multiplyScalar(100);
		
		camPos.sub(groupPos);
		
		return camPos;
	}
	
	function intersectingGroups(cam, mousePos, offset) {
		var groups = [];

		var ensureGroup = function(group) {
			return group.dist >= dist;
		};
		
		for(var i = 0; i < this._p.groups.length; i++) {
			var group = this._p.groups[i];

			var chunkCount = group.dimensions();

			var box = new THREE.Box3(new THREE.Vector3(0 - offset.x, -(chunkCount.y * 100) - offset.y, 0 - offset.z), new THREE.Vector3(chunkCount.x * 100 + offset.x, 0 + offset.y, chunkCount.z * 100 + offset.z));

			var camPos = calcGroupPosition(cam, group);

			var ray = createRay(cam, camPos, mousePos);
			
			var result = ray.intersectBox(box);

			if(result) {
				var dist = result.distanceTo(camPos);
			
				ensureInsert(groups, ensureGroup, {group: group, dist: dist });
			}
		}

		return groups;
	}

	function intersectingGroupChunks(group, cam, mousePos, offset) {
		var groups = [];
		
		var camPos = calcGroupPosition(cam, group);
		
		var ray = createRay(cam, camPos, mousePos);
		
		var count = group.chunksCount();

		var ensureGroup = function(group) {
			return group.dist >= dist;
		};
		
		var chunkSize = BlockGroupChunk.CHUNK_SIZE * 100;
		
		for(var i = 0; i < count.x; i++) {
			for(var j = 0; j < count.y; j++) {
				for(var k = 0; k < count.z; k++) {
					var chunk = group.chunk(new THREE.Vector3(i, j, k));

					if(chunk === null) {
						continue;
					}

					var x = i * chunkSize;
					var y = j * chunkSize;
					var z = k * chunkSize;

					var box = new THREE.Box3(new THREE.Vector3(x - offset.x, -(y + chunkSize) - offset.y, z - offset.z), new THREE.Vector3(x + chunkSize + offset.x, -y + offset.y, z + chunkSize + offset.z));

					var result = ray.intersectBox(box);

					if(result) {
						var dist = result.distanceTo(camPos);
					
						ensureInsert(groups, ensureGroup, {group: chunk, dist: dist });
					}
				}
			}
		}

		return groups;
	}

	function intersectingBlock(chunk, cam, mousePos, offset) {
		var groups = [];
		
		var index = chunk.index();

		var camPos = calcGroupPosition(cam, chunk.group());
		
		var ray = createRay(cam, camPos, mousePos);
		
		var ensureGroup = function(group) {
			return group.dist >= dist;
		};
		
		var chunkSize = BlockGroupChunk.CHUNK_SIZE * 100;
		
		for(var i = 0; i < BlockGroupChunk.CHUNK_SIZE; i++) {
			for(var j = 0; j < BlockGroupChunk.CHUNK_SIZE; j++) {
				for(var k = 0; k < BlockGroupChunk.CHUNK_SIZE; k++) {
					var block = chunk.block(new THREE.Vector3(i, j, k));

					if(block === null) {
						continue;
					}

					//var def = block.blockDefinition();

					//var dim = def.dimensions();

					var x = index.x * chunkSize + i * 100;
					var y = index.y * chunkSize + j * 100;
					var z = index.z * chunkSize + k * 100;

					var box = new THREE.Box3(new THREE.Vector3(x - offset.x, -(y + 100) - offset.y, z - offset.z), new THREE.Vector3(x + 100 + offset.x, -y + offset.y, z + 100 + offset.z));

					var result = ray.intersectBox(box);
					
					if(result)
					{
						var dist = result.distanceTo(camPos);
					
						ensureInsert(groups, ensureGroup, {group: block, dist: dist });
					}
				}
			}
		}

		return groups;
	}

	function isBetweenPoints(a) {
		var right = a.box.max.x, left = a.box.min.x, top = -a.box.min.y, bottom = -a.box.max.y;
	
		return ((right >= 0 && left >= 0 && left < right) || (right < 0 && left < 0 && left >= right)) && ((bottom >= 0 && top >= 0 && top < bottom) || (bottom < 0 && top < 0 && top >= bottom));
	}

	function intersectPlane(normalX, normalY, normalZ, constant, ray, camPos, actual, grid, block, dir) {
		var plane = new THREE.Plane(new THREE.Vector3(normalX, normalY, normalZ), -constant);
		
		var result = ray.intersectPlane(plane);
		
		if(result !== null && result.equals(camPos)) {
			result = null;
		}
		
		if(result === null) {
			return null;
		}
		
		var min = new THREE.Vector2();
		var max = new THREE.Vector2();
		
		var counter = 0;
		var set = [THREE.Vector2.prototype.setX, THREE.Vector2.prototype.setY];
		
		if(!normalX) {
			set[counter].call(min, result.x);
			set[counter].call(max, actual.x);
			counter++;
		}
		
		if(!normalY) {
			set[counter].call(min, result.y);
			set[counter].call(max, -actual.y);
			counter++;
		}
		
		if(!normalZ) {
			set[counter].call(min, result.z);
			set[counter].call(max, actual.z);
			counter++;
		}
		
		var box = new THREE.Box2(min, max);
		
		var dist = result.distanceTo(camPos);
		
		return {
			box: box,
			dist: dist,
			point: result,
			success: function () {				
				var dim = block.blockDefinition().dimensions();
				
				function calcByPoint(prop) {
					return Math.floor(result[prop] / actual[prop]);
				}
				
				function calcByGrid(prop) {
					return Math.floor(Math.abs(result[prop] / actual[prop]) * grid[prop]);
				}
				
				function calcByDim(prop) {
					return dim[prop] - 1;
				}
				
				function calcFromNormal(normal, prop) {
					if(normal > 0) {
						return {
							index: calcByDim(prop),
							grid: 0
						};
					}
					
					if(normal < 0) {
						return {
							index: 0,
							grid: 0
						};
					}
					
					return {
						index: calcByPoint(prop),
						grid: calcByGrid(prop)
					};
				}
				
				var row = calcFromNormal(normalY, 'y');
				var colX = calcFromNormal(normalX, 'x');
				var colZ = calcFromNormal(normalZ, 'z');
				
				return {
					block: block,
					index: new THREE.Vector3(colX.index, row.index, colZ.index),
					grid: new THREE.Vector3(colX.grid, row.grid, colZ.grid),
					dir: dir
				};
			}
		};
	}
	
	function DirectionPlane(direction) {
		var normalX, normalY, normalZ, setX, setY;
		
		if(direction === Direction.TOP || direction === Direction.BOTTOM) {
			normalX = 0; normalZ = 0; setX = 'x'; setY = 'z';
			normalY = direction === Direction.TOP ? 1 : -1;
		}
		else if(direction === Direction.LEFT || direction === Direction.RIGHT) {
			normalY = 0; normalZ = 0; setX = 'y'; setY = 'z';
			normalX = direction === Direction.RIGHT ? 1 : -1;
		}
		else if(direction === Direction.FRONT || direction === Direction.BACK) {
			normalX = 0; normalY = 0; setX = 'x'; setY = 'y';
			normalZ = direction === Direction.FRONT ? 1 : -1;
		}
		
		this._p = {
			normalX: normalX,
			normalY: normalY,
			normalZ: normalZ,
			setX: setX,
			setY: setY,
			dir: direction
		};
	}
	
	DirectionPlane.prototype = {
		direction: function() {
			return this._p.dir;
		},
		intersect: function(constant, ray, camPos, actual, grid, block) {
			var plane = new THREE.Plane(new THREE.Vector3(this._p.normalX, this._p.normalY, this._p.normalZ), -constant);
		
			var result = ray.intersectPlane(plane);
			
			if(result !== null && result.equals(camPos)) {
				result = null;
			}
			
			if(result === null) {
				return null;
			}
			
			//camPos.sub(new THREE.Vector3(index.x * 100, -index.y * 100, index.z * 100));
			//camPos.sub(block.chunk().group().position());
			
			var min = new THREE.Vector2();
			var max = new THREE.Vector2();
			
			var set = function(propA, propB) {
				min[propA] = result[propB];
				max[propA] = (propB === 'y' ? -1 : 1) * actual[propB];
			};
			
			set('x', this._p.setX);
			set('y', this._p.setY);
			
			var box = new THREE.Box2(min, max);
			
			var dist = result.distanceTo(camPos);
			
			var normalX = this._p.normalX;
			var normalY = this._p.normalY;
			var normalZ = this._p.normalZ;
			var dir = this._p.dir;
			
			return {
				box: box,
				dist: dist,
				point: result,
				success: function () {				
					var dim = block.blockDefinition().dimensions();
					
					function calcByPoint(prop) {
						return Math.floor(result[prop] / actual[prop]);
					}
					
					function calcByGrid(prop) {
						return Math.floor(Math.abs(result[prop] / actual[prop]) * grid[prop]);
					}
					
					function calcByDim(prop) {
						return dim[prop] - 1;
					}
					
					function calcFromNormal(normal, prop) {
						if(normal > 0) {
							return {
								index: calcByDim(prop),
								grid: 0
							};
						}
						
						if(normal < 0) {
							return {
								index: 0,
								grid: 0
							};
						}
						
						return {
							index: calcByPoint(prop),
							grid: calcByGrid(prop)
						};
					}
					
					var row = calcFromNormal(normalY, 'y');
					var colX = calcFromNormal(normalX, 'x');
					var colZ = calcFromNormal(normalZ, 'z');
					
					return {
						block: block,
						index: new THREE.Vector3(colX.index, row.index, colZ.index),
						grid: new THREE.Vector3(colX.grid, row.grid, colZ.grid),
						dir: dir
					};
				}
			};
		}
	};

	var DirectionPlanes = {
		TOP: new DirectionPlane(Direction.TOP),
		BOTTOM: new DirectionPlane(Direction.BOTTOM),
		LEFT: new DirectionPlane(Direction.LEFT),
		RIGHT: new DirectionPlane(Direction.RIGHT),
		FRONT: new DirectionPlane(Direction.FRONT),
		BACK: new DirectionPlane(Direction.BACK)
	};
	
	function intersectingDirection(block, cam, mousePos, offset, grid) {
		var actual = new THREE.Vector3(100 + offset.x * 2, 100 + offset.y * 2, 100 + offset.z * 2);
		
		var camPos = cam.position.clone();
		
		var index = block.index();

		camPos.sub(new THREE.Vector3(index.x * 100, -index.y * 100, index.z * 100));
		
		var groupPos = block.chunk().group().position().clone();
		groupPos.multiplyScalar(100);
			
		camPos.sub(groupPos);
		
		camPos.x += offset.x;
		camPos.y -= offset.y;
		camPos.z += offset.z;
		
		var ray = createRay(cam, camPos, mousePos);
		
		function intersectPlane2(dirPlane, constant) {
			return dirPlane.intersect(constant, ray, camPos, actual, grid, block);
		}
		
		var top = intersectPlane2(DirectionPlanes.TOP, 0);
		var bottom = intersectPlane2(DirectionPlanes.BOTTOM, actual.y);
		var left = intersectPlane2(DirectionPlanes.LEFT, 0);
		var right = intersectPlane2(DirectionPlanes.RIGHT, actual.x);
		var front = intersectPlane2(DirectionPlanes.FRONT, actual.z);
		var back = intersectPlane2(DirectionPlanes.BACK, 0);

		var plane = [
			top,
			bottom,
			left,
			right,
			front,
			back
		].reduce(function(p, c) {
			if(!p) {
				return c;
			}
			
			if(!c || c.dist > p.dist || !isBetweenPoints(c)) {
				return p;
			}
			
			return c;
		});
		
		return plane.success();
	}
	
	return Gun;
});