const WIDTH = 700
const HEIGHT = 700
const N = 70
const tamCell = WIDTH/N
const size = (N+2) * (N+2)
let u, v, u_prev, v_prev
let dens, dens_prev;
let visc = 0.005
let diff = 0.0001
let dt = 0.01

let dirShooter = 0
let velShooter = 5

let sliderVisc, 
	sliderDiff,
	sliderDt,
	sliderVel

let checkShowVel

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
	sliderVisc = createSlider(0, 0.1, 0.005, 0.005)
	sliderVisc.position(WIDTH + 20, 40)

	p[1] = createP('Diff: ' + diff)
	p[1].position(WIDTH + 20, 50)
	sliderDiff = createSlider(0.0001, 0.001, 0.0001, 0.0001)
	sliderDiff.position(WIDTH + 20, 90)

	p[2] = createP('dt: ' + dt)
	p[2].position(WIDTH + 20, 100)
	sliderDt = createSlider(0, 0.1, 0.01, 0.001)
	sliderDt.position(WIDTH + 20, 140)

	p[3] = createP('Velocity of Shooter: ' + velShooter)
	p[3].position(WIDTH + 20, 150)
	sliderVel = createSlider(1, 10, 5, 0.1)
	sliderVel.position(WIDTH + 20, 190)

	checkShowVel = createCheckbox()
	checkShowVel.position(WIDTH + 20, 240)
	p[4] = createP('Show velocity Field: ' + checkShowVel.checked())
	p[4].position(WIDTH + 20, 200)

	p[5] = createP('Click to add source')
	p[5].position(WIDTH + 20, 250)
	p[6] = createP('Press any key to change direction')
	p[6].position(WIDTH + 20, 270)
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
	p[0].html('Viscosity: ' + visc)
	p[1].html('Diff: ' + diff)
	p[2].html('dt: ' + dt)
	p[3].html('Velocity of Shooter: ' + velShooter)
	p[4].html('Show velocity Field: ' + checkShowVel.checked())
}

function mousePressed(){
	let x = ~~(mouseX/(WIDTH/N));
  	let y = ~~(mouseY/(WIDTH/N));
  	if(x < N && y < N){ 
  		dens[IX(x, y)] = 1;
  	}
}

function keyPressed(){
	dirShooter++
	dirShooter = dirShooter%4
}

function draw(){
	updateConfig()
	let x = ~~(mouseX/(WIDTH/N));
  	let y = ~~(mouseY/(WIDTH/N));
  	if(x < N && y < N){ 
  		if(mouseIsPressed) dens[IX(x, y)] = 1;
  		if(dirShooter == 0) u[IX(x, y)] = velShooter;
  		else if(dirShooter == 1) v[IX(x, y)] = velShooter;
  		else if(dirShooter == 2) u[IX(x, y)] = -velShooter;
  		else if(dirShooter == 3) v[IX(x, y)] = -velShooter;
  	}

	vel_step( N, u, v, u_prev, v_prev, visc, dt );
	dens_step( N, dens, dens_prev, u, v, diff, dt );
	draw_dens()
	if(checkShowVel.checked()) draw_vel()

}

function draw_dens(){
	noStroke()
	for(let i = 0; i < N; i++){
	    for(let j = 0; j < N; j++){
	    	let den = map(dens[IX(i, j)], 0, 1, 0, 255)
	        fill(den)
	        rect(i*tamCell, j*tamCell, tamCell, tamCell);
	      	
	    }
	}
}

function draw_vel(){
	// let maxSx = Math.max(...u)
	// let maxSy = Math.max(...v)
	// let maxS = createVector(maxSx, maxSy)
	// let maxSmag = maxS.mag()
	push()
	colorMode(HSB)
	for(let i = 0; i < N; i++){
	    for(let j = 0; j < N; j++){
	    	let speed = createVector(u[IX(i,j)], v[IX(i,j)])
	    	let col = map(speed.mag(), 0, 1, 0, 120)
	    	stroke(col, 100, 100)
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
        x[i] = (x[i]+dt*s[i])/(1+dt);
    }

    // Normalize the density array to keep values within the range [0, 1]
    // let maxDensity = Math.max(...x); // Find the maximum density value
    
    // if (maxDensity > 1) {
    //     for (let i = 0; i < size; i++) {
    //         x[i] /= maxDensity; // Normalize all values to keep them within [0, 1]
    //     }
    // }
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

function set_bnd (N, b, x){
	let i;
	for ( i=1 ; i<=N ; i++ ) {
		x[IX(0 ,i)] = b==1 ? -x[IX(1,i)] : x[IX(1,i)];
		x[IX(N+1,i)] = b==1 ? -x[IX(N,i)] : x[IX(N,i)];
		x[IX(i,0 )] = b==2 ? -x[IX(i,1)] : x[IX(i,1)];
		x[IX(i,N+1)] = b==2 ? -x[IX(i,N)] : x[IX(i,N)];
	}
	x[IX(0 ,0 )] = 0.5*(x[IX(1,0 )]+x[IX(0 ,1)]);
	x[IX(0 ,N+1)] = 0.5*(x[IX(1,N+1)]+x[IX(0 ,N)]);
	x[IX(N+1,0 )] = 0.5*(x[IX(N,0 )]+x[IX(N+1,1)]);
	x[IX(N+1,N+1)] = 0.5*(x[IX(N,N+1)]+x[IX(N+1,N)]);
}

function IX(i, j){
	return ((i)+(N+2)*(j))
}

function SWAP(x0, x) {
    let temp = x0.slice();  // Copy contents of x0
    x0.length = 0;          // Clear x0
    x0.push(...x);          // Copy contents of x to x0
    x.length = 0;           // Clear x
    x.push(...temp);        // Copy contents of temp (old x0) to x
}







