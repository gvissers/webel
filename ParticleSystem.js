"use strict";

/**
 * Class for particle systems
 */
function ParticleSystem(fname, pos)
{
	/// File name of the definition file
	this.def_fname = fname;
	/// Position of this particle system
	this.position = pos;

	/// Positions of the particles in this system
	this.vertices = null;
	/// Colors of the particles in this system
	this.colors = null;
	/// Velocities of the particles in this system
	this.velocities = null;

	/// GL vertex buffer
	this.vertex_buffer = gl.createBuffer();
	/// GL color buffer
	this.color_buffer = gl.createBuffer();

	/// The number of particles still active
	this.nr_particles_alive = 0;
	/// The timestamp until which the system goes out of existance
	this.time_to_live = -1;

	/// Timestamp of last update
	this.last_update = null;

	/// Get the definition for this particle system
	this.def = null;
	var this_obj = this;
	particle_system_def_cache.get(fname, function(def) { this_obj.setDefinition(def); });
}

/// Maximum height particles in a teleporter system are allowed to go, in "meters"
ParticleSystem.max_teleporter_height = 2.0;
/// Maximum height particles in a teleport system are allowed to go, in "meters"
ParticleSystem.max_teleport_height = 2.0;
/// Maximum height particles in a bag system are allowed to go, in "meters"
ParticleSystem.max_bag_height = 1.0;
/// Minimum distance from center for particles in a burst system, in "meters"
ParticleSystem.min_burst_squared_dist = 0.01;
/// Scale factor for squared radius in burst system
ParticleSystem.burst_squared_radius_scale = 9.0;
/// Minimum speed in a single coordinate for particles in a burst system
ParticleSystem.min_burst_speed = 0.01;
/// Scale factor for resetting the velocity of too slow particles in a burst system
ParticleSystem.burst_reset_scale = 0.25;

/// Set the definition of this particle systems and initialize it
ParticleSystem.prototype.setDefinition = function(def)
{
	this.def = def;

	this.last_update = new Date().getTime();

	this.nr_particles_alive = def.count;

	this.vertices = new Float32Array(this.nr_particles_alive * 3);
	this.colors = new Float32Array(this.nr_particles_alive * 4);
	this.velocities = new Float32Array(this.nr_particles_alive * 3);
	for (var ip = 0; ip < this.nr_particles_alive; ++ip)
	{
		this.setPosition(ip, this.position);
		this.shiftPosition(ip, def.randomPosition());
		this.setColor(ip, def.randomColor());

		var vel = def.randomVelocity();
		for (var i = 0; i < 3; ++i)
			this.velocities[ip*3+i] = vel[i];
	}

	this.time_to_live = def.time_to_live < 0
		? -1
		: this.last_update + def.time_to_live;
};

/// Update the state of the particles in the system
ParticleSystem.prototype.update = function(time)
{
	if (!this.def)
		// definition not loaded yet
		return;

	var frac = (time - this.last_update) / (18 * 4);
	if (frac == 0)
		return;

	switch (this.def.type)
	{
		case ParticleSystemDefCache.Type.TELEPORTER:
			this.updateTeleporter(time, frac);
			break;
		case ParticleSystemDefCache.Type.TELEPORT:
			this.updateTeleport(time, frac);
			break;
		case ParticleSystemDefCache.Type.BAG:
			this.updateBag(time, frac);
			break;
		case ParticleSystemDefCache.Type.BURST:
			this.updateBurst(time, frac);
			break;
		case ParticleSystemDefCache.Type.FIRE:
			this.updateFire(time, frac);
			break;
		case ParticleSystemDefCache.Type.FOUNTAIN:
			this.updateFountain(time, frac);
			break;
		default:
			/* unknown type, shouldn't happen */ ;
	}

	this.last_update = time;
};

/// Update the state of the particles in a teleporter system
ParticleSystem.prototype.updateTeleporter = function(time, frac)
{
	var vertices = this.vertices;
	var z = this.position[2];
	this.restoreParticles(time, function(ip) {
		vertices[3*ip+2] = Math.max(z, vertices[3*ip+2]);
	});
	this.killParticlesIf(function(ip) {
		return vertices[3*ip+2] > z+ParticleSystem.max_teleporter_height;
	});
	this.updateParticles(frac, 1, 0);
};

/// Update the state of the particles in a teleport system
ParticleSystem.prototype.updateTeleport = function(time, frac)
{
	var obj = this;
	var pos = this.position;
	this.restoreParticles(time, function(ip) { obj.setPosition(ip, obj.position); });
	this.killParticlesIf(function(ip) {
		return vertices[3*ip+2] > pos[2]+ParticleSystem.max_teleport_height;
	});
	this.updateParticles(frac, 1, 1);
};

/// Update the state of the particles in a bag system
ParticleSystem.prototype.updateBag = function(time, frac)
{
	var vertices = this.vertices;
	var z = this.position[2];
	this.restoreParticles(time, function(ip) {
		vertices[3*ip+2] = Math.max(z, vertices[3*ip+2]);
	});
	this.killParticlesIf(function(ip) {
		return vertices[3*ip+2] > z+ParticleSystem.max_bag_height;
	});
	this.updateParticles(frac, 1, 1);
};

/// Update the state of the particles in a burst system
ParticleSystem.prototype.updateBurst = function(time, frac)
{
	var ip = 0;
	var vs = this.vertices;
	while (ip < this.nr_particles_alive)
	{
		var delta = vec3.fromValues(vs[3*ip+0], vs[3*ip+1], vs[3*ip+2]);
		vec3.sub(delta, part.position, this.position);
		var dist_sq = vec3.squaredLength(delta);
		if (dist_sq > ParticleSystem.burst_squared_radius_scale * this.def.radius_squared
			|| dist_sq < ParticleSystem.min_dist_squared)
		{
			this.killParticle(ip);
		}
		else
		{
			var avx = Math.abs(this.velocities[3*ip]);
			var avy = Math.abs(this.velocities[3*ip+1]);
			var avz = Math.abs(this.velocities[3*ip+2]);
			if (Math.max(vx, vy, vz) < ParticleSystem.min_burst_speed)
			{
				vec3.normalize(delta);
				this.velocities[3*ip  ] = 0.25 * delta[0];
				this.velocities[3*ip+1] = 0.25 * delta[1];
				this.velocities[3*ip+2] = 0.25 * delta[2];
			}
			var color_diff = this.def.randomColorDifference(0);
			for (var i = 0; i < 3; ++i)
				this.vertices[3*ip+i] += frac * this.velocities[3*ip+i];
			//for (var i = 0; i < 4; ++i)
			//	this.colors[4*ip+i] += frac * color_diff[i];
			++ip;
		}
	}
};

/// Update the state of the particles in a fire system
ParticleSystem.prototype.updateFire = function(time, frac)
{
	var colors = this.colors;
	this.restoreParticles(time);
	this.killParticlesIf(function(ip) { return colors[4*ip+3] < 0.0; });
	this.updateParticles(frac, 0, 0);
};

/// Update the state of the particles in a fountain system
ParticleSystem.prototype.updateFountain = function(time, frac)
{
	var vertices = this.vertices;
	var colors = this.colors;

	this.restoreParticles(time);
	this.killParticlesIf(function(ip) { return colors[4*ip+3] < 0.0; });
	this.updateParticles(frac, 0, 0, function(ip) {
			if (vertices[3*ip+2] < 0.0)
			{
				vertices[3*ip+2] = -vertices[3*ip+2];
				velocities[3*ip+2] = -velocities[3*ip+2];
			}
		}, true);
};

/// Reinitialize particles that are no longer active
ParticleSystem.prototype.restoreParticles = function(time, init)
{
	if (this.time_to_live > 0 && time >= this.time_to_live)
		return;

	for (var ip = this.nr_particles_alive; ip < this.def.count; ++ip)
	{
		this.setPosition(ip, this.position);
		this.shiftPosition(ip, this.def.randomPosition());
		this.setColor(ip, this.def.randomColor());
		this.setVelocity(ip, this.def.randomVelocity());
		if (init)
			init(ip);
	}
	this.nr_particles_alive = this.def.count;
}

/**
 * Kill particles
 *
 * Remove particles for which function @a die_cond returns true, from the
 * list of active particles.
 * @param die_cond function that determines if a particle should die
 */
ParticleSystem.prototype.killParticlesIf = function(die_cond)
{
	var ip = 0;
	while (ip < this.nr_particles_alive)
	{
		if (die_cond(ip))
			this.killParticle(ip);
		else
			++ip;
	}
}

/**
 * Update the particles in this system
 *
 * Update the active particles in this system, setting new positions, colors,
 * and possibly velocities.
 * @param frac            Time difference since last update, relative to a full update
 * @param acc_rf_sel      Random function selector for the acceleration
 * @param col_diff_rf_sel Random function selector for the color difference
 * @param update_func     If set, function to execute before other updates
 * @param update_vel      If set, update velocities of the particles
 */
ParticleSystem.prototype.updateParticles = function(frac,
	acc_rf_sel, col_diff_rf_sel, update_func, update_vel)
{
	if (update_func)
	{
		for (var ip = 0; ip < this.nr_particles_alive; ++ip)
			update_func(ip);
	}

	if (update_vel)
	{
		for (var ip = 0; ip < this.nr_particles_alive; ++ip)
		{
			var acceleration = this.def.randomAcceleration(acc_rf_sel);
			var color_diff = this.def.randomColorDifference(col_diff_rf_sel);
			for (var i = 0; i < 3; ++i)
			{
				this.vertices[3*ip+i] += frac * this.velocities[3*ip+i];
				this.velocities[3*ip+i] += frac * acceleration[i];
			}
			for (var i = 0; i < 4; ++i)
				this.colors[4*ip+i] += frac * color_diff[i];
		}
	}
	else
	{
		for (var ip = 0; ip < this.nr_particles_alive; ++ip)
		{
			var extra_velocity = this.def.randomAcceleration(acc_rf_sel);
			var color_diff = this.def.randomColorDifference(col_diff_rf_sel);
			for (var i = 0; i < 3; ++i)
				this.vertices[3*ip+i] += frac * (this.velocities[3*ip+i] + extra_velocity[i]);
			for (var i = 0; i < 4; ++i)
				this.colors[4*ip+i] += frac * color_diff[i];
		}
	}
}

/**
 * Kill a particle
 *
 * Kill the particle at index @a ip and remove it from the list of active
 * particles.
 * @param ip Index of the particle to remove
 */
if (Float32Array.prototype.copyWithin)
{
	ParticleSystem.prototype.killParticle = function(ip)
	{
		var np = this.nr_particles_alive;
		this.vertices.copyWithin(3*ip, 3*np-3, 3*np);
		this.colors.copyWithin(4*ip, 4*np-4, 4*np);
		this.velocities.copyWithin(3*ip, 3*np-3, 3*np);
		--this.nr_particles_alive;
	};
}
else
{
	// Chromium doesn't have copyWithin yet
	ParticleSystem.prototype.killParticle = function(ip)
	{
		var np = this.nr_particles_alive;
		for (var i = 0; i < 3; ++i)
			this.vertices[3*ip+i] = this.vertices[3*np-3+i];
		for (var i = 0; i < 4; ++i)
			this.colors[4*ip+i] = this.colors[4*np-4+i];
		for (var i = 0; i < 3; ++i)
			this.velocities[3*ip+i] = this.velocities[3*np-3+i];
		--this.nr_particles_alive;
	};
}

/// Set the position of the particle at index @a ip to @a position
ParticleSystem.prototype.setPosition = function(ip, position)
{
	for (var i = 0; i < 3; ++i)
		this.vertices[3*ip+i] = position[i];
};

/// Move the position of the particle at index @a ip by @a delta
ParticleSystem.prototype.shiftPosition = function(ip, delta)
{
	for (var i = 0; i < 3; ++i)
		this.vertices[3*ip+i] += delta[i];
};

/// Set the color of the particle at index @a ip to @a color
ParticleSystem.prototype.setColor = function(ip, color)
{
	for (var i = 0; i < 4; ++i)
		this.colors[4*ip+i] = color[i];
};

/// Set the velocity of the particle at index @a ip to @a velocity
ParticleSystem.prototype.setVelocity = function(ip, velocity)
{
	for (var i = 0; i < 3; ++i)
		this.velocities[3*ip+i] = velocity[i];
};

/// Draw this particle system on the screen
ParticleSystem.prototype.draw = function()
{
	if (!this.def)
		// definition not loaded yet
		return;

	gl.uniform1f(shaders.program.point_size, this.def.size*(11-camera.zoom_distance)*2.2);

	gl.blendFunc(this.def.blend.source, this.def.blend.dest);
	gl.bindTexture(gl.TEXTURE_2D, this.def.texture);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
	gl.vertexAttribPointer(shaders.program.vertexPositionAttribute, 3,
		gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
	gl.vertexAttribPointer(shaders.program.vertexColorAttribute, 4,
		gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.POINTS, 0, this.nr_particles_alive);
//	gl.drawArrays(gl.POINTS, 0, 12);
//	gl.drawArrays(gl.TRIANGLES, 0, 12);
}
