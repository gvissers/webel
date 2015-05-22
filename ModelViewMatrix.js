"use strict";

/**
 * Class for the model view matrix
 */
function ModelViewMatrix()
{
	GLMatrix.call(this, "model_view");
}

/// ModelViewMatrix derives from GLMatrix
ModelViewMatrix.prototype = Object.create(GLMatrix.prototype);

/// Return the normal matrix for this model view
ModelViewMatrix.prototype.normal = function()
{
	var normalMatrix = mat3.create();
	mat3.normalFromMat4(normalMatrix, this.matrix);
	return normalMatrix;
};
