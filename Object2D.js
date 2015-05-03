/**
 * Class for 2-dimensional objects on the game map
 */
function Object2D(fname, pos, rot)
{
	/// Position of the object
	this.position = pos;
	/// Orientation of the object
	this.rotation = rot;
	/// Object definition
	this.def = object_2d_def_cache.get(fname);
}

/// Draw a 2d object
Object2D.prototype.draw = function()
{
	if (!this.def.texture)
		// Definition not loaded
		return;

	
}
