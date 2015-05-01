/**
 * Cache for texture objects
 *
 * Cache for textures loaded from image files. By accessing textures only
 * through this cache, images need only be loaded from the network once.
 */
function TextureCache()
{
	/// The actual cache object, initially containing only a single-pixel white texture
	var _cache = { "white": _createWhitePixel() };
	/// Extensions provided by our graphics card
	var _extensions;
	/// Whether we have support for DXT1 compressed textures
	var _have_dxt1_support = false;
	/// Whether we have support for DXT5 compressed textures
	var _have_dxt5_support = false;

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
		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
			new Uint8Array([255, 255, 255, 255]));
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
	 * This function is called when the compressed image data @data to be
	 * associated with @a texture has been loaded. It generates a new texture
	 * from the data, and associates it with @a texture. The old contents of
	 * @a texture are lost.
	 * @param texture The texture to assign the image to
	 * @param data    The image data just loaded
	 */
	function _handleCompressedImageLoad(texture, data)
	{
		dds = new DDS(data);
		if (!dds.ok)
			return;

		var format;
		if (dds.format == "DXT1" && _have_dxt1_support)
		{
			format = _extensions.COMPRESSED_RGBA_S3TC_DXT1_EXT;
		}
		else if (dds.format == "DXT5" && _have_dxt5_support)
		{
			format = _extensions.COMPRESSED_RGBA_S3TC_DXT5_EXT;
		}
		else
		{
			logError("No support for " + dds.format + " compressed textures");
			return;
		}

		gl.bindTexture(gl.TEXTURE_2D, texture);
		for (var level = 0; level < dds.mipmaps.length; ++level)
		{
			gl.compressedTexImage2D(gl.TEXTURE_2D, level, format,
				dds.mipmaps[level].width, dds.mipmaps[level].height, 0,
				dds.mipmaps[level].data);
		}
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
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
						_handleCompressedImageLoad(_cache[fname], data);
					}
				});
			}
			else
			{
				image = new Image();
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
					_have_dxt1_support = true;
					break;
				case _extensions.COMPRESSED_RGBA_S3TC_DXT5_EXT:
					_have_dxt5_support = true;
					break;
			}
		}
    }
}
