"use strict";

/**
 * Cache for 3D object definitions
 */
function Object3DDefCache()
{
	/// The cache itself, mapping file name to definition
	this._cache = {};
}

/**
 * Retrieve a 3d object definition
 *
 * Read the 3D object definition for file @a fname from the cache. If the
 * definition is not yet in the cache, it is requested from the server.
 * If a callback function @a callback is provided, it is executed once the
 * definition is in the cache.
 */
Object3DDefCache.prototype.get = function(fname, callback)
{
	var cache = this._cache;
	if (!(fname in cache))
	{
		$.ajax(fname, {
			dataType: "arraybuffer",
			error: function() {
				logError("Failed to get 3d object definition " + fname);
			},
			success: function(data) {
				cache[fname] = new Object3DDef();
				cache[fname].create(data);
				if (callback)
					callback(cache[fname]);
			}
		});
		return null;
	}
	else
	{
		if (callback)
			callback(cache[fname]);
		cache[fname] = new Object3DDef();
	}
};
