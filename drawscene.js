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

function setMatrixUniforms()
{
	projection_matrix.setUniform();
	model_view_matrix.setUniform();
	gl.uniformMatrix3fv(shaders.program.nMatrixUniform, false,
		model_view_matrix.normal());
}

var map;

function drawScene()
{
	if (!shaders.ready)
		return;

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var aspect = gl.viewportWidth/gl.viewportHeight;
	projection_matrix.perspective(Camera.field_of_view*Math.PI/180, aspect,
		near_plane, far_plane);

	model_view_matrix.setIdentity();
	camera.setModelView();

	setMatrixUniforms();

	map.draw();
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

	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	document.onkeydown = function(event) { key_handler.handleKeyDown(event); }
	document.onkeyup = function(event) { key_handler.handleKeyUp(event); }

	map = new GameMap("maps/map3.elm");

	tick();
}
