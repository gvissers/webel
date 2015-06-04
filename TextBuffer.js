"use strict";

/**
 * Class for storing text messages from the server
 * @param min_history The minimum number of messages to remember
 */
function TextBuffer(min_history)
{
	/// The messages in the buffer
	this.messages = [];
	/// The minimum number of messages to remember
	this.min_history = min_history;

	/// Current text color
	this.current_color = Protocol.ColorCode.GREY1;

	this.buffers_size = 100;
	/// Colors of the characters to draw
	this.vertices = new Float32Array(8*this.buffers_size);
	/// Texture coordinates of the characters to draw
	this.texture_coords = new Float32Array(8*this.buffers_size);
	/// Colors of the characters to draw
	this.colors = new Uint8Array(12*this.buffers_size);
	/// Indexes of the vertices to draw
	this.indices = new Uint16Array(6*this.buffers_size);

	/// GL vertex buffer
	this.vertex_buffer = gl.createBuffer();
	/// GL texture coordinate buffer
	this.texture_coord_buffer = gl.createBuffer();
	/// GL color buffer
	this.color_buffer = gl.createBuffer();
	/// GL vertex index buffer
	this.index_buffer = gl.createBuffer();
}

/**
 * Add a message of type @a type and with contents @a text to the text buffer.
 * If the buffer grows too long, older messages are discarded,
 * @param type The type of message to add
 * @param text Text contents of the message
 */
TextBuffer.prototype.add = function(type, text)
{
	this.messages.push({type: type, text: text});
	if (this.messages.length >= 2*this.min_history)
		this.messages = this.messages.slice(-this.min_history);
};

TextBuffer.prototype.drawCharAt = function(x, y, c)
{
	gl.enableVertexAttribArray(shaders.program.vertexColorAttribute);

	if (Protocol.charIsColor(c))
	{
		this.current_color = c;
		return;
	}

	font.addChar(x, y, c, this.current_color, this.vertices.subarray(0, 8),
		this.texture_coords.subarray(0, 8), this.colors.subarray(0, 12));
	this.indices[0] = 0;
	this.indices[1] = 1;
	this.indices[2] = 2;
	this.indices[3] = 0;
	this.indices[4] = 2;
	this.indices[5] = 3;

	font.bindTexture();

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
	gl.vertexAttribPointer(shaders.program.vertexPositionAttribute, 2,
		gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_coord_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.texture_coords, gl.STATIC_DRAW);
	gl.vertexAttribPointer(shaders.program.textureCoordAttribute, 2,
		gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
	gl.vertexAttribPointer(shaders.program.vertexColorAttribute, 3,
		gl.UNSIGNED_BYTE, true, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
};
