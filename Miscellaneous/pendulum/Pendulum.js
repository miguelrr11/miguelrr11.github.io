class Pendulum {
    constructor(id, x = WIDTH / 2, y1 = HEIGHT / 2, y2 = HEIGHT / 2 - rod_length, length = rod_length) {
    	this.engine = Engine.create();
        this.world = this.engine.world;
        this.id = id
        this.angularVel = 0
    	this.points = 0
    	this.timeUp = 0
    	this.rad = 15

        this.p1 = Bodies.circle(x, y1, this.rad, {
		    restitution: 1,
		    isStatic: true,
		    friction: 0
		});

		// p2 only collides with mouseColl
		this.p2 = Bodies.circle(x, y2, this.rad, { 
		    restitution: 0,
		    mass: 1
		});

		this.p3 = Bodies.circle(x, y2-length, this.rad, {
		    restitution: 0,
		    mass: 1
		});

        this.c1 = Constraint.create({
            bodyA: this.p1,
            bodyB: this.p2,
            length: length,
            stiffness: 0.9
        });

        this.c2 = Constraint.create({
            bodyA: this.p2,
            bodyB: this.p3,
            length: length,
            stiffness: 0.9
        });

        World.add(this.world, this.c1);
        //World.add(this.world, this.c2)
        World.add(this.world, this.p1);
        World.add(this.world, this.p2);
        //World.add(this.world, this.p3);

        Runner.run(this.engine);
    }

    applyTangentialForce(bob, base, forceMagnitude) {
	    // Calculate the direction from the base to the bob
	    const dx = bob.position.x - base.position.x;
	    const dy = bob.position.y - base.position.y;
	    const distance = Math.sqrt(dx * dx + dy * dy);

	    // Calculate the tangential force (perpendicular to the base-bob line)
	    const tangentialForce = {
	        x: -dy / distance * forceMagnitude,
	        y: dx / distance * forceMagnitude
	    };

	    

	    // Apply the tangential force to the bob
	    Body.applyForce(bob, bob.position, tangentialForce);
	}

    getAngularVel() {
        const vectorP1toP2 = Matter.Vector.sub(this.p2.position, this.p1.position);

		// Step 2: Get the distance between p1 and p2
		const distance = Matter.Vector.magnitude(vectorP1toP2);

		// Step 3: Get the velocity of p1 along the x-axis
		const velocityP1 = this.p2.velocity.x;

		// Step 4: Calculate the angular velocity of p2 around p1
		const angularVelocityP2 = velocityP1 / distance; // v / r

		// Step 5: Calculate the tangential velocity of p2
		const tangentialVelocityP2 = angularVelocityP2 * distance;

		return tangentialVelocityP2
    }

    move(speed) {
        this.applyTangentialForce(this.p2, this.p1, speed)
    }

    show() {
        push()
        strokeWeight(5)
		fill(dark_brown)
		line(this.p1.position.x, this.p1.position.y, this.p2.position.x, this.p2.position.y)
		//line(this.p2.position.x, this.p2.position.y, this.p3.position.x, this.p3.position.y)
		stroke(0)
		strokeWeight(5)
		fill(255)
		
		let length = 30
		rectMode(CENTER)
		rect(this.p1.position.x, this.p1.position.y, length * 2, 15)
		ellipse(this.p1.position.x - length, this.p1.position.y, length)
		ellipse(this.p1.position.x + length, this.p1.position.y, length)
		strokeWeight(8)
		point(this.p1.position.x - length, this.p1.position.y)
		point(this.p1.position.x + length, this.p1.position.y)

		//if(keyIsPressed) fill(255, 35)
		ellipse(this.p2.position.x, this.p2.position.y, length)
		//ellipse(this.p3.position.x, this.p3.position.y, length)
		
        pop()
    }
}