"use strict";

/**
 * Class to load and use GLSL shaders
 */
function Shaders()
{
	var _shaders_obj = this;
	var _status = {
		"shaders/shader-fs.glsl": Shaders.Status.UNINITIALIZED,
		"shaders/shader-vs.glsl": Shaders.Status.UNINITIALIZED
	};

	this.ready = false;
	this.program = null;

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
					gl.attachShader(_shaders_obj.program, shader);
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

		gl.useProgram(program);

		program.vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
		program.vertexNormalAttribute = gl.getAttribLocation(program, "aVertexNormal");
		program.vertexColorAttribute = gl.getAttribLocation(program, "aVertexColor");
		program.textureCoordAttribute = gl.getAttribLocation(program, "aTextureCoord");

		gl.enableVertexAttribArray(program.vertexPositionAttribute);

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

		_shaders_obj.ready = true;
	}

	this.init = function()
	{
		this.program = gl.createProgram();

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
