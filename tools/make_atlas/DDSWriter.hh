#ifndef DDSWRITER_HH
#define DDSWRITER_HH

#include <iostream>
#include "Image.hh"

class DDSWriter
{
public:
	enum FitMethod
	{
		END_PIXELS,
		LUMINANCE
	};

	DDSWriter(std::ostream& os): _os(os), _fit_method(END_PIXELS) {}

	void writeDXT1(const Image& image);
	void writeDXT5(const Image& image);

private:
	std::ostream& _os;
	FitMethod _fit_method;

	void writeHeader(const Image& image, std::uint32_t four_cc);
	void writeColorBlock(const Image& image, int i, int j, int lvl);
	void writeInterpolatedAlphaBlock(const Image& image, int i, int j, int lvl);

	const std::pair<Pixel, Pixel> getMinMaxColors(const Image& image,
		int i, int j, int lvl);
	const std::pair<Pixel, Pixel> getMinMaxColorsEndPixels(const Image& image,
		int i, int j, int lvl);
	const std::pair<Pixel, Pixel> getMinMaxColorsLuminance(const Image& image,
		int i, int j, int lvl);
	const std::pair<float, float> getMinMaxAlpha(const Image& image,
		int i, int j, int lvl);
};

#endif // DDSWRITER_HH
