"use strict";

/**
 * Cache for texture objects
 *
 * Cache for textures loaded from image files. By accessing textures only
 * through this cache, images need only be loaded from the network once.
 */
function TextureCache()
{
	/// The actual cache object, initially containing only a single-pixel white texture
	var _cache = {
		"white": _createWhitePixel(),
		// These are single color textures, don't bother loading them
		"3dobjects/tile0.dds": _createPixel(new Uint8Array([61, 132, 169, 255])),
		"3dobjects/tile39.dds": _createPixel(new Uint8Array([0, 0, 0, 255]))
	};
	/// Texture atlases, combining collections of small textures into a single large one
	var _atlases = {};
	/// Whether the texture atlases have been loaded yet
	var _atlases_loaded = false;
	/// Extensions provided by our graphics card
	var _extensions;
	/// Compressed texture format that are supported
	var _supported = {};

	// Get the texture atlases
	var _atlas_callbacks = [];
	var this_obj = this;
	$.ajax("__all__.atlas", {
		dataType: "json",
		error: function() {
			logError("Failed to get texture atlases");
		},
		success: function(atlas) {
			if ("error" in atlas)
			{
				logError(atlas.error)
			}
			else
			{
				_atlases = atlas;
				_atlases_loaded = true;
				for (var i = 0; i < _atlas_callbacks.length; ++i)
				{
					var tup = _atlas_callbacks[i];
					this_obj.lookupAtlas(tup.fname, tup.callback);
				}
				Signal.emit(Event.TEXTURE_ATLASES_LOADED);
			}
		}
	});

	/**
	 * Create single white pixel texture
	 *
	 * Create a new single-pixel white texture. This is used to have a texture
	 * available for drawing while the associated images loads, and also to
	 * create the single white pixel texture used in drawing colored,
	 * untextured, objects.
	 * @return The new texture
	 */
	function _createWhitePixel()
	{
		return _createPixel(new Uint8Array([255, 255, 255, 255]));
	}

	/**
	 * Create single pixel texture
	 *
	 * Create a new single-pixel texture with color @a color.
	 * @param color The color of the pixel, as a Uint8Array
	 * @return The new texture
	 */
	function _createPixel(color)
	{
		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA,
			gl.UNSIGNED_BYTE, color);
		return texture;
	}

	/**
	 * Callback for loaded image
	 *
	 * This function is called when the image @a image to be associated with
	 * @a texture has been loaded. It generates a new texture from the image,
	 * and associates it with @a texture. The old contents of @a texture are
	 * lost.
	 * @param texture The texture to assign the image to
	 * @param image   The image just loaded
	 */
	function _handleImageLoad(texture, image)
	{
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	}

	/**
	 * Callback for compressed image
	 *
	 * This function is called when the compressed image data @a data for
	 * texture file @a fname has been loaded. It generates a new texture
	 * from the data, and associates it with the texture in the cache.
	 * The old contents of the texture are lost.
	 * @param fname The file name of the texture image
	 * @param data  The image data just loaded
	 */
	function _handleCompressedImageLoad(fname, data)
	{
		var dds = new DDS(data);
		if (!dds.ok)
			return;

		var format;
		if (dds.format == "DXT1" && _supported.DXT1)
		{
			format = _extensions.COMPRESSED_RGBA_S3TC_DXT1_EXT;
		}
		else if (dds.format == "DXT3" && _supported.DXT3)
		{
			format = _extensions.COMPRESSED_RGBA_S3TC_DXT3_EXT;
		}
		else if (dds.format == "DXT5" && _supported.DXT5)
		{
			format = _extensions.COMPRESSED_RGBA_S3TC_DXT5_EXT;
		}
		else
		{
			logError("No support for " + dds.format + " compressed textures");
			return;
		}

		var nr_mipmaps = dds.mipmaps.length;
		gl.bindTexture(gl.TEXTURE_2D, _cache[fname]);
		for (var level = 0; level < nr_mipmaps; ++level)
		{
			gl.compressedTexImage2D(gl.TEXTURE_2D, level, format,
				dds.mipmaps[level].width, dds.mipmaps[level].height, 0,
				dds.mipmaps[level].data);
		}

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		if ((1 << (nr_mipmaps-1)) == Math.max(dds.width, dds.height))
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		else
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}

	/**
	 * Retrieve a texture from cache
	 *
	 * Get the texture for file name @fname from the texture cache. If the
	 * texture is not yet in the cache, it is loaded from the network. While
	 * the associated image is loaded, a single white pixel texture is returned.
	 * @return The texture for file @fname
	 */
	this.get = function(fname)
	{
		if (!(fname in _cache))
		{
			_cache[fname] = _createWhitePixel();
			if (/\.dds$/.test(fname))
			{
				$.ajax(fname, {
					dataType: "arraybuffer",
					error: function() {
						logError("Failed to get texture " + fname);
					},
					success: function(data) {
						_handleCompressedImageLoad(fname, data);
					}
				});
			}
			else
			{
				var image = new Image();
				image.onload = function() {
					_handleImageLoad(_cache[fname], image)
				}
				image.src = fname;
			}
		}
		return _cache[fname];
	};

	/**
	 * Bind a texture
	 *
	 * Retrieve the texture associated with file @fname from this cache, and
	 * bind it as the current GL texture.
	 */
	this.bind = function(fname)
	{
		gl.bindTexture(gl.TEXTURE_2D, this.get(fname));
	};

	/**
	 * Try to find a texture in one of the texture atlases. If found, return
	 * the name of the atlas, and the coordinates of the texture in the atlas.
	 * If not, return the original file name, and texture coordinates spanning
	 * the whole texture.
	 * @param fname The file name of the texture to look up
	 * @return Name of the atlas and coordinates of the texture in the atlas
	 */
	this.lookupAtlas = function(fname)
	{
		if (_atlases_loaded)
		{
			for (var atlas_name in _atlases)
			{
				if (fname in _atlases[atlas_name])
				{
					return {
						fname: atlas_name,
						coords: _atlases[atlas_name][fname]
					};
				}
			}
		}

		return {
			fname: fname,
			coords: { u_start: 0.0, v_start: 0.0, u_end: 1.0, v_end: 1.0 }
		};
	};

	/**
	 * Check if the texture atlas descriptions are loaded, and if so, emit
	 * the corresponding signal
	 */
	this.checkAtlasesLoaded = function()
	{
		if (_atlases_loaded)
			Signal.emit(Signal.TEXTURE_ATLASES_LOADED);
	}

	// Check if we have the required GL extensions for handling compressed textures
	var ext_names = [
		"WEBGL_compressed_texture_s3tc",
		"MOZ_WEBGL_compressed_texture_s3tc",
		"WEBKIT_WEBGL_compressed_texture_s3tc"
	];
	_extensions = {};
	for (var i = 0; i < ext_names.length; ++i)
	{
		var ext = gl.getExtension(ext_names[i]);
		if (ext)
		{
			for (var f in ext)
				_extensions[f] = ext[f];
			break;
		}
	}
	if (_extensions)
	{
		var formats = gl.getParameter(gl.COMPRESSED_TEXTURE_FORMATS);
		for (var i = 0; i < formats.length; ++i)
		{
			switch (formats[i])
			{
				case _extensions.COMPRESSED_RGBA_S3TC_DXT1_EXT:
					_supported.DXT1 = true;
					break;
				case _extensions.COMPRESSED_RGBA_S3TC_DXT3_EXT:
					_supported.DXT3 = true;
					break;
				case _extensions.COMPRESSED_RGBA_S3TC_DXT5_EXT:
					_supported.DXT5 = true;
					break;
			}
		}
    }
}
