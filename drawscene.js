var gl;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var pyramidVertexPositionBuffer;
var pyramidVertexColorBuffer;
var cubeVertexPositionBuffer;
var cubeVertexColorBuffer;
var cubeVertexIndexBuffer;
var lastTime = 0;
var rPyramid = 0;
var rCube = 0;
var mvMatrixStack = new Stack(mat4.clone);
var shaders = new Shaders();

function logError(msg)
{
	alert(msg);
}

function initGL(canvas)
{
	try
	{
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	}
	catch (e)
	{
	}

	if (!gl)
		logError("Could not initialise WebGL, sorry :-(");
}

function setMatrixUniforms()
{
	gl.uniformMatrix4fv(shaders.program.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaders.program.mvMatrixUniform, false, mvMatrix);
}

function initBuffers()
{
	pyramidVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
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
	pyramidVertexPositionBuffer.itemSize = 3;
	pyramidVertexPositionBuffer.numItems = vertices.length / pyramidVertexPositionBuffer.itemSize;

	pyramidVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
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
	pyramidVertexColorBuffer.itemSize = 4;
	pyramidVertexColorBuffer.numItems = colors.length / pyramidVertexColorBuffer.itemSize;

	cubeVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
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
	cubeVertexPositionBuffer.itemSize = 3;
	cubeVertexPositionBuffer.numItems = vertices.length / cubeVertexPositionBuffer.itemSize;

	cubeVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
	colors = [
            [1.0, 0.0, 0.0, 1.0], // Front face
            [1.0, 1.0, 0.0, 1.0], // Back face
            [0.0, 1.0, 0.0, 1.0], // Top face
            [1.0, 0.5, 0.5, 1.0], // Bottom face
            [1.0, 0.0, 1.0, 1.0], // Right face
            [0.0, 0.0, 1.0, 1.0]  // Left face
	];
	var unpackedColors = [];
	for (var i = 0; i < colors.length; ++i)
	{
		var color = colors[i];
		for (var j = 0; j < 4; ++j)
			unpackedColors = unpackedColors.concat(color);
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
	cubeVertexColorBuffer.itemSize = 4;
	cubeVertexColorBuffer.numItems = unpackedColors.length / cubeVertexColorBuffer.itemSize;

	cubeVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	var cubeVertexIndices = [
		0, 1, 2,      0, 2, 3,    // Front face
		4, 5, 6,      4, 6, 7,    // Back face
		8, 9, 10,     8, 10, 11,  // Top face
		12, 13, 14,   12, 14, 15, // Bottom face
		16, 17, 18,   16, 18, 19, // Right face
		20, 21, 22,   20, 22, 23  // Left face
	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
	cubeVertexIndexBuffer.itemSize = 1;
	cubeVertexIndexBuffer.numItems = cubeVertexIndices.length / cubeVertexIndexBuffer.itemSize;
}

function drawScene()
{
	if (!shaders.ready)
	{
		setTimeout(drawScene, 100);
		return;
	}

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	mat4.perspective(pMatrix, 45, gl.viewportWidth/gl.viewportHeight, 0.1, 100.0);

	mat4.identity(mvMatrix);

	mat4.translate(mvMatrix, mvMatrix, [-1.5, 0.0, -7.0]);
	mvMatrixStack.push(mvMatrix);
	mat4.rotate(mvMatrix, mvMatrix, rPyramid, [0, 1, 0]);
	gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
	gl.vertexAttribPointer(shaders.program.vertexPositionAttribute,
		pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
	gl.vertexAttribPointer(shaders.program.vertexColorAttribute,
		pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLES, 0, pyramidVertexPositionBuffer.numItems);
	mvMatrix = mvMatrixStack.pop();

	mat4.translate(mvMatrix, mvMatrix, [3.0, 0.0, 0.0]);
	mvMatrixStack.push(mvMatrix);
	mat4.rotate(mvMatrix, mvMatrix, rCube, [1, 1, 1]);
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.vertexAttribPointer(shaders.program.vertexPositionAttribute,
		cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
	gl.vertexAttribPointer(shaders.program.vertexColorAttribute,
		cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems,
		gl.UNSIGNED_SHORT, 0);
	mvMatrix = mvMatrixStack.pop();
}

function animate()
{
	var timeNow = new Date().getTime();
	if (lastTime != 0)
	{
		var elapsed = timeNow - lastTime;

		rPyramid += (0.5 * Math.PI * elapsed) / 1000.0;
		rCube -= (5.0/12 * Math.PI * elapsed) / 1000.0;
	}
	lastTime = timeNow;
}

function tick()
{
	requestAnimFrame(tick);
	drawScene();
	animate();
}

function webGLStart()
{
	var canvas = document.getElementById("webel-canvas");
	initGL(canvas);
	shaders.init();
	initBuffers();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	tick();
}
