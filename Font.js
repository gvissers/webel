"use strict";

function Font()
{
	/// Descriptions of the available fonts
	this.descriptions = null;
	/// The number of the font currently in use
	this.current_font_nr = 0;

	// Get font descriptions from the server
	var this_obj = this;
	$.ajax("getfonts.php", {
		dataType: "json",
		error: function() {
			logError("Failed to initialize font descriptions");
		},
		success: function(descriptions) {
			for (var i in descriptions)
			{
				if (descriptions[i].texture_fname)
					descriptions[i].texture = texture_cache.get(descriptions[i].texture_fname);
			}
			this_obj.descriptions = descriptions;
		}
	});
}

/// Map from color code to actual color values
Font.color_map = {};
Font.color_map[Protocol.ColorCode.RED1] =    new Uint8Array([255, 179, 193,  255, 148, 168,  223,  93, 116,  132,  39,  56]);
Font.color_map[Protocol.ColorCode.RED2] =    new Uint8Array([250,  90,  90,  224,  60,  60,  188,  27,  27,   89,   5,   5]);
Font.color_map[Protocol.ColorCode.RED3] =    new Uint8Array([221,   2,   2,  182,   3,   3,  142,   3,   3,   74,   1,   1]);
Font.color_map[Protocol.ColorCode.RED4] =    new Uint8Array([126,   3,   3,  102,   2,   2,   79,   2,   2,   30,   1,   1]);
Font.color_map[Protocol.ColorCode.ORANGE1] = new Uint8Array([247, 196, 159,  232, 164, 115,  216, 133,  72,  149,  75,  22]);
Font.color_map[Protocol.ColorCode.ORANGE2] = new Uint8Array([252, 122,  58,  216,  75,   1,  163,  64,   6,   82,  34,   2]);
Font.color_map[Protocol.ColorCode.ORANGE3] = new Uint8Array([191, 102,  16,  147,  79,  13,  110,  56,   3,   47,  24,   1]);
Font.color_map[Protocol.ColorCode.ORANGE4] = new Uint8Array([131,  48,   3,  104,  38,   2,   76,  28,   2,   30,  11,   1]);
Font.color_map[Protocol.ColorCode.YELLOW1] = new Uint8Array([251, 250, 190,  245, 243, 125,  216, 215,  36,  112, 111,   2]);
Font.color_map[Protocol.ColorCode.YELLOW2] = new Uint8Array([252, 236,  56,  243, 207,   0,  197, 156,   4,  111,  79,   2]);
Font.color_map[Protocol.ColorCode.YELLOW3] = new Uint8Array([231, 174,  20,  207, 147,  15,  158, 102,   7,   64,  37,   1]);
Font.color_map[Protocol.ColorCode.YELLOW4] = new Uint8Array([130, 111,   6,  101,  86,   4,   73,  62,   3,   44,  37,   1]);
Font.color_map[Protocol.ColorCode.GREEN1] =  new Uint8Array([201, 254, 203,  145, 255, 150,   70, 236,  78,    6, 108,  11]);
Font.color_map[Protocol.ColorCode.GREEN2] =  new Uint8Array([  5, 250, 155,   11, 177, 112,    1, 135,  83,    3,  93,  58]);
Font.color_map[Protocol.ColorCode.GREEN3] =  new Uint8Array([ 37, 196,   0,   33, 167,   1,   28, 138,   3,    2,  64,  40]);
Font.color_map[Protocol.ColorCode.GREEN4] =  new Uint8Array([ 20, 149,   4,    2,  99,  11,   12,  85,   2,   12,  85,   2]);
Font.color_map[Protocol.ColorCode.BLUE1] =   new Uint8Array([169, 239, 250,  120, 228, 244,   54, 192, 213,    5,  96, 110]);
Font.color_map[Protocol.ColorCode.BLUE2] =   new Uint8Array([118, 151, 248,   83, 117, 227,   39,  74, 186,    4,  34, 132]);
Font.color_map[Protocol.ColorCode.BLUE3] =   new Uint8Array([ 68,  72, 210,   55,  58, 176,   41,  44, 142,    1,  18,  72]);
Font.color_map[Protocol.ColorCode.BLUE4] =   new Uint8Array([ 15,  15, 186,    6,   6, 150,    1,   1, 103,    1,   2,  62]);
Font.color_map[Protocol.ColorCode.PURPLE1] = new Uint8Array([210, 180, 251,  179, 128, 247,  134,  51, 248,   49,   5, 110]);
Font.color_map[Protocol.ColorCode.PURPLE2] = new Uint8Array([217,  93, 244,  191,  62, 220,  132,  32, 153,   92,   5, 110]);
Font.color_map[Protocol.ColorCode.PURPLE3] = new Uint8Array([130,  84, 246,   84,   2, 167,   67,   2, 134,   63,   0,  76]);
Font.color_map[Protocol.ColorCode.PURPLE4] = new Uint8Array([106,   1, 172,   63,   1, 103,   49,   1,  80,   31,   1,  61]);
Font.color_map[Protocol.ColorCode.GREY1] =   new Uint8Array([255, 255, 255,  231, 231, 231,  175, 175, 175,  134, 134, 134]);
Font.color_map[Protocol.ColorCode.GREY2] =   new Uint8Array([153, 153, 153,  132, 132, 132,  110, 110, 110,   60,  60,  60]);
Font.color_map[Protocol.ColorCode.GREY3] =   new Uint8Array([158, 158, 158,  114, 114, 114,   71,  71,  71,   27,  27,  27]);
Font.color_map[Protocol.ColorCode.GREY4] =   new Uint8Array([ 40,  40,  40,   27,  27,  27,   13,  13,  13,    0,   0,   0]);

/// Map from special character codes to positions in the font texture
Font.special_char_positions = {};
Font.special_char_positions[Protocol.SpecialChar.UC_A_ACUTE] =   207;
Font.special_char_positions[Protocol.SpecialChar.UC_A_UML] =     194;
Font.special_char_positions[Protocol.SpecialChar.UC_A_RING] =    203;
Font.special_char_positions[Protocol.SpecialChar.UC_AE] =        201;
Font.special_char_positions[Protocol.SpecialChar.UC_E_ACUTE] =   208;
Font.special_char_positions[Protocol.SpecialChar.UC_I_ACUTE] =   210;
Font.special_char_positions[Protocol.SpecialChar.UC_ENYE] =      205;
Font.special_char_positions[Protocol.SpecialChar.UC_O_ACUTE] =   212;
Font.special_char_positions[Protocol.SpecialChar.UC_O_UML] =     195;
Font.special_char_positions[Protocol.SpecialChar.UC_O_SLASH] =   202;
Font.special_char_positions[Protocol.SpecialChar.UC_U_ACUTE] =   214;
Font.special_char_positions[Protocol.SpecialChar.UC_U_UML] =     196;
Font.special_char_positions[Protocol.SpecialChar.DOUBLE_S] =     197;
Font.special_char_positions[Protocol.SpecialChar.LC_A_GRAVE] =   183;
Font.special_char_positions[Protocol.SpecialChar.LC_A_ACUTE] =   206;
Font.special_char_positions[Protocol.SpecialChar.LC_A_CIRC] =    182;
Font.special_char_positions[Protocol.SpecialChar.LC_A_UML] =     191;
Font.special_char_positions[Protocol.SpecialChar.LC_A_RING] =    200;
Font.special_char_positions[Protocol.SpecialChar.LC_AE] =        198;
Font.special_char_positions[Protocol.SpecialChar.LC_C_CEDIL] =   184;
Font.special_char_positions[Protocol.SpecialChar.LC_E_GRAVE] =   187;
Font.special_char_positions[Protocol.SpecialChar.LC_E_ACUTE] =   181;
Font.special_char_positions[Protocol.SpecialChar.LC_E_CIRC] =    185;
Font.special_char_positions[Protocol.SpecialChar.LC_E_UML] =     186;
Font.special_char_positions[Protocol.SpecialChar.LC_I_ACUTE] =   209;
Font.special_char_positions[Protocol.SpecialChar.LC_I_ACUTE_2] = 209;
Font.special_char_positions[Protocol.SpecialChar.LC_I_UML] =     188;
Font.special_char_positions[Protocol.SpecialChar.LC_ENYE] =      204;
Font.special_char_positions[Protocol.SpecialChar.LC_O_ACUTE] =   211;
Font.special_char_positions[Protocol.SpecialChar.LC_O_ACUTE_2] = 211;
Font.special_char_positions[Protocol.SpecialChar.LC_O_CIRC] =    189;
Font.special_char_positions[Protocol.SpecialChar.LC_O_UML] =     192;
Font.special_char_positions[Protocol.SpecialChar.LC_O_SLASH] =   199;
Font.special_char_positions[Protocol.SpecialChar.LC_U_GRAVE] =   190;
Font.special_char_positions[Protocol.SpecialChar.LC_U_ACUTE] =   213;
Font.special_char_positions[Protocol.SpecialChar.LC_U_UML] =     193;

/// First character appearing in the font texture
Font.start_char = 32;
/// Number of columns in the font texture
Font.chars_per_line = 14;
/// Width of a character in the font texture
Font.x_spacing = 18;
/// Height of a character in the font texture
Font.y_spacing = 21;

/**
 * Set vertex and texture coordinates for a character to bew drawn.
 * @param x              x-coordinate of the upper-left corner of the character
 * @param y              y-coordinate of the upper-left corner of the character
 * @param color_code     code for the color in which to draw the character
 * @param vertices       place to store the vertices
 * @param texture_coords place to store the texture coordinates
 * @param colors         place to store the color values
 */
Font.prototype.addChar = function(x, y, c, color_code, vertices, texture_coords,
	colors)
{
	if (!this.descriptions)
		// Font descriptions not loaded yet
		return 0;

	var pos = this.getCharPosition(c);
	if (pos < 0)
		return 0;

	var width = 11.0*4;
	var height = 18.0*4;
	var font_width = this.getCharWidth(pos);
	var ignore = (12 - font_width) / 2;

	var row = Math.floor(pos / Font.chars_per_line);
	var col = pos % Font.chars_per_line;

	var u_start = (col*Font.x_spacing+ignore) / 256.0;
	var u_end= ((col+1)*Font.x_spacing-7-ignore)/256.0;
	var v_start= (1+row*Font.y_spacing)/256.0;
	var v_end= ((row+1)*Font.y_spacing-1)/256.0;

	vertices[0] = x;
	vertices[1] = y;
	vertices[2] = x;
	vertices[3] = y + height + 1;
	vertices[4] = x + width;
	vertices[5] = y + height + 1;
	vertices[6] = x + width;
	vertices[7] = y;

	texture_coords[0] = u_start;
	texture_coords[1] = v_start;
	texture_coords[2] = u_start;
	texture_coords[3] = v_end;
	texture_coords[4] = u_end;
	texture_coords[5] = v_end;
	texture_coords[6] = u_end;
	texture_coords[7] = v_start;

	var color = Font.color_map[color_code];

	colors[ 0] = color[0];
	colors[ 1] = color[1];
	colors[ 2] = color[2];
	colors[ 3] = color[0];
	colors[ 4] = color[1];
	colors[ 5] = color[2];
	colors[ 6] = color[0];
	colors[ 7] = color[1];
	colors[ 8] = color[2];
	colors[ 9] = color[0];
	colors[10] = color[1];
	colors[11] = color[2];

	return width;
};

/**
 * Set the texture to use for the current font
 */
Font.prototype.bindTexture = function()
{
	gl.uniform1f(shaders.program.alpha_low, 0.1);
	gl.bindTexture(gl.TEXTURE_2D, this.descriptions[this.current_font_nr].texture);
}

/**
 * Get the position of a character in the font texture
 * @param c The character code for which to get the position
 * @return index of the character in the font texture
 */
Font.prototype.getCharPosition = function(c)
{
	if (c < Font.start_char)
		return -1;
	if (c < 127)
		return c - Font.start_char;
	if (c in Protocol.SpecialChar)
		return c - Protocol.SpecialChar.MIN + 128 - Font.start_char;
	return -1;
};

/**
 * Get the width of a character to draw
 * @param pos Index of the character in the font texture
 * @return Width of the character in the font texture, in pixels
 */
Font.prototype.getCharWidth = function(pos)
{
	if (pos < 0)
		return 0;
	return this.descriptions[this.current_font_nr].widths[pos]
		+ this.descriptions[this.current_font_nr].spacing;
};
