attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec4 aVertexColor;
attribute vec2 aTextureCoord;

uniform mat4 model_view;
uniform mat4 projection;
uniform mat3 uNMatrix;

uniform bool uUseLighting;

uniform vec3 uAmbientColor;
uniform vec3 uLightingDirection;
uniform vec3 uDirectionalColor;

uniform float point_size;

varying vec4 vColor;
varying vec2 vTextureCoord;
varying vec3 vLightWeighting;

void main(void)
{
	gl_Position = projection * model_view * vec4(aVertexPosition, 1.0);
	gl_PointSize = point_size;
	vColor = aVertexColor;
	vTextureCoord = aTextureCoord;

	if (!uUseLighting)
	{
		vLightWeighting = vec3(1.0, 1.0, 1.0);
	}
	else
	{
		vec3 transformedNormal = uNMatrix * aVertexNormal;
		float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);
		vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;
	}
}
