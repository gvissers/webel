"use strict";

/**
 * A class for the collection of all particle systems on the game map
 */
function ParticleSystemMap()
{
	/// The particle systems in this collection
	this._systems = {};

	/// The positions of all particles in the system
	this._vertices = null;
	/// The colors of all particles in the system
	this._vertices = null;

	/// GL vertex buffer
	this._vertex_buffer = gl.createBuffer();
	/// GL color buffer
	this._color_buffer = gl.createBuffer();

	/// The number of system definitions still to load
	this._nr_defs_to_load = 0;
}

/**
 * Add a new particle system to this map
 * @param system The particle system to add
 */
ParticleSystemMap.prototype.add = function(system)
{
	if (!(system.def_fname in this._systems))
	{
		this._systems[system.def_fname] = {
			def: null,
			systems: []
		};
		this._nr_defs_to_load++;
	}
	this._systems[system.def_fname].systems.push({
		offset: 0,
		system: system
	});
};

/**
 * Get the system definitions for all particle systems on this map.
 */
ParticleSystemMap.prototype.setAllDefinitions = function()
{
	var this_obj = this;
	for (var fname in this._systems)
	{
		(function(local_fname) {
			particle_system_def_cache.get(local_fname, function (def) {
				this_obj.setDefinition(local_fname, def);
			})
		})(fname);
	}
}

/**
 * Set the definition from file @a fname for all particle systems using it.
 * @param fname The file name of the definition file
 * @param def   The particle system definition
 */
ParticleSystemMap.prototype.setDefinition = function(fname, def)
{
	this._systems[fname].def = def;
	if (--this._nr_defs_to_load > 0)
		return;

	var nr_particles = 0;
	for (var fname in this._systems)
	{
		var def_sys = this._systems[fname];
		nr_particles += def_sys.def.count * def_sys.systems.length;
	}

	this._vertices = new Float32Array(3 * nr_particles);
	this._colors = new Float32Array(4 * nr_particles);

	var offset = 0;
	for (var fname in this._systems)
	{
		var def_sys = this._systems[fname];
		for (var i = 0; i < def_sys.systems.length; ++i)
		{
			def_sys.systems[i].offset = offset;
			def_sys.systems[i].system.setDefinition(def_sys.def,
				this._vertices.subarray(3*offset, 3*(offset+def_sys.def.count)),
				this._colors.subarray(4*offset, 4*(offset+def_sys.def.count)));
			offset += def_sys.def.count;
		}
	}
};

/**
 * Draw all particle systems on the map
 */
ParticleSystemMap.prototype.draw = function()
{
	if (!this._vertices)
		// definitions not loaded yet
		return;

	gl.uniform1i(shaders.program.do_point, true);
	gl.disableVertexAttribArray(shaders.program.texture_coord);
	gl.enableVertexAttribArray(shaders.program.vertex_color);
	gl.enable(gl.BLEND);

	gl.bindBuffer(gl.ARRAY_BUFFER, this._vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.STATIC_DRAW);
	gl.vertexAttribPointer(shaders.program.vertex_position, 3,
		gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this._color_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this._colors, gl.STATIC_DRAW);
	gl.vertexAttribPointer(shaders.program.vertex_color, 4,
		gl.FLOAT, false, 0, 0);

	for (var fname in this._systems)
	{
		var def_sys = this._systems[fname];
		if (!def_sys.def)
			// Definition not loaded yet
			continue;

		gl.uniform1f(shaders.program.point_size, def_sys.def.size*(11-camera.zoom_distance)*2.2);

		gl.blendFunc(def_sys.def.blend.source, def_sys.def.blend.dest);
		gl.bindTexture(gl.TEXTURE_2D, def_sys.def.texture);

		for (var i = 0; i < def_sys.systems.length; ++i)
		{
			gl.drawArrays(gl.POINTS, def_sys.systems[i].offset,
				def_sys.systems[i].system.nr_particles_alive);
		}
	}

	gl.disable(gl.BLEND);
	gl.disableVertexAttribArray(shaders.program.vertex_color);
	gl.enableVertexAttribArray(shaders.program.texture_coord);
	gl.uniform1i(shaders.program.do_point, false);
};

/**
 * Update the state (positions, velocities, colors) of all particles in all
 * systems.
 * @param time The timestamp of the update
 */
ParticleSystemMap.prototype.update = function(time)
{
	for (var fname in this._systems)
	{
		for (var i = 0; i < this._systems[fname].systems.length; ++i)
			this._systems[fname].systems[i].system.update(time);
	}
}
