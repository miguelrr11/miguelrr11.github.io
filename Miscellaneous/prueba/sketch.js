// Game of Life in WebGL
// ChatGPT
// 09-05-2025

/* sketch.js: GPU-based Ping-Pong Game of Life in a single WebGL context */

let gl;
let w, h;
let fbos = [], textures = [];
let initProgram, golProgram, displayProgram;
let quadBuffer;
let current = 0, next = 1;
let pd 

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();

  // Respect screen pixel density
  pd = pixelDensity();
  w = width * pixelDensity();
  h = height * pixelDensity();

  // Access raw WebGL context
  gl = this._renderer.GL;

  // Create two FBOs with textures for ping-pong
  setupFramebuffers();

  // Compile shaders (in this context)
  initShaders();

  // Fullscreen quad buffer (posXY, texUV interleaved)
  quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1,  0, 0,
       1, -1,  1, 0,
      -1,  1,  0, 1,
      -1,  1,  0, 1,
       1, -1,  1, 0,
       1,  1,  1, 1
    ]),
    gl.STATIC_DRAW
  );

  // Initialize first texture with random state
  initFBO();
}

function draw() {
  // Inject brush if mouse is pressed
  if (mouseIsPressed) {
    drawBrushToTexture(textures[current], mouseX, mouseY, 50);
  }

  // Step: render Game of Life into 'next' FBO
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[next]);
  gl.viewport(0, 0, w, h);
  gl.useProgram(golProgram);
  setQuadAttributes(golProgram);
  // Bind previous state texture
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[current]);
  gl.uniform1i(gl.getUniformLocation(golProgram, 'uPrevState'), 0);
  gl.uniform2f(gl.getUniformLocation(golProgram, 'uTexelSize'), 1.0 / w, 1.0 / h);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Display 'next' to screen
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(displayProgram);
  setQuadAttributes(displayProgram);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[next]);
  gl.uniform1i(gl.getUniformLocation(displayProgram, 'uTexture'), 0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Swap
  [current, next] = [next, current];
}

function drawBrushToTexture(texture, x, y, radius) {
	const pd = pixelDensity();
	const px = Math.floor(x * pd);
	const py = Math.floor((height - y) * pd);
  
	const brushSize = radius * pd;
	const size = Math.floor(brushSize);
	const data = new Uint8Array(size * size * 4);
  
	for (let j = 0; j < size; j++) {
	  for (let i = 0; i < size; i++) {
		const dx = i - size / 2;
		const dy = j - size / 2;
		const dist = Math.sqrt(dx * dx + dy * dy);
		if (dist <= size / 2) {
		  const index = 4 * (j * size + i);
		  const alive = Math.random() > 0.5;
			const value = alive ? 255 : 0;
			data[index + 0] = value;
			data[index + 1] = value;
			data[index + 2] = value;
			data[index + 3] = 255;
		}
	  }
	}
  
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texSubImage2D(
	  gl.TEXTURE_2D,
	  0,
	  px - size / 2,
	  py - size / 2,
	  size,
	  size,
	  gl.RGBA,
	  gl.UNSIGNED_BYTE,
	  data
	);
  }

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  w = width * pd;
  h = height * pd;
  // Resize textures
  for (let i = 0; i < 2; i++) {
    gl.bindTexture(gl.TEXTURE_2D, textures[i]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }
  initFBO();
  current = 0;
  next = 1;
}

// Initialize FBO[0] with random cells
function initFBO() {
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[0]);
  gl.viewport(0, 0, w, h);
  gl.useProgram(initProgram);
  setQuadAttributes(initProgram);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

// Create two textures+framebuffers
function setupFramebuffers() {
  for (let i = 0; i < 2; i++) {
    // Create texture
    let tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    // Create framebuffer
    let fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

    textures.push(tex);
    fbos.push(fbo);
  }
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

// Compile shaders
function initShaders() {
  const vertSrc = `
    attribute vec2 aPosition;
    attribute vec2 aTexCoord;
    varying vec2 vTexCoord;
    void main() {
      vTexCoord = aTexCoord;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fragInitSrc = `
    precision mediump float;
    varying vec2 vTexCoord;
    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
    }
    void main() {
      float r = rand(vTexCoord);
      float s = r > 0.5 ? 1.0 : 0.0;
      gl_FragColor = vec4(s, s, s, 1.0);
    }
  `;

  const fragSrc = `
    precision mediump float;
    varying vec2 vTexCoord;
    uniform sampler2D uPrevState;
    uniform vec2 uTexelSize;
    void main() {
      int count = 0;
      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          if (x==0 && y==0) continue;
          vec2 off = vec2(float(x), float(y)) * uTexelSize;
          float n = texture2D(uPrevState, vTexCoord + off).r;
          count += int(n + 0.5);
        }
      }
      float state = texture2D(uPrevState, vTexCoord).r;
      float ns = (state > 0.5)
        ? ((count == 2 || count == 3) ? 1.0 : 0.0)
        : (count == 3 ? 1.0 : 0.0);
      gl_FragColor = vec4(ns, ns, ns, 1.0);
    }
  `;

  const fragDisplaySrc = `
    precision mediump float;
    varying vec2 vTexCoord;
    uniform sampler2D uTexture;
    void main() {
      gl_FragColor = texture2D(uTexture, vTexCoord);
    }
  `;

  initProgram    = createProgram(vertSrc, fragInitSrc);
  golProgram     = createProgram(vertSrc, fragSrc);
  displayProgram = createProgram(vertSrc, fragDisplaySrc);
}

// Helper: compile & link GLSL
function createProgram(vsSrc, fsSrc) {
  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
      console.error(gl.getShaderInfoLog(sh));
    return sh;
  }
  const vs = compile(gl.VERTEX_SHADER, vsSrc);
  const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
  const pr = gl.createProgram();
  gl.attachShader(pr, vs);
  gl.attachShader(pr, fs);
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS))
    console.error(gl.getProgramInfoLog(pr));
  return pr;
}

// Helper: bind quadBuffer to attributes
function setQuadAttributes(program) {
  const posLoc = gl.getAttribLocation(program, 'aPosition');
  const texLoc = gl.getAttribLocation(program, 'aTexCoord');
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(texLoc);
  gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 16, 8);
}