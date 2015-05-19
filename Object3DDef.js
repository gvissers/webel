"use strict";

function Object3DDef()
{
	/// Whether this definition has been fully loaded yet
	this.loaded = false;

	this.vertices = null;
	this.texture_coords = null;
	this.normals = null;
	this.color = null;

	/// WebGL vertex buffer
	this.vertex_buffer = null;
	/// WebGL texture coordinate buffer
	this.texture_coord_buffer = null;
	/// WebGL normal buffer. May be null if no normals are used.
	this.normal_buffer = null;
	/// WebGL color buffer. May be null if no vertex colors are used.
	this.color_buffer = null;
	/// Type of elements in the index buffer
	this.index_type = null;
	/// Size of an element in the index buffer
	this.index_size = null;
	/// vertex indices for this 3D object
	this.index_buffer = null;
	/// materials for this 3D object
	this.materials = null;
}

/// Supported version numbers for the 3d object definitions
Object3DDef.Version = {
	VERSION_1_0: 0x0001,
	VERSION_1_1: 0x0101
};
/// Options for the vertices in the file data
Object3DDef.VertexOptions = {
	HAS_NORMAL: 0x01,
	HAS_TANGENT: 0x02,
	HAS_SECONDARY_TEXTURE_COORDINATE: 0x04,
	HAS_COLOR: 0x08,
	OPTION_1_0_MASK: 0x07,
	OPTION_1_1_MASK: 0x0f
};
/// Options for the way vertices are stored in the file data
Object3DDef.VertexFormat = {
	HALF_POSITION: 0x01,
	HALF_UV: 0x02,
	HALF_EXTRA_UV: 0x04,
	HALF_MASK: 0x07,
	COMPRESSED_NORMAL: 0x08,
	SHORT_INDEX: 0x10,
	FORMAT_MASK: 0x1f
};

/// The maximum length of a texture file name in a 3d object definition file
Object3DDef.material_texture_name_size = 128;
/// The size of a material in a 3d object definition file
Object3DDef.material_data_size = 172;

/**
 * Create a new 3D object definition
 *
 * Parse the data @a data received from the server, and create a new object
 * definition from it.
 */
Object3DDef.prototype.create = function(data)
{
	var view = new DataView(data);

	if (view.getUint32(0, true) != fourCC("e3dx"))
	{
		logError("Not a 3d object definition");
		return;
	}

	var version = view.getUint32(4, true);
	if (version != Object3DDef.Version.VERSION_1_0
		&& version != Object3DDef.Version.VERSION_1_1)
	{
		logError("Unsupported e3d version " + version);
		return;
	}

	var hash = new Uint8Array(data, 8, 16);
	var offset = view.getUint32(24, true);

	var vertex_count = view.getUint32(offset, true);
	var vertex_size = view.getUint32(offset+4, true);
	var vertex_offset = view.getUint32(offset+8, true);
	var index_count = view.getUint32(offset+12, true);
	var index_size = view.getUint32(offset+16, true);
	var index_offset = view.getUint32(offset+20, true);
	var material_count = view.getUint32(offset+24, true);
	var material_size = view.getUint32(offset+28, true);
	var material_offset = view.getUint32(offset+32, true);
	var vertex_options = view.getUint8(offset+36);
	var vertex_format = view.getUint8(offset+37);

	switch (version)
	{
		case Object3DDef.Version.VERSION_1_0:
			vertex_options |= Object3DDef.VertexOptions.HAS_NORMAL;
			vertex_options &= Object3DDef.VertexOptions.OPTION_1_0_MASK;
			vertex_format = 0;
			break;
		case Object3DDef.Version.VERSION_1_1:
			vertex_options &= Object3DDef.VertexOptions.OPTION_1_1_MASK;
			vertex_format &= Object3DDef.VertexFormat.FORMAT_MASK;
			break;
	}

	if (vertex_size != this.calcVertexSize(vertex_options, vertex_format))
	{
		logError("Incorrect vertex size");
		return;
	}
	if (material_size != this.calcMaterialSize(vertex_options))
	{
		logError("Incorrect material size");
		return;
	}
	if (index_size != ((vertex_format & Object3DDef.VertexFormat.SHORT_INDEX) ? 2 : 4))
	{
		logError("Incorrect index size");
		return;
	}

	this.readVertices(view, vertex_offset, vertex_count,
		vertex_format, vertex_options);

	this.vertex_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

	this.texture_coord_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_coord_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.texture_coords, gl.STATIC_DRAW);

	if (vertex_options & Object3DDef.VertexOptions.HAS_NORMAL)
	{
		this.normal_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
	}

	if (vertex_options & Object3DDef.VertexOptions.HAS_COLOR)
	{
		this.color_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
	}

	this.index_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
	if (index_count <= 0xffff)
	{
		this.index_type = gl.UNSIGNED_SHORT;
		this.index_size = 2;
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
			new Uint16Array(data, index_offset, index_count), gl.STATIC_DRAW);
	}
	else
	{
		this.index_type = gl.UNSIGNED_INT;
		this.index_size = 4;
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
			new Uint32Array(data, index_offset, index_count), gl.STATIC_DRAW);
	}

	this.materials = this.readMaterials(view, material_offset, material_count,
		material_size);

	this.loaded = true;
};

/**
 * Compute the size of vertex
 *
 * Compute the size of a single vertex in this definition, given vertex
 * options @a options and vertex format @a format.
 * @param options The vertex options used in this file
 * @param format  The vertex format used in this file
 * @return The size of a vertex in bytes
 */
Object3DDef.prototype.calcVertexSize = function(options, format)
{
	var size = 0;

	size += (format & Object3DDef.VertexFormat.HALF_POSITION) ? 3*2 : 3*4;
	size += (format & Object3DDef.VertexFormat.HALF_UV) ? 2*2 : 2*4;
	if (options & Object3DDef.VertexOptions.HAS_NORMAL)
		size += (format & Object3DDef.VertexFormat.COMPRESSED_NORMAL) ? 2 : 3*4;
	if (options & Object3DDef.VertexOptions.HAS_TANGENT)
		size += (format & Object3DDef.VertexFormat.COMPRESSED_NORMAL) ? 2 : 3*4;
	if (options & Object3DDef.VertexOptions.HAS_SECONDARY_TEXTURE_COORDINATE)
		size += (format & Object3DDef.VertexFormat.HALF_EXTRA_UV) ? 2*2 : 2*4;
	if (options & Object3DDef.VertexOptions.HAS_COLOR)
		size += 4;

	return size;
}

/**
 * Compute the size of a material in this definition, given vertex option @a options
 */
Object3DDef.prototype.calcMaterialSize = function(options)
{
	var size = Object3DDef.material_data_size;
	if (options & Object3DDef.VertexOptions.HAS_SECONDARY_TEXTURE_COORDINATE)
		size += 128;
	return size;
}

/**
 * Read the vertices from the e3d data
 */
Object3DDef.prototype.readVertices = function(view, off, count, format, options)
{
	this.vertices = new Float32Array(count*3);
	this.texture_coords = new Float32Array(count*2);
	if (options & Object3DDef.VertexOptions.HAS_NORMAL)
		this.normals = new Float32Array(count*3);
	if (options & Object3DDef.VertexOptions.HAS_COLOR)
		this.color = new Uint8Array(count*4);

	var vertices = [];
	for (var i = 0; i < count; ++i)
	{
		if (format & Object3DDef.VertexFormat.HALF_UV)
		{
			var hu = view.getUint16(off, true);
			var hv = view.getUint16(off+2, true);
			this.texture_coords[2*i+0] = half_lut.lookup(hu);
			this.texture_coords[2*i+1] = half_lut.lookup(hv);
			off += 2*2;
		}
		else
		{
			this.texture_coords[2*i+0] = view.getFloat32(off, true);
			this.texture_coords[2*i+1] = view.getFloat32(off+4, true);
			off += 2*4;
		}

		if (options & Object3DDef.VertexOptions.HAS_SECONDARY_TEXTURE_COORDINATE)
			// skip secondary texture coordinates
			off += (format & Object3DDef.VertexFormat.HALF_EXTRA_UV) ? 2*2 : 2*4;

		if (options & Object3DDef.VertexOptions.HAS_NORMAL)
		{
			if (format & Object3DDef.VertexFormat.COMPRESSED_NORMAL)
			{
				var cnormal = view.getUint16(off, true);
				var normal = this.uncompressNormal(cnormal);
				this.normals[3*i+0] = normal[0];
				this.normals[3*i+1] = normal[1];
				this.normals[3*i+2] = normal[2];
				off += 2;
			}
			else
			{
				this.normals[3*i+0] = view.getFloat32(off, true);
				this.normals[3*i+1] = view.getFloat32(off+4, true);
				this.normals[3*i+2] = view.getFloat32(off+8, true);
				off += 3*4;
			}
		}

		if (options & Object3DDef.VertexOptions.HAS_TANGENT)
			off += (format & Object3DDef.VertexFormat.COMPRESSED_NORMAL) ? 2 : 3*4;

		if (format & Object3DDef.VertexFormat.HALF_POSITION)
		{
			var hx = view.getUint16(off, true);
			var hy = view.getUint16(off+2, true);
			var hz = view.getUint16(off+4, true);
			this.vertices[3*i+0] = half_lut.lookup(hx);
			this.vertices[3*i+1] = half_lut.lookup(hy);
			this.vertices[3*i+2] = half_lut.lookup(hz);
			off += 3*2;
		}
		else
		{
			this.vertices[3*i+0] = view.getFloat32(off, true);
			this.vertices[3*i+1] = view.getFloat32(off+4, true);
			this.vertices[3*i+2] = view.getFloat32(off+8, true);
			off += 3*4;
		}

		if (options & Object3DDef.VertexOptions.HAS_COLOR)
		{
			this.color[4*i+0] = view.getUint32(off);
			this.color[4*i+1] = view.getUint32(off+1);
			this.color[4*i+2] = view.getUint32(off+2);
			this.color[4*i+3] = view.getUint32(off+3);
			off += 4;
		}
	}
};

/**
 * Read definitions of the materials of this 3d object definition from the data
 */
Object3DDef.prototype.readMaterials = function(view, off, count, size)
{
	var materials = [];
	for (var i = 0; i < count; ++i, off += size)
	{
		var options = view.getUint32(off, true);
		var texture_fname = "3dobjects/"
			+ extractString(view, off+4, Object3DDef.material_texture_name_size);
		var min_pos = new Float32Array(view, off+132, 3);
		var max_pos = new Float32Array(view, off+144, 3);
		var min_vert_idx = view.getUint32(off+156, true);
		var max_vert_idx = view.getUint32(off+160, true);
		var index = view.getUint32(off+164, true);
		var mat_count = view.getUint32(off+168, true);

		materials.push(new Material(options, texture_fname, min_pos, max_pos,
			min_vert_idx, max_vert_idx, index, mat_count));
	}

	return materials;
}

/**
 * Uncompress a compressed normal
 */
Object3DDef.prototype.uncompressNormal = function(cnormal)
{
    var x = (cnormal & 0x1f80) >> 7;
    var y = cnormal & 0x007f;

    // map the numbers back to the triangle (0,0)-(0,126)-(126,0)
    if (x + y >= 127)
    {
        x = 127 - x;
        y = 127 - y;
    }

    var res = vec3.fromValues(x, y, 126 - x - y);

    // set all the sign bits
    if (cnormal & 0x8000)
		res[0] = -res[0];
    if (cnormal & 0x4000)
        res[1] = -res[1];
    if (cnormal & 0x2000)
        res[2] = -res[2];

    vec3.normalize(res, res);

    return res;
};

/**
 * Draw a 3D object definition. The position and orientation of the object
 * should be set through the model view matrix
 */
Object3DDef.prototype.draw = function()
{
	if (!this.loaded)
		// Definition not loaded from server yet
		return;

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
	gl.vertexAttribPointer(shaders.program.vertexPositionAttribute, 3,
		gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_coord_buffer);
	gl.vertexAttribPointer(shaders.program.textureCoordAttribute, 2,
		gl.FLOAT, false, 0, 0);

	if (this.normals)
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
		gl.vertexAttribPointer(shaders.program.vertexNormalAttribute, 3,
			gl.FLOAT, false, 0, 0);
	}

	if (this.colors)
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
		gl.vertexAttribPointer(shaders.program.vertexColorAttribute, 4,
			gl.UNSIGNED_BYTE, false, 0, 0);
	}

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);

	for (var i = 0; i < this.materials.length; ++i)
	{
		var material = this.materials[i];
		var alpha_low;

		if (material.isTransparent())
			alpha_low = this.normals ? 0.30 : 0.23;
		else
			alpha_low = 1.0;
		gl.uniform1f(shaders.program.alpha_low, alpha_low);

		gl.bindTexture(gl.TEXTURE_2D, material.texture);
		gl.drawElements(gl.TRIANGLES, material.count, this.index_type,
            material.index*this.index_size);
	}
}
