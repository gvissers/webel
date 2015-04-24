var gl;
var shaderProgram;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var triangleVertexPositionBuffer;
var triangleVertexColorBuffer;
var squareVertexPositionBuffer;
var squareVertexColorBuffer;
var lastTime = 0;
var rTri = 0;
var rSquare = 0;
var mvMatrixStack = new Stack(mat4.clone);

function elError(msg)
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
		elError("Could not initialise WebGL, sorry :-(");
}

UNINITIALIZED = -2;
IN_PROGRESS = -1;
OK = 0;
ERROR = 1;

var shader_status = {
	"shaders/shader-fs.glsl": UNINITIALIZED,
	"shaders/shader-vs.glsl": UNINITIALIZED
};
var have_shaders = false;

function getShaderScript(fname)
{
	var type;
	if (/.*-fs\.glsl/.test(fname))
	{
		type = gl.FRAGMENT_SHADER;
	}
	else if (/.*-vs\.glsl/.test(fname))
	{
		type = gl.VERTEX_SHADER;
	}
	else
	{
		elError("Unknown shader type for file " + fname);
		shader_status[fname] = ERROR;
		return;
	}

	shader_status[fname] = IN_PROGRESS;
	$.ajax(fname, {
		error: function() {
			elError("Failed to get shader source file " + fname);
			shader_status[fname] = ERROR;
		},
		success: function(str) {
			var shader = gl.createShader(type);

			gl.shaderSource(shader, str);
			gl.compileShader(shader);

			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
			{
				elError(gl.getShaderInfoLog(shader));
				shader_status[fname] = ERROR;
			}
			else
			{
				gl.attachShader(shaderProgram, shader);
				shader_status[fname] = OK;
			}
		}
	});
}

function initShaders()
{
	shaderProgram = gl.createProgram();

	for (var fname in shader_status)
		getShaderScript(fname);

	setTimeout(finishShaders, 100);
}

function finishShaders()
{
	for (var fname in shader_status)
	{
		switch (shader_status[fname])
		{
			case UNINITIALIZED:
			case IN_PROGRESS:
				setTimeout(finishShaders, 100);
			case ERROR:
				return;
			case OK:
			default:
				/* continue */
		}
	}

	gl.linkProgram(shaderProgram);
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
	{
		elError("Could not initialise shaders");
		return;
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

	have_shaders = true;
}

function setMatrixUniforms()
{
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function initBuffers()
{
	triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	var vertices = [
		 0.0,  1.0,  0.0,
		-1.0, -1.0,  0.0,
		 1.0, -1.0,  0.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	triangleVertexPositionBuffer.itemSize = 3;
	triangleVertexPositionBuffer.numItems = 3;

	triangleVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
	var colors = [
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	triangleVertexColorBuffer.itemSize = 4;
	triangleVertexColorBuffer.numItems = 3;

	squareVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	vertices = [
		 1.0,  1.0,  0.0,
		-1.0,  1.0,  0.0,
		 1.0, -1.0,  0.0,
		-1.0, -1.0,  0.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	squareVertexPositionBuffer.itemSize = 3;
	squareVertexPositionBuffer.numItems = 4;

	squareVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
	colors = [];
	for (var i=0; i < 4; i++) {
		colors = colors.concat([0.5, 0.5, 1.0, 1.0]);
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	squareVertexColorBuffer.itemSize = 4;
	squareVertexColorBuffer.numItems = 4;
}

function degToRad(degrees)
{
	return degrees * Math.PI / 180;
}

function drawScene()
{
	if (!have_shaders)
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
	mat4.rotate(mvMatrix, mvMatrix, degToRad(rTri), [0, 1, 0]);
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
		triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
		triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
	mvMatrix = mvMatrixStack.pop();

	mat4.translate(mvMatrix, mvMatrix, [3.0, 0.0, 0.0]);
	mvMatrixStack.push(mvMatrix);
	mat4.rotate(mvMatrix, mvMatrix, degToRad(rSquare), [1, 0, 0]);
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
		squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
		squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
	mvMatrix = mvMatrixStack.pop();
}

function animate()
{
	var timeNow = new Date().getTime();
	if (lastTime != 0)
	{
		var elapsed = timeNow - lastTime;

		rTri += (90 * elapsed) / 1000.0;
		rSquare += (75 * elapsed) / 1000.0;
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
	initShaders();
	initBuffers();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	tick();
}
