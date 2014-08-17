/*global define:false */

define(['three', 'pubsub'], function (/*THREE, PubSub*/) {
	function BlockMergeIterator(blocks, blockCheck, side, start, end)
	{
		this._p = {
			blocks: blocks,
			blockCheck: blockCheck,
			dir: side.directions(),
			start: start.clone(),
			end: end.clone(),

			side: side,
			
			relHIndex: side.horizontal(), //Index3(1,0,0);//this->ConvertDirectionToRelativeHorizontal(Direction::TOP);
			relVIndex: side.vertical(), //Index3(0,0,1);//this->ConvertDirectionToRelativeVertical(Direction::TOP);

			index: start.clone(),

			hasNext: true,
			isLastHorizontal: false,
			isLastVertical: false,
			first: true
		};
	}
	
	BlockMergeIterator.prototype = {
		hasNext: function() {
			return this._p.hasNext;
		},
		isLastHorizontal: function() {
			if(!this._p.first) {
				if(this._p.relHIndex.x !== 0 && this._p.index.x >= this._p.lastHorizontal.x) {
					return true;
				}
				
				if(this._p.relHIndex.y !== 0 && this._p.index.y >= this._p.lastHorizontal.y) {
					return true;
				}
				
				if(this._p.relHIndex.z !== 0 && this._p.index.z >= this._p.lastHorizontal.z) {
					return true;
				}
			}

			return isLast.call(this, this._p.index, this._p.relHIndex);
		},
		isLastVertical: function() {
			return isLast.call(this, this._p.start, this._p.relVIndex);
		},
		gotoNextVertical: function() {
			var isLastVertical = this.isLastVertical();

			if(isLastVertical) {
				return false;
			}

			if(this._p.first) {
				this._p.first = false;
			}

			this._p.lastHorizontal = this._p.index;

			this._p.start.add(this._p.relVIndex);
				
			this._p.index = this._p.start.clone();

			return true;
		},
		fetch: function() {
			return this._p.index;
		},
		next: function() {
			var isLastHorizontal = this.isLastHorizontal();

			if(isLastHorizontal) {
				var isLastVertical = this.gotoNextVertical();

				if(!isLastVertical) {
					this._p.hasNext = false;
				}
			} else {
				this._p.index.add(this._p.relHIndex);
			}
		}
	};
	
	function isLast(index, rel) {
		var next = new THREE.Vector3();
		
		next.addVectors(index, rel);

		if(next.x > this._p.end.x) {
			return true;
		}

		if(next.y > this._p.end.y) {
			return true;
		}

		if(next.z > this._p.end.z) {
			return true;
		}

		var nextBlock = this._p.blocks[next.x][next.y][next.z];
		
		if(nextBlock === null) {
			return true;
		}
		
		var side = nextBlock.blockDefinition().sideByDirection(this._p.dir);
		
		if(side !== this._p.side) {
			return true;
		}

		/*jshint bitwise: false*/
		if((this._p.blockCheck[next.x][next.y][next.z] & this._p.dir) === this._p.dir) {
			return true;
		}
		/*jshint bitwise: true*/

		return false;
	}
	
	return BlockMergeIterator;
});