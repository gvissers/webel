"use strict";

/**
 * Cache for particle system definitions
 */
function ParticleSystemDefCache ()
{
	/// The cache itself, mapping file name to definition
	this._cache = {};
	/// Whether all currently known particle system definitions have been loaded yet
	this._preloaded = false;
	/// callbacks waiting to be executed
	this._callbacks = [];

	// preload all particle systems
	var this_obj = this;
	$.ajax("__all__.part", {
		dataType: "json",
		error: function() {
			logError("Failed to initialize particle system cache");
		},
		success: function(defs) { this_obj.fill(defs); }
	});
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

/// Fill the cache with objects from the server
ParticleSystemDefCache.prototype.fill = function(defs)
{
	if ("error" in defs)
	{
		logError(defs.error);
	}
	else
	{
		for (var fname in defs)
			this._cache[fname] = new ParticleSystemDef(defs[fname]);
		this._preloaded = true;

		// Now try to get particle systems requested before preload completed
		for (var i = 0; i < this._callbacks.length; ++i)
		{
			var cb = this._callbacks[i];
			this.get(cb.fname, cb.callback);
		}
		this._callbacks = [];
	}

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
		if (!this._preloaded)
		{
			// we're still waiting for the preloaded data
			if (callback)
				this._callbacks.push({fname: fname, callback: callback});
		}
		else
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
		}
		return null;
	}
	else
	{
		if (callback)
			callback(cache[fname]);
		return cache[fname];
	}
};
