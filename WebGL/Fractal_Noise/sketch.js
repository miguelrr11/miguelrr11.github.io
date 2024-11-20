//Fractal Noise WebGL
//Miguel Rodríguez
//25-09-2024


let t = 0
const rx = Math.random() * 1000
const ry = Math.random() * 1000

const canvas = document.getElementById('webgl-canvas');
const gl = canvas.getContext('webgl');

// Vertex Shader Source
const vertexShaderSource = `
    attribute vec2 a_position;
    varying vec2 v_texCoord;
    
    void main() {
        v_texCoord = a_position * 0.5 + 0.5; // Convert to [0, 1] range
        gl_Position = vec4(a_position, 0, 1);
    }
`;

// Fragment Shader Source
const fragmentShaderSource = `
    precision highp float;

    varying vec2 v_texCoord;
    uniform float u_time;
    uniform vec2 u_scl;
    uniform float u_displacementScale;
    uniform float u_persistence;
    uniform int u_totalOctaves;
    uniform float u_contrastPower;
    uniform vec2 u_resolution;

    // 2D Random
    float random (in vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    

    vec3 mod289(vec3 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec2 mod289(vec2 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec3 permute(vec3 x) {
      return mod289(((x*34.0)+10.0)*x);
    }

    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                          0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                         -0.577350269189626,  // -1.0 + 2.0 * C.x
                          0.024390243902439); // 1.0 / 41.0
    // First corner
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);

    // Other corners
      vec2 i1;
      //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
      //i1.y = 1.0 - i1.x;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      // x0 = x0 - 0.0 + 0.0 * C.xx ;
      // x1 = x0 - i1 + 1.0 * C.xx ;
      // x2 = x0 - 1.0 + 2.0 * C.xx ;
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;

    // Permutations
      i = mod289(i); // Avoid truncation effects in permutation
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));

      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;

    // Gradients: 41 points uniformly over a line, mapped onto a diamond.
    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt( a0*a0 + h*h );
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

    // Compute final noise value at P
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    // Fractal noise function
    float fractalNoise(vec2 st) {
        float col = 0.0;
        float amplitude = 1.0;
        float frequency = 1.0;
        float maxValue = 0.0;

        for (int octave = 0; octave < 15; octave++) {  // Adjust to u_totalOctaves if needed
            col += snoise(st * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= u_persistence; // Reduce amplitude
            frequency *= 2.0; // Increase frequency
        }

        return col / maxValue; // Normalize
    }

    vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    void main() {
        vec2 st = v_texCoord * u_resolution; // Use texture coordinates scaled by resolution

        // Apply animated noise-based displacement
        float xOffset = (snoise(st)) * u_displacementScale + u_time*500.0 + u_scl.x;
        float yOffset = (snoise(st)) * u_displacementScale + u_time*500.0 + u_scl.y;

        // Calculate the displaced position
        vec2 displacedPos = st + vec2(xOffset, yOffset);

        // Get the fractal noise value, which is already between 0 and 1
        float n = fractalNoise(displacedPos);

        // Apply contrast adjustment
        n = pow(n, u_contrastPower);
        //gl_FragColor = vec4(vec3(n), 1.0);

        // Map the noise value to a hue between 0 and 1
        float hue = n;  // No need to divide by 255; it's already in [0, 1]

        // Create an HSV color where:
        // - hue is based on noise
        // - saturation is full (1.0)
        // - value (brightness) is full (1.0)
        vec3 hsvColor = vec3(hue, 1.0, 1.0);

        // Convert the HSV color to RGB
        vec3 rgbColor = hsv2rgb(hsvColor);

        // Set the final fragment color with RGB values
        gl_FragColor = vec4(rgbColor, 1);
    }

`;



function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));  // Show the error log
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) {
        console.error("Shader creation failed.");
        return null;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
if (!program) {
    console.error("Program linking failed.");
}

gl.useProgram(program); 

// Set up the rectangle that covers the entire canvas
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
     1,  1 ]), gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Get uniform locations
const timeLocation = gl.getUniformLocation(program, 'u_time');
const sclLocation = gl.getUniformLocation(program, 'u_scl');
const displacementScaleLocation = gl.getUniformLocation(program, 'u_displacementScale');
const persistenceLocation = gl.getUniformLocation(program, 'u_persistence');
const totalOctavesLocation = gl.getUniformLocation(program, 'u_totalOctaves');
const contrastPowerLocation = gl.getUniformLocation(program, 'u_contrastPower');
const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

// Create a texture to hold pixel data
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);

// Set up texture parameters
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

// Upload the pixel data (for example, a 500x500 image)
const width = 500;
const height = 500;

requestAnimationFrame(draw)

function draw() {
    gl.uniform1f(timeLocation, t);
    gl.uniform2f(sclLocation, rx, ry); // Scale for zooming in/out
    gl.uniform1f(displacementScaleLocation, 0.1); // Displacement scale
    gl.uniform1f(persistenceLocation, 0.6); // Noise persistence
    gl.uniform1i(totalOctavesLocation, 1); // Number of octaves for noise
    gl.uniform1f(contrastPowerLocation, 1); // Contrast adjustment
    gl.uniform2f(resolutionLocation, 0.8, 0.8);  // Pass resolution

    // Draw the quad
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Increment time
    t += 0.000001;

    requestAnimationFrame(draw)
}
