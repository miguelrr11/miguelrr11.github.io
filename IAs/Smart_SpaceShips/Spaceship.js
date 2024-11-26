class Spaceship {
    constructor(x, y, w, h, id) {
        this.engine = Engine.create();
        this.world = this.engine.world;
        this.w = w
        this.h = h
        this.body = Bodies.rectangle(x, y, w, h, {
            friction: 0.1,
            frictionAir: 0.01,
            mass: 3
        });

        this.floor = Bodies.rectangle(WIDTH/2, HEIGHT, WIDTH*2, 30, { isStatic: true });  

        this.target = createVector(random(WIDTH), random(HEIGHT))
        this.points = 0
        this.id = id

        this.PEfloor = new ParticleEmitter(15)
        this.PEdcha = new ParticleEmitter(10)
        this.PEizda = new ParticleEmitter(10)

        let ceiling = Bodies.rectangle(WIDTH/2, 0, WIDTH*2, 30, { isStatic: true });  
        let pared1 = Bodies.rectangle(0, HEIGHT/2, 30, HEIGHT, { isStatic: true });
        let pared2 = Bodies.rectangle(WIDTH, HEIGHT/2, 30, HEIGHT, { isStatic: true });  

        World.add(this.engine.world, this.body);
        World.add(this.engine.world, this.floor);
        World.add(this.engine.world, ceiling);
        World.add(this.engine.world, pared1);
        World.add(this.engine.world, pared2);

        Events.on(this.engine, 'beforeUpdate', function() {
            this.world.bodies.forEach(function(body) {
                const speed = body.speed
                
                if (speed > maxSpeed) {
                    const scalingFactor = maxSpeed / speed;
                    Matter.Body.setVelocity(body, {
                        x: body.velocity.x * scalingFactor,
                        y: body.velocity.y * scalingFactor
                    });
                }

                if (Math.abs(body.angularVelocity) > maxAngularSpeed) {
                    Body.setAngularVelocity(body, Math.sign(body.angularVelocity) * maxAngularSpeed);
                }
                
            });
        });
    }

    addThrust(force) {
        let thrustPos = this.getThrustPos()
        const angle = this.body.angle - Math.PI / 2;
        const forceVector = {
            x: force * Math.cos(angle),
            y: force * Math.sin(angle)
        };
        Body.applyForce(this.body, thrustPos, forceVector);

        if(indexShowing == this.id) this.PEfloor.shoot(thrustPos, this.body.angle + HALF_PI)
    }

   //Enciendo el thrust de la derecha para ir a la izquierda
    steerLeft(force) {
        let thrustPos = this.getRightThrustPos()
        const angle = this.body.angle + Math.PI
        const forceVector = {
            x: force * Math.cos(angle),
            y: force * Math.sin(angle)
        };
        Body.applyForce(this.body, thrustPos, forceVector);

        if(indexShowing == this.id) this.PEdcha.shoot(thrustPos, this.body.angle - TWO_PI)
    }

    // Method to add rightward force at the top of the spaceship to steer
    steerRight(force) {
        let thrustPos = this.getLeftThrustPos()
        const angle = this.body.angle + Math.PI * 2
        const forceVector = {
            x: force * Math.cos(angle),
            y: force * Math.sin(angle)
        };
        Body.applyForce(this.body, thrustPos, forceVector);

        if(indexShowing == this.id) this.PEizda.shoot(thrustPos, this.body.angle - PI)
    }

    getThrustPos(){
        return {x: lerp(this.body.vertices[3].x, this.body.vertices[2].x, 0.5),
                y: lerp(this.body.vertices[3].y, this.body.vertices[2].y, 0.5)}
    }

    getRightThrustPos(){
        return {x: lerp(this.body.vertices[1].x, this.body.vertices[2].x, 0.2), 
                y: lerp(this.body.vertices[1].y, this.body.vertices[2].y, 0.2)}
    }

    getLeftThrustPos(){
        return {x: lerp(this.body.vertices[0].x, this.body.vertices[3].x, 0.2),
                y: lerp(this.body.vertices[0].y, this.body.vertices[3].y, 0.2)}
    }

    move(choice){
        if(choice == 0) this.addThrust(VER_THRUST_FORCE)
        if(choice == 1) this.steerLeft(VER_THRUST_FORCE)
        if(choice == 2) this.steerRight(VER_THRUST_FORCE)
        if(choice == 3) return
    }

    checkTarget(){
        if(dist(this.body.position.x, this.body.position.y, this.target.x, this.target.y) < 60){
            this.target = createVector(random(WIDTH), random(HEIGHT))
            this.points++
        }
    }

    showVectors(){
        let force = 40
        let thrustPos = this.getThrustPos()
        let angle = this.body.angle - Math.PI / 2;
        let forceVector = {
            x: force * Math.cos(angle),
            y: force * Math.sin(angle)
        };
        stroke(255, 0, 0)
        line(thrustPos.x, thrustPos.y, thrustPos.x - forceVector.x, thrustPos.y - forceVector.y)

        thrustPos = this.getRightThrustPos()
        angle = this.body.angle + PI
        forceVector = {
            x: force * Math.cos(angle),
            y: force * Math.sin(angle)
        };
        stroke(255, 0, 0)
        line(thrustPos.x, thrustPos.y, thrustPos.x - forceVector.x, thrustPos.y - forceVector.y)

        thrustPos = this.getLeftThrustPos()
        angle = this.body.angle + TWO_PI
        forceVector = {
            x: force * Math.cos(angle),
            y: force * Math.sin(angle)
        };
        stroke(255, 0, 0)
        line(thrustPos.x, thrustPos.y, thrustPos.x - forceVector.x, thrustPos.y - forceVector.y)
    }

    showParticles(){
        this.PEfloor.update()
        this.PEdcha.update()
        this.PEizda.update()
        this.PEfloor.show()
        this.PEdcha.show()
        this.PEizda.show()
    }

    showTarget(){
        push()
        noStroke()
        fill(255, 150, 0, 110)
        ellipse(this.target.x, this.target.y, 40)
        fill(255, 155, 0, 110)
        ellipse(this.target.x, this.target.y, 35)
        fill(255, 160, 0, 110)
        ellipse(this.target.x, this.target.y, 30)
        fill(255, 165, 0, 110)
        ellipse(this.target.x, this.target.y, 25)
        pop()
    }

    show() {
        let pos = this.body.position;
        let angle = this.body.angle;
        push();
        translate(pos.x, pos.y);
        rotate(angle);
        rectMode(CENTER);
        strokeWeight(1);
        stroke(255)
        fill(127);
        rect(0, 0, this.w, this.h);
        pop();

        pos = this.floor.position;
        angle = this.floor.angle;
        push();
        translate(pos.x, pos.y);
        rotate(angle);
        rectMode(CENTER);
        strokeWeight(1);
        stroke(255)
        fill(127);
        rect(0, 0, 1600, 30);
        pop();

        // push()
        // let thrust = this.getThrustPos()
        // ellipse(thrust.x, thrust.y, 10)
        // let Rthrust = this.getRightThrustPos()
        // ellipse(Rthrust.x, Rthrust.y, 10)
        // let Lthrust = this.getLeftThrustPos()
        // ellipse(Lthrust.x, Lthrust.y, 10)
        // pop()
        //this.showVectors()
        this.showParticles()
        this.showTarget()
    }
}