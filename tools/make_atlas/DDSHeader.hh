#ifndef DDSHEADER_HH
#define DDSHEADER_HH

#include <cstdint>
#include <iostream>

struct PixelFormat
{
	enum Flags
	{
		DDPF_ALPHAPIXELS = 0x01,
		DDPF_ALPHA       = 0x02,
		DDPF_FOURCC      = 0x04,
		DDPF_RGB         = 0x40,
		DDPF_YUV         = 0x0200,
		DDPF_LUMINANCE   = 0x020000
	};

	std::uint32_t size;
	std::uint32_t flags;
	std::uint32_t four_cc;
	std::uint32_t rgb_bit_count;
	std::uint32_t r_bit_mask;
	std::uint32_t g_bit_mask;
	std::uint32_t b_bit_mask;
	std::uint32_t a_bit_mask;
};

struct DDSHeader
{
	enum Flags
	{
		DDSD_CAPS        = 0x01,
		DDSD_HEIGHT      = 0x02,
		DDSD_WIDTH       = 0x04,
		DDSD_PITCH       = 0x08,
		DDSD_PIXELFORMAT = 0x1000,
		DDSD_MIPMAPCOUNT = 0x020000,
		DDSD_LINEARSIZE  = 0x080000,
		DDSD_DEPTH       = 0x800000
	};

	std::uint32_t size;
	std::uint32_t flags;
	std::uint32_t height;
	std::uint32_t width;
	std::uint32_t pitch_or_linear_size;
	std::uint32_t depth;
	std::uint32_t mipmap_count;
	std::uint32_t reserved[11];
	PixelFormat pixel_format;
	std::uint32_t caps;
	std::uint32_t caps2;
	std::uint32_t caps3;
	std::uint32_t caps4;
	std::uint32_t reserved2;
};

std::ostream& operator<<(std::ostream& os, const PixelFormat& format);
std::ostream& operator<<(std::ostream& os, const DDSHeader& header);

#endif // DDSHEADER_HH
