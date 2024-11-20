class Pendulum {
    constructor(id) {
    	this.engine = Engine.create();
    	// this.engine.velocityIterations = 8
    	// this.engine.positionIterations = 8
    	// this.engine.constraintIterations = 8
        this.world = this.engine.world;
        this.id = id
        this.angularVelocity = 0
        this.vel = 0
        this.avgAngularVelocity = 0
    	this.points = 0
    	this.timeUp = 0
    	this.timeDown = 0
    	this.baseVel = 0
    	this.rad = 15

    	this.pointsInd = 0
    	this.alive = true

    	let [x1, y1, x2, y2] = this.getNewPos()
    	let length = rod_length

        //this.p1 = Bodies.circle(x, y1, 20, {isStatic: true, frictionAir: 0, density: 1});
		  // Define collision categories
		const categoryA = 0x0001; // p1
		const categoryB = 0x0002; // p2
		const categoryC = 0x0004; // suelo, techo, paredes
		const categoryD = 0x0008; // mouseColl
		let cx_suelo = track_start + track_length / 2
        let cy_suelo = track_height + 10

		// p1 collides with everything except mouseColl
		this.p1 = Bodies.circle(x1, y1, this.rad, {
		    restitution: 1,
		    inertia: Infinity,
		    friction: 0,
		    collisionFilter: {
		        category: categoryA,
		        mask: categoryB | categoryC // Collides with p2 and static structures
		    }
		});

		// p2 only collides with mouseColl
		this.p2 = Bodies.circle(x2, y2, this.rad, {
		    restitution: 0,
		    collisionFilter: {
		        category: categoryB,
		        mask: categoryD // Collides only with mouseColl
		    }
		});

		// suelo, techo, paredIzquierda, paredDerecha only collide with p1
		this.suelo = Bodies.rectangle(cx_suelo, cy_suelo, track_length, 10, {
		    isStatic: true,
		    friction: 0,
		    collisionFilter: {
		        category: categoryC,
		        mask: categoryA // Collides only with p1
		    }
		});

		this.techo = Bodies.rectangle(cx_suelo, cy_suelo - this.rad * 2 - 15, track_length, 20, {
		    isStatic: true,
		    friction: 0,
		    collisionFilter: {
		        category: categoryC,
		        mask: categoryA // Collides only with p1
		    }
		});

		this.paredIzquierda = Bodies.rectangle(track_start, track_height, 50, 400, {
		    isStatic: true,
		    friction: 0,
		    collisionFilter: {
		        category: categoryC,
		        mask: categoryA // Collides only with p1
		    }
		});

		this.paredDerecha = Bodies.rectangle(track_start + track_length, track_height, 50, 400, {
		    isStatic: true,
		    friction: 0,
		    collisionFilter: {
		        category: categoryC,
		        mask: categoryA // Collides only with p1
		    }
		});

		// mouseColl only collides with p2
		this.mouseColl = Bodies.circle(0, 0, 30, {
		    collisionFilter: {
		        category: categoryD,
		        mask: categoryB // Collides only with p2
		    }
		});

        this.constraint = Constraint.create({
            bodyA: this.p1,
            bodyB: this.p2,
            length: length,
		    stiffness: 1,
		    angularStiffness: 1
        });

        World.add(this.world, this.p1);
        World.add(this.world, this.p2);
        World.add(this.world, this.constraint);
        World.add(this.world, this.suelo);
        World.add(this.world, this.paredDerecha);
        World.add(this.world, this.paredIzquierda);
        World.add(this.world, this.techo);
        World.add(this.world, this.mouseColl);

        Runner.run(this.engine);
    }

    getNewPos(){
    	let x1 = track_start + track_length/2
    	let y1 = track_height - 2*this.rad
    	let side = Math.random() > 0.5 ? -1 : 1
    	let off = Math.random() * 10 * side + 10
    	let x2 = x1 + off
    	let y2 = track_height + rod_length
    	return [x1, y1, x2, y2]
    }

    getAngle(){
    	let angle = -Math.atan2(this.p2.position.y - this.p1.position.y, this.p2.position.x - this.p1.position.x) % TWO_PI;
    	if (angle < 0) angle += TWO_PI;
    	return angle
    }

    getAngularVelocity() {
        const vx = this.p2.velocity.x
        const vy = this.p2.velocity.y
        const angle = this.getAngle()
        return (vx*sin(angle) + vy*cos(angle)) / rod_length
    }

    setAvgAngVel(){
    	this.avgAngularVelocity += (this.angularVelocity)
    }

    checkBounds(){
		if (this.p1.position.x - this.rad <= this.suelo.position.x - track_length / 2) {
			Body.setPosition(this.p1, { x: this.suelo.position.x - track_length / 2 + this.rad, y: track_height - 2*this.rad });
			Body.setVelocity(this.p1, { x: 0, y: 0 })
		}

		if (this.p1.position.x + this.rad >= this.suelo.position.x + track_length / 2) {
			Body.setPosition(this.p1, { x: this.suelo.position.x + track_length / 2 - this.rad, y: track_height - 2*this.rad });
			Body.setVelocity(this.p1, { x: 0, y: 0 })
		}
    	
    	
    	
		let dif = Math.abs(this.p1.position.y - track_height)
		if (dif >= 10) {
			Body.setPosition(this.p1, { x: this.p1.position.x, y: track_height - 10});
		}
    	
		
    }

    move(speed) {
        // let newX = this.p1.position.x + speed
        // if(newX < track_start) newX = track_start
        // else if(newX > track_start + track_length) newX = track_start + track_length
        // Body.setPosition(this.p1, { x: newX, y: this.p1.position.y });
    	Body.setVelocity(this.p1, {x: speed, y: 0})
    	if(this == showing && panel_interact.isChecked()) Body.setPosition(this.mouseColl, {x: mouseX-15, y: mouseY-15})
    	else Body.setPosition(this.mouseColl, {x: 0, y: 0})

        let isUp = this.p2.position.y < this.p1.position.y - rod_length * 0.9
        if(isUp){
        	this.timeUp++
        	this.timeDown = 1
        	if(this.timeUp % 60 == 0){
        		if(this == best){
        			console.log()
        		}
        		// let d = Math.abs(this.p1.position.x - track_start + track_length/2)
        		// this.points += map(d, 0, track_start + track_length/2, 1, 0.5)
        		//let normalizedAngularVelocity = 1 - Math.abs(this.getAngularVelocity()) / maxAngVel;
        		// let avg = this.avgAngularVelocity / (timeG - timeGen)
        		// let normalizedAngularVelocity = 1 - avg / maxAngVel;
        		// this.points += normalizedAngularVelocity
        		if(this == showing){
        			console.log("")
        		}
        		let d = Math.abs(this.p1.position.x - (track_start + track_length / 2))
        		this.points += map(Math.abs(this.p1.position.y - this.p2.position.y), rod_length * 0.9, rod_length, 0.5, 1, true) * 0.5
        		if(d <= track_length / 2 - track_length / 6) this.points += map(d, 0, track_length / 2, 1, 0.5, true) * 0.5
        		this.pointsInd = 1
        	}
        }

    	else{
    		// if(Math.floor(this.timeUp / 60) > 0){
    		// 	let bonus = Math.floor(this.timeUp / 60 )
        	// 	this.points += bonus
    		// }
        	
    		this.timeUp = 0
    		// if(this.p2.position.y > this.p1.position.y){
    		// 	if(this.timeDown % 30 == 0){
	    	// 		if(this.points > 1){ 
	    	// 			//this.points -= t * 0.05
	    	// 			this.points -= 0.05
	    	// 			this.pointsInd = -1
	    	// 		}
	    	// 		if(this.points < 0) this.points = 0
	    	// 	}
	    	// 	this.timeDown++
    		// }
    	}

    	if(this.p2.position.y > this.p1.position.y){
    		//this.alive = false
    	}
    }

    show() {
        push()
        strokeWeight(5)
		stroke(dark_brown)
		if(keyIsPressed) stroke(0, 27)
		line(this.p1.position.x, this.p1.position.y, this.p2.position.x, this.p2.position.y)
		stroke(0)
		strokeWeight(5)
		fill(255)
		if(keyIsPressed){ 
			fill(255, 27)
			stroke(0, 27)
		}
		let length = 30
		rectMode(CENTER)
		rect(this.p1.position.x, this.p1.position.y, length * 2, 15)
		ellipse(this.p1.position.x - length, this.p1.position.y, length)
		ellipse(this.p1.position.x + length, this.p1.position.y, length)
		strokeWeight(8)
		point(this.p1.position.x - length, this.p1.position.y)
		point(this.p1.position.x + length, this.p1.position.y)
		// this.pointsInd = round(this.pointsInd, 2)
		// this.pointsInd < 0 ? fill(255, 0, 0, Math.abs(this.pointsInd) * 255) : (this.pointsInd > 0 ? fill(0, 255, 0, (this.pointsInd) * 255) : fill(255))
		// if(this.pointsInd < 0) this.pointsInd += 0.1
		// if(this.pointsInd > 0) this.pointsInd -= 0.1
		// if(this.pointsInd == 0) fill(255)
		if(keyIsPressed) fill(255, 27)
		ellipse(this.p2.position.x, this.p2.position.y, length)
		if(keyIsPressed){
			stroke(0, 0, 200)
			fill(0, 0, 255)
			ellipse(avgPosBob.x, avgPosBob.y, length)
		}

		if(this == showing && panel_interact.isChecked()) {
			push()
			noFill()
			stroke(255, 0, 0)
			strokeWeight(4)
			ellipse(this.mouseColl.position.x, this.mouseColl.position.y, this.mouseColl.circleRadius*2)
			pop()
		}
		

		// push()
		// stroke(0);
		// strokeWeight(1)
		// fill(127);
		// rectMode(CENTER);
		// rect(this.suelo.position.x, this.suelo.position.y, track_length, 10);
		// rect(this.paredIzquierda.position.x, this.paredIzquierda.position.y, 50, 400);
		// rect(this.paredDerecha.position.x, this.paredDerecha.position.y, 50, 400);
		// rect(this.techo.position.x, this.techo.position.y, track_length, 10);
		// ellipse(this.p1.position.x, this.p1.position.y, this.p1.circleRadius*2)
		// ellipse(this.p2.position.x, this.p2.position.y, this.p2.circleRadius*2)
		// pop()

		//if(mouseIsPressed) Body.setPosition(this.p1, {x: mouseX, y: mouseY})
		
        pop()
    }
}