"use strict";

/**
 * Lookup table for half floats
 *
 * Class for looking up 16-bit float values.
 */
function HalfLUT()
{
	/// The lookup table itself
	this._lut = new Float32Array(0x10000);

	var intlut = new Uint32Array(this._lut.buffer);
	for (var i = 0; i < 0x10000; ++i)
	{
		var sign = i >> 15;
		var exponent = (i >> 10) & 0x1f;
		var mantissa = i & 0x3ff;

		if (exponent == 0)
		{
			if (mantissa != 0)
			{
				// denormalized half, can be normalized in 32-bit
				exponent = 127 - 15 + 1;
				do
				{
					--exponent;
					mantissa <<= 1;
				} while ((mantissa & 0x400) == 0);

				mantissa &= 0x3ff;
			}
			// else: mantissa zero => float is zero
		}
		else if (exponent == 0x1f)
		{
			// inf or nan
			exponent = 0xff;
		}
		else
		{
			exponent += 127 - 15;
		}

		intlut[i] = (sign << 31) | (exponent << 23) | (mantissa << 13);
	}
}

/// Lookup the float value corresponding to half float @a i
HalfLUT.prototype.lookup = function(i)
{
	return this._lut[i];
}
