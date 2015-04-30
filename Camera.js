/**
 * Class to hold camera position
 *
 * Class to hold the camera position and orientation, and functions to change
 * these.
 */
function Camera()
{
	/// Position of the camera
	this.position = [0, 0, -7.0];
}

/// Distance to move the camera when zooming in or out
Camera.zoom_delta = 0.05;

/// Zoom in on the scene by a single step
Camera.prototype.zoomIn = function()
{
	this.position[2] += Camera.zoom_delta;
};
/// Zoom out of the scene by a single step
Camera.prototype.zoomOut = function()
{
	this.position[2] -= Camera.zoom_delta;
};
