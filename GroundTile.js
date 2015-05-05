"use strict";

/**
 * Class for ground tiles on a game map
 */
function GroundTile(number)
{
	this.number = number;
	if (this.isValid())
		this.texture = texture_cache.get("3dobjects/tile" + number + ".dds");
}

/// Size of a ground tile in walkable positions
GroundTile.size = 6;
/// Size of a ground tile in "meters"
GroundTile.size_meters = ElevationMap.tile_size_meters * GroundTile.size;
/// Tile number used for invalid or no tile
GroundTile.invalid_number = 255;
/// z-coordinate of a normal ground tile
GroundTile.normal_elevation = -0.001;
/// z-coordinate of a water tile
GroundTile.water_elevation = -0.25;

/// Check if a tile is valid ground tile
GroundTile.prototype.isValid = function()
{
	return this.number != GroundTile.invalid_number;
}
/// Check if a tile is a water tile
GroundTile.prototype.isWater = function()
{
	return this.number == 0 || (this.number > 230 && this.number < 255);
}
/// Return the elevation for a tile
GroundTile.prototype.elevation = function()
{
	return this.isWater() ? GroundTile.water_elevation : GroundTile.normal_elevation;
}
