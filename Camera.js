"use strict";

/**
 * Class to hold camera position
 *
 * Class to hold the camera position and orientation, and functions to change
 * these.
 */
function Camera()
{
	/// Height map used to compute z values
	this.elevation_map = null;
	/// Position in walkable tiles
	this.tile_pos = [0, 0];
	/// Additional zoom distance
	this.zoom_distance = 0;
	/// Inverted rotation of the camera, in degrees
	this.inv_rot = [-60, 0, 45];
	/// Bounding box for the camera, objects outsize this box aren't drawn
	this.bounding_box = null;
}

/// Distance to move the camera when zooming in or out
Camera.zoom_delta = 1.0;
/// Change in position, based on current view angle
Camera.pos_delta = {
	0:   [ 0,  1],
	45:  [ 1,  1],
	90:  [ 1,  0],
	135: [ 1, -1],
	180: [ 0, -1],
	225: [-1, -1],
	270: [-1,  0],
	315: [-1,  1]
};
/// Max distance beyond which objects aren't drawn
Camera.max_distance = 10;

/// Set the elevation map and position of the camera
Camera.prototype.set = function(elevation_map, x, y)
{
	this.elevation_map = elevation_map;
	this.tile_pos[0] = x;
	this.tile_pos[1] = y;
	this.setBoundingBox();
};

/// Take a step forward in the current viewing direction
Camera.prototype.stepForward = function()
{
	var x = this.tile_pos[0] + Camera.pos_delta[this.inv_rot[2]][0];
	var y = this.tile_pos[1] + Camera.pos_delta[this.inv_rot[2]][1];
	if (this.elevation_map.isWalkable(x, y))
	{
		this.tile_pos[0] = x;
		this.tile_pos[1] = y;
		this.setBoundingBox();
	}
};
/// Take a step backward in the current viewing direction
Camera.prototype.stepBackward = function()
{
	var x = this.tile_pos[0] - Camera.pos_delta[this.inv_rot[2]][0];
	var y = this.tile_pos[1] - Camera.pos_delta[this.inv_rot[2]][1];
	if (this.elevation_map.isWalkable(x, y))
	{
		this.tile_pos[0] = x;
		this.tile_pos[1] = y;
		this.setBoundingBox();
	}
};

/// Rotate the camera 45 degrees left
Camera.prototype.rotateLeft = function()
{
	this.inv_rot[2] -= 45;
	if (this.inv_rot[2] < 0)
		this.inv_rot[2] += 360;
};
/// Rotate the camera 45 degrees right
Camera.prototype.rotateRight = function()
{
	this.inv_rot[2] += 45;
	if (this.inv_rot[2] >= 360)
		this.inv_rot[2] -= 360;
};

/// Set the bounding box for the current camera settings
Camera.prototype.setBoundingBox = function()
{
	var x = this.tile_pos[0] * ElevationMap.tile_size_meters;
	var y = this.tile_pos[1] * ElevationMap.tile_size_meters;
	this.bounding_box = new BoundingBox(
		[x - Camera.max_distance, y - Camera.max_distance, Number.NEGATIVE_INFINITY],
		[x + Camera.max_distance, y + Camera.max_distance, Number.POSITIVE_INFINITY]
	);
}

/// Multiply the model view matrix to set the camera position
Camera.prototype.setModelView = function()
{
	var inv_pos = vec3.fromValues(
		-this.tile_pos[0] * ElevationMap.tile_size_meters,
		-this.tile_pos[1] * ElevationMap.tile_size_meters,
		-this.elevation_map.elevationAt(this.tile_pos[0], this.tile_pos[1]) - 2
	);

	model_view_matrix.translate([0, 0, -this.zoom_distance]);
	model_view_matrix.rotateX(this.inv_rot[0]*Math.PI/180);
	model_view_matrix.rotateZ(this.inv_rot[2]*Math.PI/180);
	model_view_matrix.translate(inv_pos);
}

/// Zoom in on the scene by a single step
Camera.prototype.zoomIn = function()
{
	this.zoom_distance -= Camera.zoom_delta;
	if (this.zoom_distance < 0)
		this.zoom_distance = 0;
};
/// Zoom out of the scene by a single step
Camera.prototype.zoomOut = function()
{
	this.zoom_distance += Camera.zoom_delta;
	if (this.zoom_distance > 10)
		this.zoom_distance = 10;
};
