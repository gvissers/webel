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
			logError("Unknown shader type for file " + fname);
			_status[fname] = this.ERROR;
			return;
		}

		_status[fname] = this.IN_PROGRESS;
		$.ajax(fname, {
			error: function() {
				logError("Failed to get shader source file " + fname);
				_status[fname] = Shaders.ERROR;
			},
			success: function(str) {
				var shader = gl.createShader(type);

				gl.shaderSource(shader, str);
				gl.compileShader(shader);

				if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
				{
					logError("Failed to compile shader: " + gl.getShaderInfoLog(shader));
					_status[fname] = Shaders.ERROR;
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
			logError("Could not initialise shaders");

		gl.useProgram(program);

		program.vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
		program.vertexColorAttribute = gl.getAttribLocation(program, "aVertexColor");
		program.textureCoordAttribute = gl.getAttribLocation(program, "aTextureCoord");

		gl.enableVertexAttribArray(program.vertexPositionAttribute);

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
