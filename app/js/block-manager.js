/*global define:false */

define(['three', 'block-direction', 'block-settings', 'block-definition', 'block-side-definition'], function (THREE, Direction, BlockSettings, BlockDefinition, BlockSideDefinition) {

	function BlockManager() {
		this._p = {
			sides: {},
			definitions: {}
		};
	}

	BlockManager.prototype = {
		definition: function(sides, block) {
			var def = getDefinition.call(this, sides, block);
			
			if(def) {
				return def;
			}
			
			def = createDefinition.call(this, sides, block);
			
			return def;
		}
	};

	function getKey(dir, color) {
		return dir.toString() + color.toString();
	}
	
	function getSide(dir, color) {
		var key = getKey(dir, color);
	
		var side = this._p.sides[key];
		
		if(!side) {
			side = createSide.call(this, dir, color);
			
			this._p.sides[key] = side;
		}
		
		return side;
	}
	
	function getDefinition(sides, block) {
		var key = '';
		
		for(var i in sides) {
			var side = sides[i];
		
			if(!side) {
				side = block.blockDefinition().sideByDirection(Direction[i]).color;
			}
		
			key += getKey(Direction[i], side);
		}
		
		return this._p.definitions[key] || null;
	}
	
	function createDefinition(sides, block) {
		var defKey = '', sidesArr = [];
		
		for(var i in sides) {
			var side = sides[i];
		
			if(!side) {
				side = block.blockDefinition().sideByDirection(Direction[i]).color;
			}
			
			var sideKey = getKey(Direction[i], side);
			
			side = getSide.call(this, Direction[i], side);
			
			sidesArr.push(side);
			
			defKey += sideKey;
		}
		
		var def = new BlockDefinition(new THREE.Vector3(1, 1, 1), sidesArr);
		
		this._p.definitions[defKey] = def;
		
		return def;
	}
	
	function createSide(dir, color) {
		switch(dir) {
			case Direction.TOP: return createSide2(0,100,0,-90,0,0,    1,0,0,0,0,1,Direction.TOP, color);
			case Direction.BOTTOM: return createSide2(0,-100,0,90,0,0, 1,0,0,0,0,1,Direction.BOTTOM, color);
			case Direction.LEFT: return createSide2(-100,0,0,0,-90,0,  0,1,0,0,0,1,Direction.LEFT, color);
			case Direction.RIGHT: return createSide2(100,0,0,0,90,0,   0,1,0,0,0,1,Direction.RIGHT, color);
			case Direction.FRONT: return createSide2(0,0,100,0,0,0,    1,0,0,0,1,0,Direction.FRONT, color);
			case Direction.BACK: return createSide2(0,0,-100,180,0,0,  1,0,0,0,1,0,Direction.BACK, color);
		}
	}
	
	function createSide2(a, b, c, d, e, f, g, h, i, j, k, l, dir, color) {
		var geometry = new THREE.PlaneGeometry(200, 200);
		var material = new THREE.MeshLambertMaterial( {color: color, side: THREE.DoubleSide} );
	
		matrix = new THREE.Matrix4();
		matrix.makeRotationX(d * Math.PI / 180);
		geometry.applyMatrix(matrix);
		
		matrix = new THREE.Matrix4();
		matrix.makeRotationY(e * Math.PI / 180);
		geometry.applyMatrix(matrix);
		
		matrix = new THREE.Matrix4();
		matrix.makeRotationZ(f * Math.PI / 180);
		geometry.applyMatrix(matrix);
	
		var matrix = new THREE.Matrix4();
		matrix.makeTranslation(a,b,c);
		geometry.applyMatrix(matrix);
		
		var plane = new THREE.Mesh(geometry, material);
		
		var side = new BlockSideDefinition(plane, new THREE.Vector3(g, h, i), new THREE.Vector3(j, k, l), dir, true);
		
		side.color = color;
		
		return side;
	}
	
	return new BlockManager();
});