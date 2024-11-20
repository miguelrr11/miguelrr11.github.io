class Pendulum {
    constructor(id) {
    	this.engine = Engine.create();
		this.engine.world.gravity.y = gravity;
		this.engine.constraintIterations = 2; // Default is 4
		this.engine.positionIterations = 4; // Default is 6
        this.world = this.engine.world;
        this.id = id
        this.angularVelocity = 0
        this.vel = 0
        this.avgAngularVelocity = 0
    	this.points = 0
    	this.timeUp = 0
    	this.timeDown = 0
    	this.baseVel = 0
    	this.rad = 20

    	this.prevTheta1 = 0;
        this.prevTheta2 = 0;

    	this.angleInd = 0

    	this.pointsInd = 0
    	this.alive = true

    	this.path = []

    	let [x, y1, y2, y3, xOff] = this.getNewPos()
    	let length = rod_length

        //this.p1 = Bodies.circle(x, y1, 20, {isStatic: true, frictionAir: 0, density: 1});
		  // Define collision categories
		const categoryA = 0x0001; // p1
		const categoryB = 0x0002; // p2
		const categoryC = 0x0004; // suelo, techo, paredes
		const categoryD = 0x0008; // mouseColl

		// p1 collides with everything except mouseColl
		this.p1 = Bodies.circle(x, y1, this.rad, {
		    restitution: 1,
		    isStatic: true,
			inertia: Infinity,
		    collisionFilter: {
		        category: categoryA,
		        mask: categoryB | categoryC // Collides with p2 and static structures
		    }
		});

		// p2 only collides with mouseColl
		this.p2 = Bodies.circle(x, y2, this.rad, {
		    restitution: 0,
		    mass: 1,
			frictionAir: friction,
			inertia: Infinity,
		    collisionFilter: {
		        category: categoryB,
		        mask: categoryD // Collides only with mouseColl
		    }
		});

		this.p3 = Bodies.circle(x + xOff, y3, this.rad, {
		    restitution: 0,
		    mass: 1,
			frictionAir: friction,
			inertia: Infinity,
		    collisionFilter: {
		        category: categoryB,
		        mask: categoryD // Collides only with mouseColl
		    }
		});

		

		// mouseColl only collides with p2
		this.mouseColl = Bodies.circle(0, 0, 30, {
			isStatic: true,
		    collisionFilter: {
		        category: categoryD,
		        mask: categoryB // Collides only with p2
		    }
		});

        this.constraint1 = Constraint.create({
            bodyA: this.p1,
            bodyB: this.p2,
            length: length,
		    stiffness: 1,
		    angularStiffness: 1
        });

		this.constraint2 = Constraint.create({
            bodyA: this.p2,
            bodyB: this.p3,
            length: length,
		    stiffness: 1,
		    angularStiffness: 1
        });

        World.add(this.world, this.p1);
        World.add(this.world, this.p2);
		World.add(this.world, this.p3);
        World.add(this.world, this.constraint1);
		World.add(this.world, this.constraint2);
        World.add(this.world, this.mouseColl);

        Runner.run(this.engine);
    }

    getNewPos(){
    	let x = WIDTH/2 + 140
		let xOff = 2 + Math.random() * 1.5
		if(Math.random() < 0.5) xOff *= -1
    	let y1 = HEIGHT/2
    	let y2 = HEIGHT/2 - rod_length 
		let y3 = HEIGHT/2 - rod_length*2
    	return [x, y1, y2, y3, xOff]
    }

    restartPos(){
    	let [x, y1, y2, y3] = this.getNewPos()

        Body.setPosition(this.p1, {x: x, y: y1})
        Body.setPosition(this.p2, {x: x, y: y2})
        Body.setPosition(this.p3, {x: x, y: y3})
        Body.setVelocity(this.p1, {x: 0, y: 0 });
        Body.setVelocity(this.p2, {x: 0, y: 0 });
    }

    getAngle_p2(){
    	let angle = -Math.atan2(this.p2.position.y - this.p1.position.y, this.p2.position.x - this.p1.position.x) % TWO_PI;
    	if (angle < 0) angle += TWO_PI;
    	return angle
    }

    getAngle_p3(){
    	let angle = -Math.atan2(this.p3.position.y - this.p2.position.y, this.p3.position.x - this.p2.position.x) % TWO_PI;
    	if (angle < 0) angle += TWO_PI;
    	return angle
    }

    getAngularVelocity_p2() {
        const vx = this.p2.velocity.x
        const vy = this.p2.velocity.y
        const angle = this.getAngle_p2(this.p2)
		const dx = this.p1.position.x - this.p2.position.x
	    const dy = this.p1.position.y - this.p2.position.y
	    const distance = Math.sqrt(dx * dx + dy * dy)
        return (vx*sin(angle) + vy*cos(angle)) / distance
    }

    getAngularVelocity_p3() {
        const vx = this.p3.velocity.x
        const vy = this.p3.velocity.y
        const angle = this.getAngle_p3(this.p3)
		const dx = this.p2.position.x - this.p3.position.x
	    const dy = this.p2.position.y - this.p3.position.y
	    const distance = Math.sqrt(dx * dx + dy * dy)
        return (vx*sin(angle) + vy*cos(angle)) / distance
    }

    setAvgAngVel(){
    	this.avgAngularVelocity += (this.angularVelocity)
    }

    checkBounds(){
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

	    //if(this == showing) console.log(tangentialForce)

	    return tangentialForce
	    // Apply the tangential force to the bob
	    
	}

    move(speed) {
    	if(bestNN) this.path.push(createVector(this.p3.position.x, this.p3.position.y))
    	else this.path = []
    	if(bestNN && this.path.length > 100) this.path.shift()

    	let force = this.applyTangentialForce(this.p2, this.p1, speed)
    	Body.applyForce(this.p2, this.p2.position, force);
    	this.angleInd += speed*50

    	if(this == showing && panel_interact.isChecked()) Body.setPosition(this.mouseColl, {x: mouseX, y: mouseY})
    	else Body.setPosition(this.mouseColl, {x: 0, y: 0})

        let isUp = this.p3.position.y < this.p1.position.y - rod_length * 2 * 0.95
        if(isUp){
        	this.timeUp++
        	this.timeDown = 1
        	if(bestNN) console.log("up")
        	if(!bestNN && this.timeUp % 20 == 0){ //if the sim of the gen has finished, no more points should be added
        		// let d = this.p1.position.y - this.p3.position.y
        		// this.points += mapp(d, 0, rod_length*0.9*2, 0.01, 1)
        		// if(this.points > timeG) this.points = timeG
				this.points += this.timeUp
        		this.pointsInd = 1
        	}
        }

    	else{
    		this.timeUp = 0
    	}
    }

	drawPath(){
		push()
		noFill()
        let c2_C = color(c3)
        let c5_C = color(c5)
		strokeWeight(4)
		if (!keyIsPressed) {
			for (let i = 0; i < this.path.length - 1; i++) {
				let p1 = this.path[i];
				let p2 = this.path[i + 1];
				let col = lerpColor(c5_C, c2_C, i/this.path.length)
				stroke(col);         // Apply stroke color with alpha
				line(p1.x, p1.y, p2.x, p2.y); // Draw individual segment
			}
		}
		pop()
	}

	show(){
		push()
		// if(keyIsPressed){
		// 	let c2_C = color(c3)
		// 	c2_C.setAlpha(25)
		// 	stroke(c2_C)
		// 	strokeWeight(8)
		// 	noFill()
		// 	// ellipse(this.p1.position.x, this.p1.position.y, this.rad*2)
		// 	// ellipse(this.p2.position.x, this.p2.position.y, this.rad*2)
		// 	// ellipse(this.p3.position.x, this.p3.position.y, this.rad*2)
		// 	strokeWeight(5)
		// 	line(this.p1.position.x, this.p1.position.y, this.p2.position.x, this.p2.position.y)
		// 	line(this.p3.position.x, this.p3.position.y, this.p2.position.x, this.p2.position.y)
		// 	fill(c1)
		// 	ellipse(avgPosBob.x, avgPosBob.y, 40, 40)
		// }
		if(true){
			this.drawPath()

			strokeWeight(5)
			stroke(c2)
			line(this.p1.position.x, this.p1.position.y, this.p2.position.x, this.p2.position.y)
			line(this.p3.position.x, this.p3.position.y, this.p2.position.x, this.p2.position.y)

			fill(c2)
			noStroke()
			ellipse(this.p1.position.x, this.p1.position.y, 50)

			fill(c3)
			ellipse(this.p1.position.x, this.p1.position.y, 35)

			strokeWeight(8)
			let x1 = Math.cos(this.angleInd) * 35 + this.p1.position.x
			let y1 = Math.sin(this.angleInd) * 35 + this.p1.position.y
			let x2 = Math.cos(this.angleInd + PI) * 35 + this.p1.position.x
			let y2 = Math.sin(this.angleInd + PI) * 35 + this.p1.position.y
			stroke(c3)
			point(x1, y1)
			point(x2, y2)

			stroke(c1)
			fill(c5)
			ellipse(this.p2.position.x, this.p2.position.y, this.rad*2)
			ellipse(this.p3.position.x, this.p3.position.y, this.rad*2)

			if(this == showing && panel_interact.isChecked()) {
				push()
				noFill()
				stroke(c1)
				strokeWeight(4)
				ellipse(mouseX, mouseY, this.mouseColl.circleRadius*2)
				pop()
			}
		}
		pop()
	}

    
}