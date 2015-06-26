"use strict";

/**
 * Class to load and use GLSL shaders
 */
function Shaders()
{
	var _shaders_obj = this;
	var _status = {
		"shaders/shader-fs.glsl": Shaders.Status.UNINITIALIZED,
		"shaders/shader-vs.glsl": Shaders.Status.UNINITIALIZED,
		"shaders/shader2d-fs.glsl": Shaders.Status.UNINITIALIZED,
		"shaders/shader2d-vs.glsl": Shaders.Status.UNINITIALIZED
	};

	this.ready = false;
	this.program = null;
	this.program_2d = null;

	function _getShaderScript(fname)
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
			logError("Unknown shader type for file " + fname);
			_status[fname] = Shaders.Status.ERROR;
			return;
		}

		var progname = fname.indexOf("2d") >= 0 ? "program_2d" : "program";

		_status[fname] = Shaders.Status.IN_PROGRESS;
		$.ajax(fname, {
			error: function() {
				logError("Failed to get shader source file " + fname);
				_status[fname] = Shaders.Status.ERROR;
			},
			success: function(str) {
				var shader = gl.createShader(type);

				gl.shaderSource(shader, str);
				gl.compileShader(shader);

				if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
				{
					logError("Failed to compile shader: " + gl.getShaderInfoLog(shader));
					_status[fname] = Shaders.Status.ERROR;
				}
				else
				{
					gl.attachShader(_shaders_obj[progname], shader);
					_status[fname] = Shaders.Status.OK;
				}
			}
		});
	}

	function _finishShaders()
	{
		for (var fname in _status)
		{
			switch (_status[fname])
			{
				case Shaders.Status.UNINITIALIZED:
				case Shaders.Status.IN_PROGRESS:
					setTimeout(_finishShaders, 100);
				case Shaders.Status.ERROR:
					return;
				case Shaders.Status.OK:
				default:
					/* continue */
			}
		}

		var program = _shaders_obj.program;
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS))
			logError("Could not initialise shaders");

		program.vertex_position = gl.getAttribLocation(program, "vertex_position");
		program.vertex_normal = gl.getAttribLocation(program, "vertex_normal");
		program.vertex_color = gl.getAttribLocation(program, "vertex_color");
		program.texture_coord = gl.getAttribLocation(program, "texture_coord");

		program.projection = gl.getUniformLocation(program, "projection");
		program.model_view = gl.getUniformLocation(program, "model_view");
		program.useLightingUniform = gl.getUniformLocation(program, "uUseLighting");
		program.nMatrixUniform = gl.getUniformLocation(program, "uNMatrix");
		program.ambientColorUniform = gl.getUniformLocation(program, "uAmbientColor");
		program.lightingDirectionUniform = gl.getUniformLocation(program, "uLightingDirection");
		program.directionalColorUniform = gl.getUniformLocation(program, "uDirectionalColor");

		program.alpha_low = gl.getUniformLocation(program, "alpha_low");
		program.point_size = gl.getUniformLocation(program, "point_size");
		program.do_point = gl.getUniformLocation(program, "do_point");

		program.fog_density = gl.getUniformLocation(program, "fog_density");
		program.fog_color = gl.getUniformLocation(program, "fog_color");

		var program_2d = _shaders_obj.program_2d;
		gl.linkProgram(program_2d);
		if (!gl.getProgramParameter(program_2d, gl.LINK_STATUS))
			logError("Could not initialise 2D shaders");

		program_2d.vertex_position = gl.getAttribLocation(program_2d, "vertex_position");
		program_2d.vertex_color = gl.getAttribLocation(program_2d, "vertex_color");
		program_2d.texture_coord = gl.getAttribLocation(program_2d, "texture_coord");

		program_2d.projection = gl.getUniformLocation(program_2d, "projection");
		program_2d.model_view = gl.getUniformLocation(program_2d, "model_view");

		program_2d.alpha_low = gl.getUniformLocation(program_2d, "alpha_low");

		_shaders_obj.ready = true;
	}

	this.init = function()
	{
		this.program = gl.createProgram();
		this.program_2d = gl.createProgram();

		for (var fname in _status)
			_getShaderScript(fname);

		setTimeout(_finishShaders, 100);
	};
}

Shaders.Status = {
	UNINITIALIZED: -2,
	IN_PROGRESS:   -1,
	OK:            0,
	ERROR:         1
};
