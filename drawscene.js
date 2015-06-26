"use strict";

var near_plane = 0.1;
var far_plane = 100;

var gl;
var model_view_matrix = new ModelViewMatrix;
var projection_matrix = new ProjectionMatrix;
var game_window;
var lastTime = 0;
var shaders = new Shaders();
var texture_cache;
var object_2d_def_cache;
var object_3d_def_cache;
var particle_system_def_cache;
var camera = new Camera;
var key_handler = new KeyHandler();
var fps_counter = new FPSCounter(60, new Date().getTime());
var half_lut = new HalfLUT();
var map;
var font;
var text_buffer;

function logError(msg)
{
	console.log(msg);
	alert(msg);
}

function initGL(canvas)
{
	try
	{
		gl = WebGLUtils.setupWebGL(canvas, {alpha: false});
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	}
	catch (e)
	{
	}

	if (!gl)
		logError("Could not initialise WebGL, sorry :-(");
}

function to3DMode()
{
	gl.enable(gl.DEPTH_TEST);

	var aspect = gl.viewportWidth/gl.viewportHeight;
	projection_matrix.perspective(Camera.field_of_view*Math.PI/180, aspect,
		near_plane, far_plane);
	projection_matrix.setUniform();

	model_view_matrix.setIdentity();
	camera.setModelView();
	model_view_matrix.setUniform();

	gl.uniformMatrix3fv(shaders.program.nMatrixUniform, false,
		model_view_matrix.normal());
}

function to2DMode()
{
	gl.disable(gl.DEPTH_TEST);

	projection_matrix.ortho(0.0, gl.viewportWidth, gl.viewportHeight, 0.0,
		-1.0, 1.0);
	projection_matrix.setUniform();

	model_view_matrix.setIdentity();
	model_view_matrix.setUniform();
}

var sq_vertex_buf = 0;
var sq_color_buf = 0;

function drawSquare()
{
	if (!sq_vertex_buf)
		sq_vertex_buf = gl.createBuffer();
	if (!sq_color_buf)
		sq_color_buf = gl.createBuffer();

	gl.enableVertexAttribArray(shaders.program.vertexColorAttribute);
	gl.vertexAttrib4f(shaders.program.vertexColorAttribute, 1, 1, 1, 1);
	gl.disableVertexAttribArray(shaders.program.textureCoordAttribute);

	var vertices = new Float32Array([
		10, 10, 0,
		10, 110, 0,
		110, 110, 0,
		110, 10, 0
	]);
	var colors = new Float32Array([
		1, 0, 0, 1,
		0, 1, 0, 1,
		0, 0, 1, 1,
		1, 1, 0, 1
	]);

	texture_cache.bind("white");

	gl.bindBuffer(gl.ARRAY_BUFFER, sq_vertex_buf);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	gl.vertexAttribPointer(shaders.program.vertexPositionAttribute, 3,
		gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, sq_color_buf);
	gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
	gl.vertexAttribPointer(shaders.program.vertexColorAttribute, 4,
		gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.LINE_LOOP, 0, 4);
}

function drawScene()
{
	if (!shaders.ready)
		return;

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	to3DMode();
	map.draw();

	to2DMode();
	text_buffer.drawStringAt(10, 10, [65, 97, 109]);
	drawSquare();
}

var lastFPS = new Date().getTime();
function animate()
{
	var timeNow = new Date().getTime();

	map.animate(timeNow);

	fps_counter.update(timeNow);
	if (timeNow - lastFPS > 5000)
	{
		console.log(fps_counter.get());
		lastFPS = timeNow;
	}
}

function tick()
{
	requestAnimFrame(tick);
	key_handler.handleKeys();
	drawScene();
	animate();
}

function webGLStart()
{
	var canvas = document.getElementById("webel-canvas");
	initGL(canvas);

	shaders.init();
	texture_cache = new TextureCache();
	object_2d_def_cache = new Object2DDefCache();
	object_3d_def_cache = new Object3DDefCache();
	particle_system_def_cache = new ParticleSystemDefCache();
	font = new Font;
	text_buffer = new TextBuffer(1000);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	document.onkeydown = function(event) { key_handler.handleKeyDown(event); }
	document.onkeyup = function(event) { key_handler.handleKeyUp(event); }

	map = new GameMap("maps/map3.elm");

	tick();
}
