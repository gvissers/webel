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

	/// Transformation matrix for the vertices
	this.transform = calculateTransformationMatrix(pos, rot);

	/// Bounding box for this object
	this.bounding_box = new BoundingBox;

	/// Get the object definition for this object
	this.def = null;
	var this_obj = this;
	object_3d_def_cache.get(fname, function(def) { this_obj.setDefinition(def); });
}

/// Draw this 3D object
Object3D.prototype.draw = function()
{
	if (!this.def)
		// Definition not loaded yet
		return;

	model_view_matrix.push();
	model_view_matrix.multiply(this.transform);
	model_view_matrix.setUniform();

	this.def.draw();

	model_view_matrix.pop();
};

/// Set the object definition for this 3D object, and calculate its bounding box
Object3D.prototype.setDefinition = function(def)
{
	this.def = def;

	var vs = def.vertices;
	for (var i = 0; i < vs.length; i += 3)
	{
		var v = vec3.fromValues(vs[i], vs[i+1], vs[i+2]);
		vec3.transformMat4(v, v, this.transform);
		this.bounding_box.update(v);
	}
};
