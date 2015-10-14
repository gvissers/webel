"use strict"

/**
 * Provide an implementation of TypedArray.prototype.copyWithin, which is
 * not available on Chromium
 */
if (!Uint8Array.prototype.copyWithin)
{
	Object.getPrototypeOf(Uint8Array.prototype).copyWithin
		= function(target, start, end)
	{
		if (!end)
			end = this.length;

		if (end === undefined || end > this.length)
			end = this.length;
		else if (end < 0)
			end = 0;

		if (start > target)
		{
			for (var i = target, j = start; j < end; ++i, ++j)
				this[i] = this[j];
		}
		else
		{
			var n = end - start;
			for (var i = target+n-1, j = end-1; j >= start; --i, --j)
				this[i] = this[j];
		}
	}
}