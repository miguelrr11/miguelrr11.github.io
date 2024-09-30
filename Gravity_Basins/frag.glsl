precision mediump float;
varying vec2 pos;
uniform vec2 planets[4]; 
uniform float G;
uniform float maxSpeed;

vec4 col1 = vec4(246./255., 247./255., 235./255., 1.);
vec4 col2 = vec4(233./255., 79./255., 55./255., 1.);
vec4 col3 = vec4(57./255., 62./255., 65./255., 1.);
vec4 col4 = vec4(255./255., 209./255., 102./255., 1.);

#define MAX_PLANETS 4

vec2 getF(vec2 planet, vec2 astro) {
    vec2 dir = planet - astro; // Direction from astro to planet
    float distnor = length(dir); // Distance between astro and planet
    float mAstro = 1.;
    float mPlanet = 10.;
    //float G = 3.;

    if (distnor > 0.0) {
        float F = G * ((mAstro * mPlanet) / (distnor * distnor)); // Gravitational force
        dir = normalize(dir); // Normalize direction
        dir *= F; // Scale the direction vector by the force magnitude
        return dir; // Return the force vector
    }
    return vec2(0.0, 0.0); // Return zero force if distance is zero
}

float dist(vec2 point1, vec2 point2) {
    return length(point2 - point1);
}

vec2 limit(vec2 v, float maxMag) {
    float mag = length(v); // Get the current magnitude of the vector
    if (mag > maxMag) {
        v = normalize(v) * maxMag; // Normalize and scale to the maximum magnitude
    }
    return v; // Return the limited vector
}

float minOfArray(float values[MAX_PLANETS]) {
    float minVal = values[0]; // Start with the first value
    for (int i = 1; i < MAX_PLANETS; i++) {
        minVal = min(minVal, values[i]); // Compare with each subsequent value
    }

    return minVal; // Return the smallest value
}



void main() {
    vec2 speed = vec2(0., 0.);
    vec2 acc = vec2(0., 0.);
    vec2 position = pos;

    for(int i = 0; i < 100; i++){
    	vec2 deltaAcc = vec2(0., 0.);
    	for(int j = 0; j < MAX_PLANETS; j++) deltaAcc += getF(planets[j], position);
    	acc = deltaAcc;
    	speed += acc;
    	speed = limit(speed, maxSpeed);
    	position += speed;
    	speed *= 0.999;
    }

    float distances[MAX_PLANETS];
    for(int i = 0; i < MAX_PLANETS; i++){
    	distances[i] = dist(position, planets[i]);
    }

    float closest = minOfArray(distances);
    vec4 color;

    if(closest == distances[0]) color = col1;
    if(closest == distances[1]) color = col2;
    if(closest == distances[2]) color = col3;
    if(closest == distances[3]) color = col4;


	gl_FragColor = vec4(color);


    float bestD = 10.0;
    int bestI = -1;

    for (int i = 0; i < MAX_PLANETS; i++) {
        float d = length(pos - planets[i]); 
        if (d < bestD){ 
        	bestD = d;
        	bestI = i;
        } 
    }

    float radius1 = 0.012;
    float radius2 = 0.008;
    if (bestD < radius1) {
    	gl_FragColor = vec4(0.0, 0.0, 0.0, 1); 
	}
	if(bestD < radius2){
		if(bestI == 0) color = col1;
		else if(bestI == 1) color = col2;
		else if(bestI == 2) color = col3;
		else if(bestI == 3) color = col4;
		gl_FragColor = vec4(color);
	}


}





