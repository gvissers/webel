"use strict";

/**
 * Cache for 2d object definitions
 */
function Object2DDefCache()
{
	/// The cache itself, mapping file name to definition
	this._cache = {};
}

/**
 * Enumeration for the different types of 2d object. It seems that in practice
 * only type GROUND is used anymore, though.
 */
Object2DDefCache.Type = {
	GROUND: 0,
	PLANT: 1,
	FENCE: 2,
	INVALID: 3
};

/**
 * Set a 2d object definition
 *
 * Set a 2d object definition for object @a obj. If the definition is not in
 * the cache yet, it is requested from the server.
 * @param fname File name of the definition to retrieve
 * @param obj   2D object for which to set the definition
 */
Object2DDefCache.prototype.get = function(fname, obj)
{
	if (fname in this._cache)
	{
		obj.setDefinition(this._cache[fname]);
	}
	else
	{
		var cache = this._cache;
		$.ajax(fname, {
			dataType: "json",
			error: function() {
				logError("Failed to get 2d object definition " + fname);
			},
			success: function(def) {
				if ("error" in def)
				{
					logError(def.error)
				}
				else
				{
					if (def.texture_fname)
						def.texture = texture_cache.get(def.texture_fname);
					cache[fname] = def;
					obj.setDefinition(def);
				}
			}
		});
	}
};
