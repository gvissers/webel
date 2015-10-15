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
 * Add a message from channel @a channel and with contents @a text to the text
 * buffer. If the buffer grows too long, older messages are discarded.
 * @param channel The type of message to add
 * @param text    Text contents of the message
 */
TextBuffer.prototype.add = function(channel, text)
{
	var off = 0;
	while (off < text.length)
	{
		var end = text.indexOf("\n".charCodeAt(0), off);
		if (end == -1)
			end = text.length;
		this.messages.push({channel: channel, text: text.slice(off, end)});
		off = end + 1;
	}

	if (this.messages.length >= 2*this.min_history)
		this.messages = this.messages.slice(-this.min_history);
};

/**
 * Draw all messages in the text buffer.
 * TODO FIXME: compared to the full client, this obviously needs work. Lines
 * aren't wrapped, messages don't scroll out, no filtering on channel is done,
 * no support for console and scrolling, etc. But for a first version, it
 * suffices.
 */
TextBuffer.prototype.draw = function()
{
	var end = this.messages.length;
	var start = end > 10 ? end - 10 : 0;
	for (var i = start, y = 10; i < end; ++i, y += Font.y_spacing)
	{
		this.drawStringAt(10, y, this.messages[i].text);
	}
};

TextBuffer.prototype.drawStringAt = function(x_start, y_start, str)
{
	if (str.length > this.buffers_size)
		this.resizeBuffers(str.length);

	var x = x_start;
	var y = y_start;
	var count = 0;
	for (var i = 0; i < str.length; ++i)
	{
		var c = str[i];
		if (Protocol.charIsColor(c))
		{
			this.current_color = c;
			continue;
		}

		var dx = font.addChar(x, y, c, this.current_color,
			this.vertices.subarray(8*count, 8*count+8),
			this.texture_coords.subarray(8*count, 8*count+8),
			this.colors.subarray(12*count, 12*count+12));
		this.indices[6*count  ] = 4*count;
		this.indices[6*count+1] = 4*count+1;
		this.indices[6*count+2] = 4*count+2;
		this.indices[6*count+3] = 4*count;
		this.indices[6*count+4] = 4*count+2;
		this.indices[6*count+5] = 4*count+3;

		x += dx;
		++count;
	}

	font.bindTexture();

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
	gl.vertexAttribPointer(shaders.program_2d.vertex_position, 2,
		gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
	gl.vertexAttribPointer(shaders.program_2d.vertex_color, 3,
		gl.UNSIGNED_BYTE, true, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_coord_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.texture_coords, gl.STATIC_DRAW);
	gl.vertexAttribPointer(shaders.program_2d.texture_coord, 2,
		gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

	gl.drawElements(gl.TRIANGLES, 6*count, gl.UNSIGNED_SHORT, 0);
};

TextBuffer.prototype.resizeBuffers = function(min_len)
{
	if (this.buffers_size < min_len)
	{
		this.buffers_size = 100 * Math.ceil(min_len/100);
		this.vertices = new Float32Array(8*this.buffers_size);
		this.texture_coords = new Float32Array(8*this.buffers_size);
		this.colors = new Uint8Array(12*this.buffers_size);
		this.indices = new Uint16Array(6*this.buffers_size);
	}
}
