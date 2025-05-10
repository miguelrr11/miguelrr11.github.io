#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform float u_particles[400];
uniform int   u_num_particles;

uniform float u_mu_k, u_sigma_k, u_w_k;
uniform float u_mu_g, u_sigma_g, u_c_rep;
uniform float u_world_size, u_world_radius;
uniform vec2  u_offset;
uniform float u_point_radius; // radio del punto en coordenadas del mundo
uniform float u_trans;
uniform float u_aspect;


// Helper: HSV → RGB
vec3 hsv2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x*6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

float peak(float x, float mu, float sigma) {
    return exp(-pow((x - mu) / sigma, 2.0));
}

void main() {
    // Mapea pantalla → mundo
   vec2 centered = vTexCoord * 2.0 - 1.0; // NDC in [-1, 1]
    centered.x *= u_aspect; // compensate for aspect ratio
    vec2 world = centered * (u_world_radius) + u_offset;

    // Calcula campos U y R
    float U = 0.0;
    float R = 0.0;
    for (int i = 0; i < 200; ++i) {
        if (i >= u_num_particles) break;
        vec2 normP = vec2(u_particles[2*i], u_particles[2*i+1]);
        vec2 pos   = normP * u_world_size - u_world_radius + u_offset;
        float d    = length(world - pos) + 1e-5;
        U += peak(d, u_mu_k, u_sigma_k);
        if (d < 1.0) R += 0.5 * u_c_rep * pow(1.0 - d, 2.0);
    }
    U *= u_w_k;
    float G = peak(U, u_mu_g, u_sigma_g);

    // Mapeo de color en HSV para más dinamismo
    float angle = atan(world.y, world.x);
    float hue   = fract((angle / (2.0 * 3.14159)) + U * 0.1 + G * 0.2 + 0.5);
    float sat   = clamp(0.5 + 0.5 * G, 0.2, 1.0);
    float val   = clamp(0.3 + 0.7 * R, 0.0, 1.0);
    vec3 baseCol = hsv2rgb(vec3(hue, sat, val));

    // Destacar partículas con un suave resplandor blanco
    float minD = u_point_radius;
    for (int i = 0; i < 200; ++i) {
        if (i >= u_num_particles) break;
        vec2 normP = vec2(u_particles[2*i], u_particles[2*i+1]);
        vec2 pos   = normP * u_world_size - u_world_radius + u_offset;
        float d    = length(world - pos);
        if (d < minD) minD = d;
    }
    vec3 finalCol = baseCol;
    if (minD < u_point_radius) {
        float f = clamp(minD / u_point_radius, 0.0, u_trans);
        float w = pow(f, 8.0);
        finalCol = mix(vec3(1.0), baseCol, 1.0 - w);
    }

    gl_FragColor = vec4(finalCol, 1.0);
}
