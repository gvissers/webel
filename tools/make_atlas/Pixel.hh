#ifndef PIXEL_HH
#define PIXEL_HH

#include <array>
#include <cmath>
#include <cstdint>

class Pixel
{
public:
	Pixel(): _c {0.0f, 0.0f, 0.0f, 1.0f} {}
	Pixel(float r, float g, float b, float a): _c {r, g, b, a} {}

	float operator[](int i) const { return _c[i]; }
	float red() const { return _c[0]; }
	float green() const { return _c[1]; }
	float blue() const { return _c[2]; }
	float alpha() const { return _c[3]; }
	std::uint8_t redByte() const { return floatToByte(red()); }
	std::uint8_t greenByte() const { return floatToByte(green()); }
	std::uint8_t blueByte() const { return floatToByte(blue()); }
	std::uint8_t alphaByte() const { return floatToByte(alpha()); }
	std::uint16_t color565() const
	{
		std::uint16_t r = 31.0 * _c[0] + 0.5,
			g = 63.0 * _c[1] + 0.5,
			b = 31.0 * _c[2] + 0.5;
		return (r << 11) | (g << 5) | b;
	}

	void setRed(float r) { _c[0] = r; }
	void setGreen(float g) { _c[1] = g; }
	void setBlue(float b) { _c[2] = b; }
	void setAlpha(float a) { _c[3] = a; }
	void set(float r, float g, float b, float a) { _c = { r, g, b, a }; }
	void setColor565(std::uint16_t c)
	{
		_c[0] = ((c >> 11) & 0x1f) / 31.0f;
		_c[1] = ((c >>  5) & 0x3f) / 63.0f;
		_c[2] = (c & 0x1f) / 31.0f;
	}

	float colorDistanceSquared(const Pixel& p) const
	{
		float dr = red() - p.red(), dg = green() - p.green(),
			db = blue() - p.blue();
		return dr*dr + dg*dg + db*db;
	}
	float colorLuminance() const
	{
		return _c[0] + _c[1] + 2*_c[2];
	}

	static std::uint8_t floatToByte(float f)
	{
		return 255.0 * f + 0.5;
		//return f >= 1.0 ? 255 : 256.0*f;
		//return std::uint8_t(std::round(255*f));
		//return std::uint8_t(std::floor(255*f));
	}

private:
	std::array<float, 4> _c;
};

inline const Pixel mixPixels(const Pixel &p0, float w0, const Pixel& p1, float w1)
{
	float w = w0 + w1;
	return Pixel((w0*p0.red() + w1*p1.red()) / w,
		(w0*p0.green() + w1*p1.green()) / w,
		(w0*p0.blue() + w1*p1.blue()) / w,
		(w0*p0.alpha() + w1*p1.alpha()) / w);
}

inline std::ostream& operator<<(std::ostream& os, const Pixel& pixel)
{
	return os << "Pixel { " << pixel.red() << ", " << pixel.green()
		<< ", " << pixel.blue() << ", " << pixel.alpha() << " }";
}

#endif // PIXEL_HH
