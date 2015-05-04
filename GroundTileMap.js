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
	/// Tiles themselves
	this.tiles = [];

	// Chromium does not do TypedArray.forEach() yet
	for (var i = 0; i < tiles.length; ++i)
		this.tiles.push(new GroundTile(tiles[i]));

	// Set up buffers
	var vertices = [];
	var texture_coords = [];
	var indices = [];
	var tile_idx = 0;
	for (var iy = 0; iy < this.height; ++iy)
	{
		for (var ix = 0; ix < this.width; ++ix, ++tile_idx)
		{
			var tile = this.tiles[tile_idx];
			if (!tile.isValid())
				continue;

			var x0 = ix * GroundTile.size_meters;
			var y0 = iy * GroundTile.size_meters;
			var x1 = (ix+1) * GroundTile.size_meters;
			var y1 = (iy+1) * GroundTile.size_meters;
			var z = tile.elevation();
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

/// Get the tile at position (@a x, @a y)
GroundTileMap.prototype.get = function(x, y)
{
	return tiles[y*width + x];
}

/// Draw the tiles in this tile map
GroundTileMap.prototype.draw = function()
{
	gl.uniform1i(shaders.program.useLightingUniform, false);

	gl.disable(gl.BLEND);
	gl.enable(gl.DEPTH_TEST);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
	gl.vertexAttribPointer(shaders.program.vertexPositionAttribute, 3,
		gl.FLOAT, false, 0, 0);

	gl.enableVertexAttribArray(shaders.program.textureCoordAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_coord_buffer);
	gl.vertexAttribPointer(shaders.program.textureCoordAttribute, 2,
		gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);

	gl.uniform1i(shaders.program.samplerUniform, 0);

	var idx = 0;
	for (var i = 0; i < this.width*this.height; ++i)
	{
		if (this.tiles[i].isValid())
		{
			gl.bindTexture(gl.TEXTURE_2D, this.tiles[i].texture);
			gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 12*idx);
			++idx;
		}
	}
}
