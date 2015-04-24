function Shaders()
{
	var _shaders_obj = this;
	var _status = {
		"shaders/shader-fs.glsl": this.UNINITIALIZED,
		"shaders/shader-vs.glsl": this.UNINITIALIZED
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
			_status[fname] = this.ERROR;
			throw ("Unknown shader type for file " + fname);
		}

		_status[fname] = this.IN_PROGRESS;
		$.ajax(fname, {
			error: function() {
				_status[fname] = Shaders.ERROR;
				throw ("Failed to get shader source file " + fname);
			},
			success: function(str) {
				var shader = gl.createShader(type);

				gl.shaderSource(shader, str);
				gl.compileShader(shader);

				if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
				{
					_status[fname] = Shaders.ERROR;
					throw gl.getShaderInfoLog(shader);
				}
				else
				{
					gl.attachShader(_shaders_obj.program, shader);
					_status[fname] = Shaders.OK;
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
				case this.UNINITIALIZED:
				case this.IN_PROGRESS:
					setTimeout(_finishShaders, 100);
				case this.ERROR:
					return;
				case this.OK:
				default:
					/* continue */
			}
		}

		var program = _shaders_obj.program;
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS))
			throw "Could not initialise shaders";

		gl.useProgram(program);

		program.vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
		gl.enableVertexAttribArray(program.vertexPositionAttribute);

		program.vertexColorAttribute = gl.getAttribLocation(program, "aVertexColor");
		gl.enableVertexAttribArray(program.vertexColorAttribute);

		program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
		program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");

		_shaders_obj.ready = true;
	}

	this.init = function()
	{
		this.program = gl.createProgram();

		for (var fname in _status)
			_getShaderScript(fname);

		setTimeout(_finishShaders, 100);
	}
}

Shaders.UNINITIALIZED = -2;
Shaders.IN_PROGRESS   = -1;
Shaders.OK            = 0;
Shaders.ERROR         = 1;
