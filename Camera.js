/**
 * Class to hold camera position
 *
 * Class to hold the camera position and orientation, and functions to change
 * these.
 */
function Camera()
{
	/// Inverted position of the camera
	this.inv_pos = [0, 0, -10.0];
}

/// Distance to move the camera when zooming in or out
Camera.zoom_delta = 1.0;


/// Move the camera to the right
Camera.prototype.moveRight = function()
{
	this.inv_pos[0] -= ElevationMap.tile_size_meters;
}
/// Move the camera to the left
Camera.prototype.moveLeft = function()
{
	this.inv_pos[0] += ElevationMap.tile_size_meters;
}
/// Move the camera up
Camera.prototype.moveUp = function()
{
	this.inv_pos[1] -= ElevationMap.tile_size_meters;
}
/// Move the camera down
Camera.prototype.moveDown = function()
{
	this.inv_pos[1] += ElevationMap.tile_size_meters;
}
/// Zoom in on the scene by a single step
Camera.prototype.zoomIn = function()
{
	this.inv_pos[2] += Camera.zoom_delta;
};
/// Zoom out of the scene by a single step
Camera.prototype.zoomOut = function()
{
	this.inv_pos[2] -= Camera.zoom_delta;
};
