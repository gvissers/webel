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

/// Get the elevation code for the tile at position (@a x, @a y)
ElevationMap.prototype.get = function(x, y)
{
	return this.elevations[y*this.width + x];
}
/// Check if the tile at position (@a x, @a y) is walkable
ElevationMap.prototype.isWalkable = function(x, y)
{
	return this.get(i, j) != 0;
}
