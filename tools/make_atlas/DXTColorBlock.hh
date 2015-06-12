#ifndef DXTCOLORBLOCK_HH
#define DXTCOLORBLOCK_HH

#include <cstdint>
#include "Image.hh"

struct DXTColorBlock
{
	std::uint16_t colors[2];
	std::uint32_t indices;

	void unpack(Image& image, int i, int j, int lvl, bool dxt1=false) const;
};

#endif // DXTCOLORBLOCK_HH
