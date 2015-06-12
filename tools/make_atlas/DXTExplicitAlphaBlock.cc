#include "DXTExplicitAlphaBlock.hh"

void DXTExplicitAlphaBlock::unpack(Image& image, int i, int j, int lvl) const
{
	int iimax = std::min(4, image.height(lvl)-i);
	int jjmax = std::min(4, image.width(lvl)-j);
	for (int ii = 0; ii < iimax; ++ii)
	{
		for (int jj = 0; jj < jjmax; ++jj)
			image(i+ii, j+jj, lvl).setAlpha((alphas[ii] >> (jj * 4) & 0x0f) / 15.0f);
	}
}
