CXXFLAGS = -Wall -W -std=c++11 -ggdb
LDFLAGS = -lz

OBJS = make_atlas.o DDSHeader.o DDSReader.o DDSWriter.o DXTColorBlock.o \
	DXTExplicitAlphaBlock.o DXTInterpolatedAlphaBlock.o Image.o

all: make_atlas

make_atlas: $(OBJS:%=.objs/%)
	$(CXX) -o$@ $^ $(LDFLAGS)

.objs/%.o: %.cc .objs/.keep
	$(CXX) $(CXXFLAGS) -c $< -o $@

.objs/.keep:
	mkdir -p .objs
	touch $@

.deps/%.d: %.cc .deps/.keep
	set -e;\
	$(CXX) -M $(CXXFLAGS) $< | sed 's#\($*\).o[ :]*#.objs/\1.o $@: #g' > $@

.deps/.keep:
	mkdir -p .deps
	touch $@

clean:
	\rm -f .objs/* make_atlas

veryclean: clean
	\rm -f .deps/*

ifneq "$(MAKECMDGOALS)" "clean"
-include $(OBJS:%.o=.deps/%.d)
endif
