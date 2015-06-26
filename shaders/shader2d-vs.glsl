attribute vec3 vertex_position;
attribute vec4 vertex_color;
attribute vec2 texture_coord;

uniform mat4 model_view;
uniform mat4 projection;

varying vec4 color;
varying vec2 text_crd;

void main(void)
{
	gl_Position = projection * model_view * vec4(vertex_position, 1.0);
	color = vertex_color;
	text_crd = texture_coord;
}
