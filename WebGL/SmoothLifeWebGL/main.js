const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  alert("WebGL no es compatible en tu navegador.");
}

// Tamaño de la cuadrícula
const rows = 100, cols = 100;
const dt = 0.05;

// Vertex Shader
const vertexShaderSrc = `
  attribute vec2 a_position;
  varying vec2 v_texcoord;

  void main() {
    v_texcoord = a_position * 0.5 + 0.5; // Normalizamos las coordenadas de textura
    gl_Position = vec4(a_position, 0, 1);
  }
`;

// Fragment Shader
const fragmentShaderSrc = `
 precision mediump float;

uniform sampler2D u_state;
uniform vec2 u_resolution;
uniform float u_dt;

varying vec2 v_texcoord;

#define RADIUS 15 // Definir radio como constante

void main() {
    vec2 gridSize = 1.0 / u_resolution;
    float value = texture2D(u_state, v_texcoord).r;

    float sum = 0.0;
    int count = 0;

    // Bucle con límites constantes
    for (int dx = -RADIUS; dx <= RADIUS; dx++) {
        for (int dy = -RADIUS; dy <= RADIUS; dy++) {
            vec2 offset = vec2(float(dx), float(dy)) * gridSize;
            sum += texture2D(u_state, v_texcoord + offset).r;
            count++;
        }
    }

    float average = sum / float(count);
    float newValue = clamp(value + u_dt * (2.0 * average - 1.0), 0.0, 1.0);

    gl_FragColor = vec4(newValue, newValue, newValue, 1.0); // Escala de grises
}

`;

// Función para compilar shaders
function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }
  return shader;
}

// Programa de shaders
const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error(gl.getProgramInfoLog(program));
}
gl.useProgram(program);

// Cuadrado de pantalla completa
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1, -1,  1, -1,  -1, 1,  1, 1
]), gl.STATIC_DRAW);

const a_position = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

// Textura inicial (aleatoria)
const initialState = new Uint8Array(rows * cols);
for (let i = 0; i < initialState.length; i++) {
  initialState[i] = Math.random() * 255; // Valores aleatorios entre 0 y 255
}

const stateTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, stateTexture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, cols, rows, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, initialState);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

// Uniformes
const u_resolution = gl.getUniformLocation(program, "u_resolution");
const u_dt = gl.getUniformLocation(program, "u_dt");
gl.uniform2f(u_resolution, cols, rows);
gl.uniform1f(u_dt, dt);

// Dibujar
function render() {
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(render);
}
render();
