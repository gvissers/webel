/**
 * Cache for 2d object definitions
 */
function Object2DDefCache()
{
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
 * Get a 2d object definition
 *
 * Get a 2d object definition, If it is not in the cache yet, it is requested
 * from the server.
 */
Object2DDefCache.prototype.get = function(fname)
{
	if (!(fname in this._cache))
	{
		var cache = this._cache;
		cache[fname] = {}
		$.ajax(fname, {
			type: "json",
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
					for (var key in def)
						cache[fname][key] = def[key];
				}
			}
		});
	}
	return this._cache[fname];
}
