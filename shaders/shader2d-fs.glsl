precision mediump float;

uniform float alpha_low;
uniform sampler2D uSampler;

varying vec4 color;
varying vec2 text_crd;

void main(void)
{
	gl_FragColor = color * texture2D(uSampler, text_crd);
	if (gl_FragColor.a < alpha_low)
		discard;
}
