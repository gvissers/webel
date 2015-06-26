"use strict";

/**
 * Class for the collection of 2D objects on a map
 */
function Object2DMap()
{
	/// 2D objects, collected per definition
	this.objects_for_def = {};
	/// Definition file names, sorted by texture
	this.fnames_for_texture = {};
	/// 2D objects, collected per texture
	this.objects_for_texture = {};
	/// Total number of objects in this collection
	this.nr_objects = 0;

	/// The number of definitions still to load
	this.nr_defs_to_load = 0;

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
			objects: []
		};
		this.nr_defs_to_load++;
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
	this.objects_for_def[fname].def = def;

	var key = def.texture_fname + '|' + Math.round(100*def.alpha_test);
	if (!(key in this.fnames_for_texture))
		this.fnames_for_texture[key] = [];
	this.fnames_for_texture[key].push(fname);

	if (--this.nr_defs_to_load > 0)
		return;

	// All definitions loaded, collect them per texture
	var sq_idx = [0, 1, 2,   0, 2, 3];
	var total_count = 0;
	for (var key in this.fnames_for_texture)
	{
		var fnames = this.fnames_for_texture[key];
		var def0 = this.objects_for_def[fnames[0]].def;
		this.objects_for_texture[key] = {
			texture: texture_cache.get(def0.texture_fname),
			alpha_test: def0.alpha_test,
			count: 0,
			offset: 2 * 3 * 2 * total_count
		};
		for (var i = 0; i < fnames.length; ++i)
		{
			var objs = this.objects_for_def[fnames[i]];
			for (var j = 0; j < objs.objects.length; ++j)
			{
				var obj = objs.objects[j];
				obj.setDefinition(objs.def);

				for (var k = 0; k < 4*3; ++k)
					this.vertices[4*3*total_count+k] = obj.vertices[k];
				for (var k = 0; k < 4*2; ++k)
					this.texture_coords[4*2*total_count+k] = obj.texture_coords[k];
				for (var k = 0; k < 2*3; ++k)
					this.indices[2*3*total_count+k] = 4*total_count + sq_idx[k];

				total_count++;
			}

			this.objects_for_texture[key].count += 2 * 3 * objs.objects.length;
		}
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
	gl.vertexAttribPointer(shaders.program.vertex_position, 3,
		gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_coord_buffer);
	gl.vertexAttribPointer(shaders.program.texture_coord, 2,
		gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);

	for (var key in this.objects_for_texture)
	{
		var obj = this.objects_for_texture[key];
		gl.uniform1f(shaders.program.alpha_low, obj.alpha_test);
		gl.bindTexture(gl.TEXTURE_2D, obj.texture);
		gl.drawElements(gl.TRIANGLES, obj.count, gl.UNSIGNED_SHORT, obj.offset);
	}

	// Reset alpha limit
	gl.uniform1f(shaders.program.alpha_low, 0.0);
}
