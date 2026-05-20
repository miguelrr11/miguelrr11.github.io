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
  uniform vec4 uColor;
  uniform float uBorderWidth;
  uniform vec2 uCorners[4];
  in vec2 vWorldPos;
  out vec4 outColor;

  float distToSeg(vec2 a, vec2 b, vec2 p) {
    vec2 ab = b - a;
    float t = clamp(dot(p - a, ab) / dot(ab, ab), 0.0, 1.0);
    return length(p - (a + t * ab));
  }

  void main() {
    float d = min(
      min(distToSeg(uCorners[0], uCorners[1], vWorldPos),
          distToSeg(uCorners[1], uCorners[2], vWorldPos)),
      min(distToSeg(uCorners[2], uCorners[3], vWorldPos),
          distToSeg(uCorners[3], uCorners[0], vWorldPos))
    );
    float alpha = uColor.a * (1.0 - smoothstep(0.0, uBorderWidth, d));
    outColor = vec4(uColor.rgb, alpha);
  }`;