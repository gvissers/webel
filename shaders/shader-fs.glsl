precision mediump float;

varying vec4 vColor;
varying vec2 vTextureCoord;
varying vec3 vLightWeighting;

uniform float alpha_low;
uniform bool do_point;

uniform sampler2D uSampler;

void main(void)
{
	vec4 textureColor;
	if (do_point)
		textureColor = vColor * texture2D(uSampler, gl_PointCoord);
	else
		textureColor = vColor * texture2D(uSampler, vTextureCoord);
	if (textureColor.a < alpha_low)
		discard;
	gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a);
}
