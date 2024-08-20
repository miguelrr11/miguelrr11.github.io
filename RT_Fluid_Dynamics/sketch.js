//Real-Time Fluid Dynamics for Games 2003 paper implementation
//Miguel Rodríguez Rodríguez
//20-08-2024

const WIDTH = 700
const HEIGHT = 700
let N = 70
let oldN = 70
let tamCell = WIDTH/N
let size = (N+2) * (N+2)

let u, v, u_prev, v_prev
let dens, dens_prev;

let visc = 0.005
let diff = 0.0001
let dt = 0.01

let dirShooter = 0
let velShooter = 5
let denShooter = 1

let sliderVisc, 
	sliderDiff,
	sliderDt,
	sliderVel,
	sliderDen,
	sliderN

let checkShowVel,
	checkRandomShooter,
	checkObstacles,
	checkColor

let btnRestart

let angle = 0
let avgDen
let obstaclesR = []
let p = []

function init(){
	u = []
    v = []
    u_prev = []
    v_prev = []
    dens = []
    dens_prev = []
    for(let i = 0; i < size; i++){
    	u[i] = 0
    	v[i] = 0
    	u_prev[i] = 0
    	v_prev[i] = 0
    	dens[i] = 0
    	dens_prev[i] = 0
    }

    if(N == 70) obstaclesR.push({a: createVector(10,10), b: createVector(20, 30), type: "rect"},
    				{a: createVector(40,50), b: createVector(60, 65), type: "rect"},
    				{a: createVector(45,5), b: createVector(60, 35), type: "rect"})
    				//{a: createVector(50, 25), rad: 8, type: "circle"})
    else obstaclesR = []

    for (let i = 20; i <= N-20; i++) { 
    	dens[IX(i, 20)] = 3;
    }
    for (let i = 20; i <= N-20; i++) { 
    	dens[IX(i, N-20)] = 3;
    }
    for (let i = 20; i <= N-20; i++) { 
    	dens[IX(20, i)] = 3;
    }
    for (let i = 20; i <= N-20; i++) { 
    	dens[IX(N-20, i)] = 3;
    }
}

function initUI(){
	p[0] = createP('Viscosity: ' + visc)
	p[0].position(WIDTH + 20, 0)
	sliderVisc = createSlider(0, 0.1, 0.001, 0.001)
	sliderVisc.position(WIDTH + 20, 40)

	p[1] = createP('Diff: ' + diff)
	p[1].position(WIDTH + 20, 50)
	sliderDiff = createSlider(0.0001, 0.01, 0.0001, 0.0001)
	sliderDiff.position(WIDTH + 20, 90)

	p[2] = createP('dt: ' + dt)
	p[2].position(WIDTH + 20, 100)
	sliderDt = createSlider(0, 0.1, 0.01, 0.001)
	sliderDt.position(WIDTH + 20, 140)

	p[3] = createP('Velocity of Shooter: ' + velShooter)
	p[3].position(WIDTH + 20, 150)
	sliderVel = createSlider(1, 20, 5, 0.1)
	sliderVel.position(WIDTH + 20, 190)

	p[4] = createP('Density of Shooter: ' + denShooter)
	p[4].position(WIDTH + 20, 200)
	sliderDen = createSlider(0, 7, 2.5, 0.5)
	sliderDen.position(WIDTH + 20, 240)

	checkShowVel = createCheckbox()
	checkShowVel.position(WIDTH + 20, 290)
	p[5] = createP('Show velocity Field: ')
	p[5].position(WIDTH + 20, 250)

	checkRandomShooter = createCheckbox()
	checkRandomShooter.position(WIDTH + 20, 340)
	p[6] = createP('Static-Random Shooter: ')
	p[6].position(WIDTH + 20, 300)

	checkObstacles = createCheckbox()
	checkObstacles.position(WIDTH + 20, 390)
	p[7] = createP('Obstacles: ')
	p[7].position(WIDTH + 20, 350)

	checkColor = createCheckbox()
	checkColor.position(WIDTH + 20, 440)
	p[8] = createP('Colorful: ')
	p[8].position(WIDTH + 20, 400)

	p[9] = createP('Size of grid: ' + N + ' x ' + N)
	p[9].position(WIDTH + 20, 450)
	sliderN = createSlider(10, 70, 70, 1)
	sliderN.position(WIDTH + 20, 490)

	btnRestart = createButton('Clear')
	btnRestart.position(WIDTH+20, HEIGHT - 50)
	btnRestart.mouseClicked(init)

	p[10] = createP('Click to add source')
	p[10].position(WIDTH + 20, HEIGHT - 20)
	p[11] = createP('Press any key to change direction')
	p[11].position(WIDTH + 20, HEIGHT)
}

function setup(){
	createCanvas(WIDTH, HEIGHT)
	init()
	initUI()
}

function updateConfig(){
	visc = sliderVisc.value()
	diff = sliderDiff.value()
	dt = sliderDt.value()
	velShooter = sliderVel.value()
	denShooter = sliderDen.value()
	N = sliderN.value()
	if(N != oldN){
		oldN = N 
		size = (N+2) * (N+2)
		tamCell = WIDTH/N
		init()
	}
	p[0].html('Viscosity: ' + visc)
	p[1].html('Diff: ' + diff)
	p[2].html('dt: ' + dt)
	p[3].html('Velocity of Shooter: ' + velShooter)
	p[4].html('Density of Shooter: ' + denShooter)
	p[9].html('Size of grid: ' + N + ' x ' + N)
}

function keyPressed(){
	dirShooter = ++dirShooter%4
}

function draw(){
	updateConfig()
	let x = ~~(mouseX/(WIDTH/N));
  	let y = ~~(mouseY/(WIDTH/N));
  	if(x < N && y < N){ 
  		if(mouseIsPressed) dens[IX(x, y)] = denShooter;
  		if(dirShooter == 0) u[IX(x, y)] = velShooter;
  		else if(dirShooter == 1) v[IX(x, y)] = velShooter;
  		else if(dirShooter == 2) u[IX(x, y)] = -velShooter;
  		else if(dirShooter == 3) v[IX(x, y)] = -velShooter;
  	}

  	if(checkRandomShooter.checked()){
  		angle += 0.5 - noise(frameCount/2)
  		angle = angle % TWO_PI
  		let x = floor(N/2)
  		dens[IX(x, x)] = denShooter
  		dens[IX(x+1, x)] = denShooter
  		dens[IX(x, x+1)] = denShooter
  		dens[IX(x+1, x+1)] = denShooter
  		let coss = cos(angle)*velShooter
  		let sinn = sin(angle)*velShooter
  		u[IX(x, x)] = coss
  		v[IX(x, x)] = sinn
  		u[IX(x, x+1)] = coss
  		v[IX(x, x+1)] = sinn
  		u[IX(x+1, x)] = coss
  		v[IX(x+1, x)] = sinn
  		u[IX(x+1, x+1)] = coss
  		v[IX(x+1, x+1)] = sinn
  	}

	vel_step( N, u, v, u_prev, v_prev, visc, dt );
	dens_step( N, dens, dens_prev, u, v, diff, dt );

	draw_dens()
	if(checkShowVel.checked()) draw_vel()
	if(checkObstacles.checked()) draw_obs()
}

function draw_obs(){
	push()
	rectMode(CORNERS)
	stroke(255, 0, 0)
	fill(0)
	strokeWeight(2)
	for(let ob of obstaclesR){
		if(ob.type == "rect") rect(ob.a.x*tamCell, ob.a.y*tamCell, (ob.b.x+1)*tamCell, (ob.b.y+1)*tamCell)
		else if(ob.type == "circle") ellipse(ob.a.x*tamCell, ob.a.y*tamCell, ob.rad*2*tamCell, ob.rad*2*tamCell)
	}
	pop()
}

function draw_dens(){
	push()
	noStroke()
	if(checkColor.checked()) colorMode(HSB, 255)
	else colorMode(RGB)
	let sum = 0
	fill(0)
	rect(0,0,WIDTH,HEIGHT)
	translate(-tamCell/2, -tamCell/2)
	for(let i = 1; i < N; i++){
	    for(let j = 1; j < N; j++){
	    	let den = map(dens[IX(i, j)], 0, 1, 0, 255)
	    	sum += dens[IX(i, j)]
	        if(checkColor.checked()) fill(den, 255, 255)
	        else fill(den)
	        rect(i*tamCell, j*tamCell, tamCell, tamCell);
	      	
	    }
	}
	avgDen = sum/size
	pop()
}

function draw_vel(){
	push()
	strokeWeight(1.5)
	colorMode(RGB)
	translate(-tamCell/2, -tamCell/2)
	for(let i = 1; i < N; i++){
	    for(let j = 1; j < N; j++){
	    	let speed = createVector(u[IX(i,j)], v[IX(i,j)])
	    	let speedMag = speed.mag()
	    	speedMag = map(constrain(speedMag, 0, 2), 0, 2, 0, 1)
	    	let col = lerpColor(color(255, 0, 0), color(0, 255, 0), speedMag)
	    	col.setAlpha(speedMag*1000)
	    	stroke(col)

	        let x0 = i*tamCell + tamCell/2
	        let y0 = j*tamCell + tamCell/2
	        let angle = atan2(v[IX(i,j)], u[IX(i,j)])
	        let x1 = x0 + cos(angle)*(tamCell*0.7)
	        let y1 = y0 + sin(angle)*(tamCell*0.7)
	        line(x0, y0, x1, y1)
	      	
	    }
	}
	pop()
}

function add_source(N, x, s, dt) {
    for (let i = 0; i < size; i++) {
        //x[i] += dt * s[i];
        //la clave que no te cuentan en el paper es la normalizacion:
        x[i] = (x[i]+dt*s[i])/(1+dt);
    }
}

function diffuse(N, b, x, x0, diff, dt) {
    let a = dt * diff * N * N;
    for (let k = 0; k < 20; k++) {
        for (let i = 1; i <= N; i++) {
            for (let j = 1; j <= N; j++) {
                x[IX(i, j)] = (x0[IX(i, j)] + a * (x[IX(i - 1, j)] + x[IX(i + 1, j)] + x[IX(i, j - 1)] + x[IX(i, j + 1)])) / (1 + 4 * a);
            }
        }
        set_bnd(N, b, x);
    }
}

function advect(N, b, d, d0, u, v, dt) {
    let i, j, i0, j0, i1, j1;
    let x, y, s0, t0, s1, t1, dt0;
    dt0 = dt * N;
    for (i = 1; i <= N; i++) {
        for (j = 1; j <= N; j++) {
            x = i - dt0 * u[IX(i, j)];
            y = j - dt0 * v[IX(i, j)];
            if (x < 0.5) x = 0.5;
            if (x > N + 0.5) x = N + 0.5;
            i0 = ~~(x);
            i1 = i0 + 1;
            if (y < 0.5) y = 0.5;
            if (y > N + 0.5) y = N + 0.5;
            j0 = ~~(y);
            j1 = j0 + 1;
            s1 = x - i0;
            s0 = 1 - s1;
            t1 = y - j0;
            t0 = 1 - t1;
            d[IX(i, j)] = s0 * (t0 * d0[IX(i0, j0)] + t1 * d0[IX(i0, j1)]) +
                          s1 * (t0 * d0[IX(i1, j0)] + t1 * d0[IX(i1, j1)]);
        }
    }
    set_bnd(N, b, d);
}

function dens_step (N, x, x0, u, v, diff, dt){
	add_source (N, x, x0, dt);
	SWAP (x0, x); 
	diffuse (N, 0, x, x0, diff, dt);
	SWAP (x0, x); 
	advect (N, 0, x, x0, u, v, dt);
}

function vel_step (N, u, v, u0, v0, visc, dt){
	add_source ( N, u, u0, dt ); 
	add_source ( N, v, v0, dt );
	SWAP ( u0, u ); 
	diffuse ( N, 1, u, u0, visc, dt );
	SWAP ( v0, v ); 
	diffuse ( N, 2, v, v0, visc, dt );
	project ( N, u, v, u0, v0 );
	SWAP ( u0, u ); 
	SWAP ( v0, v );
	advect ( N, 1, u, u0, u0, v0, dt ); 
	advect ( N, 2, v, v0, u0, v0, dt );
	project ( N, u, v, u0, v0 );
}

function project (N, u, v, p, div){
	let i, j, k;
	let h;
	h = 1/N;
	for ( i=1 ; i<=N ; i++ ) {
		for ( j=1 ; j<=N ; j++ ) {
			div[IX(i,j)] = -0.5*h*(u[IX(i+1,j)]-u[IX(i-1,j)]+
			v[IX(i,j+1)]-v[IX(i,j-1)]);
			p[IX(i,j)] = 0;
		}
	}
	set_bnd ( N, 0, div ); 
	set_bnd ( N, 0, p );
	for ( k=0 ; k<20 ; k++ ) {
		for ( i=1 ; i<=N ; i++ ) {
			for ( j=1 ; j<=N ; j++ ) {
				p[IX(i,j)] = (div[IX(i,j)]+p[IX(i-1,j)]+p[IX(i+1,j)]+
				p[IX(i,j-1)]+p[IX(i,j+1)])/4;
			}
		}
		set_bnd ( N, 0, p );
	}
	for ( i=1 ; i<=N ; i++ ) {
		for ( j=1 ; j<=N ; j++ ) {
			u[IX(i,j)] -= 0.5*(p[IX(i+1,j)]-p[IX(i-1,j)])/h;
			v[IX(i,j)] -= 0.5*(p[IX(i,j+1)]-p[IX(i,j-1)])/h;
		}
	}
	set_bnd ( N, 1, u );
	set_bnd ( N, 2, v );
}

function set_bnd (N, b, x) {
	let bool = checkObstacles.checked()
	let n = !bool ? 1 : obstaclesR.length
	let inCircle = false

	
    for(let k = 0; k < n; k++){
    	if(bool && obstaclesR[k] && obstaclesR[k].type == "rect"){
    		xMin = obstaclesR[k].a.x
    		yMin = obstaclesR[k].a.y
    		xMax = obstaclesR[k].b.x
    		yMax = obstaclesR[k].b.y
    	}
	    for (let i = 1; i <= N; i++) {
	        for (let j = 1; j <= N; j++) {
	            if (bool && obstaclesR[k].type == "rect" && i >= xMin && i <= xMax && j >= yMin && j <= yMax) {
	                x[IX(i, j)] = b == 1 || b == 2 ? 0 : x[IX(i, j)];
	            }
	            //ralentiza muchisimo y ni siquiera mola
	            // else if (bool && obstaclesR[k].type == "circle" && 
	            // 	dist(i, j, obstaclesR[k].a.x, obstaclesR[k].a.y) < obstaclesR[k].rad) {
	            //     x[IX(i, j)] = b == 1 || b == 2 ? 0 : x[IX(i, j)];
	            // }
	            else {
	                if (i == 1) x[IX(0, j)] = b == 1 ? -x[IX(1, j)] : x[IX(1, j)];
	                if (i == N) x[IX(N + 1, j)] = b == 1 ? -x[IX(N, j)] : x[IX(N, j)];
	                if (j == 1) x[IX(i, 0)] = b == 2 ? -x[IX(i, 1)] : x[IX(i, 1)];
	                if (j == N) x[IX(i, N + 1)] = b == 2 ? -x[IX(i, N)] : x[IX(i, N)];
	            }
	        }
	    }
	}

    // Handle the corners
    x[IX(0, 0)] = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
    x[IX(0, N + 1)] = 0.5 * (x[IX(1, N + 1)] + x[IX(0, N)]);
    x[IX(N + 1, 0)] = 0.5 * (x[IX(N, 0)] + x[IX(N + 1, 1)]);
    x[IX(N + 1, N + 1)] = 0.5 * (x[IX(N, N + 1)] + x[IX(N + 1, N)]);
}

function IX(i, j){
	return i+(N+2)*j
}

function SWAP(x0, x) {
    let temp = x0.slice();  // Copy contents of x0
    x0.length = 0;          // Clear x0
    x0.push(...x);          // Copy contents of x to x0
    x.length = 0;           // Clear x
    x.push(...temp);        // Copy contents of temp (old x0) to x
}