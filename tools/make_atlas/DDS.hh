#ifndef DDS_HH
#define DDS_HH

struct DDS
{
	template <std::uint8_t c0, std::uint8_t c1, std::uint8_t c2, std::uint8_t c3>
	struct FourCC
	{
		static const std::uint32_t value = c0 | (c1 << 8) | (c2 << 16) | (c3 << 24);
	};

	static const uint32_t FOUR_CC_DDS_MAGIC = FourCC<'D', 'D', 'S', ' '>::value;
	static const uint32_t FOUR_CC_DXT1 = FourCC<'D', 'X', 'T', '1'>::value;
	static const uint32_t FOUR_CC_DXT3 = FourCC<'D', 'X', 'T', '3'>::value;
	static const uint32_t FOUR_CC_DXT5 = FourCC<'D', 'X', 'T', '5'>::value;
};

#endif // DDS_HH
