const fragBlur = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 resolution;
uniform float blurAmount;

void main() {
  // Precompute the texel step scaled by blurAmount.
  vec2 texelSize = 1.0 / resolution;
  vec2 step = texelSize * blurAmount;
  // With sigma = 1.0, 1/(2*sigma^2) equals 0.5.
  float invSigma2 = 0.5;

  // Start with the center sample (offset 0, weight exp(0)==1)
  vec4 sumColor = texture2D(tex0, vTexCoord);
  float weightSum = 1.0;

  // Predefined offsets for the 8 surrounding pixels
  vec2 offsets[8];
  offsets[0] = step * vec2( 1.0,  0.0);
  offsets[1] = step * vec2(-1.0,  0.0);
  offsets[2] = step * vec2( 0.0,  1.0);
  offsets[3] = step * vec2( 0.0, -1.0);
  offsets[4] = step * vec2( 1.0,  1.0);
  offsets[5] = step * vec2( 1.0, -1.0);
  offsets[6] = step * vec2(-1.0,  1.0);
  offsets[7] = step * vec2(-1.0, -1.0);

  // Loop over surrounding pixels
  for (int i = 0; i < 8; i++) {
    vec2 off = offsets[i];
    float weight = exp(-dot(off, off) * invSigma2);
    sumColor += texture2D(tex0, vTexCoord + off) * weight;
    weightSum += weight;
  }

  gl_FragColor = sumColor / weightSum;
}

  `;
