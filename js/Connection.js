"use strict"

/**
 * Class for dealing with the connection to the game server. This class uses
 * web sockets since raw sockets are not available within browsers, so for
 * connecting to the game server some sort of proxy must be used.
 * @param host Name of the (proxy) host to connect to
 * @param port Port number to connect on
 */
function Connection(host, port)
{
	/// Private copy of the host name
	this.host = host;
	/// Private copy of the port number
	this.port = port;
	/// The web socket used to communicate
	this.socket = new WebSocket("ws://" + host + ":" + port, "binary");

	var this_obj = this;
	this.socket.binaryType = "arraybuffer";
	this.socket.onopen = function() { this_obj.onopen(); };
	this.socket.onclose = function() { this_obj.onclose(); };
	this.socket.onerror = function(event) { this_obj.onerror(event); };
	this.socket.onmessage = function(msg)
	{
		this_obj.onmessage(new Uint8Array(msg.data));
	};

	/// Timestamp of the last time we sent a message to the server
	this.last_send_time = 0;

	/// Size of the buffer for unprocessed (incomplete) server messages
	this.unprocessed_data_size = 256;
	/// Size of the buffer that is in use
	this.unprocessed_data_used = 0;
	/// The unprocessed data buffer itself
	this.unprocessed_data = new Uint8Array(this.unprocessed_data_size);
}

/// Interval we are able to not talk to the server before it closes the connection
Connection.heart_beat_timeout = 20000; // milliseconds

/**
 * Check if we should send a heartbeat to the server, and if so, do it.
 * Afterwards, reschedule to check again at an appropriate time.
 */
Connection.prototype.checkHeartbeat = function()
{
	if (!this.socket)
		// socket closed, return to stop heartbeat cycle
		return;

	var now = Date.now();
	var this_obj = this;
	if (now > this.last_send_time + 0.9 * Connection.heart_beat_timeout)
	{
		this.send(Protocol.ServerCmd.HEART_BEAT);
		window.setTimeout(function() { this_obj.checkHeartbeat(); },
			Connection.heart_beat_timeout);
	}
	else
	{
		window.setTimeout(function() { this_obj.checkHeartbeat(); },
			this.last_send_time + Connection.heart_beat_timeout - now);
	}
};

/**
 * Handle a message from the server.
 * @param opcode The command code of the server message
 * @param data   The data associated with the command
 */
Connection.prototype.handleMessage = function(opcode, data)
{
	switch (opcode)
	{
		case Protocol.ClientCmd.RAW_TEXT:
			if (data.length > 4)
				text_buffer.add(data[0], data.slice(1));
			break;
		case Protocol.ClientCmd.PING_REQUEST:
			// XXX NOTE: other-life adds some status information.
			// EL just wants the packet back as is
			this.send(Protocol.ServerCmd.PING_RESPONSE, data);
			break;
		default:
			console.log("got " + opcode + " message with " + data.length + " bytes of data");
	}
};

/// Handle the connection being closed
Connection.prototype.onclose = function()
{
console.log("close");
	this.socket = null;
};

/// Handle an error in the connection to the server
Connection.prototype.onerror = function(err)
{
console.log("error:");
	console.log(err);
};

/**
 * Handle incoming data from the server. This splits the data into separate
 * messages which are handles by handleMessage().
 * @param data The data bytes read from the server
 */
Connection.prototype.onmessage = function(data)
{
	var needed = this.unprocessed_data_used + data.length;
	if (needed > this.unprocessed_data_size)
	{
		var size = 2 * this.unprocessed_data_size;
		while (needed > size)
			size *= 2;
		var new_data = new Uint8Array(size);
		new_data.set(data);
		this.unprocessed_data = data;
		this.unprocessed_data_size = size;
	}

	this.unprocessed_data.set(data, this.unprocessed_data_used);
	this.unprocessed_data_used = needed;

	var off = 0;
	while (off + 3 <= this.unprocessed_data_used)
	{
		var data_size = (this.unprocessed_data[off+1] | (this.unprocessed_data[off+2] << 8)) - 1;
		if (off + 3 + data_size > this.unprocessed_data_used)
			break;

		this.handleMessage(this.unprocessed_data[off],
			this.unprocessed_data.subarray(off+3, off+3+data_size));
		off += 3 + data_size;
	}

	this.unprocessed_data.copyWithin(0, off, this.unprocessed_data_used);
	this.unprocessed_data_used -= off;
};

/// Handle the connection to the server being opened
Connection.prototype.onopen = function()
{
console.log("open");
	this.checkHeartbeat();
};

/**
 * Send a message to the server
 * @param opcode The command code of the message
 * @param data   Data bytes associated with the message
 */
Connection.prototype.send = function(opcode, data)
{
	var bytes;
	if (!data)
	{
		bytes = Uint8Array.from([opcode, 1, 0]);
	}
	else
	{
		var count = data.length;
		if (count >= 0xffff)
			return;

		bytes = new Uint8Array(3 + count);
		bytes[0] = opcode;
		bytes[1] = (count+1) & 0xff;
		bytes[2] = ((count+1) >> 8) & 0xff;
		bytes.set(data, 3);
	}

	this.socket.send(bytes.buffer);

	this.last_send_time = Date.now();
console.log("send " + opcode + " with " + count + " bytes of data");
};