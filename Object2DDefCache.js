"use strict";

/**
 * Cache for 2d object definitions
 */
function Object2DDefCache()
{
	/// The cache itself, mapping file name to definition
	this._cache = {};
	/// Whether all currently known 2d objects have been loaded yet
	this._preloaded = false;
	/// callbacks waiting to be executed
	this._callbacks = [];

	// preload all 2d0 objects
	var this_obj = this;
	$.ajax("__all__.2d0", {
		dataType: "json",
		error: function() {
			logError("Failed to initialize 2d object cache");
		},
		success: function(defs) { this_obj.fill(defs); }
	});
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

/// Fill the cache with objects from the server
Object2DDefCache.prototype.fill = function(defs)
{
	if ("error" in defs)
	{
		logError(defs.error);
	}
	else
	{
		for (var fname in defs)
		{
			var def = defs[fname];
			if (def.texture_fname)
				def.texture = texture_cache.get(def.texture_fname);
			this._cache[fname] = def;
		}

		for (var i = 0; i < this._callbacks.length; ++i)
		{
			var cb = this._callbacks[i];
			cb.callback(this._cache[cb.fname]);
		}
		this._callbacks = [];

		this._preloaded = true;
	}

};

/**
 * Get a 2d object definition
 *
 * Get a 2d object definition from file name @a fname. If the definition is not
 * in the cache yet, it is requested from the server.
 * @param fname    File name of the definition to retrieve
 * @param callback optional callback function to execute once definition is loaded
 */
Object2DDefCache.prototype.get = function(fname, callback)
{
	fname = fname.toLowerCase();
	if (fname.substr(0, 2) == './')
		fname = fname.substr(2);

	if (!(fname in this._cache))
	{
		if (!this._preloaded)
		{
			// we're still waiting for the preloaded data
			if (callback)
				this._callbacks.push({fname: fname, callback: callback});
		}
		else
		{
			// object is not preloaded either. Try to request it from the server.
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
						if (callback)
							callback(def);
					}
				}
			});
		}
		return null;
	}
	else
	{
		if (callback)
			callback(this._cache[fname]);
		return this._cache[fname];
	}
};
