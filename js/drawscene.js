"use strict";

var gl;
var model_view_matrix = new ModelViewMatrix;
var model_view_matrix_2d = new ModelViewMatrix("program_2d");
var projection_matrix = new ProjectionMatrix;
var projection_matrix_2d = new ProjectionMatrix("program_2d");
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
var sky;
var connection;

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
	gl.useProgram(shaders.program);

	gl.enableVertexAttribArray(shaders.program.vertex_position);
	gl.disableVertexAttribArray(shaders.program.vertex_normal);
	gl.disableVertexAttribArray(shaders.program.vertex_color);
	gl.enableVertexAttribArray(shaders.program.texture_coord);

	gl.enable(gl.DEPTH_TEST);

	var aspect = gl.viewportWidth/gl.viewportHeight;
	projection_matrix.perspective(Camera.field_of_view*Math.PI/180, aspect,
		Camera.near_plane, Camera.far_plane);
	projection_matrix.setUniform();

	model_view_matrix.setIdentity();
	camera.setModelView();
	model_view_matrix.setUniform();

	gl.uniformMatrix3fv(shaders.program.nMatrixUniform, false,
		model_view_matrix.normal());

	gl.uniform1f(shaders.program.fog_density, 0.05);
	gl.uniform3fv(shaders.program.fog_color, [0.5, 0.5, 0.5]);
}

function to2DMode()
{
	gl.useProgram(shaders.program_2d);

	gl.enableVertexAttribArray(shaders.program_2d.vertex_position);
	gl.enableVertexAttribArray(shaders.program_2d.vertex_color);
	gl.enableVertexAttribArray(shaders.program_2d.texture_coord);

	gl.disable(gl.DEPTH_TEST);

	projection_matrix_2d.ortho(0.0, gl.viewportWidth, gl.viewportHeight, 0.0,
		-1.0, 1.0);
	projection_matrix_2d.setUniform();

	model_view_matrix_2d.setIdentity();
	model_view_matrix_2d.setUniform();
}

function drawScene()
{
	if (!shaders.ready)
		return;

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	to3DMode();
	sky.draw();
	map.draw();

	to2DMode();
	text_buffer.draw();
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
	sky = new Sky;

	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	document.onkeydown = function(event) { key_handler.handleKeyDown(event); }
	document.onkeyup = function(event) { key_handler.handleKeyUp(event); }

	map = new GameMap("maps/map3.elm");

	connection = new Connection("webel.ghnet.nl", 2001);

text_buffer.add(0, [116, 104, 105, 115, 32, 105, 115, 32, 97, 32, 115, 116, 114, 105, 110, 103, 10, 119, 105, 116, 104, 32, 97, 32, 110, 101, 119, 108, 105, 110, 101]);
text_buffer.add(0, [116, 104, 105, 115, 32, 105, 115, 32, 97, 32, 118, 101, 114, 121, 32, 108, 111, 110, 103, 32, 115, 116, 114, 105, 110, 103, 32, 99, 111, 110, 116, 97, 105, 110, 105, 110, 103, 32, 108, 111, 116, 115, 32, 111, 102, 32, 116, 101, 120, 116, 32, 119, 104, 105, 99, 104, 32, 112, 114, 111, 98, 97, 98, 108, 121, 32, 119, 111, 110, 39, 116, 32, 102, 105, 116, 32, 111, 110, 32, 116, 104, 101, 32, 115, 99, 114, 101, 101, 110]);

	tick();
}
