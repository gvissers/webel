#include <fstream>
#include <memory>
#include <sstream>
#include <unordered_map>
#include "Image.hh"
#include "DDSReader.hh"
#include "DDSWriter.hh"

struct Texture
{
	std::string fname;
	Image image;
	int i;
	int j;

	Texture(const std::string& fname, Image image, int i, int j):
		fname(fname), image(std::move(image)), i(i), j(j) {}
	Texture(const Texture&) = delete;
	Texture(Texture&& text) = default;
};

class AtlasDesc
{
public:
	typedef std::unordered_map<std::string, Texture>::const_iterator const_iterator;

	AtlasDesc(): _offsets() {}

	void setOutFile(const std::string fname) { _out_fname = fname; }
	void add(const std::string& fname, Image image, int i, int j)
	{
		_offsets.emplace(fname, Texture(fname, std::move(image), i, j));
	}

	const_iterator begin() const { return _offsets.begin(); }
	const_iterator end() const { return _offsets.end(); }

	const std::string& outFile() const { return _out_fname; }

private:
	std::string _out_fname;
	std::unordered_map<std::string, Texture> _offsets;
};

Image createAtlas(const AtlasDesc& desc)
{
	int width = 0, height = 0, nr_mipmaps = 0;
	bool has_mipmaps = desc.begin()->second.image.hasMipmaps();
	for (const auto& tup: desc)
	{
		if (tup.second.image.hasMipmaps() != has_mipmaps)
			throw std::runtime_error("Cannot mix images with and without mipmaps");

		height = std::max(height, tup.second.i + tup.second.image.height());
		width = std::max(width, tup.second.j + tup.second.image.width());
		nr_mipmaps = std::max(nr_mipmaps, tup.second.image.nrMipmaps());
	}

	Image image(width, height, nr_mipmaps);
	for (const auto& tup: desc)
		tup.second.image.copyInto(image, tup.second.i, tup.second.j);

	return image;
}

void readAtlasDescription(AtlasDesc & desc, const char* desc_fname)
{
	std::string fname;
	int x, y;

	std::ifstream is(desc_fname);
	is >> fname;
	desc.setOutFile(fname);

	while (true)
	{
		is >> fname >> x >> y;
		if (is.eof())
			break;
		if (is.fail())
			throw std::runtime_error("Failed to read from atlas file");

		std::cout << "Reading image " << fname << '\n';
		std::ifstream img_is(fname);
		DDSReader reader(img_is);
		desc.add(fname, reader.readImage(), x, y);
		img_is.close();

	}
	is.close();
}

void writeAtlasJson(std::ostream& os, const AtlasDesc& desc, int w, int h)
{
	os << "{\"" << desc.outFile() << ".dds\":{";
	bool first = true;
	for (const auto& tup: desc)
	{
		if (!first)
			os << ',';
		else
			first = false;

		float u_start = float(tup.second.j) / w;
		float v_start = float(tup.second.i) / h;
		float u_end = float(tup.second.j + tup.second.image.width()) / w;
		float v_end = float(tup.second.i + tup.second.image.height()) / h;
		os << '"' << tup.first << "\":{\"u_start\":" << u_start
			<< ",\"v_start\":" << v_start << ",\"u_end\":" << u_end
			<< ",\"v_end\":" << v_end << "}";
	}
	os << "}}";
}

int main(int argc, const char* argv[])
{
	if (argc != 2)
	{
		std::cerr << "Usage: " << argv[0] << " <atlas file>\n";
		return 1;
	}

	try
	{
		AtlasDesc desc;
		readAtlasDescription(desc, argv[1]);
		Image atlas = createAtlas(desc);

// 		for (int lvl = 0; lvl < atlas.nrMipmaps(); ++lvl)
// 		{
// 			std::ostringstream ss;
// 			ss << "x_" << lvl << ".png";
// 			std::ofstream os(ss.str().c_str());
// 			atlas.writePNG(os, lvl);
// 			os.close();
// 		}

		std::ofstream os((desc.outFile() + ".dds").c_str());
		DDSWriter writer(os);
		writer.writeDXT1(atlas);
		os.close();

		os.open((desc.outFile() + ".atlas.json").c_str());
		writeAtlasJson(os, desc, atlas.width(), atlas.height());
		os.close();
	}
	catch (const std::exception &e)
	{
		std::cerr << "Exception: " << e.what() << '\n';
		return 1;
	}

	return 0;
}
