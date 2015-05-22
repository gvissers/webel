"use strict";

/**
 * Class for the projection matrix
 */
function ProjectionMatrix()
{
	GLMatrix.call(this, "projection");
}

/// ProjectionMatrix derives from GLMatrix
ProjectionMatrix.prototype = Object.create(GLMatrix.prototype);

/**
 * Set up a perspective projection in this matrix.
 * @param field_of_view Vertical view angle in radians
 * @param aspect        Aspect ratio
 * @param near_plane    Distance of the near plane, in "meters"
 * @param far_plane     Distance of the far plane, in "meters"
 */
ProjectionMatrix.prototype.perspective = function(field_of_view, aspect,
	near_plane, far_plane)
{
	mat4.perspective(this.matrix, field_of_view, aspect, near_plane, far_plane);
};
