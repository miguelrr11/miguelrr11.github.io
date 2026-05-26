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

  // SHADER GRID POINTS
const vsGridSrc = `#version 300 es
  const vec2 verts[3] = vec2[](
      vec2(-1.0, -1.0),
      vec2( 3.0, -1.0),
      vec2(-1.0,  3.0)
  );
  void main() {
      gl_Position = vec4(verts[gl_VertexID], 0.0, 1.0);
  }`;

const fsGridSrc = `#version 300 es
  precision mediump float;

  uniform vec2 uResolution;
  uniform vec2 uCameraOffset;
  uniform float uCameraScale;
  uniform float uCellSize;
  uniform float uDPR;

  out vec4 outColor;

  void main() {
      // gl_FragCoord is in physical pixels, origin bottom-left.
      // Convert to CSS pixel space (top-left origin) to match camera uniforms.
      vec2 screen = vec2(gl_FragCoord.x / uDPR, uResolution.y - gl_FragCoord.y / uDPR);
      vec2 world  = (screen - uCameraOffset) / uCameraScale;

      // distance from this pixel to the nearest grid point (in world units)
      vec2 nearest   = round(world / uCellSize) * uCellSize;
      float distWorld = length(world - nearest);

      // dot radius: ~1.5 screen pixels in world units
      float r    = 1.5 / uCameraScale;
      float edge = 0.5 / uCameraScale;
      float dot  = 1.0 - smoothstep(r - edge, r + edge, distWorld);

      // fade in as zoom goes from 0.3 → 0.4 (matches p5 version)
      float zoomAlpha = clamp((uCameraScale - 0.3) / 0.1, 0.0, 1.0) * (150.0 / 255.0);

      // fade dots near screen edges (10% margin)
      float fadeZone = uResolution.x * 0.1;
      float minEdge  = min(min(screen.x, uResolution.x - screen.x),
                           min(screen.y, uResolution.y - screen.y));
      float fadeFactor = clamp(minEdge / fadeZone, 0.0, 1.0);

      float alpha = dot * zoomAlpha * fadeFactor;
      if (alpha < 0.002) discard;
      outColor = vec4(1.0, 1.0, 1.0, alpha);
  }`;