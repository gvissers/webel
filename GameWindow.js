function GameWindow()
{
	this.lastTime = 0;

	this.rPyramid = 0;
	this.rCube = [0, 0, 0];
	this.rCubeSpeed = [0, 0, 0];

	this.pyramidVertexPositionBuffer = null;
	this.pyramidVertexColorBuffer = null;
	this.cubeVertexPositionBuffer = null;
	this.cubeVertexTextureCoordBuffer = null;
	this.cubeVertexIndexBuffer = null;

	this._construct();
}

GameWindow.prototype._construct = function()
{
	this.pyramidVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.pyramidVertexPositionBuffer);
	var vertices = [
		// Front face
		 0.0,  1.0,  0.0,
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,

		// Right face
		 0.0,  1.0,  0.0,
		 1.0, -1.0,  1.0,
		 1.0, -1.0, -1.0,

		// Back face
		 0.0,  1.0,  0.0,
		 1.0, -1.0, -1.0,
		-1.0, -1.0, -1.0,

		// Left face
		 0.0,  1.0,  0.0,
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	this.pyramidVertexPositionBuffer.itemSize = 3;
	this.pyramidVertexPositionBuffer.numItems = vertices.length /
		this.pyramidVertexPositionBuffer.itemSize;

	this.pyramidVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.pyramidVertexColorBuffer);
	var colors = [
		// Front face
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,

		// Right face
		1.0, 0.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 1.0, 0.0, 1.0,

		// Back face
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,

		// Left face
		1.0, 0.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 1.0, 0.0, 1.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	this.pyramidVertexColorBuffer.itemSize = 4;
	this.pyramidVertexColorBuffer.numItems = colors.length /
		this.pyramidVertexColorBuffer.itemSize;

	this.cubeVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexPositionBuffer);
	vertices = [
		// Front face
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,
		 1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,

		// Back face
		-1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0, -1.0, -1.0,

		// Top face
		-1.0,  1.0, -1.0,
		-1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
		 1.0,  1.0, -1.0,

		// Bottom face
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		 1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,

		// Right face
		 1.0, -1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0,  1.0,  1.0,
		 1.0, -1.0,  1.0,

		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		-1.0,  1.0, -1.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	this.cubeVertexPositionBuffer.itemSize = 3;
	this.cubeVertexPositionBuffer.numItems = vertices.length /
		this.cubeVertexPositionBuffer.itemSize;

	this.cubeVertexTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexTextureCoordBuffer);
	var textureCoords = [
		// Front face
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,

		// Back face
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,

		// Top face
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,

		// Bottom face
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,

		// Right face
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,

		// Left face
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
	this.cubeVertexTextureCoordBuffer.itemSize = 2;
	this.cubeVertexTextureCoordBuffer.numItems = textureCoords.length /
		this.cubeVertexTextureCoordBuffer.itemSize;

	this.cubeVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeVertexIndexBuffer);
	var cubeVertexIndices = [
		0, 1, 2,      0, 2, 3,    // Front face
		4, 5, 6,      4, 6, 7,    // Back face
		8, 9, 10,     8, 10, 11,  // Top face
		12, 13, 14,   12, 14, 15, // Bottom face
		16, 17, 18,   16, 18, 19, // Right face
		20, 21, 22,   20, 22, 23  // Left face
	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices),
		gl.STATIC_DRAW);
	this.cubeVertexIndexBuffer.itemSize = 1;
	this.cubeVertexIndexBuffer.numItems = cubeVertexIndices.length /
		this.cubeVertexIndexBuffer.itemSize;
};

GameWindow.prototype.draw = function()
{
	mvMatrixStack.push(mvMatrix);
	mat4.translate(mvMatrix, mvMatrix, [-1.5, 0.0, 0.0]);
	mat4.rotate(mvMatrix, mvMatrix, this.rPyramid, [1, 1, 0]);
	// Set vertex positions
	gl.bindBuffer(gl.ARRAY_BUFFER, this.pyramidVertexPositionBuffer);
	gl.vertexAttribPointer(shaders.program.vertexPositionAttribute,
		this.pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	// Pyramid is drawn using solid colors, use single-pixel white texture
	// for texture interpolation
	texture_cache.bind("white");
	// turn off texture coordinates.
	gl.enableVertexAttribArray(shaders.program.vertexColorAttribute);
	gl.disableVertexAttribArray(shaders.program.textureCoordAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.pyramidVertexColorBuffer);
	gl.vertexAttribPointer(shaders.program.vertexColorAttribute,
		this.pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLES, 0, this.pyramidVertexPositionBuffer.numItems);
	mvMatrix = mvMatrixStack.pop();

	mvMatrixStack.push(mvMatrix);
	mat4.translate(mvMatrix, mvMatrix, [1.5, 0.0, 0.0]);
	mat4.rotate(mvMatrix, mvMatrix, this.rCube[0], [1, 0, 0]);
	mat4.rotate(mvMatrix, mvMatrix,this.rCube[1], [0, 1, 0]);
	// Set vertex positions
	gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexPositionBuffer);
	gl.vertexAttribPointer(shaders.program.vertexPositionAttribute,
		this.cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	// Cube uses texture only, disable color and use white
	gl.disableVertexAttribArray(shaders.program.vertexColorAttribute);
	gl.vertexAttrib4f(shaders.program.vertexColorAttribute, 1, 1, 1, 1);
	// Set texture buffer
	gl.enableVertexAttribArray(shaders.program.textureCoordAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexTextureCoordBuffer);
	gl.vertexAttribPointer(shaders.program.textureCoordAttribute,
		this.cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.activeTexture(gl.TEXTURE0);
	texture_cache.bind("textures/items1.dds");
	gl.uniform1i(shaders.program.samplerUniform, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeVertexIndexBuffer);
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, this.cubeVertexIndexBuffer.numItems,
		gl.UNSIGNED_SHORT, 0);
	mvMatrix = mvMatrixStack.pop();
};

GameWindow.prototype.animate = function(time)
{
	if (this.lastTime != 0)
	{
		var elapsed = time - this.lastTime;

		this.rPyramid += (0.5 * Math.PI * elapsed) / 1000.0;
		this.rCube[0] -= (this.rCubeSpeed[0] * Math.PI/180 * elapsed) / 1000.0;
		this.rCube[1] -= (this.rCubeSpeed[1] * Math.PI/180 * elapsed) / 1000.0;
	}
	this.lastTime = time;
}

GameWindow.prototype.handleKeys = function(keys_pressed)
{
    if (keys_pressed[37]) {
      // Left cursor key
      this.rCubeSpeed[1] -= 1;
    }
    if (keys_pressed[39]) {
      // Right cursor key
      this.rCubeSpeed[1] += 1;
    }
    if (keys_pressed[38]) {
      // Up cursor key
      this.rCubeSpeed[0] -= 1;
    }
    if (keys_pressed[40]) {
      // Down cursor key
      this.rCubeSpeed[0] += 1;
    }
}
