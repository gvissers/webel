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
 */
Object3DDefCache.prototype.get = function(fname)
{
	if (!(fname in this._cache))
	{
		var cache = this._cache;
		cache[fname] = new Object3DDef();
		$.ajax(fname, {
			dataType: "arraybuffer",
			error: function() {
				logError("Failed to get 2d object definition " + fname);
			},
			success: function(data) {
				cache[fname].create(data);
			}
		});
	}
	return this._cache[fname];
};
