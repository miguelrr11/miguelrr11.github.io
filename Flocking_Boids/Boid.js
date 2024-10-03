class Boid{
    constructor(){
        this.pos = createVector(random(WIDTH), random(HEIGHT))
        this.vel = p5.Vector.fromAngle(random(360))
        this.maxSpeed = 4
        this.vel.setMag(this.maxSpeed)
        this.acc = createVector(0, 0)
        this.maxForce = 0.01
        this.size = 8

        this.cohesionSum = createVector(0, 0)
        this.alignSum = createVector(0, 0)
        this.separateSum = createVector(0, 0)

        this.auxSum = createVector(0, 0)
    }

    update(boids, a, b, c){
        let force = this.combinedBehavior(boids, a, b, c)
        this.applyForce(force)

        this.vel.add(this.acc)
        this.vel.limit(this.maxSpeed)
        this.pos.add(this.vel)

        this.edges()
    }

    edges(){
        if(this.pos.x < 0) this.pos.x = width
        if(this.pos.x > width) this.pos.x = 0
        if(this.pos.y < 0) this.pos.y = height
        if(this.pos.y > height) this.pos.y = 0
    }

    applyForce(force){
        this.acc.add(force)
    }

    combinedBehavior(boids, sepMult, cohMult, aliMult) {
        this.cohesionSum.mult(0)
        this.alignSum.mult(0)
        this.separateSum.mult(0)
        let cohesionCount = 0;
        let alignCount = 0;
        let separateCount = 0;
        let desiredSeparation = 900; // 30 * 30
        let neighbourDist = 2500

        for (let b of boids) {
            let d = this.squaredDistance(this.pos.x, this.pos.y, b.pos.x, b.pos.y);

            if (this !== b && d != 0) {
                if (d < neighbourDist) {
                    this.cohesionSum.add(b.pos);
                    cohesionCount++;
                }

                if (d < neighbourDist) {
                    this.alignSum.add(b.vel);
                    alignCount++;
                }

                if (d < desiredSeparation) {
                    let diff = p5.Vector.sub(this.pos, b.pos);
                    diff.setMag(1 / d);
                    this.separateSum.add(diff);
                    separateCount++;
                }
            }
        }


        let cohesionForce = createVector(0, 0);
        if (cohesionCount > 0) {
            this.cohesionSum.div(cohesionCount);
            cohesionForce = this.seek(this.cohesionSum);
        }
        cohesionForce.mult(cohMult)


        let alignForce = createVector(0, 0);
        if (alignCount > 0) {
            this.alignSum.setMag(this.maxSpeed);
            alignForce = p5.Vector.sub(this.alignSum, this.vel);
            alignForce.limit(this.maxForce);
        }
        alignForce.mult(aliMult)


        let separateForce = createVector(0, 0);
        if (separateCount > 0) {
            this.separateSum.setMag(this.maxSpeed);
            separateForce = p5.Vector.sub(this.separateSum, this.vel);
            separateForce.limit(this.maxForce);
        }
        separateForce.mult(sepMult)


        return cohesionForce.add(alignForce).add(separateForce);
    }


    // cohesion(boids, neighbourDist){
    //     this.auxSum.mult(0)
    //     let count = 0

    //     for(let b of boids){
    //         let d = this.squaredDistance(this.pos.x, this.pos.y, b.pos.x, b.pos.y)
    //         if(this !== b && d < neighbourDist){
    //             this.auxSum.add(b.pos)
    //             count++
    //         }
    //     }

    //     if(count > 0){
    //         this.auxSum.div(count)
    //         return this.seek(this.auxSum)
    //     }
    //     return createVector(0, 0)
    // }

    // align(boids, neighbourDist){
    //     this.auxSum.mult(0)
    //     let count = 0

    //     for(let b of boids){
    //         let d = this.squaredDistance(this.pos.x, this.pos.y, b.pos.x, b.pos.y)
    //         if(this !== b && d < neighbourDist){
    //             this.auxSum.add(b.vel)
    //             count++
    //         }
    //     }

    //     if(count > 0){
    //         this.auxSum.setMag(this.maxSpeed)
    //         let steer = p5.Vector.sub(this.auxSum, this.vel)
    //         steer.limit(this.maxForce)
    //         return steer
    //     }
    //     return createVector(0, 0)
    // }

    // separate(boids){
    //     let desiredSeparation = 900 //30 * 30 = 900

    //     this.auxSum.mult(0)
    //     let count = 0
    //     for(let b of boids){
    //         let d = this.squaredDistance(this.pos.x, this.pos.y, b.pos.x, b.pos.y)
    //         if(this !== b && d < desiredSeparation){
    //             let diff = p5.Vector.sub(this.pos, b.pos)
    //             diff.setMag(1 / d)
    //             this.auxSum.add(diff)
    //             count++
    //         }
    //     }

    //     if(count > 0){
    //         this.auxSum.setMag(this.maxSpeed)
    //         let steer = p5.Vector.sub(this.auxSum, this.vel)
    //         steer.limit(this.maxForce)
    //         return steer        
    //     }

    //     return createVector(0, 0)
    // }

    seek(target){
        let desired = p5.Vector.sub(target, this.pos)
        desired.setMag(this.maxSpeed)
        let steer = p5.Vector.sub(desired, this.speed)
        steer.limit(this.maxForce)
        return steer
    }


    show(){
        push()
        translate(this.pos.x, this.pos.y)
        rotate(this.vel.heading());
        triangle(-this.size, -this.size / 2, -this.size, this.size / 2, this.size, 0)
        pop()
    }

    squaredDistance(x1, y1, x2, y2) {
        return (x2 - x1) ** 2 + (y2 - y1) ** 2
    }
}