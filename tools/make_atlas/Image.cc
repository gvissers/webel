#include <stdexcept>
#include "Image.hh"
#include "endian.h"
#include "zlib.h"

/* Table of CRCs of all 8-bit messages. */
std::uint32_t Image::_crc_table[256];

/* Flag: has the table been computed? Initially false. */
bool Image::_crc_table_computed = false;

/* Make the table for a fast CRC. */
void Image::make_crc_table()
{
	std::uint32_t c;
	int n, k;

	for (n = 0; n < 256; n++)
	{
		c = std::uint32_t(n);
		for (k = 0; k < 8; k++)
		{
			if (c & 1)
				c = 0xedb88320U ^ (c >> 1);
			else
				c = c >> 1;
		}
		_crc_table[n] = c;
	}

	_crc_table_computed = 1;
}

/* Update a running CRC with the bytes buf[0..len-1]--the CRC
	should be initialized to all 1's, and the transmitted value
	is the 1's complement of the final running CRC (see the
	crc() routine below)). */
std::uint32_t Image::update_crc(std::uint32_t crc, const unsigned char *buf,
	int len)
{
	std::uint32_t c = crc;
	int n;

	if (!_crc_table_computed)
		make_crc_table();

	for (n = 0; n < len; n++)
		c = _crc_table[(c ^ buf[n]) & 0xff] ^ (c >> 8);

	return c;
}

/* Return the CRC of the bytes buf[0..len-1]. */
std::uint32_t Image::crc(const unsigned char *buf, int len)
{
	return update_crc(0xffffffffU, buf, len) ^ 0xffffffffU;
}

Image::Image(int width, int height, int nr_mipmaps):
	_widths(nr_mipmaps), _heights(nr_mipmaps), _pixels(nr_mipmaps)
{
	int w = width, h = height;
	for (int i = 0; i < nr_mipmaps; ++i)
	{
		_widths[i] = w;
		_heights[i] = h;
		_pixels[i] = new Pixel[w*h];
		w = std::max(1, w>>1);
		h = std::max(1, h>>1);
	}
}

void Image::copyInto(Image& image, int i, int j) const
{
	for (int lvl = 0; lvl < std::min(nrMipmaps(), image.nrMipmaps()); ++lvl)
	{
		int h = std::min(height(lvl), image.height(lvl)-i);
		int w = std::min(width(lvl), image.width(lvl)-j);
		for (int ii = 0; ii < h; ++ii)
		{
			for (int jj = 0; jj < w; ++jj)
				image(i+ii, j+jj, lvl) = (*this)(ii, jj, lvl);
		}
		i /= 2;
		j /= 2;
	}
}

void Image::writePNG(std::ostream& os, int lvl) const
{
	os.write("\x89PNG\x0d\x0a\x1a\x0a", 8);

	unsigned char hdr[13];
	*reinterpret_cast<int32_t*>(hdr) = htobe32(width(lvl));
	*reinterpret_cast<int32_t*>(hdr+4) = htobe32(height(lvl));
	hdr[8] = 8;
	hdr[9] = 6;
	hdr[10] = 0;
	hdr[11] = 0;
	hdr[12] = 0;
	writePNGChunk(os, "IHDR", hdr, 13);

	int s = size(lvl)*4 + height(lvl);
	unsigned char* data = new unsigned char[s];
	int idx = 0;
	for (int i = 0, pidx = 0; i < height(lvl); ++i)
	{
		data[idx++] = 0;
		for (int j = 0; j < width(lvl); ++j, ++pidx)
		{
			const Pixel& p = _pixels[lvl][pidx];
			data[idx++] = p.redByte();
			data[idx++] = p.greenByte();
			data[idx++] = p.blueByte();
			data[idx++] = p.alphaByte();
		}
	}
	int len = idx;

	unsigned long zlen = size(lvl)*44/10 + 12;
	unsigned char* zdata = new unsigned char[zlen];
	if (compress(zdata, &zlen, data, len) != Z_OK)
		throw std::runtime_error("Failed to compress PNG data");
	delete[] data;
	writePNGChunk(os, "IDAT", zdata, zlen);
	delete[] zdata;

	writePNGChunk(os, "IEND", nullptr, 0);
}

void Image::writePNGChunk(std::ostream& os, const char* name,
	const unsigned char* data, int len)
{
	std::uint32_t cs = update_crc(0xffffffffU,
		reinterpret_cast<const unsigned char*>(name), 4);
	cs = update_crc(cs, data, len) ^ 0xffffffffU;

	char buf[4];
	*reinterpret_cast<int32_t*>(buf) = htobe32(len);
	os.write(buf, 4);
	os.write(name, 4);
	os.write(reinterpret_cast<const char*>(data), len);
	*reinterpret_cast<int32_t*>(buf) = htobe32(cs);
	os.write(buf, 4);
}
