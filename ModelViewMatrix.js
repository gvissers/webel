"use strict";

/**
 * Class for the model view matrix
 */
function ModelViewMatrix()
{
	/// The model view matrix itself
	this.matrix = mat4.create();
	/// Matrix stack, used to restore the matrix after modifying it
	this.stack = [];
}

/// Multiply the model view matrix with mat
ModelViewMatrix.prototype.multiply = function(mat)
{
	mat4.multiply(this.matrix, this.matrix, mat);
}

/// Return the normal matrix for this model view
ModelViewMatrix.prototype.normal = function()
{
	var normalMatrix = mat3.create();
	mat3.normalFromMat4(normalMatrix, this.matrix);
	return normalMatrix;
}

/// Restore the model view matrix to the last state on the stack
ModelViewMatrix.prototype.pop = function()
{
	if (this.stack.length == 0)
		throw "Unable to pop empty stack";
	this.matrix = this.stack.pop();
};

/// Push a copy of the current model view matrix on the stack
ModelViewMatrix.prototype.push = function()
{
	this.stack.push(mat4.clone(this.matrix));
};

/// Set the model view matrix to the unit matrix
ModelViewMatrix.prototype.setIdentity = function()
{
	mat4.identity(this.matrix);
}

/// Export the model view matrix to the shaders
ModelViewMatrix.prototype.setUniform = function()
{
	gl.uniformMatrix4fv(shaders.program.mvMatrixUniform, false, this.matrix);
};

/// Translate the current model view
ModelViewMatrix.prototype.translate = function(delta)
{
	mat4.translate(this.matrix, this.matrix, delta);
}
