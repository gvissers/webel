"use strict";

/**
 * Class for game maps
 *
 * Class for ELM game maps, used in Eternal Lands and Other Life.
 */
function GameMap(fname)
{
	var _map_obj = this;

	/// Is this map inside
	this.dungeon = false;
	/// Color of ambient light
	this.ambientColor = [1.0, 1.0, 1.0];
	/// Ground tiles on this map
	this.tile_map = null;
	/// Elevation map
	this.elevation_map = null;
	/// two-dimensional objects
	this.objects_2d = [];
	/// three-dimensional objects
	this.objects_3d = [];

	$.ajax(fname, {
		dataType: "arraybuffer",
		error: function() {
			logError("Failed to get map " + fname);
		},
		success: function(data) {
			_map_obj._construct(data);
		}
	});
}

/// Extract the map data from @a data
GameMap.prototype._construct = function(data)
{
	var view = new DataView(data);
	if (view.getUint32(0, true) != fourCC("elmf"))
	{
		logError("Not a valid map file");
		return;
	}

	var tile_map_width = view.getUint32(4, true);
	var tile_map_height = view.getUint32(8, true);
	var tile_map_offset = view.getUint32(12, true);
	var elev_map_width = GroundTile.size * tile_map_width;
	var elev_map_height = GroundTile.size * tile_map_height;
	var elev_map_offset = view.getUint32(16, true);
	var obj_3d_size = view.getUint32(20, true);
	var obj_3d_count = view.getUint32(24, true);
	var obj_3d_offset = view.getUint32(28, true);
	var obj_2d_size = view.getUint32(32, true);
	var obj_2d_count = view.getUint32(36, true);
	var obj_2d_offset = view.getUint32(40, true);
	var light_size = view.getUint32(44, true);
	var light_count = view.getUint32(48, true);
	var light_offset = view.getUint32(52, true);
	this.dungeon = view.getUint8(56);
	this.ambientColor[0] = view.getFloat32(60, true);
	this.ambientColor[1] = view.getFloat32(64, true);
	this.ambientColor[2] = view.getFloat32(68, true);
	var particles_size = view.getUint32(72, true);
	var particles_count = view.getUint32(76, true);
	var particles_offset = view.getUint32(80, true);
	var clusters_offset = view.getUint32(84, true);

	this.tile_map = new GroundTileMap(tile_map_width, tile_map_height,
		new Uint8Array(data, tile_map_offset, tile_map_width*tile_map_height));
	this.elevation_map = new ElevationMap(elev_map_width, elev_map_height,
		new Uint8Array(data, elev_map_offset, elev_map_width*elev_map_height));

	var off = obj_2d_offset;
	for (var i = 0; i < obj_2d_count; ++i, off += obj_2d_size)
	{
		var str = extractString(view, off, 80);
		var pos = new Float32Array(data, off+80, 3);
		var rot = new Float32Array(data, off+92, 3);
		this.objects_2d.push(new Object2D(str, pos, rot));
	}

	var off = obj_3d_offset;
	for (var i = 0; i < obj_3d_count; ++i, off += obj_3d_size)
	{
		var str = extractString(view, off, 80);
		var pos = new Float32Array(data, off+80, 3);
		var rot = new Float32Array(data, off+92, 3);
		var self_lit = view.getUint8(off+104);
		var blended = view.getUint8(off+105);
		var col = new Float32Array(data, off+108, 3);
		var scale = view.getFloat32(off+120, true);
		this.objects_3d.push(
			new Object3D(str, pos, rot, col, scale, self_lit, blended));
	}

	console.log(this);
};

/**
 * Draw the map
 *
 * Draw the map, and all the objects in it, on the screen
 */
GameMap.prototype.draw = function()
{
	// All objects are textured, disable vertex coloring and enable texture
	// coordinates
	gl.disableVertexAttribArray(shaders.program.vertexColorAttribute);
	gl.vertexAttrib4f(shaders.program.vertexColorAttribute, 1, 1, 1, 1);
	gl.enableVertexAttribArray(shaders.program.textureCoordAttribute);

	gl.disable(gl.BLEND);
	gl.enable(gl.DEPTH_TEST);

	this.tile_map.draw();
	for (var i = 0; i < this.objects_2d.length; ++i)
		this.objects_2d[i].draw();
	gl.uniform1f(shaders.program.alpha_low, 0.0);
}
