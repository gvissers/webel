var gl;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var game_window;
var lastTime = 0;
var mvMatrixStack = new Stack(mat4.clone);
var shaders = new Shaders();
var texture_cache;
camera = new Camera();
var keys_pressed = {}


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
	mat4.translate(mvMatrix, mvMatrix, camera.position);

	game_window.draw();
}

function animate()
{
	var timeNow = new Date().getTime();
	game_window.animate(timeNow);
}

function tick()
{
	requestAnimFrame(tick);
	handleKeys();
	drawScene();
	animate();
}

function handleKeyDown(event)
{
	keys_pressed[event.keyCode] = true;
}

function handleKeyUp(event)
{
	keys_pressed[event.keyCode] = false;
}

function handleKeys()
{
	if (keys_pressed[33]) {
      // Page Up
      camera.zoomOut();
    }
    if (keys_pressed[34]) {
      // Page Down
      camera.zoomIn();
    }
    game_window.handleKeys(keys_pressed);
}

function webGLStart()
{
	var canvas = document.getElementById("webel-canvas");
	initGL(canvas);

	shaders.init();
	texture_cache = new TextureCache();
	game_window = new GameWindow();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;

	tick();
}
