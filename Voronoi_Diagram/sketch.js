//Fractal Noise WebGL
//Miguel Rodríguez
//25-09-2024

const canvas = document.getElementById('webgl-canvas');
const gl = canvas.getContext('webgl');
let mouseX, mouseY

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
    uniform int numPoints; 
    uniform vec2 points[1000];


    float mapp(float value, float start1, float stop1, float start2, float stop2){
        return start2 + ( (value - start1) / (stop1 - start1) ) * (stop2 - start2); 
    }

    float dist(vec2 point1, vec2 point2) {
        return length(point2 - point1);
    }

    void main() {

        vec2 st = v_texCoord;

        float bestD = 1000.0;
        int bestP = 1;

        for(int i = 0; i < 2000; i++){
            if(i >= numPoints) break;
            float d = dist(st, points[i]);
            if(d < bestD){
                bestD = d;
                bestP = i;
            }
        }

        
        //float d = pow(bestD, 0.25);  // Decrease the exponent to sharpen the contrast
        float d = mapp(bestD, 0.0, 0.15, 0.0, 1.0);
        gl_FragColor = vec4(1.0 - d, 1.0 - d, 1.0 - d, 1.0);

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
     1,  1
]), gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

const pointsLocation = gl.getUniformLocation(program, 'points');
const numPointsLocation = gl.getUniformLocation(program, 'numPoints');
const numPoints = 200 + 1;
const points = new Float32Array(numPoints * 2); // 2 values (x, y) per point

for (let i = 0; i < numPoints; i++) {
    points[i * 2] = Math.random();      
    points[i * 2 + 1] = Math.random();  
}

gl.uniform2fv(pointsLocation, points);
gl.uniform1i(numPointsLocation, numPoints);

// Create a texture to hold pixel data
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);

// Set up texture parameters
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

// Upload the pixel data (for example, a 500x500 image)
const width = 700;
const height = 700;

requestAnimationFrame(draw)

let pointsMov = []
for(let i = 0; i < numPoints; i++){
    pointsMov.push({dx: Math.random()*2-1, dy: Math.random()*2-1})
}

function draw() {
    for(let i = 0; i < numPoints-1; i++){
        points[i * 2] += pointsMov[i].dx / 400
        points[i * 2 + 1] += pointsMov[i].dy / 400

        if(points[i * 2] > 1 || points[i * 2] < 0) pointsMov[i].dx *= -1
        if(points[i * 2 + 1] > 1 || points[i * 2 + 1] < 0) pointsMov[i].dy *= -1
    }

    points[numPoints * 2 - 2] = mouseX / width
    points[numPoints * 2 - 1] = 1- (mouseY / height)

    gl.uniform2fv(pointsLocation, points);
    gl.uniform1i(numPointsLocation, numPoints);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(draw)
}

canvas.addEventListener('mousemove', function(event) {
    const rect = canvas.getBoundingClientRect(); // Get canvas position
    mouseX = event.clientX - rect.left;    // Mouse X relative to canvas
    mouseY = event.clientY - rect.top;     // Mouse Y relative to canvas
});
