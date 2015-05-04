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
	this.def = null;
	/// Vertices for this object
	this.vertex_buffer = null;
	/// Texture coordinates for this object
	this.texture_coord_buffer = null;

	// Get the object definition from the cache
	object_2d_def_cache.get(fname, this);
}

/// Calculate the transformation matrix and coordinate buffers
Object2D.prototype.setDefinition = function(def)
{
	this.def = def;

	if (this.def.type == Object2DDefCache.Type.PLANT)
	{
		this.rot[0] += 90;
		this.rot[2] = -this.rot[2];
	}
	else if (this.def.type == Object2DDefCache.Type.FENCE)
	{
		this.rot[0] += 90;
	}

	var transform = mat4.create();
	mat4.identity(transform);
	mat4.translate(transform, transform, this.position);
	mat4.rotateZ(transform, transform, this.rotation[2]*Math.PI/180);
	mat4.rotateX(transform, transform, this.rotation[0]*Math.PI/180);
	mat4.rotateY(transform, transform, this.rotation[1]*Math.PI/180);

	var x0 = -0.5 * this.def.width;
	var x1 = x0 + this.def.width;
	var y0 = this.def.type == Object2DDefCache.Type.GROUND ? -0.5 * this.def.height : 0.0;
	var y1 = y0 + this.def.height;

	vertices = [
		x0, y0, 0,
		x0, y1, 0,
		x1, y1, 0,
		x0, y0, 0,
		x1, y1, 0,
		x1, y0, 0
	];
	transformed_vertices = [];
	for (var i = 0; i < vertices.length; i += 3)
	{
		v = vec3.fromValues(vertices[i], vertices[i+1], vertices[i+2]);
		vec3.transformMat4(v, v, transform);
		transformed_vertices.push(v[0]);
		transformed_vertices.push(v[1]);
		transformed_vertices.push(v[2]);
	}
	this.vertex_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(transformed_vertices),
		gl.STATIC_DRAW);
	texture_coords = [
		this.def.u_start, this.def.v_start,
		this.def.u_start, this.def.v_end,
		this.def.u_end, this.def.v_end,
		this.def.u_start, this.def.v_start,
		this.def.u_end, this.def.v_end,
		this.def.u_end, this.def.v_start
	];
	this.texture_coord_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_coord_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texture_coords), gl.STATIC_DRAW);
}

/// Draw a 2d object
Object2D.prototype.draw = function()
{
	if (!this.def)
		// Definition still not loaded
		return;

	gl.uniform1f(shaders.program.alpha_low, this.def.alpha_test);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
	gl.vertexAttribPointer(shaders.program.vertexPositionAttribute, 3,
		gl.FLOAT, false, 0, 0);

	gl.bindTexture(gl.TEXTURE_2D, this.def.texture);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_coord_buffer);
	gl.vertexAttribPointer(shaders.program.textureCoordAttribute, 2,
		gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.TRIANGLES, 0, 6);
}
