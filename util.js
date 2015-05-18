"use strict";

/**
 * Convert a four-CC string to integer
 *
 * Convert the four-CC character string @a str to a (four-byte) unsigned
 * integer. The string should consist of 4 ASCII characters.
 * @param str The character string to convert
 * @return integer corresponding to the same four bytes
 */
function fourCC(str)
{
	return str.charCodeAt(0)
		| (str.charCodeAt(1) << 8)
		| (str.charCodeAt(2) << 16)
		| (str.charCodeAt(3) << 24);
}

/**
 * Convert a four-CC integer to string
 *
 * Convert the four byte integer @a val to a four-byte character string.
 * @param val The integer string to convert
 * @return string containing the integer vyte values as characters
 */
function unfourCC(val)
{
	return String.fromCharCode(
		val & 0xff,
		(val >> 8) & 0xff,
		(val >> 16) & 0xff,
		(val >> 24) & 0xff
	);
}

/**
 * Extract string
 *
 * Extract a zero-terminated ASCII string from byte buffer @a buf of length
 * @a len.
 * @param buf The buffer to read the string from
 * @param len The number of bytes in the buffer
 * @return String contents of the buffer
 */
function extractString(buf, off, len)
{
	var str = '';
	for (var j = off; j < off+len; ++j)
	{
		var byte = buf.getUint8(j);
		if (byte == 0)
			break;
		str += String.fromCharCode(byte);
	}
	return str;
}

/**
 * Calculate a transformation matrix based on position and rotation of an object
 * @param position Position of the object
 * @param rotation Orientation of the object
 * @return Transformation matrix placing the object into the correct position
 */
function calculateTransformationMatrix(position, rotation)
{
	var transform = mat4.create();
	mat4.identity(transform);
	mat4.translate(transform, transform, position);
	mat4.rotateZ(transform, transform, rotation[2]*Math.PI/180);
	mat4.rotateX(transform, transform, rotation[0]*Math.PI/180);
	mat4.rotateY(transform, transform, rotation[1]*Math.PI/180);
	return transform;
}

/**
 * Return the absolute largest element of @a array.
 * @param array The array of which to find the absolute largest value
 * @return The absolute largest element in the array
 */
function maxabs(array)
{
	var res = 0;
	for (var i = 0; i < array.length; ++i)
		res = Math.max(res. Math.abs(array[i]));
	return res;
}
