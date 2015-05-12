"use strict";

/**
 * Class for "materials" (parts using the same texture) in a 3D object definition
 */
function Material(options, texture_fname, min_coords, max_coords,
			min_vert_idx, max_vert_idx, index, count)
{
	this.options = options;
	this.texture_fname = texture_fname;
	this.min_coords = min_coords;
	this.max_coords = max_coords;
	this.min_vertex_index = min_vert_idx;
	this.max_vertex_index = max_vert_idx;
	this.index = index;
	this.count = count;

	this.texture = texture_cache.get(this.texture_fname);
}

/// Check if this material is (partially) transparent
Material.prototype.isTransparent = function()
{
	return this.options != 0;
}
