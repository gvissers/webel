"use strict";

/**
 * Class for the model view matrix
 * @param program_name The name of the GLSL program in which this matrix is used
 */
function ModelViewMatrix(program_name)
{
	/// Call parent constructor
	GLMatrix.call(this, "model_view", program_name);

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
