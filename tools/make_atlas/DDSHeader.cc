#include "DDSHeader.hh"

std::ostream& operator<<(std::ostream& os, const PixelFormat& format)
{
	os << "PixelFormat {\n"
		<< "size: " << format.size << '\n'
		<< "flags: ";
	int nf = 0;
	if (format.flags & PixelFormat::DDPF_ALPHAPIXELS)
	{
		os << "ALPHAPIXELS";
		++nf;
	}
	if (format.flags & PixelFormat::DDPF_ALPHA)
	{
		if (nf) os << '|';
		os << "ALPHA";
		++nf;
	}
	if (format.flags & PixelFormat::DDPF_FOURCC)
	{
		if (nf) os << '|';
		os << "FOURCC";
		++nf;
	}
	if (format.flags & PixelFormat::DDPF_RGB)
	{
		if (nf) os << '|';
		os << "RGB";
		++nf;
	}
	if (format.flags & PixelFormat::DDPF_YUV)
	{
		if (nf) os << '|';
		os << "YUV";
		++nf;
	}
	if (format.flags & PixelFormat::DDPF_LUMINANCE)
	{
		if (nf) os << '|';
		os << "LUMINANCE";
		++nf;
	}
	os << '\n';
	if (format.flags & PixelFormat::DDPF_FOURCC)
	{
		os << "four_cc: " << char(format.four_cc & 0xff)
			<< char((format.four_cc >> 8) & 0xff)
			<< char((format.four_cc >> 16) & 0xff)
			<< char((format.four_cc >> 24) & 0xff)
			<< '\n';
	}
	if (format.flags & PixelFormat::DDPF_RGB)
	{
		os << "rgb_bit_count: " << format.rgb_bit_count << '\n'
			<< std::hex
			<< "r_bit_mask: " << format.r_bit_mask << '\n'
			<< "g_bit_mask: " << format.g_bit_mask << '\n'
			<< "b_bit_mask: " << format.b_bit_mask << '\n'
			<< std::dec;
	}
	if (format.flags & PixelFormat::DDPF_ALPHAPIXELS)
	{
		os << std::hex << "a_bit_mask: " << format.a_bit_mask << '\n' << std::dec;
	}

	return os << '}';
}

std::ostream& operator<<(std::ostream& os, const DDSHeader& header)
{
	os << "DDSHeader {\n"
		<< "size: " << header.size << '\n'
		<< "flags: ";
	int nf = 0;
	if (header.flags & DDSHeader::DDSHeader::DDSD_CAPS)
	{
		os << "CAPS";
		++nf;
	}
	if (header.flags & DDSHeader::DDSD_HEIGHT)
	{
		if (nf) os << '|';
		os << "HEIGHT";
		++nf;
	}
	if (header.flags & DDSHeader::DDSD_WIDTH)
	{
		if (nf) os << '|';
		os << "WIDTH";
		++nf;
	}
	if (header.flags & DDSHeader::DDSD_PITCH)
	{
		if (nf) os << '|';
		os << "PITCH";
		++nf;
	}
	if (header.flags & DDSHeader::DDSD_PIXELFORMAT)
	{
		if (nf) os << '|';
		os << "PIXELFORMAT";
		++nf;
	}
	if (header.flags & DDSHeader::DDSD_MIPMAPCOUNT)
	{
		if (nf) os << '|';
		os << "MIPMAPCOUNT";
		++nf;
	}
	if (header.flags & DDSHeader::DDSD_LINEARSIZE)
	{
		if (nf) os << '|';
		os << "LINEARSIZE";
		++nf;
	}
	if (header.flags & DDSHeader::DDSD_DEPTH)
	{
		if (nf) os << '|';
		os << "DEPTH";
		++nf;
	}
	os << '\n';
	if (header.flags & DDSHeader::DDSD_HEIGHT)
		os << "height: " << header.height << '\n';
	if (header.flags & DDSHeader::DDSD_WIDTH)
		os << "width: " << header.width << '\n';
	if (header.flags & DDSHeader::DDSD_PITCH)
		os << "pitch: " << header.pitch_or_linear_size << '\n';
	else
		os << "linear_size: " << header.pitch_or_linear_size << '\n';
	if (header.flags & DDSHeader::DDSD_DEPTH)
		os << "depth: " << header.depth << '\n';
	if (header.flags & DDSHeader::DDSD_MIPMAPCOUNT)
		os << "mipmap_count: " << header.mipmap_count << '\n';
	if (header.flags & DDSHeader::DDSD_PIXELFORMAT)
		os << "pixel_format: " << header.pixel_format << '\n';
	os << "caps: " << std::hex << header.caps
		<< ' ' << header.caps2
		<< ' ' << header.caps3
		<< ' ' << header.caps4
		<< std::dec << '\n';

	return os << '}';
}
