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
	this.objects_2d = new Object2DMap();
	/// three-dimensional objects
	this.objects_3d = [];
	/// Particle systems
	this.particles = new ParticleSystemMap;

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
	var elev_map_width = GroundTileMap.tile_size * tile_map_width;
	var elev_map_height = GroundTileMap.tile_size * tile_map_height;
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
		this.objects_2d.add(new Object2D(str, pos, rot));
	}
	this.objects_2d.setAllDefinitions();

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

	var off = particles_offset;
	for (var i = 0; i < particles_count; ++i, off += particles_size)
	{
		var str = extractString(view, off, 80);
		var pos = new Float32Array(data, off+80, 3);
		this.particles.add(new ParticleSystem(str, pos));
	}
	this.particles.setAllDefinitions();

	var x = elev_map_width>>1;
	var y = elev_map_height>>1;
	var d = 1;
	while (!this.elevation_map.isWalkable(x, y))
	{
		x += Math.round(d*Math.random());
		y += Math.round(d*Math.random());
		d += 1;
	}
x=330;y=320;
	camera.set(this.elevation_map, x, y);
	console.log(this);
};

/**
 * Draw the map
 *
 * Draw the map, and all the objects in it, on the screen
 */
GameMap.prototype.draw = function()
{
	if (!this.draw_stats)
	{
		this.draw_stats = {
			max_count: 1000,
			count: 0,
			ticks_tiles: 0,
			ticks_2d: 0,
			ticks_3d: 0,
			ticks_part: 0
		};
	}

	// All objects are textured, vertex color arrays should be disabled and
	// texture coordinates should be enabled. Set the vertex color to solid
	// white, so we see the pure texture colors.
	gl.vertexAttrib4f(shaders.program.vertex_color, 1, 1, 1, 1);

	gl.disable(gl.BLEND);

	var tic = new Date().getTime();
	this.tile_map.draw();
	var toc = new Date().getTime();
	this.draw_stats.ticks_tiles += toc - tic;

	tic = new Date().getTime();
	this.objects_2d.draw();
	toc = new Date().getTime();
	this.draw_stats.ticks_2d += toc - tic;

	tic = new Date().getTime();
	for (var i = 0; i < this.objects_3d.length; ++i)
	{
		if (camera.bounding_box.overlaps(this.objects_3d[i].bounding_box))
			this.objects_3d[i].draw();
	}
	// Reset model view matrix
	model_view_matrix.setUniform();
	// Reset alpha limit
	gl.uniform1f(shaders.program.alpha_low, 0.0);
	toc = new Date().getTime();
	this.draw_stats.ticks_3d += toc - tic;

	tic = new Date().getTime();
	this.particles.draw();
	toc = new Date().getTime();
	this.draw_stats.ticks_part += toc - tic;

	if (++this.draw_stats.count == this.draw_stats.max_count)
	{
		console.log(
			this.draw_stats.ticks_tiles/this.draw_stats.max_count + " ms for tiles, "
			+ this.draw_stats.ticks_2d/this.draw_stats.max_count + " ms for 2d, "
			+ this.draw_stats.ticks_3d/this.draw_stats.max_count + " ms for 3d, "
			+ this.draw_stats.ticks_part/this.draw_stats.max_count + " ms for particles");
		this.draw_stats.count = 0;
		this.draw_stats.ticks_tiles = 0;
		this.draw_stats.ticks_2d = 0;
		this.draw_stats.ticks_3d = 0;
		this.draw_stats.ticks_part = 0;
	}
}

/// Update the dynamic parts of the map
GameMap.prototype.animate = function(time)
{
	if (!this.update_stats)
	{
		this.update_stats = {
			max_count: 1000,
			count: 0,
			ticks_part: 0,
		};
	}

	var tic = new Date().getTime();
	this.particles.update(time);
	var toc = new Date().getTime();
	this.update_stats.ticks_part += toc - tic;

	if (++this.update_stats.count == this.update_stats.max_count)
	{
		console.log(this.update_stats.ticks_part/this.update_stats.max_count + " ms updating particles");
		this.update_stats.count = 0;
		this.update_stats.ticks_part = 0;
	}
};
