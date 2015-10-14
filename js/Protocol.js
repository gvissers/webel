"use strict";

var Protocol = {
	/// Character codes for color descriptions
	ColorCode: {
		MIN:     127,
		RED1:    127,
		ORANGE1: 128,
		YELLOW1: 129,
		GREEN1:  130,
		BLUE1:   131,
		PURPLE1: 132,
		GREY1:   133,
		RED2:    134,
		ORANGE2: 135,
		YELLOW2: 136,
		GREEN2:  137,
		BLUE2:   138,
		PURPLE2: 139,
		GREY2:   140,
		RED3:    141,
		ORANGE3: 142,
		YELLOW3: 143,
		GREEN3:  144,
		BLUE3:   145,
		PURPLE3: 146,
		GREY3:   147,
		RED4:    148,
		ORANGE4: 149,
		YELLOW4: 150,
		GREEN4:  151,
		BLUE4:   152,
		PURPLE4: 153,
		GREY4:   154,
		MAX:     154
	},
	/// Character codes for special characters
	SpecialChar: {
		MIN:          193,
		UC_A_ACUTE:   193,
		UC_A_UML:     196,
		UC_A_RING:    197,
		UC_AE:        198,
		UC_E_ACUTE:   201,
		UC_I_ACUTE:   205,
		UC_ENYE:      209,
		UC_O_ACUTE:   211,
		UC_O_UML:     214,
		UC_O_SLASH:   216,
		UC_U_ACUTE:   218,
		UC_U_UML:     220,
		DOUBLE_S:     223,
		LC_A_GRAVE:   224,
		LC_A_ACUTE:   225,
		LC_A_CIRC:    226,
		LC_A_UML:     228,
		LC_A_RING:    229,
		LC_AE:        230,
		LC_C_CEDIL:   231,
		LC_E_GRAVE:   232,
		LC_E_ACUTE:   233,
		LC_E_CIRC:    234,
		LC_E_UML:     235,
		LC_I_ACUTE:   236,
		LC_I_ACUTE_2: 237,
		LC_I_UML:     239,
		LC_ENYE:      241,
		LC_O_ACUTE:   242,
		LC_O_ACUTE_2: 243,
		LC_O_CIRC:    244,
		LC_O_UML:     246,
		LC_O_SLASH:   248,
		LC_U_GRAVE:   249,
		LC_U_ACUTE:   250,
		LC_U_UML:     252,
		MAX:          252
	},
	// Commands sent from client to server
	ServerCmd: {
		HEART_BEAT: 14
	},
	ClientCmd: {
		RAW_TEXT:     0,
		PING_REQUEST: 60
	},

	/// Check whether @a c is a color code
	charIsColor: function(c)
	{
		return c >= Protocol.ColorCode.MIN && c <= Protocol.ColorCode.MAX;
	}
};
