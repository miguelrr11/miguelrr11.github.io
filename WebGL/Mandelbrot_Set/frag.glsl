precision highp float;

varying vec2 pos;
uniform float u_zoom;
uniform vec2 u_center;

vec4 col1 = vec4(142./255., 202./255., 230./255., 1.);
vec4 col2 = vec4(33./255., 158./255., 188./255., 1.);
vec4 col3 = vec4(18./255., 103./255., 130./255., 1.);
vec4 col4 = vec4(2./255., 48./255., 71./255., 1.);
vec4 col5 = vec4(255./255., 183./255., 3./255., 1.);
vec4 col6 = vec4(251./255., 133./255., 0./255., 1.);

#define MAX_ITER_LOOP 200.

float map(float value, float start1, float stop1, float start2, float stop2){
    return start2 + ( (value - start1) / (stop1 - start1) ) * (stop2 - start2); 
}

void main() {
    float MAX_ITER = 200.;

    float aspectRatio = 1500./800.;

    float a = map(pos.x, 0., 1., u_center.x - (1.7 / u_zoom) * aspectRatio, u_center.x + (1. / u_zoom) * aspectRatio);
    float b = map(pos.y, 0., 1., u_center.y - (1.7 / u_zoom), u_center.y + (1. / u_zoom));


    float ca = a;
    float cb = b;

    float n = 0.;

    for(float i = 0.; i < MAX_ITER_LOOP; i++){
        float aa = a * a - b * b;
        float bb = 2. * a * b;
        a = aa + ca;
        b = bb + cb;
        if(a * a + b * b > 16.){ 
            n = i;
            break;
        }
    }

    float bright = map(n, 0., MAX_ITER, 0., 1.);
    bright = sqrt(bright);

    vec4 col;
    
    if(n/MAX_ITER > 0.) col = col1;
    if(n/MAX_ITER > 1./6.) col = col2;
    if(n/MAX_ITER > 2./6.) col = col3;
    if(n/MAX_ITER > 3./6.) col = col4;
    if(n/MAX_ITER > 4./6.) col = col5;
    if(n/MAX_ITER > 5./6.) col = col6;
    if(n == MAX_ITER || n == 0.) col = col3;
   

    gl_FragColor = col;

    //gl_FragColor = vec4(vec3(bright), 1.);
}