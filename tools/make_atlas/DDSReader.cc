#include <cstring>
#include <stdexcept>
#include "DDSReader.hh"
#include "DDS.hh"

DDSReader::DDSReader(std::istream& is): _is(is)
{
	std::uint32_t magic=0;
	_is.read(reinterpret_cast<char*>(&magic), 4);
	if (magic != DDS::FOUR_CC_DDS_MAGIC)
		throw std::runtime_error("Invalid file signature");
}

const DDSHeader DDSReader::readHeader()
{
	DDSHeader header;
	char *buf = reinterpret_cast<char*>(&header);
	_is.seekg(4);
	_is.read(buf, sizeof(header));
	if (!_is.good())
		throw std::runtime_error("Failed to read DDS file header");
	return header;
}

Image DDSReader::readImage()
{
	DDSHeader header = readHeader();

	if (!(header.flags & DDSHeader::DDSD_PIXELFORMAT)
		|| (!header.pixel_format.flags & PixelFormat::DDPF_FOURCC))
		throw std::runtime_error("Unknown format");

	int nr_mipmaps = (header.flags & DDSHeader::DDSD_MIPMAPCOUNT) ? header.mipmap_count : 1;
	int w = header.width;
	int h = header.height;
	Image image(w, h, nr_mipmaps);

	_is.seekg(128);
	switch (header.pixel_format.four_cc)
	{
		case DDS::FOUR_CC_DXT1:
			readDXT1(image);
			break;
		case DDS::FOUR_CC_DXT3:
			readDXT3(image);
			break;
		case DDS::FOUR_CC_DXT5:
			readDXT5(image);
			break;
		default:
			throw std::runtime_error("Unsupported pixel format");
	}

	return image;
}

void DDSReader::readDXT1(Image &image)
{
	DXTColorBlock block;
	int width = image.width();
	int height = image.height();
	for (int lvl = 0; lvl < image.nrMipmaps(); ++lvl)
	{
		for (int i = 0; i < (height+3)/4; ++i)
		{
			for (int j = 0; j < (width+3)/4; ++j)
			{
				readColorBlock(block);
				block.unpack(image, 4*i, 4*j, lvl, true);
			}
		}

		width = std::max(1, width/2);
		height = std::max(1, height/2);
	}
}

void DDSReader::readDXT3(Image &image)
{
	DXTExplicitAlphaBlock alphas;
	DXTColorBlock block;
	int width = image.width();
	int height = image.height();
	for (int lvl = 0; lvl < image.nrMipmaps(); ++lvl)
	{
		for (int i = 0; i < (height+3)/4; ++i)
		{
			for (int j = 0; j < (width+3)/4; ++j)
			{
				readAlphaBlock(alphas);
				readColorBlock(block);
				block.unpack(image, 4*i, 4*j, lvl);
				alphas.unpack(image, 4*i, 4*j, lvl);
			}
		}

		width = std::max(1, width/2);
		height = std::max(1, height/2);
	}
}

void DDSReader::readDXT5(Image &image)
{
	DXTInterpolatedAlphaBlock alphas;
	DXTColorBlock block;
	int width = image.width();
	int height = image.height();
	for (int lvl = 0; lvl < image.nrMipmaps(); ++lvl)
	{
		for (int i = 0; i < (height+3)/4; ++i)
		{
			for (int j = 0; j < (width+3)/4; ++j)
			{
				readAlphaBlock(alphas);
				readColorBlock(block);
				block.unpack(image, 4*i, 4*j, lvl);
				alphas.unpack(image, 4*i, 4*j, lvl);
			}
		}

		width = std::max(1, width/2);
		height = std::max(1, height/2);
	}
}

void DDSReader::readAlphaBlock(DXTExplicitAlphaBlock& alphas)
{
	_is.read(reinterpret_cast<char*>(&alphas), sizeof(alphas));
	if (!_is.good())
		throw std::runtime_error("Failed to read alpha block");
}

void DDSReader::readAlphaBlock(DXTInterpolatedAlphaBlock& alphas)
{
	_is.read(reinterpret_cast<char*>(&alphas), sizeof(alphas));
	if (!_is.good())
		throw std::runtime_error("Failed to read alpha block");
}

void DDSReader::readColorBlock(DXTColorBlock& block)
{
	_is.read(reinterpret_cast<char*>(&block), sizeof(block));
	if (!_is.good())
		throw std::runtime_error("Failed to read color block");
}
