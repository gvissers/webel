"use strict";

/**
 * A class for GL matrices, like the model view or projection matrix.
 * @param uniform_name The GLSL uniform attribute associated with this matrix
 * @param program_name The GLSL shader program in which this matrix is used
 */
function GLMatrix(uniform_name, program_name)
{
	/// The GLSL attribute name for the shader program to use
	this.program_name = program_name ? program_name : "program";
	/// The GLSL attribute name for this matrix
	this.uniform_name = uniform_name;
	/// The matrix data
	this.matrix = mat4.create();
	/// Matrix stack, used to restore the matrix after modifying it
	this.stack = [];

	/// The GLSL attribute for this matrix
	this.uniform = null;
}

/// Return a copy of the contents of this matrix
GLMatrix.prototype.get = function()
{
	return mat4.clone(this.matrix);
};

/// Multiply the matrix with @a mat
GLMatrix.prototype.multiply = function(mat)
{
	mat4.multiply(this.matrix, this.matrix, mat);
};

/// Restore the matrix to the last state on the stack
GLMatrix.prototype.pop = function()
{
	if (this.stack.length == 0)
		throw "Unable to pop empty stack";
	this.matrix = this.stack.pop();
};

/// Push a copy of the current matrix on the stack
GLMatrix.prototype.push = function()
{
	this.stack.push(mat4.clone(this.matrix));
};

/// Rotate the current matrix around the X axis
GLMatrix.prototype.rotateX = function(ang)
{
	mat4.rotateX(this.matrix, this.matrix, ang);
};

/// Rotate the current matrix around the Y axis
GLMatrix.prototype.rotateY = function(ang)
{
	mat4.rotateY(this.matrix, this.matrix, ang);
};

/// Rotate the current matrix around the Z axis
GLMatrix.prototype.rotateZ = function(ang)
{
	mat4.rotateZ(this.matrix, this.matrix, ang);
};

/// Set the contents of the matrix to \a mat4
GLMatrix.prototype.set = function(mat)
{
	mat4.copy(this.matrix, mat);
};

/// Set the matrix to the unit matrix
GLMatrix.prototype.setIdentity = function()
{
	mat4.identity(this.matrix);
};

/// Export the matrix to the shaders
GLMatrix.prototype.setUniform = function()
{
	if (!this.uniform)
		this.uniform = shaders[this.program_name][this.uniform_name];
	gl.uniformMatrix4fv(this.uniform, false, this.matrix);
};

/// Translate the current matrix
GLMatrix.prototype.translate = function(delta)
{
	mat4.translate(this.matrix, this.matrix, delta);
};
