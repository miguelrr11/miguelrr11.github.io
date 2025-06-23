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

        this.counterDrift = 0;
        this.miniTurboCounter = 0
        this.currentTurboProportion = 0

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
        if (keys.UP_ARROW || this.miniTurboCounter > 0) {
            vInput = 1;
            finalTraction = this.traction * 0.5;
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
        if (!this.allowBackDrift && this.acc >= 0) {
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
        if(this.miniTurboCounter == 0) this.moveForce.limit(this.maxSpeedTurbo);

        if(this.counterDrift > 0 && !isDrifting && this.miniTurboCounter == 0) {
            this.getMiniTurbo();
        }
        else if(this.miniTurboCounter > 0) {
            this.miniTurboCounter = Math.max(0, this.miniTurboCounter - 1);
            if(this.miniTurboCounter == 0) {
                this.currentTurboProportion = 1;
            }
            else{
                this.moveForce.setMag(this.maxSpeedTurbo * this.currentTurboProportion);
            }
        }

        // ——— MINI TURBO DRIFTING CALCULATIONS ———
        let isActuallyDrfiting = isDrifting && !keys.DOWN_ARROW && !keys.UP_ARROW && speed > 15 && this.miniTurboCounter == 0
        this.counterDrift = isActuallyDrfiting ? this.counterDrift + dt : 0

        return this.moveForce.copy().mult(dt);
    }

    getMiniTurbo(){
        if(this.counterDrift > 50){
            this.moveForce.normalize().mult(this.maxSpeedTurbo * 2);
            this.latAcc = 0;
            this.currentTurboProportion = 2
            this.miniTurboCounter = 60 * 2
        }
        else if(this.counterDrift > 30){
            this.moveForce.normalize().mult(this.maxSpeedTurbo * 1.5);
            this.latAcc = 0;
            this.currentTurboProportion = 1.5
            this.miniTurboCounter = 60 * 1.6
        }
        else if(this.counterDrift > 10){
            this.moveForce.normalize().mult(this.maxSpeedTurbo * 1.2);
            this.latAcc = 0;
            this.currentTurboProportion = 1.2
            this.miniTurboCounter = 60 * 1.2
        }
        else this.currentTurboProportion = 1;
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
        let midPosTires = p5.Vector.add(this.leftTire, this.rightTire).mult(0.5);
        if (keys.UP_ARROW) {
            for(let i = 0; i < 2; i++) addAnimationTurbo.call(this, midPosTires.x, midPosTires.y);
        }
        if(this.miniTurboCounter > 0) {
            let iter = Math.floor(this.miniTurboCounter / 20);
            for(let i = 0; i < iter; i++) addAnimationTurbo.call(this, midPosTires.x, midPosTires.y);
        }
        let many = 3
        if(this.counterDrift >= 50) {
            for(let i = 0; i < many; i++) addAnimationMiniTurbo.call(this, midPosTires.x, midPosTires.y, 3);
        }
        else if(this.counterDrift >= 30) {
            for(let i = 0; i < many; i++) addAnimationMiniTurbo.call(this, midPosTires.x, midPosTires.y, 2);
        }
        else if(this.counterDrift >= 10) {
            for(let i = 0; i < many; i++) addAnimationMiniTurbo.call(this, midPosTires.x, midPosTires.y, 1);
        }
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
                stroke(mapp(i, 0, arr.length - 1, backCol, 50));
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

function addAnimationMiniTurbo(x, y, level){
    if(Math.random() < 0.1) return; // reduce frequency of skid particles
    let dir = this.moveForce.copy().normalize().mult(-1);
    let col
    if(level == 1) col = lerppColor([208, 1, 0], [250, 163, 7], random())
    else if(level == 2) col = lerppColor([0, 119, 182], [173, 232, 244], random())
    else if(level == 3) col = lerppColor([161, 0, 242], [244, 192, 244], random())
    let randVar = Math.random() < 0.15
    if(randVar){
        col = [255, 255, 255]
        dir.mult(0.5)
    }
    let particle = new Particle(
        x + random(-5, 5),
        y + random(-5, 5),
        col, // color
        randVar ? 10 : 10, // lifespan
        dir, // vel
        createVector(0, 0), // acc
        randVar ? 0.8 : 0.96, // friction
        0,
        0.2,
        randVar ? 6 : random(10, 15), // size
        'triangle', // shape
        false
    )
    animations.push(particle)
}

function addAnimationTurbo(x, y) {
    if (Math.random() < 0.1) return
    let dir = p5.Vector.fromAngle(this.angle).normalize().mult(-1);
    if (Math.random() < 0.22) {
        let mult = Math.random() < 0.5 ? 1 : -1;
        dir.rotate(0.4 * mult);
    }
    let offsetDistance = random(-10, 10);
    let offset = dir.copy().mult(offsetDistance)
    let posX = x + offset.x;
    let posY = y + offset.y;
    let col = lerppColor([208, 1, 0], [250, 163, 7], random());
    let particle = new Particle(
        posX,
        posY,
        col,
        15,
        dir.copy().mult(this.moveForce.mag() * 0.15),
        createVector(0, 0),
        1,
        0,
        0,
        random(2, 14),
        'ellipse',
        false
    );

    particle.trans = random(200, 255);
    animations.push(particle);
}
