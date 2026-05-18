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
// NOTA: he añadido uColor como uniform. Si todos los polígonos comparten
// el MISMO color exactamente, puedes hardcodearlo en el shader y quitar la
// uniform. Pero lo normal es que carreteras e intersecciones sean colores
// distintos, y con un uniform las dibujas en dos draws sin tocar geometría.