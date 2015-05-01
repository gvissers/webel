/**
 * Class for reading DDS files
 *
 * Class for reading compressed texture data from microsoft Direct Draw Surface
 * files.
 */
function DDS(data)
{
	/// Width of the texture, in pixels
	this.width = 0;
	/// Height of the texture, in pixels
	this.height = 0;
	/// Format code of the data
	this.format = -1;
	/// Byte arrays for the compressed texture data, for each mipmap level
	this.mipmaps = [];
	/// Flag indicating whether the data was sucessfully loaded
	this.ok = false;

	var header = new Uint32Array(data, 0, DDS.header_length+1);
	if (header[0] != this.fourCC("DDS "))
	{
		logError("Not a DDS file");
		return;
	}

	var pixelFlags = header[20];
	if (!(pixelFlags & DDS.PixelFlags.DDPF_FOURCC))
	{
		logError("Unsupported DDS format (no fourCC code available");
		return;
	}

	this.format = this.unfourCC(header[21]);
	var blockSize = 0;
	switch (this.format)
	{
		case "DXT1":
			blockSize = 8;
			break;
		case "DXT5":
			blockSize = 16;
			break;
		default:
			logError("Unsupported DDS format " + format);
			return;
	}

	nrMipmaps = 1;
	var flags = header[2];
	if (flags & DDS.Flags.DDSD_MIPMAPCOUNT)
		nrMipmaps = Math.max(nrMipmaps, header[7]);

	this.height = header[3];
	this.width = header[4];

	var offset = header[1] + 4; // size + four magic bytes
	var height = this.height;
	var width = this.width;
	for (var level = 0; level < nrMipmaps; ++level)
	{
		var length = ((width+3)>>2) * ((height+3)>>2) * blockSize;
		this.mipmaps[level] = {
			width: width,
			height: height,
			data: new Uint8Array(data, offset, length)
		};
		offset += length;
		width = Math.max(width>>1, 1);
		height = Math.max(height>>1, 1);
	}

	this.ok = true;
}

/// Length of the header in a DDS file, in 4-byte integers
DDS.header_length = 31;

/// Values used for the flags field in the DDS header
DDS.Flags = {
	/// If set, the mipmap count field is set
	DDSD_MIPMAPCOUNT: 0x20000
};
/// Values used for the pixel flags field in the DDS header
DDS.PixelFlags = {
	DDPF_FOURCC: 0x04
};

/**
 * Convert a four-CC string to integer
 *
 * Convert the four-CC character string @a str to a (four-byte) unsigned
 * integer. The string should consist of 4 ASCII characters.
 * @param str The character string to convert
 * @return integer corresponding to the same four bytes
 */
DDS.prototype.fourCC = function(str)
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
DDS.prototype.unfourCC = function(val)
{
	return String.fromCharCode(
		val & 0xff,
		(val >> 8) & 0xff,
		(val >> 16) & 0xff,
		(val >> 24) & 0xff
	);
}
