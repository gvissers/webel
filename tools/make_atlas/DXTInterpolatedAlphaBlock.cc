#include "DXTInterpolatedAlphaBlock.hh"

void DXTInterpolatedAlphaBlock::unpack(Image& image, int i, int j, int lvl) const
{
	float tmp[8];

	tmp[0] = alphas[0] / 255.0f;
	tmp[1] = alphas[1] / 255.0f;
	if (alphas[0] > alphas[1])
	{
		for (int i = 0; i < 6; ++i)
			tmp[i+2] = ((6-i)*tmp[0] + (i+1)*tmp[1]) / 7.0f;
	}
	else
	{
		for (int i = 0; i < 4; ++i)
			tmp[i+2] = ((4-i)*tmp[0] + (i+1)*tmp[1]) / 5.0f;
		tmp[6] = 0.0f;
		tmp[7] = 1.0f;
	}

	int iimax = std::min(4, image.height(lvl)-i);
	int jjmax = std::min(4, image.width(lvl)-j);
	std::uint64_t index = std::uint64_t(indices[0])
		| (std::uint64_t(indices[1]) << 16)
		| (std::uint64_t(indices[2]) << 32);
	for (int ii = 0; ii < iimax; ++ii)
	{
		for (int jj = 0; jj < jjmax; ++jj, index >>= 3)
			image(i+ii, j+jj, lvl).setAlpha(tmp[index&0x07]);
	}
}
