#include <tuple>
#include "DDSWriter.hh"
#include "DDS.hh"
#include "DDSHeader.hh"
#include "DXTColorBlock.hh"

void DDSWriter::writeDXT1(const Image& image)
{
	writeHeader(image, DDS::FOUR_CC_DXT1);
	for (int lvl = 0; lvl < image.nrMipmaps(); ++lvl)
	{
		for (int i = 0; i < image.height(lvl); i += 4)
		{
			for (int j = 0;  j < image.width(lvl); j += 4)
				writeColorBlock(image, i, j, lvl);
		}
	}
}

void DDSWriter::writeHeader(const Image& image, std::uint32_t four_cc)
{
	std::uint32_t linear_size = 0;
	for (int lvl = 0; lvl < image.nrMipmaps(); ++lvl)
		linear_size += (image.width(lvl)+3)/4 * (image.height(lvl)+3)/4 * sizeof(DXTColorBlock);

	DDSHeader header;
	header.size = sizeof(header);
	header.flags = DDSHeader::DDSD_CAPS | DDSHeader::DDSD_HEIGHT
		| DDSHeader::DDSD_WIDTH | DDSHeader::DDSD_PIXELFORMAT
		| DDSHeader::DDSD_LINEARSIZE;
	if (image.hasMipmaps())
		header.flags |= DDSHeader::DDSD_MIPMAPCOUNT;
	header.height = image.height();
	header.width = image.width();
	header.pitch_or_linear_size = linear_size;
	header.depth = 0;
	header.mipmap_count = image.hasMipmaps() ? image.nrMipmaps() : 0;
	std::fill(header.reserved, header.reserved+11, 0);
	header.pixel_format.size = 32;
	header.pixel_format.flags = PixelFormat::DDPF_FOURCC;
	header.pixel_format.four_cc = four_cc;
	header.pixel_format.rgb_bit_count = 0;
	header.pixel_format.r_bit_mask = 0;
	header.pixel_format.g_bit_mask = 0;
	header.pixel_format.b_bit_mask = 0;
	header.pixel_format.a_bit_mask = 0;
	header.caps = 0x1000;
	if (image.hasMipmaps())
		header.caps |= 0x400008;
	header.caps2 = 0;
	header.caps3 = 0;
	header.caps4 = 0;
	header.reserved2 = 0;

	std::uint32_t magic = DDS::FOUR_CC_DDS_MAGIC;
	_os.write(reinterpret_cast<const char*>(&magic), 4);
	_os.write(reinterpret_cast<const char*>(&header), sizeof(header));
}

void DDSWriter::writeColorBlock(const Image& image, int i, int j, int lvl)
{
	DXTColorBlock block;

	Pixel cs[4];
	std::tie(cs[1], cs[0]) = getMinMaxColors(image, i, j, lvl);
	block.colors[0] = cs[0].color565();
	block.colors[1] = cs[1].color565();

	cs[2] = mixPixels(cs[0], 2.0f, cs[1], 1.0f);
	cs[3] = mixPixels(cs[0], 1.0f, cs[1], 2.0f);

	block.indices = 0;
	for (int ip = 0; ip < 16; ++ip)
	{
		int i0 = i + ip/4;
		int j0 = j + ip%4;
		if (i0 >= image.height(lvl) || j0 >= image.width(lvl))
			continue;

		const Pixel& p = image(i0, j0, lvl);
		float min_dist = 5.0;
		std::uint32_t idx = 0;
		for (int ic = 0; ic < 4; ++ic)
		{
			float dist = p.colorDistanceSquared(cs[ic]);
			if (dist < min_dist)
			{
				idx = ic;
				min_dist = dist;
			}
		}
		block.indices |= (idx << (2*ip));
	}

	_os.write(reinterpret_cast<const char*>(&block), sizeof(block));
}

const std::pair<Pixel, Pixel> DDSWriter::getMinMaxColors(const Image& image,
	int i, int j, int lvl)
{
	switch (_fit_method)
	{
		case END_PIXELS:
			return getMinMaxEndPixels(image, i, j, lvl);
		case LUMINANCE:
			return getMinMaxLuminance(image, i, j, lvl);
		default:
			throw std::runtime_error("Unknown fit method");
	}
}

const std::pair<Pixel, Pixel> DDSWriter::getMinMaxEndPixels(const Image& image,
	int i, int j, int lvl)
{
	float max_distance = -1;
	Pixel p_min, p_max;
	for (int ip = 1; ip < 16; ++ip)
	{
		int i0 = i + ip/4;
		int j0 = j + ip%4;
		if (i0 >= image.height(lvl) || j0 >= image.width(lvl))
			continue;

		const Pixel& p = image(i0, j0, lvl);
		for (int jp = 0; jp < ip; ++jp)
		{
			int i1 = i + jp/4;
			int j1 = j + jp%4;
			if (i1 >= image.height(lvl) || j1 >= image.width(lvl))
				continue;

			const Pixel& q = image(i1, j1, lvl);
			float dist = p.colorDistanceSquared(q);
			if (dist > max_distance)
			{
				p_min = p;
				p_max = q;
				max_distance = dist;
			}
		}
	}

	return p_min.color565() <= p_max.color565()
		? std::make_pair(p_min, p_max)
		: std::make_pair(p_max, p_min);
}

const std::pair<Pixel, Pixel> DDSWriter::getMinMaxLuminance(const Image& image,
	int i, int j, int lvl)
{
	float min_luminance = 3.0f, max_luminance = -1.0f;
	Pixel p_min, p_max;
	for (int ip = 1; ip < 16; ++ip)
	{
		int i0 = i + ip/4;
		int j0 = j + ip%4;
		if (i0 >= image.height(lvl) || j0 >= image.width(lvl))
			continue;

		const Pixel& p = image(i0, j0, lvl);
		float lum = p.colorLuminance();
		if (lum < min_luminance)
		{
			min_luminance = lum;
			p_min = p;
		}
		if (lum > max_luminance)
		{
			max_luminance = lum;
			p_max = p;
		}
	}

	return p_min.color565() <= p_max.color565()
		? std::make_pair(p_min, p_max)
		: std::make_pair(p_max, p_min);
}
