"use strict";

/**
 * FPS counter
 *
 * Class for counting frames per second. Timestamps for @a nr_frames frames
 * are stored, and a running average over the timestamps is maintained.
 */
function FPSCounter(nr_frames, time)
{
	/// Timestamps for the last @a nr_frames frames
	this._times = [];
	for (var i = 0; i < nr_frames; ++i)
		this._times.push(time);
	/// Index of the current timestamp to update
	this._idx = 0;
}

/**
 * Update the FPS counter when a new frame is drawn a timestamp @a time.
 */
FPSCounter.prototype.update = function(time)
{
	this._times[this._idx] = time;
	if (++this._idx >= this._times.length)
		this._idx = 0;
};

/**
 * Get the current frame rate
 */
FPSCounter.prototype.get = function()
{
	var last = this._idx == 0 ? this._times.length - 1 : this._idx - 1;
	return 1000 * this._times.length / (this._times[last] - this._times[this._idx]);
};
