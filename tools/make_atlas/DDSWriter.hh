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

private:
	std::ostream& _os;
	FitMethod _fit_method;

	void writeHeader(const Image& image, std::uint32_t four_cc);
	void writeColorBlock(const Image& image, int i, int j, int lvl);

	const std::pair<Pixel, Pixel> getMinMaxColors(const Image& image,
		int i, int j, int lvl);
	const std::pair<Pixel, Pixel> getMinMaxEndPixels(const Image& image,
		int i, int j, int lvl);
	const std::pair<Pixel, Pixel> getMinMaxLuminance(const Image& image,
		int i, int j, int lvl);
};

#endif // DDSWRITER_HH
