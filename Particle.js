"use strict";

/**
 * Class for a single particle in a particle system
 */
function Particle(sys_pos, sys_def)
{
	/// Position of this particle
	this.position = sys_def.randomPosition();
	vec3.add(this.position, this.position, sys_pos);
	/// Color of this particle
	this.color = sys_def.randomColor();
	/// Velocity of this particle
	this.velocity = sys_def.randomVelocity();
	/// Whether this particle is still active
	this.alive = true;
}

/**
 * If condition @a cond is true, mark this particle as no longer active.
 * @return The condition passed to this function
 */
Particle.prototype.dieIf = function(die_cond)
{
	if (die_cond(this))
		this.alive = false;
	return !this.alive;
};

/**
 * Update the particle
 *
 * Update the state (position, velocity, color) of this particle.
 * @param acceleration The rate of change of the velocity
 * @param color_diff   The color difference to apply
 * @param frac         Time difference since last update, relative to a full
 * 	update
 */
Particle.prototype.update = function(acceleration, color_diff, frac)
{
	for (var i = 0; i < 3; ++i)
	{
		this.position[i] += frac * this.velocity[i];
		this.velocity[i] += frac * acceleration[i];
	}
	for (var i = 0; i < 4; ++i)
		this.color[i] += frac * color_diff[i];
};

/**
 * Update the particle
 *
 * Update the state (position, color) of this particle, keeping its velocity
 * constant.
 * @param extra_velocity Additional velocity used to update position, but not
 * 	the particles velocity
 * @param color_diff   The color difference to apply
 * @param frac         Time difference since last update, relative to a full
 * 	update
 */
Particle.prototype.updateWithConstantVelocity = function(extra_velocity,
	color_diff, frac)
{
	for (var i = 0; i < 3; ++i)
		this.position[i] += frac * (this.velocity[i] + extra_velocity[i]);
	for (var i = 0; i < 4; ++i)
		this.color[i] += frac * color_diff[i];
};
