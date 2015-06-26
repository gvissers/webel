precision mediump float;

varying vec4 vColor;
varying vec2 vTextureCoord;
varying vec3 vLightWeighting;
varying float fog_factor;

uniform float alpha_low;
uniform bool do_point;
uniform vec3 fog_color;

uniform sampler2D uSampler;

void main(void)
{
	vec4 texture_color;
	if (do_point)
		texture_color = vColor * texture2D(uSampler, gl_PointCoord);
	else
		texture_color = vColor * texture2D(uSampler, vTextureCoord);
	if (texture_color.a < alpha_low)
		discard;

	vec4 final_color = vec4(texture_color.rgb * vLightWeighting, texture_color.a);

	gl_FragColor = mix(vec4(fog_color, 1.0), final_color, fog_factor);
}
