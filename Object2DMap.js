"use strict";

/**
 * Class for the collection of 2D objects on a map
 */
function Object2DMap()
{
	/// 2D objects, collected per definition
	this.objects_for_def = {};
	/// Total number of objects in this collection
	this.nr_objects = 0;

	/// Total number of objects for which definitions were loaded
	this.nr_objects_loaded = 0;

	/// Vertices for all objects in the file
	this.vertices = null;
	/// Texture coordinates for all objects in the file
	this.texture_coords = null;
	/// Vertex indices for all objects in the file
	this.indices = null;

	/// WebGL buffer for the object vertices
	this.vertex_buffer = gl.createBuffer();
	/// WebGL buffer for the texture coordinates
	this.texture_coord_buffer = gl.createBuffer();
	/// WebGL buffer for the element indices
	this.index_buffer = gl.createBuffer();
}

/// Add the 2d object @a obj to this map
Object2DMap.prototype.add = function(obj)
{
	var fname = obj.def_fname;
	if (!(fname in this.objects_for_def))
	{
		this.objects_for_def[fname] = {
			def: null,
			objects: [],
			count: 0,
			offset: 0
		};
	}
	this.objects_for_def[fname].objects.push(obj);
	this.nr_objects++;
}

/**
 * Get the object definitions for all objects on this map.
 */
Object2DMap.prototype.setAllDefinitions = function()
{
	this.vertices = new Float32Array(4 * 3 * this.nr_objects);
	this.texture_coords = new Float32Array(4 * 2 * this.nr_objects);
	this.indices = new Uint16Array(2 * 3 * this.nr_objects);
	this.nr_objects_loaded = 0;

	var this_obj = this;
	for (var fname in this.objects_for_def)
	{
		(function(local_fname) {
			object_2d_def_cache.get(local_fname, function (def) {
				this_obj.setDefinition(local_fname, def);
			})
		})(fname);
	}
}

/**
 * Use a definition
 *
 * Once a definition of a 2D object is loaded from the definition cache,
 * this function is called to calculate the vertices and texture coordinates
 * of the objects using this definitions.
 * @param fname The file name of the definition
 * @param def   The 2D object definition
 */
Object2DMap.prototype.setDefinition = function(fname, def)
{
	var sq_idx = [0, 1, 2,   0, 2, 3];
	var od = this.objects_for_def[fname];
	var objs = od.objects;

	od.def = def;
	od.offset = 2 * 3 * 2 * this.nr_objects_loaded;
	od.count = 2 * 3 * objs.length;

	for (var i = 0; i < objs.length; ++i)
	{
		objs[i].setDefinition(def);

		for (var j = 0; j < 4*3; ++j)
			this.vertices[4*3*this.nr_objects_loaded+j] = objs[i].vertices[j];
		for (var j = 0; j < 4*2; ++j)
			this.texture_coords[4*2*this.nr_objects_loaded+j] = objs[i].texture_coords[j];
		for (var j = 0; j < 2*3; ++j)
			this.indices[2*3*this.nr_objects_loaded+j] = 4*this.nr_objects_loaded + sq_idx[j];

		this.nr_objects_loaded++;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_coord_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.texture_coords, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
}

/// Draw the collection of 2D objects
Object2DMap.prototype.draw = function()
{
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
	gl.vertexAttribPointer(shaders.program.vertexPositionAttribute, 3,
		gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_coord_buffer);
	gl.vertexAttribPointer(shaders.program.textureCoordAttribute, 2,
		gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);

	for (var fname in this.objects_for_def)
	{
		var od = this.objects_for_def[fname];
		if (!od.def)
			// definition not loaded yet
			continue;

		gl.uniform1f(shaders.program.alpha_low, od.def.alpha_test);
		gl.bindTexture(gl.TEXTURE_2D, od.def.texture);
		gl.drawElements(gl.TRIANGLES, od.count, gl.UNSIGNED_SHORT, od.offset);
	}

	// Reset alpha limit
	gl.uniform1f(shaders.program.alpha_low, 0.0);
}
