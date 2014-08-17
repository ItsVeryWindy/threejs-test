/*global define:false */

define(function () {
	function BlockDefinition(dim, sides) {
		this._p = {
			dim: dim,
			sides: sides.slice()
		};
	}

	BlockDefinition.prototype.sideByIndex = function(index)
	{
		return this._p.sides[index];
	};

	BlockDefinition.prototype.sideByDirection = function(dir)
	{
		var count = this._p.sides.length;

		for(var i = 0; i < count; i++)
		{
			var side = this._p.sides[i];

			/*jshint bitwise: false*/
			if((side.directions() & dir) === dir) {
				return side;
			}
			/*jshint bitwise: true*/
		}
		
		return null;
	};

	BlockDefinition.prototype.sidesCount = function()
	{
		return this._p.sides.length;
	};

	BlockDefinition.prototype.dimensions = function()
	{
		return this._p.dim;
	};
	
	return BlockDefinition;
});