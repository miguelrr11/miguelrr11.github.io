let vert = `
// shader.vert
precision lowp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    vec4 pos = vec4(aPosition, 1.0);
    pos.xy = pos.xy * 2.0 - 1.0;
    gl_Position = pos;
}

`;

let frag = `
precision lowp float;

uniform sampler2D uGrid;
uniform float     uTamCell;      // hex “radius” in pixels
uniform float     uNRows;        // number of columns
uniform float     uNCols;        // number of rows
uniform vec2      uCanvasSize;   // canvas width, height in pixels

varying vec2      vTexCoord;

const float sqrt3 = 1.73205080757;

// ——— custom round() for GLSL 1.0 ———
float myround(float x) {
    return (x < 0.0)
        ? -floor(-x + 0.5)
        :  floor(x + 0.5);
}

// Round fractional axial coordinates to the nearest hex
ivec2 axial_round_(vec2 frac) {
    float s0 = -frac.x - frac.y;
    float q  = myround(frac.x);
    float r  = myround(frac.y);
    float s  = myround(s0);

    float qd = abs(q - frac.x);
    float rd = abs(r - frac.y);
    float sd = abs(s - s0);

    if (qd > rd && qd > sd) {
        q = -r - s;
    } else if (rd > sd) {
        r = -q - s;
    }
    return ivec2(int(q), int(r));
}

// Convert pixel-space → axial hex coords
ivec2 GetTileInAxialCoo(vec2 xy) {
    float q = (2.0/3.0) * xy.x;
    float r = (-1.0/3.0) * xy.x + (sqrt3/3.0) * xy.y;
    return axial_round_(vec2(q, r));
}

void main() {
    // 1) map to pixel space
    vec2 pix = vTexCoord * uCanvasSize;
    // 2) scale so hex “radius” = 1
    vec2 p   = pix / uTamCell;

    // 3) find which hex this pixel is in
    ivec2 h = GetTileInAxialCoo(p);

    // 4) convert axial → “odd-q” offset coords via floats
    //    no bitwise or modulus ops, only fract() & floor()
    float colf = float(h.x);
    float parity = fract(colf * 0.5) * 2.0;
    float rowf = float(h.y) + floor((colf + parity) * 0.5);

    // 5) sample that tile’s color directly
    vec2 uv = (vec2(colf, rowf) + 0.5) / vec2(uNRows, uNCols);
    vec3 color = texture2D(uGrid, uv).rgb;

    gl_FragColor = vec4(color, 1.0);
}



`;