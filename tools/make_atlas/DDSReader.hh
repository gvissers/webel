#ifndef DDSREADER_HH
#define DDSREADER_HH

#include <fstream>
#include "DDSHeader.hh"
#include "DXTColorBlock.hh"
#include "DXTExplicitAlphaBlock.hh"
#include "DXTInterpolatedAlphaBlock.hh"

class DDSReader
{
public:
	DDSReader(std::istream& is);

	const DDSHeader readHeader();
	Image readImage();

private:
	std::istream& _is;

	void readDXT1(Image &image);
	void readDXT3(Image &image);
	void readDXT5(Image &image);
	void readColorBlock(DXTColorBlock& block);
	void readAlphaBlock(DXTExplicitAlphaBlock& alphas);
	void readAlphaBlock(DXTInterpolatedAlphaBlock& alphas);
};

#endif // DDSREADER_HH
