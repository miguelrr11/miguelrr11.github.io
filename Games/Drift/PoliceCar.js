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

    getKeys(){
        if (this.targetCar) {
            const toTarget = p5.Vector.sub(this.targetCar.position, this.position);
            const desiredAng = toTarget.heading();
            let angleDiff = desiredAng - this.angle;
            angleDiff = (angleDiff + Math.PI) % (2 * Math.PI) - Math.PI;
            const margin = 0.15
            const minDistForTurbo = 300
            const d = dist(this.position.x, this.position.y, this.targetCar.position.x, this.targetCar.position.y);
            return {
                UP_ARROW: d > minDistForTurbo,
                DOWN_ARROW: false,
                LEFT_ARROW: angleDiff < -margin,
                RIGHT_ARROW: angleDiff > margin
            }
        }
        
    }


    show() {
        push();
        translate(this.position.x, this.position.y)
        rotate(this.angle + HALF_PI);
        imageMode(CENTER);
        image(carImg, 0, 0, carWidth, carHeight);
        pop();
    }
}
