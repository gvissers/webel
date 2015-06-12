#ifndef IMAGE_HH
#define IMAGE_HH

#include <cstdint>
#include <iostream>
#include <vector>
#include "Pixel.hh"

class Image
{
public:
	Image(int width, int height, int nr_mipmaps=1);
	Image(Image &&image) = default;
	Image(const Image&) = delete;
	~Image()
	{
		for (Pixel *mipmap: _pixels)
		{
			delete[] mipmap;
		}
	}

	Pixel& operator()(int i, int j, int lvl=0)
	{
		return _pixels[lvl][i*_widths[lvl]+j];
	}
	const Pixel& operator()(int i, int j, int lvl=0) const
	{
		return _pixels[lvl][i*_widths[lvl]+j];
	}

	int width(int lvl=0) const { return _widths[lvl]; }
	int height(int lvl=0) const { return _heights[lvl]; }
	int nrMipmaps() const { return _pixels.size(); }
	bool hasMipmaps() const { return nrMipmaps() > 1; }
	int size(int lvl=0) const { return width(lvl)*height(lvl); }

	void copyInto(Image& image, int i, int j) const;

	void writePNG(std::ostream& os, int lvl=0) const;

private:
	static std::uint32_t _crc_table[];
	static bool _crc_table_computed;

	std::vector<int> _widths;
	std::vector<int> _heights;
	std::vector<Pixel*> _pixels;

	static void make_crc_table();
	static std::uint32_t update_crc(std::uint32_t crc, const unsigned char *buf,
		int len);
	static std::uint32_t crc(const unsigned char *buf, int len);

	static void writePNGChunk(std::ostream& os, const char* name,
		const unsigned char* data, int len);
};

#endif // IMAGE_HH
