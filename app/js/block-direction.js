/*global define:false */

define(function () {
	var BlockDirection = {
		NONE:        0,
		BACK:        2,
		BOTTOM:      4,
		FRONT:       8,
		LEFT:       16,
		RIGHT:      32,
		TOP:        64,
		UNIFORM:    128,
		NONUNIFORM: 256
	};
	
	return BlockDirection;
});