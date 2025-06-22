const tamult = 1.5
const carWidth = 25 * tamult;
const carHeight = 48 * tamult;

class Car {
    constructor(properties = {}) {
        const {
            moveSpeed = 20,
            maxSpeed = 30,
            drag = 0.95,
            steerAngle = 4, 
            traction = 0.25,
            deltaSteerMult = 0.4,
            latDrag = 0.9,
            allowBackDrift = false,
            continuousDrift = true
        } = properties;

        this.moveSpeed = moveSpeed; 
        this.maxSpeed = maxSpeed;
        this.maxSpeedTurbo = maxSpeed * 1.3
        this.drag = drag;
        this.steerAngle = steerAngle; 
        this.traction = traction;
        this.deltaSteerMult = deltaSteerMult
        this.latDrag = latDrag; 
        this.allowBackDrift = allowBackDrift
        this.continuousDrift = continuousDrift;

        this.position = createVector(WIDTH/2, HEIGHT / 2);
        this.moveForce = createVector(0, 0);
        this.angle = 0; 
        this.acc = 0
        this.latAcc = 0
        this.latSpeed = 0
        this.slipThreshold = 0.3;
        this.slipAngle = 0; 
        this.alwaysMoving = false
        

        this.skidLeft = [];
        this.skidRight = [];
        this.maxSkidPoints = 70;
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
        // if(this.position.y < 0) {this.position.y = height;  this.addSepSkid()}
        // if(this.position.y > height) {this.position.y = 0;  this.addSepSkid()}
    }

    getKeys(){
        return {
            UP_ARROW: keyIsDown(UP_ARROW),
            DOWN_ARROW: keyIsDown(DOWN_ARROW),
            LEFT_ARROW: keyIsDown(LEFT_ARROW),
            RIGHT_ARROW: keyIsDown(RIGHT_ARROW)
        }
    }

    update(){
        let driftForce = this.getForceDrift()
        
        this.position.add(driftForce);
        this.edges();

        this.addAnimations();
    }

    getForceDrift() {
        const dt = deltaTime * 0.01

        // ——— INPUT & TURBO ———
        let vInput = 0
        let keys = this.getKeys()
        let isDrifting = keys.LEFT_ARROW || keys.RIGHT_ARROW
        let finalTraction = this.traction;
        if (keys.UP_ARROW) {
            vInput = 1;
            finalTraction = this.traction * 0.5;
            let midPosTires = p5.Vector.add(this.leftTire, this.rightTire).mult(0.5);
            addAnimationTurbo.call(this, midPosTires.x, midPosTires.y);
        }
        else if (keys.DOWN_ARROW) {
            vInput = -1;
            finalTraction = this.traction * 0.5;
        }

        // ——— ACCELERATION & BRAKING ———
        let forward = p5.Vector.fromAngle(this.angle);
        this.acc += vInput * 0.1

        if (!keys.UP_ARROW && (!this.continuousDrift || (!keys.LEFT_ARROW && !keys.RIGHT_ARROW)) && !keys.DOWN_ARROW) {
            if (this.alwaysMoving) {
                this.acc = 0.5
            } 
            else {
                this.acc = 0
                this.moveForce.mult(this.drag)
            }
        }


        // ——— STEERING INPUT & LATERAL ACCELERATION ———
        let deltaSteer = 0;
        if (keys.RIGHT_ARROW) deltaSteer = 1;
        if (keys.LEFT_ARROW)  deltaSteer = -1;

        if (this.latAcc < 0 && deltaSteer > 0) this.latAcc = 0;
        if (this.latAcc > 0 && deltaSteer < 0) this.latAcc = 0;

        this.latAcc += deltaSteer * this.deltaSteerMult;

        if (!keys.RIGHT_ARROW && !keys.LEFT_ARROW) {
            this.latAcc *= this.latDrag
            this.latSpeed *= this.latDrag
        }

        this.latAcc = constrainn(this.latAcc, -1, 1);
        if (isDrifting || keys.DOWN_ARROW) {
            this.latSpeed += this.latAcc * dt
        }
        this.latSpeed = constrainn(this.latSpeed, -1, 1);

        // ——— ROTATION ———
        let speed = this.moveForce.mag();
        let steerRad = radians(this.steerAngle);
        this.angle += this.latSpeed * speed * steerRad * dt * finalTraction;

        // ——— DRAG & SPEED LIMIT ———
        // this.moveForce.mult(this.drag)
        if (speed > this.maxSpeed && !keys.UP_ARROW && !keys.DOWN_ARROW) {
            this.moveForce.mult(0.92);
        } 
        else {
            this.moveForce.limit(this.maxSpeedTurbo)
        }

        // ——— RE-DIRECTION ———
        forward = p5.Vector.fromAngle(this.angle);
        let dir = (keys.DOWN_ARROW && !isDrifting) ?
            p5.Vector.lerp(
                this.moveForce.copy().normalize(),
                this.moveForce.copy().normalize(),
                finalTraction * dt
            ).normalize() :
            p5.Vector.lerp(
                this.moveForce.copy().normalize(),
                forward,
                finalTraction * dt
            ).normalize();
        this.moveForce = dir.mult(this.moveForce.mag());

        // ——— BACK-DRIFT BLOCKING ———
        if (!this.allowBackDrift && this.acc > 0) {
            let forwardComp = p5.Vector.dot(this.moveForce, forward);
            if (forwardComp < 0) {
                this.moveForce = p5.Vector.sub(
                    this.moveForce,
                    p5.Vector.mult(forward, forwardComp)
                );
            }
        }

        // ——— APPLY THRUST & FINAL SPEED CLAMP ———
        this.acc = constrainn(this.acc, -1, 1);
        this.moveForce.add(p5.Vector.mult(forward, this.moveSpeed * this.acc * dt));
        this.moveForce.limit(this.maxSpeedTurbo);

        return this.moveForce.copy().mult(dt);
    }


    addAnimations(){
        let forward = p5.Vector.fromAngle(this.angle);
        let keys = this.getKeys();
        this.calculateTirePositions(forward);
        if(this.moveForce.mag() > 0 || keys.DOWN_ARROW) {
            let velNorm = this.moveForce.copy().normalize();
            this.slipAngle = p5.Vector.angleBetween(velNorm, forward);
            if(Math.abs(this.slipAngle) > this.slipThreshold || keys.DOWN_ARROW) {
                this.skidLeft.push(this.leftTire.copy());
                this.skidRight.push(this.rightTire.copy());
                // clamp size
                if(this.skidLeft.length > this.maxSkidPoints) {
                    this.skidLeft.shift();
                    this.skidRight.shift();
                }
                // add skid animation
                for(let i = 0; i < 1; i++){
                    addAnimationDrift.call(this, this.leftTire.x, this.leftTire.y);
                    addAnimationDrift.call(this, this.rightTire.x, this.rightTire.y);
                }
            }
            else if(this.skidLeft[this.skidLeft.length - 1]) {
                this.addSepSkid()
            }
        }
        let fumesPos = p5.Vector.lerp(this.leftTire, this.rightTire, 0.2)
        fumesPos.x += randomm(-2, 2);
        fumesPos.y += randomm(-2, 2);
        addAnimationIdle.call(this, fumesPos.x, fumesPos.y);
    }

    calculateTirePositions() {
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
        line(this.position.x, this.position.y, this.position.x + this.moveForce.x * 5, this.position.y + this.moveForce.y * 5);
        stroke(255, 0, 0, 120);
        line(this.position.x, this.position.y, this.position.x + Math.cos(this.angle) * 50, this.position.y + Math.sin(this.angle) * 50);
    }

    show() {
        push();
        translate(this.position.x, this.position.y)
        rotate(this.angle + HALF_PI);
        imageMode(CENTER);
        image(carImg, 0, 0, carWidth, carHeight);
        pop();
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


function addAnimationIdle(x, y){
    if(Math.random() < 0.3) return; // reduce frequency of skid particles
    let dir = p5.Vector.fromAngle(this.angle).normalize().mult(-1)
    let grey = random(50, 170)
    let particle = new Particle(
        x,
        y,
        [grey, grey, grey], // color
        50, // lifespan
        dir.mult(0.6), // vel
        createVector(0, 0), // acc
        0.99, // friction
        0,
        0,
        random(2, 6), // size
        'ellipse', // shape
        false
    )
    particle.trans = random(25, 140)
    animations.push(particle)
}

function addAnimationDrift(x, y){
    if(Math.random() < 0.1) return; // reduce frequency of skid particles
    let dir = p5.Vector.fromAngle(this.angle).normalize().mult(-1)
    let grey = random(50, 170)
    let particle = new Particle(
        x + random(-5, 5),
        y + random(-5, 5),
        [grey, grey, grey], // color
        100, // lifespan
        dir.mult(this.moveForce.mag() * 0.035), // vel
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