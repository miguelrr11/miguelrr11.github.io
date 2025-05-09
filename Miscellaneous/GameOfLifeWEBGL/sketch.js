// Game of Life in WebGL
// ChatGPT
// 09-05-2025

/* sketch.js: GPU-based Ping-Pong Game of Life in a single WebGL context */
/* sketch.js: GPU-based Ping-Pong Game of Life with mobile DPI handling */

let gl;
let w, h;
let fbos = [], textures = [];
let initProgram, golProgram, displayProgram;
let quadBuffer;
let current = 0, next = 1;

function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent);
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();

  // Handle high-DPI but limit on mobile to avoid WebGL OOM
  const pd = isMobile() ? 1 : displayDensity();
  pixelDensity(pd);
  w = width * pd;
  h = height * pd;

  // Raw WebGL context
  gl = this._renderer.GL;

  // Prevent page reload on context loss
  const canvas = this.canvas;
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    console.warn('WebGL context lost');
  }, false);

  canvas.addEventListener('webglcontextrestored', () => {
    console.warn('WebGL context restored, reinitializing');
    initializeSimulation();
  }, false);

  // Initialize or reinitialize all buffers and shaders
  initializeSimulation();
}

function initializeSimulation() {
  // Clean up existing
  fbos = [];
  textures = [];

  setupFramebuffers();
  initShaders();
  setupQuad();
  initFBO();

  current = 0;
  next = 1;
}

function draw() {
  // Inject brush if mouse is pressed
  if (mouseIsPressed) {
    drawBrushToTexture(textures[current], mouseX, mouseY, 10);
  }

  // Game of Life step into `next`
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[next]);
  gl.viewport(0, 0, w, h);
  gl.useProgram(golProgram);
  setQuadAttributes(golProgram);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[current]);
  gl.uniform1i(gl.getUniformLocation(golProgram, 'uPrevState'), 0);
  gl.uniform2f(gl.getUniformLocation(golProgram, 'uTexelSize'), 1.0 / w, 1.0 / h);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Display to screen
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
  const size = Math.floor(radius * pd);
  const data = new Uint8Array(size * size * 4);

  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const dx = i - size / 2;
      const dy = j - size / 2;
      if (dx*dx + dy*dy <= (size/2)*(size/2)) {
        const index = 4 * (j * size + i);
        data[index + 0] = Math.random() > 0.5 ? 255 : 0;
        data[index + 1] = data[index + 0];
        data[index + 2] = data[index + 0];
        data[index + 3] = 255;
      }
    }
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texSubImage2D(
    gl.TEXTURE_2D, 0,
    px - size/2, py - size/2,
    size, size,
    gl.RGBA, gl.UNSIGNED_BYTE, data
  );
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  const pd = isMobile() ? 1 : displayDensity();
  pixelDensity(pd);
  w = width * pd;
  h = height * pd;
  initializeSimulation();
}

// Helpers below (setupFramebuffers, initShaders, setupQuad, initFBO, createProgram, setQuadAttributes)

function setupFramebuffers() {
  for (let i = 0; i < 2; i++) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

    textures.push(tex);
    fbos.push(fbo);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

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
    float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453); }
    void main() {
      float s = rand(vTexCoord) > 0.5 ? 1.0 : 0.0;
      gl_FragColor = vec4(vec3(s), 1.0);
    }
  `;

  const fragSrc = `
    precision mediump float;
    varying vec2 vTexCoord;
    uniform sampler2D uPrevState;
    uniform vec2 uTexelSize;
    void main() {
      int count = 0;
      for (int y=-1; y<=1; y++) for (int x=-1; x<=1; x++) {
        if (x==0 && y==0) continue;
        vec2 off = vec2(x,y) * uTexelSize;
        count += int(texture2D(uPrevState, vTexCoord+off).r+0.5);
      }
      float st = texture2D(uPrevState, vTexCoord).r;
      float ns = (st>0.5)?((count==2||count==3)?1.:0.):(count==3?1.:0.);
      gl_FragColor = vec4(vec3(ns),1.);
    }
  `;

  const fragDisplaySrc = `
    precision mediump float;
    varying vec2 vTexCoord;
    uniform sampler2D uTexture;
    void main() { gl_FragColor = texture2D(uTexture, vTexCoord); }
  `;

  initProgram    = createProgram(vertSrc, fragInitSrc);
  golProgram     = createProgram(vertSrc, fragSrc);
  displayProgram = createProgram(vertSrc, fragDisplaySrc);
}

function setupQuad() {
  quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1,-1,0,0, 1,-1,1,0, -1,1,0,1, -1,1,0,1, 1,-1,1,0, 1,1,1,1]),
    gl.STATIC_DRAW
  );
}

function initFBO() {
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[0]);
  gl.viewport(0,0,w,h);
  gl.useProgram(initProgram);
  setQuadAttributes(initProgram);
  gl.drawArrays(gl.TRIANGLES,0,6);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);
}

function createProgram(vs, fs) {
  const c = (t,s) => { const sh=gl.createShader(t); gl.shaderSource(sh,s); gl.compileShader(sh); if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(sh)); return sh; };
  const pr=gl.createProgram(); gl.attachShader(pr,c(gl.VERTEX_SHADER,vs)); gl.attachShader(pr,c(gl.FRAGMENT_SHADER,fs)); gl.linkProgram(pr); if(!gl.getProgramParameter(pr,gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(pr)); return pr;
}

function setQuadAttributes(pr) {
  const pos=gl.getAttribLocation(pr,'aPosition'), tex=gl.getAttribLocation(pr,'aTexCoord');
  gl.bindBuffer(gl.ARRAY_BUFFER,quadBuffer);
  gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos,2,gl.FLOAT,false,16,0);
  gl.enableVertexAttribArray(tex); gl.vertexAttribPointer(tex,2,gl.FLOAT,false,16,8);
}
