"use strict";

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
	if (header[0] != fourCC("DDS "))
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

	this.format = unfourCC(header[21]);
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

	var nrMipmaps = 1;
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
