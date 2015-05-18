"use strict";

function ParticleSystemDef(server_def)
{
	for (var field in server_def)
		this[field] = server_def[field];

	if (this.random_function < 0
		|| this.random_function > ParticleSystemDef.RandomFunctions.length)
	{
		logError("Invalid random function selector");
		this.random_function = 0;
	}

	if (this.texture_fname)
		this.texture = texture_cache.get(this.texture_fname);
};

ParticleSystemDef.RandomFunctions = [
	function(min, max) { return min + (max-min)*Math.random(); },
	function(min, max) { return min + 0.5*(max-min) + 0.5*(max-min)/(200*Math.random()-100+0.5); }
];

ParticleSystemDef.prototype.random = function(min, max)
{
	return ParticleSystemDef.RandomFunctions[this.random_function](min, max);
};

ParticleSystemDef.prototype.randomPosition = function()
{
	var res = vec3.create();
	do
	{
		for (var i = 0; i < 3; ++i)
			res[i] = this.random(this.min_position[i], this.max_position[i]);
	} while (this.radius_squared > 0 && vec3.squaredLength() > this.radius_squared);

	return res;
};

ParticleSystemDef.prototype.randomVelocity = function()
{
	var res = vec3.create();
	for (var i = 0; i < 3; ++i)
		res[i] = this.random(this.min_velocity[i], this.max_velocity[i]);
	return res;
};

ParticleSystemDef.prototype.randomAcceleration = function()
{
	var res = vec3.create();
	for (var i = 0; i < 3; ++i)
		res[i] = this.random(this.min_acceleration[i], this.max_acceleration[i]);
	return res;
};

ParticleSystemDef.prototype.randomColor = function()
{
	var res = vec4.create();
	for (var i = 0; i < 4; ++i)
		res[i] = this.random(this.min_color[i], this.max_color[i]);
	return res;
};

ParticleSystemDef.prototype.randomColorDifference = function()
{
	var res = vec4.create();
	for (var i = 0; i < 4; ++i)
		res[i] = this.random(this.min_color_diff[i], this.max_color_diff[i]);
	return res;
};
