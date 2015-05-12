/**
 * Class for axis aligned bounding box
 */
function BoundingBox()
{
	var pos_inf = Number.POSITIVE_INFINITY;
	var neg_inf = Number.NEGATIVE_INFINITY;
	this.min = vec3.fromValues(pos_inf, pos_inf, pos_inf);
	this.max = vec3.fromValues(neg_inf, neg_inf, neg_inf);
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
