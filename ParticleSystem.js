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

	/// The particles in this system
	this.particles = [];
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

	for (var i = 0; i < def.count; ++i)
		this.particles.push(new Particle(this.position, def));
	this.nr_particles_alive = def.count;
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
			this.updateTeleporter(frac);
			break;
		case ParticleSystemDefCache.Type.TELEPORT:
			this.updateTeleport(frac);
			break;
		case ParticleSystemDefCache.Type.BAG:
			this.updateBag(frac);
			break;
		case ParticleSystemDefCache.Type.BURST:
			this.updateBurst(frac);
			break;
		case ParticleSystemDefCache.Type.FIRE:
			this.updateFire(frac);
			break;
		case ParticleSystemDefCache.Type.FOUNTAIN:
			this.updateFountain(frac);
			break;
		default:
			/* unknown type, shouldn't happen */ ;
	}

	this.last_update = time;
};

/// Update the state of the particles in a teleporter system
ParticleSystem.prototype.updateTeleporter = function(time, frac)
{
	var def = this.def;
	var z = this.position[2];
	this.restoreParticles(time, function(part) {
		part.position[2] = Math.max(part.position[2], z);
	});
	this.updateParticles(
		function(part) { return part.position[2] > z+ParticleSystem.max_teleporter_height; },
		function(part) {
			part.updateWithConstantVelocity(
				def.randomAcceleration(1),
				def.randomColorDifference(0),
				frac);
		}
	);
};

/// Update the state of the particles in a teleport system
ParticleSystem.prototype.updateTeleport = function(time, frac)
{
	var def = this.def;
	var pos = this.position;
	this.restoreParticles(time, function(part) { part.position = pos; });
	this.updateParticles(
		function(part) { return part.position[2] > pos[2]+ParticleSystem.max_teleport_height; },
		function(part) {
			part.updateWithConstantVelocity(
				def.randomAcceleration(1),
				def.randomColorDifference(1),
				frac);
		}
	);
};

/// Update the state of the particles in a bag system
ParticleSystem.prototype.updateBag = function(time, frac)
{
	var def = this.def;
	var z = this.position[2];
	this.restoreParticles(time, function(part) {
		part.position[2] = Math.max(part.position[2], z);
	});
	this.updateParticles(
		function(part) { return part.position[2] > z+ParticleSystem.max_bag_height; },
		function(part) {
			part.updateWithConstantVelocity(
				def.randomAcceleration(1),
				def.randomColorDifference(1),
				frac);
		}
	);
};

/// Update the state of the particles in a burst system
ParticleSystem.prototype.updateBurst = function(time, frac)
{
	for (var i = 0; i < this.particles.length; ++i)
	{
		var part = this.particles[i];
		if (!part.alive)
			continue;

		var delta = vec3.create();
		vec3.sub(delta, part.position, this.position);
		var dist_sq = vec3.squaredLength(delta);
		if (dist_sq > ParticleSystem.burst_squared_radius_scale * this.def.radius_squared
			|| dist_sq < ParticleSystem.min_dist_squared)
		{
			part.active = false;
			--this.nr_particles_alive;
		}
		else
		{
			if (maxabs(part.velocity) < ParticleSystem.min_burst_speed)
			{
				vec3.normalize(delta);
				vec3.scale(part.velocity, delta, 0.25);
			}
			part.updateWithConstantVelocity(
				vec3.create(),
				this.def.randomColorDifference(0),
				frac);
		}
	}
};

/// Update the state of the particles in a fire system
ParticleSystem.prototype.updateFire = function(time, frac)
{
	var def = this.def;
	this.restoreParticles(time);
	this.updateParticles(
		function(part) { return part.color[3] < 0.0; },
		function(part) {
			part.updateWithConstantVelocity(
				def.randomAcceleration(0),
				def.randomColorDifference(0),
				frac);
		}
	);
};

/// Update the state of the particles in a fountain system
ParticleSystem.prototype.updateFountain = function(time, frac)
{
	var def = this.def;
	this.restoreParticles(time);
	this.updateParticles(
		function(part) { return part.color[3] < 0.0; },
		function(part) {
			if (part.position[2] < 0.0)
			{
				part.position[2] = -part.position[2];
				part.velocity[2] = -part.velocity[2];
			}
			part.update(
				def.randomAcceleration(0),
				def.randomColorDifference(0),
				frac);
		}
	);
};

/// Reinitialize particles that are no longer active
ParticleSystem.prototype.restoreParticles = function(time, init)
{
	if (time >= this.time_to_live || this.def.count <= this.nr_particles_alive)
		return;

	for (var i = 0; i < this.particles.length; ++i)
	{
		if (!this.particles[i].alive)
		{
			var part = new Particle(this.position, this.def);
			if (init)
				init(part);
			this.particles[i] = part;
			++this.nr_particles_alive;
		}
	}
}

/// Update the active particles in this system
ParticleSystem.prototype.updateParticles = function(die_cond, update_func)
{
	for (var i = 0; i < this.particles.length; ++i)
	{
		var part = this.particles[i];
		if (!part.alive)
			continue;

		if (part.dieIf(die_cond))
			--this.nr_particles_alive;
		else
			update_func(part);
	}
}
