"use strict";

/**
 * Class for the model view matrix
 */
function ModelViewMatrix()
{
	/// Call parent constructor
	GLMatrix.call(this, "model_view");

	/// Normal matrix (inverse of rotation part of this matrix)
	this.normal_matrix = mat3.create();
}

/// ModelViewMatrix derives from GLMatrix
ModelViewMatrix.prototype = Object.create(GLMatrix.prototype);

/// Return the normal matrix for this model view
ModelViewMatrix.prototype.normal = function()
{
	mat3.normalFromMat4(this.normal_matrix, this.matrix);
	return this.normal_matrix;
};
