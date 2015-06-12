#ifndef DXTINTERPOLATEDALPHABLOCK_HH
#define DXTINTERPOLATEDALPHABLOCK_HH

#include <cstdint>
#include "Image.hh"

struct DXTInterpolatedAlphaBlock
{
	std::uint8_t alphas[2];
	std::uint16_t indices[3];

	void unpack(Image& image, int i, int j, int lvl) const;
};


#endif // DXTINTERPOLATEDALPHABLOCK_HH
