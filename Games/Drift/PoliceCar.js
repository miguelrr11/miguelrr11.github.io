class PoliceCar extends Car {

    constructor(properties = {}, targetCar) {
        super(Object.assign({
            moveSpeed: 25,
            maxSpeed: 40,
            drag: 0.93,
            steerAngle: 5,
            traction: 0.3,
            deltaSteerMult: 0.5,
            latDrag: 0.85,
            allowBackDrift: false,
            continuousDrift: false
        }, properties));
        this.targetCar = targetCar
        this.alwaysMoving = true
        this.position = createVector(randomm(0, WIDTH), randomm(0, HEIGHT));

    }

    squaredDistance(x1, y1, x2, y2) {
        return (x2 - x1) ** 2 + (y2 - y1) ** 2
    }



    seek(target){
        let desired = p5.Vector.sub(target, this.pos)
        desired.setMag(this.maxSpeed)
        let steer = p5.Vector.sub(desired, this.speed)
        steer.limit(this.maxForce)
        return steer
    }

    applyForce(force){
        this.moveForce.add(force)
    }

    update(){
        let driftForce = this.getForceDrift()
        
        this.position.add(driftForce);
        this.edges();

        this.addAnimations();
    }

    // decides the input keys for the police car: follows the player car while avoiding collisions with other police cars
    getKeys() {
        const toTarget = p5.Vector.sub(this.targetCar.position, this.position);
        toTarget.normalize();
        
        let sepVec = createVector(0, 0);
        const desiredSeparation = 100;  
        for (let other of policeCars) {
            if (other === this) continue;
            let d = p5.Vector.dist(this.position, other.position);
            if (d < desiredSeparation && d > 0) {
                let diff = p5.Vector.sub(this.position, other.position);
                diff.normalize();
                diff.div(d);        
                sepVec.add(diff);
            }
        }
        sepVec.normalize();

        const chaseWeight = 3.0;
        const sepWeight   = 1.5;
        let steerVec = p5.Vector.add(
            p5.Vector.mult(toTarget, chaseWeight),
            p5.Vector.mult(sepVec, sepWeight)
        );

        let desiredAng = steerVec.heading();
        let angleDiff = (desiredAng - this.angle + Math.PI) % (2 * Math.PI) - Math.PI;

        const margin = 0.15;
        const minDistForTurbo = 300;
        const dPlayer = dist(
            this.position.x, this.position.y,
            this.targetCar.position.x, this.targetCar.position.y
        );

        return {
            UP_ARROW:   dPlayer > minDistForTurbo,     
            DOWN_ARROW: false,
            LEFT_ARROW:  angleDiff < -margin,
            RIGHT_ARROW: angleDiff >  margin
        };
    }



    show() {
        push();
        translate(this.position.x, this.position.y)
        rotate(this.angle + HALF_PI);
        imageMode(CENTER);
        image(policeCarImg, 0, 0, carWidth, carHeight);
        pop();
    }
}
