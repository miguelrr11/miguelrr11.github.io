const carWidth = 25;
const carHeight = 48;

class Car {
    constructor(properties = {}) {
        const {
            moveSpeed = 20,
            maxSpeed = 30,
            drag = 0.95,
            steerAngle = 4, 
            traction = 0.25,
            deltaSteerMult = 0.4,
            latDrag = 0.9
        } = properties;

        this.moveSpeed = moveSpeed; 
        this.maxSpeed = maxSpeed;
        this.drag = drag;
        this.steerAngle = steerAngle; 
        this.traction = traction;
        this.deltaSteerMult = deltaSteerMult
        this.latDrag = latDrag; 

        this.position = createVector(WIDTH/2, HEIGHT / 2);
        this.moveForce = createVector(0, 0);
        this.angle = 0; 
        this.acc = 0
        this.latAcc = 0
        this.latSpeed = 0
        this.slipThreshold = 0.3;

        this.skidLeft = [];
        this.skidRight = [];
        this.maxSkidPoints = 100;
        this.leftTire = createVector(0, 0);
        this.rightTire = createVector(0, 0);;
    }

    addSepSkid() {
        this.skidLeft.push(undefined);
        this.skidRight.push(undefined);
        if(this.skidLeft.length > this.maxSkidPoints) {
            this.skidLeft.shift();
            this.skidRight.shift();
        }
    }
    edges(){
        if(this.position.x < 0){ this.position.x = width; this.addSepSkid()}
        if(this.position.x > width) {this.position.x = 0;  this.addSepSkid()}
        if(this.position.y < 0) {this.position.y = height;  this.addSepSkid()}
        if(this.position.y > height) {this.position.y = 0;  this.addSepSkid()}
    }
    update() {
        const dt = deltaTime * 0.01
        let vInput = 0
        let keys = {
            UP_ARROW: keyIsDown(UP_ARROW),
            DOWN_ARROW: keyIsDown(DOWN_ARROW),
            LEFT_ARROW: keyIsDown(LEFT_ARROW),
            RIGHT_ARROW: keyIsDown(RIGHT_ARROW)
        }
        if(keys.UP_ARROW){
            vInput = 1;
            let midPosTires = p5.Vector.add(this.leftTire, this.rightTire).mult(0.5);
            addAnimationTurbo.call(this, midPosTires.x, midPosTires.y);
            addAnimationTurbo.call(this, midPosTires.x, midPosTires.y);
        }
        //if (keyIsDown(DOWN_ARROW))  vInput = -1;
        let forward = p5.Vector.fromAngle(this.angle);
        this.acc += vInput * 0.1
        if(!keys.UP_ARROW){
            this.acc *= 0.7
        }
        if(keys.DOWN_ARROW) {
            this.acc -= 0.1;
            this.latAcc -= 0.1;
            addAnimationDrift.call(this, this.leftTire.x, this.leftTire.y);
            addAnimationDrift.call(this, this.rightTire.x, this.rightTire.y);
        }
        this.acc = constrainn(this.acc, -3, 3);
        this.moveForce.add(p5.Vector.mult(forward, this.moveSpeed * this.acc * dt));
        this.position.add(p5.Vector.mult(this.moveForce, dt));
        
        let deltaSteer = 0;
        if(keys.RIGHT_ARROW) deltaSteer = 1;
        if(keys.LEFT_ARROW) deltaSteer = -1;
        if(this.latAcc < 0 && deltaSteer > 0) this.latAcc = 0;
        if(this.latAcc > 0 && deltaSteer < 0) this.latAcc = 0;
        this.latAcc += deltaSteer * this.deltaSteerMult;
        if(!keys.RIGHT_ARROW && !keys.LEFT_ARROW) {
            this.latAcc *= this.latDrag
            this.latSpeed *= this.latDrag
        }
        this.latAcc = constrainn(this.latAcc, -3, 3);
        if(keys.RIGHT_ARROW || keys.LEFT_ARROW || keys.DOWN_ARROW) this.latSpeed += this.latAcc * dt
        this.latSpeed = constrainn(this.latSpeed, -1, 1);
        let speed = this.moveForce.mag();
        let steerRad = radians(this.steerAngle);
        this.angle += this.latSpeed * speed * steerRad * dt * this.traction;
        // -- 3) Drag & speed limit
        let drag = this.latSpeed == 0 ? this.drag : 0.999
        this.moveForce.mult(drag);
        this.moveForce.limit(this.maxSpeed);
        forward = p5.Vector.fromAngle(this.angle);
        let dir = p5.Vector.lerp(this.moveForce.copy().normalize(), forward, this.traction * dt).normalize();
        this.moveForce = dir.mult(this.moveForce.mag());
        this.calculateTirePositions(forward);
        if(this.moveForce.mag() > 0 || keys.DOWN_ARROW) {
            let velNorm = this.moveForce.copy().normalize();
            let slipAngle = p5.Vector.angleBetween(velNorm, forward);
            if(Math.abs(slipAngle) > this.slipThreshold || keys.DOWN_ARROW) {
                this.skidLeft.push(this.leftTire.copy());
                this.skidRight.push(this.rightTire.copy());
                // clamp size
                if(this.skidLeft.length > this.maxSkidPoints) {
                    this.skidLeft.shift();
                    this.skidRight.shift();
                }
                // add skid animation
                addAnimationDrift.call(this, this.leftTire.x, this.leftTire.y);
                addAnimationDrift.call(this, this.rightTire.x, this.rightTire.y);
            }
            else if(this.skidLeft[this.skidLeft.length - 1]) {
                this.addSepSkid()
            }
        }
        this.edges();
    }

    calculateTirePositions(forward) {
        // rear‐corner offsets in local space
        let halfL = carHeight / 3,
            halfW = carWidth / 3;
        let leftLocal = createVector(-halfL, -halfW);
        let rightLocal = createVector(-halfL, halfW);
        // rotate into world space
        leftLocal.rotate(this.angle).add(this.position);
        rightLocal.rotate(this.angle).add(this.position);
        this.leftTire = leftLocal.copy();
        this.rightTire = rightLocal.copy();
    }

    showDebug() {
        //shwos lines of forward and lateral forces
        push();
        strokeWeight(2);
        stroke(0, 0, 255, 120);
        line(this.position.x, this.position.y, this.position.x + this.moveForce.x * 10, this.position.y + this.moveForce.y * 5);
        stroke(255, 0, 0, 120);
        line(this.position.x, this.position.y, this.position.x + Math.cos(this.angle) * 50, this.position.y + Math.sin(this.angle) * 50);
    }

    show() {
        // skid marks on ground plane
        
        // draw car body
        push();
        translate(this.position.x, this.position.y)
        rotate(this.angle + HALF_PI);
        imageMode(CENTER);
        image(carImg, 0, 0, 25, 47);
        // rectMode(CENTER);
        // fill(0, 0, 0, 100);
        // rect(0, 0, carWidth, carHeight);
        pop();

        // push()
        // fill(0, 255, 0)
        // ellipse(this.leftTire.x, this.leftTire.y, 10, 10)
        // ellipse(this.rightTire.x, this.rightTire.y, 10, 10)
        // pop()
    }
    drawSkids(arr) {
        strokeWeight(5);
        for(let i = 0; i < arr.length - 1; i++) {
            let p = arr[i],
                q = arr[i + 1];
            if(p && q) {
                stroke(mapp(i, 0, arr.length - 1, 190, 50));
                line(p.x, p.y + 1, q.x, q.y + 1);
            }
        }
        // this.showDebug();
    }
}

function addAnimationDrift(x, y){
    if(Math.random() < 0.1) return; // reduce frequency of skid particles
    let dir = p5.Vector.fromAngle(this.angle).normalize().mult(-1)
    let grey = random(50, 170)
    let particle = new Particle(
        x,
        y,
        [grey, grey, grey], // color
        100, // lifespan
        dir.mult(this.moveForce.mag() * 0.025), // vel
        createVector(0, 0), // acc
        0.97, // friction
        0,
        0,
        random(3, 12), // size
        'ellipse', // shape
        false
    )
    particle.trans = random(100, 200)
    animations.push(particle)
}

function addAnimationTurbo(x, y){
    if(Math.random() < 0.1) return; // reduce frequency of skid particles
    let dir = p5.Vector.fromAngle(this.angle).normalize().mult(-1)
    if(Math.random() < 0.15){
        let mult = Math.random() < 0.5 ? 1 : -1;
        dir.rotate(0.4 * mult);
    }
    let col = lerppColor([208, 1, 0], [250, 163, 7], random())
    let particle = new Particle(
        x + random(-5, 5),
        y + random(-5, 5),
        col, // color
        15, // lifespan
        dir.mult(this.moveForce.mag() * 0.15), // vel
        createVector(0, 0), // acc
        1, // friction
        0,
        0,
        random(2, 14), // size
        'ellipse', // shape
        false
    )
    particle.trans = random(200, 255)
    animations.push(particle)
}