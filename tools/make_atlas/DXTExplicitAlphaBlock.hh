#ifndef DXTEXPLICITALPHABLOCK_HH
#define DXTEXPLICITALPHABLOCK_HH

#include <cstdint>
#include "Image.hh"

struct DXTExplicitAlphaBlock
{
	std::uint16_t alphas[4];

	void unpack(Image& image, int i, int j, int lvl) const;
};


#endif // DXTEXPLICITALPHABLOCK_HH
