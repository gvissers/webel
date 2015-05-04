precision mediump float;

varying vec4 vColor;
varying vec2 vTextureCoord;
varying vec3 vLightWeighting;

uniform float alpha_low;

uniform sampler2D uSampler;

void main(void)
{
	vec4 textureColor = vColor * texture2D(uSampler, vTextureCoord);
	if (textureColor.a < alpha_low)
		discard;
	gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a);
}
