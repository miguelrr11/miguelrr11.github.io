// shader.frag
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

float peak(float x, float mu, float sigma) {
  return exp(-pow((x - mu) / sigma, 2.0));
}

void main() {
  // Mapea pantalla → mundo y aplica offset de cámara
  vec2 world = vTexCoord * u_world_size - u_world_radius + u_offset;

  // Calcula campos U y R
  float U = 0.0;
  float R = 0.0;
  for (int i = 0; i < 200; i++) {
    if (i >= u_num_particles) break;
    vec2 normP = vec2(u_particles[2*i], u_particles[2*i+1]);
    vec2 pos   = normP * u_world_size - u_world_radius + u_offset;
    float d    = length(world - pos) + 1e-5;
    U += peak(d, u_mu_k, u_sigma_k);
    if (d < 1.0) R += 0.5 * u_c_rep * pow(1.0 - d, 2.0);
  }
  U *= u_w_k;
  float G = peak(U, u_mu_g, u_sigma_g);

  // Color base: mezcla de amarillo (R) y azul (G)
  float yellow = clamp(R, 0.0, 1.0);
  float blue   = clamp(G, 0.0, 1.0);
  vec3 baseCol = clamp(vec3(U*G, yellow, yellow) + vec3(0.0, 0.0, blue), 0.0, 1.0);

  // Calcula distancia mínima a partículas para punto
  float minD = u_point_radius;
  for (int i = 0; i < 200; i++) {
    if (i >= u_num_particles) break;
    vec2 normP = vec2(u_particles[2*i], u_particles[2*i+1]);
    vec2 pos   = normP * u_world_size - u_world_radius + u_offset;
    float d    = length(world - pos);
    if (d < minD) minD = d;
  }

  // Si estamos dentro del radio, mezclamos color con caída no lineal
  vec3 finalCol = baseCol;
  if (minD < u_point_radius) {
    // factor f lineal de 0 (centro) a 1 (borde)
    float f = clamp(minD / u_point_radius, 0.0, u_trans);
    // caída rápida: f^2 para que el blanco pierda fuerza rápidamente
    float w = pow(f, 10.0);
    // white weight = w, base weight = 1 - w
    finalCol = mix(vec3(1.0), baseCol, 1.0 - w);
  }

  gl_FragColor = vec4(finalCol, 1.0);
}
