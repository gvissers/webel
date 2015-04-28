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
	 * @a texture has been loaded. It generates a new texture from the images,
	 * and associates it with @a texture. The old contents of @a texture are
	 * lost.
	 * @param texture The texture to assign the image to
	 * @param image   The image just loaded
	 */
	function _handleLoadedTexture(texture, image)
	{
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
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
			image = new Image();
			image.onload = function() {
				_handleLoadedTexture(_cache[fname], image)
			}
			image.src = fname;
		}
		return _cache[fname];
	};
}
