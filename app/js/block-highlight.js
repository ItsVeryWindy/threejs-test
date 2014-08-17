/*global define:false */

define(['three', 'pubsub', 'block-direction', 'block-settings'], function (THREE, PubSub, Direction, BlockSettings) {
	var SCALE = 1, highlights = [];

	function BlockHighlight(block) {
		this._p = {
			lines: null,
			quad: null,
			block: block,
			dir: null,
			pShow: true,
			show: false
		};
		
		var node = block.chunk().group().node();

		buildLines.call(this, node);
		buildGuide.call(this, node);
	}
	
	BlockHighlight.prototype = {
		show: function(dir) {
			this._p.show = !this._p.pShow;
		
			if(this._p.dir === dir) {
				return;
			}
		
			this._p.dir = dir;
		
			var node = this._p.block.chunk().group().node();
		
			buildQuad.call(this, node);
		},
		wasShown: function() {
			var result = this._p.pShow !== this._p.show;
			
			this._p.pShow = this._p.show;
			
			return result;
		},
		remove: function() {
			clearLines.call(this);
			clearQuad.call(this);
			clearGuide.call(this);
		},
		block: function() {
			return this._p.block;
		}
	};

	function buildLine(a, b)
	{
		var material = new THREE.LineBasicMaterial({ color: 0xffffff });
		var geometry = new THREE.Geometry();
		
		geometry.vertices.push(a, b);
		
		var line = new THREE.Line(geometry, material);

		this._p.lines.add(line);
	}

	function buildLines(node)
	{
		clearLines.call(this);

		this._p.lines = new THREE.Object3D();

		var position = this._p.block.index();

		var dim = this._p.block.blockDefinition().dimensions();

		var actualX = position.x - 0.01;
		var actualY = -(position.y - 0.01);
		var actualZ = position.z - 0.01;

		var actualX1 = position.x + dim.x * SCALE + 0.01;
		var actualY1 = -(position.y + dim.y * SCALE + 0.01);
		var actualZ1 = position.z + dim.z * SCALE + 0.01;

		buildLine.call(this, new THREE.Vector3(actualX, actualY, actualZ), new THREE.Vector3(actualX1, actualY, actualZ));
		buildLine.call(this, new THREE.Vector3(actualX, actualY, actualZ), new THREE.Vector3(actualX, actualY1, actualZ));
		buildLine.call(this, new THREE.Vector3(actualX, actualY, actualZ), new THREE.Vector3(actualX, actualY, actualZ1));
		buildLine.call(this, new THREE.Vector3(actualX1, actualY, actualZ),new THREE.Vector3(actualX1, actualY1, actualZ));
		buildLine.call(this, new THREE.Vector3(actualX1, actualY, actualZ),new THREE.Vector3(actualX1, actualY, actualZ1));
		buildLine.call(this, new THREE.Vector3(actualX, actualY1, actualZ),new THREE.Vector3(actualX1, actualY1, actualZ));
		buildLine.call(this, new THREE.Vector3(actualX, actualY1, actualZ),new THREE.Vector3(actualX, actualY1, actualZ1));
		buildLine.call(this, new THREE.Vector3(actualX, actualY, actualZ1),new THREE.Vector3(actualX1, actualY, actualZ1));
		buildLine.call(this, new THREE.Vector3(actualX, actualY, actualZ1),new THREE.Vector3(actualX, actualY1, actualZ1));
		buildLine.call(this, new THREE.Vector3(actualX1, actualY, actualZ1), new THREE.Vector3(actualX1, actualY1, actualZ1));
		buildLine.call(this, new THREE.Vector3(actualX, actualY1, actualZ1), new THREE.Vector3(actualX1, actualY1, actualZ1));
		buildLine.call(this, new THREE.Vector3(actualX1, actualY1, actualZ), new THREE.Vector3(actualX1, actualY1, actualZ1));

		node.add(this._p.lines);
	}

	function buildGuide()
	{
		return;
	
		/*clearBlock();

		block = new THREE.Object3D();

		var index = info.block.index();

		switch (info.dir)
		{
			case Direction.TOP: index.y--; break;
			case Direction.BOTTOM: index.y++; break;
			case Direction.LEFT: index.x--; break;
			case Direction.RIGHT: index.x++; break;
			case Direction.FRONT: index.z++; break;
			case Direction.BACK: index.z--; break;
		}

		var def = info.block.blockDefinition();

		var defDim = def.dimensions();

		var center = new THREE.Vector3(index.x + defDim.x / 2.0, -index.y - defDim.y / 2.0, index.z + defDim.z / 2.0);

		center.multiplyScalar(BlockSettings.BLOCK_SIZE);
		
		var scale = new THREE.Vector3(BlockSettings.SCALE);

		block.position.copy(center);
		block.scale(scale);

		for(var i = 0; i < def.sidesCount(); i++)
		{
			var side = def.side(i);

			var ent = side.createEntity('', true);

			block.add(ent);
		}*/
	}

	function buildQuad(node)
	{
		clearQuad.call(this);

		this._p.quad = new THREE.Object3D();

		var a = new THREE.Vector3();
		var b = new THREE.Vector3();
		var c = new THREE.Vector3();
		var d = new THREE.Vector3();

		var position = this._p.block.index();

		var index = new THREE.Vector3(0/*this->info.index.x*/, 0/*this->info.index.y*/, 0/*this->info.index.z*/);// this->info.index;

		var scale = BlockSettings.BLOCK_SIZE * BlockSettings.SCALE;
		
		var actualX = position.x * scale + index.x + 0.01;
		var actualY = -(position.y * scale + index.y + 0.01);
		var actualZ = position.z * scale + index.z + 0.01;

		var offset = 1;//0.2;
		
		var actualX1 = position.x * scale + index.x + scale - 0.01;
		var actualY1 = -(position.y * scale + index.y + scale - 0.01);
		var actualZ1 = position.z * scale + index.z + scale - 0.01;

		switch (this._p.dir)
		{
			case Direction.BACK:

				actualZ -= offset;

				a = new THREE.Vector3(actualX,actualY,actualZ);
				b = new THREE.Vector3(actualX1,actualY,actualZ);
				c = new THREE.Vector3(actualX1,actualY1,actualZ);
				d = new THREE.Vector3(actualX,actualY1,actualZ);
			break;
			case Direction.FRONT:

				actualZ1 += offset;

				d = new THREE.Vector3(actualX,actualY,actualZ1);
				c = new THREE.Vector3(actualX1,actualY,actualZ1);
				b = new THREE.Vector3(actualX1,actualY1,actualZ1);
				a = new THREE.Vector3(actualX,actualY1,actualZ1);
			break;
			case Direction.LEFT:

				actualX -= offset;

				a = new THREE.Vector3(actualX,actualY,actualZ);
				b = new THREE.Vector3(actualX,actualY1,actualZ);
				c = new THREE.Vector3(actualX,actualY1,actualZ1);
				d = new THREE.Vector3(actualX,actualY,actualZ1);
			break;
			case Direction.RIGHT:

				actualX1 += offset;

				d = new THREE.Vector3(actualX1,actualY,actualZ);
				c = new THREE.Vector3(actualX1,actualY1,actualZ);
				b = new THREE.Vector3(actualX1,actualY1,actualZ1);
				a = new THREE.Vector3(actualX1,actualY,actualZ1);
			break;
			case Direction.TOP:

				actualY += offset;

				d = new THREE.Vector3(actualX,actualY,actualZ);
				c = new THREE.Vector3(actualX1,actualY,actualZ);
				b = new THREE.Vector3(actualX1,actualY,actualZ1);
				a = new THREE.Vector3(actualX,actualY,actualZ1);
			break;
			case Direction.BOTTOM:

				actualY1 -= offset;

				a = new THREE.Vector3(actualX,actualY1,actualZ);
				b = new THREE.Vector3(actualX1,actualY1,actualZ);
				c = new THREE.Vector3(actualX1,actualY1,actualZ1);
				d = new THREE.Vector3(actualX,actualY1,actualZ1);
			break;
		}

		var geometry = new THREE.Geometry();

		geometry.vertices.push(a);
		geometry.vertices.push(b);
		geometry.vertices.push(c);
		geometry.vertices.push(d);
		
		geometry.faces.push(new THREE.Face3(0, 1, 2));
		geometry.faces.push(new THREE.Face3(0, 2, 3));

		//geometry.computeCentroids();
		//geometry.computeFaceNormals();
		//geometry.computeVertexNormals();
		
		var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, wireframe: true } );
		var mesh = new THREE.Mesh(geometry, material);
		
		this._p.quad.add(mesh);
		node.add(this._p.quad);
	}

	function fetch(block) {
		for(var i = 0; i < highlights.length; i++) {
			var highlight = highlights[i];
			
			if(highlight.block() === block) {
				return highlight;
			}
		}
		
		return null;
	}
	
	PubSub.subscribe('block-highlighted', function(msg, data) {
		var i, highlight;
		
		for(i = 0; i < data.length; i++) {
			var item = data[i];
			
			highlight = fetch(item.block);
			
			if(highlight) {
				highlight.show(item.dir);
				continue;
			}
			
			highlight = new BlockHighlight(item.block);
			
			highlight.show(item.dir);
			
			highlights.push(highlight);
		}
		
		for(i = 0; i < highlights.length; i++) {
			highlight = highlights[i];
			
			if(highlight.wasShown()) {
				continue;
			}
			
			highlight.remove();
			
			highlights.splice(i, 1);
			
			i--;
		}
	});

	PubSub.subscribe('block-diminished', function() {
		for(var i = 0; i < highlights.length; i++) {
			highlights[i].remove();
		}
		
		highlights.length = 0;
	});

	function clearLines()
	{
		if(this._p.lines)
		{
			this._p.lines.parent.remove(this._p.lines);
			this._p.lines = null;
		}
	}

	function clearQuad()
	{
		if(this._p.quad)
		{
			this._p.quad.parent.remove(this._p.quad);
			this._p.quad = null;
		}
	}

	function clearGuide()
	{
		if(this._p.guide)
		{
			this._p.guide.parent.remove(this._p.guide);
			this._p.guide = null;
		}
	}
});