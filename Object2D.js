"use strict";

/**
 * Class for 2-dimensional objects on the game map
 */
function Object2D(fname, pos, rot)
{
	/// File name of the definition file
	this.def_fname = fname;
	/// Position of the object
	this.position = pos;
	/// Orientation of the object
	this.rotation = rot;

	/// Vertices for this object
	this.vertices = null;
	/// Texture coordinates for this object
	this.texture_coords = null;
}

/// Calculate the transformation matrix and coordinate buffers
Object2D.prototype.setDefinition = function(def)
{
	if (def.type == Object2DDefCache.Type.PLANT)
	{
		this.rot[0] += 90;
		this.rot[2] = -this.rot[2];
	}
	else if (def.type == Object2DDefCache.Type.FENCE)
	{
		this.rot[0] += 90;
	}

	var transform = mat4.create();
	mat4.identity(transform);
	mat4.translate(transform, transform, this.position);
	mat4.rotateZ(transform, transform, this.rotation[2]*Math.PI/180);
	mat4.rotateX(transform, transform, this.rotation[0]*Math.PI/180);
	mat4.rotateY(transform, transform, this.rotation[1]*Math.PI/180);

	var x0 = -0.5 * def.width;
	var x1 = x0 + def.width;
	var y0 = def.type == Object2DDefCache.Type.GROUND ? -0.5 * def.height : 0.0;
	var y1 = y0 + def.height;

	var body_vertices = [
		vec3.fromValues(x0, y0, 0),
		vec3.fromValues(x0, y1, 0),
		vec3.fromValues(x1, y1, 0),
		vec3.fromValues(x1, y0, 0)
	];
	this.vertices = [];
	for (var i = 0; i < body_vertices.length; ++i)
	{
		var v = vec3.create();
		vec3.transformMat4(v, body_vertices[i], transform);
		this.vertices.push(v[0]);
		this.vertices.push(v[1]);
		this.vertices.push(v[2]);
	}
	this.texture_coords = [
		def.u_start, def.v_start,
		def.u_start, def.v_end,
		def.u_end,   def.v_end,
		def.u_end,   def.v_start
	];
}
