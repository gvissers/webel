#include "DXTColorBlock.hh"

void DXTColorBlock::unpack(Image& image, int i, int j, int lvl, bool dxt1) const
{
	Pixel tmp[4];

	tmp[0].setColor565(colors[0]);
	tmp[0].setAlpha(1.0f);

	tmp[1].setColor565(colors[1]);
	tmp[1].setAlpha(1.0f);

	if (dxt1 && (colors[0] <= colors[1]))
	{
		// 1-bit alpha
		// one intermediate colour, half way between the other two
		tmp[2] = mixPixels(tmp[0], 1.0f, tmp[1], 1.0f);
		// transparent colour
		tmp[3].set(0.0f, 0.0f, 0.0f, 0.0f);
	}
	else
	{
		// first interpolated colour, 1/3 of the way along
		tmp[2] = mixPixels(tmp[0], 2.0f, tmp[1], 1.0f);
		// second interpolated colour, 2/3 of the way along
		tmp[3] = mixPixels(tmp[0], 1.0f, tmp[1], 2.0f);
	}

	// Process 4x4 block of texels
	int iimax = std::min(4, image.height(lvl)-i);
	int jjmax = std::min(4, image.width(lvl)-j);
	std::uint32_t index = indices;
	for (int ii = 0; ii < iimax; ++ii)
	{
		for (int jj = 0; jj < jjmax; ++jj, index >>= 2)
		{
			const Pixel& p = tmp[index & 0x3];
			if (dxt1)
			{
				image(i+ii, j+jj, lvl) = p;
			}
			else
			{
				image(i+ii, j+jj, lvl).setRed(p.red());
				image(i+ii, j+jj, lvl).setGreen(p.green());
				image(i+ii, j+jj, lvl).setBlue(p.blue());
			}
		}
	}
}
