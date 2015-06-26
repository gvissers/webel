"use strict";

/**
 * Class for the map of elevation levels on a game map
 */
function ElevationMap(width, height, elevations)
{
	/// Width of this map (nr of tiles in x direction)
	this.width = width;
	/// Height of this map (nr of tiles in y direction)
	this.height = height;
	/// The elevation codes
	this.elevations = elevations;
}

/// Size of a single walkable tile (in "meters")
ElevationMap.tile_size_meters = 0.5;
/// Size of a single step, in "meters"
ElevationMap.step = 0.2;
/// Offset of elevation map steps
ElevationMap.offset = -2.2;

/// Calculate the elevation in "meters" at position (@a x, @a y)
ElevationMap.prototype.elevationAt = function(x, y)
{
	var code = this.get(x, y);
	if (code)
		return ElevationMap.offset + ElevationMap.step * code;

	// tile is not walkable, interpolate walkable neighbours
	var count = 0;
	var sum = 0;
	for (var j = y-1; j <= y+1; ++j)
	{
		for (var i = x-1; i <= x+1; ++i)
		{
			code = this.get(i, j);
			if (code)
			{
				sum += code;
				++count;
			}
		}
	}
	return ElevationMap.offset + (count > 0 ? ElevationMap.step * sum / count : 0);
};

/// Get the elevation code for the tile at position (@a x, @a y)
ElevationMap.prototype.get = function(x, y)
{
	return this.elevations[y*this.width + x];
};

/// Check if the tile at position (@a x, @a y) is walkable
ElevationMap.prototype.isWalkable = function(x, y)
{
	return this.get(x, y) != 0;
};
