class Car {
    constructor(x, y) {
        this.position = createVector(0, 0, 0);
        this.moveForce = createVector(0, 0);
        this.moveSpeed = 20; // units per second per input
        this.maxSpeed = 20; // units per second
        this.drag = 0.97; // velocity multiplier each frame
        this.steerAngle = 4; // degrees per unit-speed per second
        this.traction = 0.25; // how fast velocity aligns to forward
        this.angle = 0; // heading in radians
        this.acc = 0
        this.slipThreshold = 0.3;
        this.skidLeft = [];
        this.skidRight = [];
        this.maxSkidPoints = 1000;
    }
    update() {
        const dt = deltaTime * 0.01
        let vInput = 0
        if(keyIsDown(UP_ARROW)) vInput = 1;
        //if (keyIsDown(DOWN_ARROW))  vInput = -1;
        let forward = p5.Vector.fromAngle(this.angle);
        this.acc += vInput * 0.1
        if(!keyIsDown(UP_ARROW) && !keyIsDown(DOWN_ARROW)) {
            this.acc *= 0.7
        }
        this.acc = constrain(this.acc, -3, 3);
        this.moveForce.add(p5.Vector.mult(forward, this.moveSpeed * this.acc * dt));
        this.position.add(p5.Vector.mult(this.moveForce, dt));
        let hInput = 0;
        if(keyIsDown(RIGHT_ARROW)) hInput = 1;
        if(keyIsDown(LEFT_ARROW)) hInput = -1;
        let speed = this.moveForce.mag();
        let steerRad = radians(this.steerAngle);
        this.angle += hInput * speed * steerRad * dt * this.traction;
        // -- 3) Drag & speed limit
        let drag = hInput == 0 ? this.drag : 0.999
        this.moveForce.mult(drag);
        this.moveForce.limit(this.maxSpeed);
        forward = p5.Vector.fromAngle(this.angle);
        let traction = dist(this.position.x, this.position.y, width / 2, height / 2) > ice.rad ? this.traction : 0.1;
        let dir = p5.Vector.lerp(this.moveForce.copy().normalize(), forward, this.traction * dt).normalize();
        this.moveForce = dir.mult(this.moveForce.mag());
        if(this.moveForce.mag() > 0) {
            let velNorm = this.moveForce.copy().normalize();
            let slipAngle = p5.Vector.angleBetween(velNorm, forward);
            if(Math.abs(slipAngle) > this.slipThreshold) {
                // rear‐corner offsets in local space
                let halfL = 20,
                    halfW = 10;
                let leftLocal = createVector(-halfL, -halfW);
                let rightLocal = createVector(-halfL, halfW);
                // rotate into world space
                leftLocal.rotate(this.angle).add(this.position);
                rightLocal.rotate(this.angle).add(this.position);
                // store
                this.skidLeft.push(leftLocal.copy());
                this.skidRight.push(rightLocal.copy());
                // clamp size
                if(this.skidLeft.length > this.maxSkidPoints) {
                    this.skidLeft.shift();
                    this.skidRight.shift();
                }
            }
            else if(this.skidLeft[this.skidLeft.length - 1]) {
                this.skidLeft.push(undefined);
                this.skidRight.push(undefined);
            }
        }
    }
  show() {
    // skid marks on ground plane
    this.drawSkids(this.skidLeft);
    this.drawSkids(this.skidRight);

    // draw car body
    push();
    translate(this.position.x, this.position.y + 10, this.position.z);
    rotateZ(this.angle);
    noStroke();
    ambientMaterial(200, 0, 0);
    box(40, 20, 20);
    pop();
  }

  drawSkids(arr) {
    strokeWeight(3);
    for (let i = 0; i < arr.length - 1; i++) {
      let p = arr[i], q = arr[i + 1];
      if (p && q) {
        stroke(0, map(i, 0, arr.length - 1, 50, 255));
        line(p.x, p.y + 1, p.z, q.x, q.y + 1, q.z);
      }
    }
  }
}