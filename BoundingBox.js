/**
 * Class for axis aligned bounding box
 */
function BoundingBox(min, max)
{
	if (min)
	{
		this.min = vec3.fromValues(min[0], min[1], min[2]);
	}
	else
	{
		var pos_inf = Number.POSITIVE_INFINITY;
		this.min = vec3.fromValues(pos_inf, pos_inf, pos_inf);
	}
	if (max)
	{
		this.max = vec3.fromValues(max[0], max[1], max[2]);
	}
	else
	{
		var neg_inf = Number.NEGATIVE_INFINITY;
		this.max = vec3.fromValues(neg_inf, neg_inf, neg_inf);
	}
}

/// Check if this bounding box overlaps with @a bbox
BoundingBox.prototype.overlaps = function(bbox)
{
	for (var i = 0; i < 3; ++i)
	{
		if (this.max[i] < bbox.min[i] || bbox.max[i] < this.min[i])
			return false;
	}
	return true;
}

/// Update the bounding box with a new point
BoundingBox.prototype.update = function(vec)
{
	for (var i = 0; i < 3; ++i)
	{
		this.min[i] = Math.min(this.min[i], vec[i]);
		this.max[i] = Math.max(this.max[i], vec[i]);
	}
}
