"use strict";

function Object3D(fname, pos, rot, col, scale, self_lit, blended)
{
	/// Position of the object
	this.position = pos;
	/// Orientation of the object
	this.rotation = rot;
	/// Color of the object
	this.color = col;
	/// Scale factor of the object
	this.scale = scale;
	/// Whether this object is self-lit
	this.self_lit = self_lit;
	/// Whether this object blends with other objects
	this.blended = blended;

	/// Get the object definition for this object
	this.def = object_3d_def_cache.get(fname);
}
