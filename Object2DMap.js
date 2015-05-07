/**
 * Class for the collection of 2D objects on a map
 */
function Object2DMap()
{
	/// 2D objects, collected per definition
	this.objects_for_def = {};
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
			vertex_buffer: null,
			texture_coord_buffer: null,
			index_buffer: null,
			count: 0
		};
	}
	this.objects_for_def[fname].objects.push(obj);
}

/**
 * Get the object definitions for all objects on this map.
 */
Object2DMap.prototype.setAllDefinitions = function()
{
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
	var od = this.objects_for_def[fname];

	od.def = def;

	var vertices = [];
	var texture_coords = [];
	var indices = [];
	var objs = od.objects;
	for (var i = 0; i < objs.length; ++i)
	{
		var idx_off = vertices.length/3;

		objs[i].setDefinition(def);
		vertices = vertices.concat(objs[i].vertices);
		texture_coords = texture_coords.concat(objs[i].texture_coords);
		indices = indices.concat([
			idx_off+0, idx_off+1, idx_off+2,
			idx_off+0, idx_off+2, idx_off+3
		]);
	}

	od.vertex_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, od.vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	od.texture_coord_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, od.texture_coord_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texture_coords), gl.STATIC_DRAW);
	od.index_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, od.index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	od.count = indices.length;
}

/// Draw the collection of 2D objects
Object2DMap.prototype.draw = function()
{
	for (var fname in this.objects_for_def)
	{
		var od = this.objects_for_def[fname];
		if (!od.def)
			// definition not loaded yet
			continue;

		gl.uniform1f(shaders.program.alpha_low, od.def.alpha_test);
		gl.bindTexture(gl.TEXTURE_2D, od.def.texture);

		gl.bindBuffer(gl.ARRAY_BUFFER, od.vertex_buffer);
		gl.vertexAttribPointer(shaders.program.vertexPositionAttribute, 3,
			gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, od.texture_coord_buffer);
		gl.vertexAttribPointer(shaders.program.textureCoordAttribute, 2,
			gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, od.index_buffer);

		gl.drawElements(gl.TRIANGLES, od.count, gl.UNSIGNED_SHORT, 0);
	}

	// Reset alpha limit
	gl.uniform1f(shaders.program.alpha_low, 0.0);
}
