"use strict";

/**
 * Class for tile map
 *
 * Class for the map of the ground tiles in a game map. Each byte in the map
 * corresponds to the number of a tile texture.
 */
function GroundTileMap(width, height, tiles)
{
	/// Width of the map (nr of tiles in x direction)
	this.width = width;
	/// Height of the map (nr of tiles in y direction)
	this.height = height;
	/// Codes of the tiles to draw
	this.tile_numbers = tiles;
	/// Offset in index buffer, sorted by texture
	this.texture_tiles = [];

	/// GL buffer for the vertices of the tiles
	this.vertex_buffer = gl.createBuffer();
	/// GL buffer for the texture coordinates of the tiles
	this.texture_coord_buffer = gl.createBuffer();
	/// GL buffer for the indices of the vertices to draw
	this.index_buffer = gl.createBuffer();

	// Load the textures from a texture atlas where possible
	var this_obj = this;
	Signal.bind(Signal.TEXTURE_ATLASES_LOADED, function() { this_obj.createBuffers(); });
	texture_cache.checkAtlasesLoaded();
}

/**
 * Fill the OpenGL buffers used in drawing the tiles
 */
GroundTileMap.prototype.createBuffers = function()
{
	var tile_idx = 0;
	var sorted_tiles = {};
	for (var iy = 0; iy < this.height; ++iy)
	{
		for (var ix = 0; ix < this.width; ++ix, ++tile_idx)
		{
			var number = this.tile_numbers[tile_idx];
			if (number == GroundTileMap.invalid_number)
				continue;

			if (!(number in sorted_tiles))
				sorted_tiles[number] = [];
			sorted_tiles[number].push(tile_idx);
		}
	}

	var atlas_sorted_tiles = {};
	for (var number in sorted_tiles)
	{
		var fname = "3dobjects/tile" + number + ".dds";
		var tup = texture_cache.lookupAtlas("3dobjects/tile" + number + ".dds");
		if (!(tup.fname in atlas_sorted_tiles))
			atlas_sorted_tiles[tup.fname] = [];
		for (var i = 0; i < sorted_tiles[number].length; ++i)
		{
			atlas_sorted_tiles[tup.fname].push({
				index: sorted_tiles[number][i],
				number: number,
				texture_coords: tup.coords
			});
		}
	}

	// Set up buffers
	var vertices = new Float32Array(12 * this.height * this.width);
	var texture_coords = new Float32Array(8 * this.height * this.width);
	var indices = new Uint16Array(6 * this.height * this.width);
	var index_offset = 0;
	var count = 0;
	this.texture_tiles = [];
	for (var fname in atlas_sorted_tiles)
	{
		var tups = atlas_sorted_tiles[fname];
		this.texture_tiles.push({
			texture: texture_cache.get(fname),
			count: 6*tups.length,
			offset: index_offset
		});
		index_offset += tups.length * 6 * 2;

		for (var i = 0; i < tups.length; ++i)
		{
			var tup = tups[i];

			var iy = Math.floor(tup.index / this.width);
			var ix = tup.index % this.width;

			var x0 = ix * GroundTileMap.tile_size_meters;
			var y0 = iy * GroundTileMap.tile_size_meters;
			var x1 = (ix+1) * GroundTileMap.tile_size_meters;
			var y1 = (iy+1) * GroundTileMap.tile_size_meters;
			var z = (tup.number == 0 || (tup.number > 230 && tup.number < 255))
				? GroundTileMap.water_elevation
				: GroundTileMap.normal_elevation;
			var off = 4 * count;

			vertices.set([x0, y0, z, x1, y0, z, x1, y1, z, x0, y1, z],
				12 * count);
			texture_coords.set([
					tup.texture_coords.u_start, tup.texture_coords.v_start,
					tup.texture_coords.u_end,   tup.texture_coords.v_start,
					tup.texture_coords.u_end,   tup.texture_coords.v_end,
					tup.texture_coords.u_start, tup.texture_coords.v_end
				], 8 * count);
			indices.set([off+0, off+1, off+2, off+0, off+2, off+3], 6 * count);

			++count;
		}
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_coord_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, texture_coords, gl.STATIC_DRAW);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
}

/// Tile number used for invalid or no tile
GroundTileMap.invalid_number = 255;
/// Size of a ground tile in walkable positions
GroundTileMap.tile_size = 6;
/// Size of a ground tile in "meters"
GroundTileMap.tile_size_meters = ElevationMap.tile_size_meters * GroundTileMap.tile_size;
/// z-coordinate of a normal ground tile
GroundTileMap.normal_elevation = -0.001;
/// z-coordinate of a water tile
GroundTileMap.water_elevation = -0.25;

/// Get the tile at position (@a x, @a y)
GroundTileMap.prototype.get = function(x, y)
{
	return tiles[y*width + x];
}

/// Draw the tiles in this tile map
GroundTileMap.prototype.draw = function()
{
	gl.uniform1i(shaders.program.useLightingUniform, false);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
	gl.vertexAttribPointer(shaders.program.vertexPositionAttribute, 3,
		gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_coord_buffer);
	gl.vertexAttribPointer(shaders.program.textureCoordAttribute, 2,
		gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);

	gl.uniform1i(shaders.program.samplerUniform, 0);

	for (var i = 0; i < this.texture_tiles.length; ++i)
	{
		gl.bindTexture(gl.TEXTURE_2D, this.texture_tiles[i].texture);
		gl.drawElements(gl.TRIANGLES, this.texture_tiles[i].count,
			gl.UNSIGNED_SHORT, this.texture_tiles[i].offset);
	}
}
