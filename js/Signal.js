"use strict";

/**
 * Object for simple asynchronous processing (i.e. storing callbacks in a
 * central location without passing them around as arguments.
 */
var Signal = {
	/// Map from signal number to list of callbacks
	_callbacks: {},

	/// Enumeration of known signals
	TEXTURE_ATLASES_LOADED: 0,

	/**
	 * Register a callback, to be executed when a signal is emitted
	 * @param signal   The signal to bind a callback to
	 * @param callback The function to execute when @a signal is emitted
	 */
	bind: function(signal, callback)
	{
		if (!(signal in this._callbacks))
			this._callbacks[signal] = [];
		this._callbacks[signal].push(callback);
	},

	/**
	 * Emit a signal, and call all callbacks registered with this signal.
	 * Executed callbacks are no longer associated with the signal.
	 * @param signal The signal number to emit
	 */
	emit: function(signal)
	{
		if (!(signal in this._callbacks))
			return;

		for (var i = 0; i < this._callbacks[signal].length; ++i)
			this._callbacks[signal][i]();

		delete this._callbacks[signal];
	}
};
