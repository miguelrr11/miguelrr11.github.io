// SHADER SUPERFICIES
const vsSrc = `#version 300 es
  in vec2 aPos;
  uniform vec2 uResolution;
  uniform vec2 uCameraOffset;
  uniform float uCameraScale;
  void main() {
    vec2 screen = aPos * uCameraScale + uCameraOffset;
    vec2 clip   = (screen / uResolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  }`;

const fsSrc = `#version 300 es
  precision mediump float;
  uniform vec4 uColor;
  out vec4 outColor;
  void main() { outColor = uColor; }`;

// SHADER HOVER POLYGON
const vsHoverSrc = `#version 300 es
  in vec2 aPos;
  uniform vec2 uResolution;
  uniform vec2 uCameraOffset;
  uniform float uCameraScale;
  out vec2 vWorldPos;
  void main() {
    vec2 screen = aPos * uCameraScale + uCameraOffset;
    vec2 clip   = (screen / uResolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    vWorldPos = aPos;
  }`;

const fsHoverSrc = `#version 300 es
  precision mediump float;
  precision highp sampler2D;

  uniform vec4 uColor;
  uniform float uBorderWidth;
  uniform sampler2D uCorners;
  uniform int uCornerCount;

  in vec2 vWorldPos;
  out vec4 outColor;

  float distToSeg(vec2 a, vec2 b, vec2 p) {
    vec2 ab = b - a;
    float t = clamp(dot(p - a, ab) / dot(ab, ab), 0.0, 1.0);
    return length(p - (a + t * ab));
  }

  vec2 getCorner(int i) {
    return texelFetch(uCorners, ivec2(i, 0), 0).xy;
  }

  void main() {
    float uSolidWidth = uBorderWidth * 0.25;

    float d = 1e20;
    for (int i = 0; i < uCornerCount; i++) {
      int j = (i + 1) == uCornerCount ? 0 : (i + 1);
      d = min(d, distToSeg(getCorner(i), getCorner(j), vWorldPos));
    }

    float t = smoothstep(uSolidWidth * 0.7, uSolidWidth, d);
    vec3 lightColor = mix(uColor.rgb, vec3(1.0), 0.75);
    vec3 rgb = mix(lightColor, uColor.rgb, t);
    float alpha = uColor.a * (1.0 - smoothstep(uSolidWidth, uBorderWidth, d));
    outColor = vec4(rgb, alpha);
  }`;