attribute vec3 vertex_position;
attribute vec3 vertex_normal;
attribute vec4 vertex_color;
attribute vec2 texture_coord;

uniform mat4 model_view;
uniform mat4 projection;
uniform mat3 uNMatrix;

uniform bool uUseLighting;

uniform vec3 uAmbientColor;
uniform vec3 uLightingDirection;
uniform vec3 uDirectionalColor;

uniform float point_size;

uniform float fog_density;

varying vec4 vColor;
varying vec2 vTextureCoord;
varying vec3 vLightWeighting;
varying float fog_factor;

void main(void)
{
	vec4 vertex = model_view * vec4(vertex_position, 1.0);

	gl_Position = projection * vertex;
	gl_PointSize = point_size;
	vColor = vertex_color;
	vTextureCoord = texture_coord;

	float rhoz = fog_density * length(vertex.xyz);
	fog_factor = exp(-rhoz * rhoz);
	fog_factor = clamp(fog_factor, 0.0, 1.0);

	if (!uUseLighting)
	{
		vLightWeighting = vec3(1.0, 1.0, 1.0);
	}
	else
	{
		vec3 transformedNormal = uNMatrix * vertex_normal;
		float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);
		vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;
	}
}
