"use strict";

/**
 * Cache for particle system definitions
 */
function ParticleSystemDefCache ()
{
	/// The cache itself, mapping file name to definition
	this._cache = {};
};

/// Enumeration for the various types of particle systems
ParticleSystemDefCache.Type = {
	TELEPORTER: 0,
	TELEPORT: 1,
	BAG: 2,
	BURST: 3,
	FIRE: 4,
	FOUNTAIN: 5
};

/**
 * Get a particle system definition
 *
 * Get a particle system definition from file name @a fname. If the definition
 * is not in the cache yet, it is requested from the server.
 * @param fname    File name of the definition to retrieve
 * @param callback optional callback function to execute once definition is loaded
 */
ParticleSystemDefCache.prototype.get = function(fname, callback)
{
	var cache = this._cache;
	if (!(fname in cache))
	{
		$.ajax(fname, {
			dataType: "json",
			error: function() {
				logError("Failed to get particle system definition " + fname);
			},
			success: function(def) {
				if ("error" in def)
				{
					logError(def.error)
				}
				else
				{
					cache[fname] = new ParticleSystemDef(def);
					if (callback)
						callback(cache[fname]);
				}
			}
		});
		return null;
	}
	else
	{
		if (callback)
			callback(cache[fname]);
		return cache[fname];
	}
};
