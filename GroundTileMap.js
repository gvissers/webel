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
	/// Offset in index buffer, sorted by texture
	this.texture_tiles = null;

	var tile_idx = 0;
	var sorted_tiles = {};
	for (var iy = 0; iy < this.height; ++iy)
	{
		for (var ix = 0; ix < this.width; ++ix, ++tile_idx)
		{
			var number = tiles[tile_idx];
			if (number == GroundTileMap.invalid_number)
				continue;

			if (!(number in sorted_tiles))
				sorted_tiles[number] = [];
			sorted_tiles[number].push(tile_idx);
		}
	}

	// Set up buffers
	var vertices = [];
	var texture_coords = [];
	var indices = [];
	var texture_tiles_offset = 0;
	this.texture_tiles = [];
	for (var number in sorted_tiles)
	{
		var idxs = sorted_tiles[number];
		var fname = "3dobjects/tile" + number + ".dds";
		this.texture_tiles.push({
			texture: texture_cache.get(fname),
			count: 6*idxs.length,
			offset: texture_tiles_offset
		});
		texture_tiles_offset += idxs.length * 6 * 2;
		var z;
		if (number == 0 || (number > 230 && number < 255))
			z = GroundTileMap.water_elevation;
		else
			z = GroundTileMap.normal_elevation;

		for (var i = 0; i < idxs.length; ++i)
		{
			var idx = idxs[i];
			var iy = Math.floor(idx / this.width);
			var ix = idx % this.width;

			var x0 = ix * GroundTileMap.tile_size_meters;
			var y0 = iy * GroundTileMap.tile_size_meters;
			var x1 = (ix+1) * GroundTileMap.tile_size_meters;
			var y1 = (iy+1) * GroundTileMap.tile_size_meters;
			var idx_off = vertices.length/3;
			vertices = vertices.concat([
				x0, y0, z,
				x1, y0, z,
				x1, y1, z,
				x0, y1, z
			]);
			texture_coords = texture_coords.concat([
				0, 0,
				1, 0,
				1, 1,
				0, 1
			]);
			indices = indices.concat([
				idx_off+0, idx_off+1, idx_off+2,
				idx_off+0, idx_off+2, idx_off+3
			]);
		}
	}

	this.vertex_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	this.texture_coord_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_coord_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texture_coords), gl.STATIC_DRAW);

	this.index_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
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
