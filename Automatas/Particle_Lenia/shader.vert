// shader.vert
#ifdef GL_ES
precision mediump float;
#endif

// Atributos por defecto de p5.js
attribute vec3 aPosition;
attribute vec2 aTexCoord;

// Matrices uniformes de p5.js
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
