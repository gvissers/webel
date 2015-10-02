"use strict";

/**
 * Class for drawing the sky
 */
function Sky()
{
	/// Definitions (sky colors, sun, moon, etc.) for different maps
	this.settings = null;
	/// The projection matrix to use for the sky
	this.projection_matrix = null;
	/// The sky dome itself
	this.sky_dome = null;
	/// Dome for the clouds in the sky
	this.clouds_dome = null;

	// The sky dome needs to be drawn further away than the usual far plane
	// allows. So we use our own projection matrix when drawing it.
	this.setProjection();

	// Get the settings from the server
	var this_obj = this;
	$.ajax("getsky.php", {
		dataType: "json",
		error: function() {
			logError("Failed to get sky definitions");
		},
		success: function(settings) {
			if ("error" in settings)
			{
				logError(settings.error)
			}
			else
			{
				this_obj.settings = settings;
				this_obj.sky_dome = this_obj.createDome(Sky.dome_nr_slices,
					Sky.dome_nr_stacks, Sky.dome_radius,
					80*Math.PI/180, 90*Math.PI/180, 3.5*Math.PI/180, 1.0);
				this_obj.clouds_dome = this_obj.createDome(Sky.dome_nr_slices,
					Sky.dome_nr_stacks, Sky.dome_radius,
					80*Math.PI/180, 90*Math.PI/180, 2.0*Math.PI/180, 1.0);

				this_obj.setColors(0);
			}
		}
	});
}

/// The number of horizontal rings in the dome
Sky.dome_nr_stacks = 12;
/// The number of vertical segments per ring
Sky.dome_nr_slices = 24;
/// The radius of the dome, in "meters"
Sky.dome_radius = 500;

/**
 * Create a dome in the sky
 * @param nr_slices        The number of vertical segments per ring
 * @param nr_stacks        The number of rings making up the dome
 * @param radius           The ground radius of the dome in "meters"
 * @param opening
 * @param fake_opening
 * @param first_angle_step latitudinal angle for the topmost ring in radians
 * @param texture_size
 */
Sky.prototype.createDome = function(nr_slices, nr_stacks, radius, opening,
	fake_opening, first_angle_step, texture_size)
{
	var nr_vertices = nr_slices * (nr_stacks+1) + 1;
	var nr_faces = nr_slices * (2*nr_stacks+1);

	var vertices = new Float32Array(3 * nr_vertices);
	var normals = new Float32Array(3 * nr_vertices);
	var colors = new Float32Array(4 * nr_vertices);
	var texture_coords = new Float32Array(2 * nr_vertices);
	var indices = new Uint16Array(3 * nr_faces);

	var angle = opening;
	var sin_max_angle = Math.sin(angle);
	var cos_max_angle = Math.cos(angle);
	var real_radius = radius / sin_max_angle;
	var height = real_radius * (1 - cos_max_angle);
	var tc_scale_factor = radius / texture_size;

	texture_size *= radius * cos_max_angle / (real_radius * sin_max_angle);

	var conversion_factor = cos_max_angle * radius;

	var idx = 0;
	var first = first_angle_step > 0.0;
	var tot_angle = angle + 10 * Math.PI / 180;
	var angle_step = first ? tot_angle / nr_stacks : tot_angle / (nr_stacks+1);
	for (var i = 0; i <= nr_stacks; ++i)
	{
		var cos_angle = Math.cos(angle);
		var sin_angle = Math.sin(angle);
		var z_pos = height - (1 - cos_angle) * real_radius;
		var tmp = 0.5 * texture_size * sin_angle/cos_angle;
		var fake_angle = angle * fake_opening / opening;
		var cos_fake_angle = Math.cos(fake_angle);
		var sin_fake_angle = Math.sin(fake_angle);
		for (j = 0; j < nr_slices; ++j, ++idx)
		{
			var theta = j * 2.0 * Math.PI / nr_slices;
			var cos_theta = Math.cos(theta);
			var sin_theta = Math.sin(theta);
			vertices[3*idx  ] = sin_angle * cos_theta * real_radius;
			vertices[3*idx+1] = sin_angle * sin_theta * real_radius;
			vertices[3*idx+2] = z_pos;
			normals[3*idx  ] = sin_fake_angle * cos_theta;
			normals[3*idx+1] = sin_fake_angle * sin_theta;
			normals[3*idx+2] = cos_fake_angle;
			texture_coords[2*idx  ] = 0.5 + tmp * cos_theta;
			texture_coords[2*idx+1] = 0.5 + tmp * sin_theta;
		}
		angle -= first ? first_angle_step : angle_step;
		first = false;
	}
	vertices[idx*3  ] = 0.0;
	vertices[idx*3+1] = 0.0;
	vertices[idx*3+2] = height;
	normals[idx*3  ] = 0.0;
	normals[idx*3+1] = 0.0;
	normals[idx*3+2] = 1.0;
	texture_coords[idx*2  ] = 0.5;
	texture_coords[idx*2+1] = 0.5;

	idx = 0;
	for (var i = 0; i < nr_stacks; ++i)
	{
		for (var j = 0; j < nr_slices; ++j)
		{
			var j1 = (j + 1) % nr_slices;
			indices[idx++] = i*nr_slices + j;
			indices[idx++] = i*nr_slices + j + nr_slices;
			indices[idx++] = i*nr_slices + j1;
			indices[idx++] = i*nr_slices + j1;
			indices[idx++] = i*nr_slices + j + nr_slices;
			indices[idx++] = i*nr_slices + j1 + nr_slices;
		}
	}
	for (var j = 0; j < nr_slices; ++j)
	{
		var j1 = (j + 1) % nr_slices;
		indices[idx++] = nr_stacks * nr_slices + j;
		indices[idx++] = nr_stacks * nr_slices + nr_slices;
		indices[idx++] = nr_stacks * nr_slices + j1;
	}

	var dome = {
		vertex_buffer: gl.createBuffer(),
		color_buffer: gl.createBuffer(),
		texture_coord_buffer: gl.createBuffer(),
		index_buffer: gl.createBuffer(),
		colors: colors,
		nr_slices: nr_slices,
		nr_vertices: nr_vertices,
		nr_faces: nr_faces,
		height: height
	};

	gl.bindBuffer(gl.ARRAY_BUFFER, dome.vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, dome.texture_coord_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, texture_coords, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dome.index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	return dome;
};

/// Draw the sky
Sky.prototype.draw = function()
{
	gl.enableVertexAttribArray(shaders.program.vertex_color);

	projection_matrix.push();
	projection_matrix.set(this.projection_matrix);
	projection_matrix.setUniform();

	var x = camera.tile_pos[0] * ElevationMap.tile_size_meters;
	var y = camera.tile_pos[1] * ElevationMap.tile_size_meters;
	model_view_matrix.push();
	model_view_matrix.translate([-x, -y, 0.0]);
	model_view_matrix.setUniform();

	texture_cache.bind("white");
	gl.bindBuffer(gl.ARRAY_BUFFER, this.sky_dome.vertex_buffer);
	gl.vertexAttribPointer(shaders.program.vertex_position, 3,
		gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.sky_dome.color_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.sky_dome.colors, gl.STATIC_DRAW);
	gl.vertexAttribPointer(shaders.program.vertex_color, 4,
		gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.sky_dome.texture_coord_buffer);
	gl.vertexAttribPointer(shaders.program.texture_coord, 2,
		gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sky_dome.index_buffer);
	gl.drawElements(gl.TRIANGLES, 3*this.sky_dome.nr_faces, gl.UNSIGNED_SHORT, 0);

	model_view_matrix.pop();
	projection_matrix.pop();

	gl.disableVertexAttribArray(shaders.program.vertex_color);
}

/// Calculate the projection matrix to use for the sky
Sky.prototype.setProjection = function()
{
	var aspect = gl.viewportWidth / gl.viewportHeight;
	var mat = new ProjectionMatrix;
	mat.perspective(Camera.field_of_view*Math.PI/180, aspect,
		Camera.near_plane, 2*Sky.dome_radius);

	this.projection_matrix = mat.get();
}

/// Set the current colors for the vertices in the sky domes
Sky.prototype.setColors = function(light_level)
{
	// For now
	for (var i = 0; i < this.sky_dome.nr_vertices; ++i)
	{
		this.sky_dome.colors[4*i  ] = 18/256;
		this.sky_dome.colors[4*i+1] = 46/256;
		this.sky_dome.colors[4*i+2] = 68/256;
		this.sky_dome.colors[4*i+3] = 1.0;
	}
}
