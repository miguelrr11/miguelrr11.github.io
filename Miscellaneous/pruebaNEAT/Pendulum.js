class Pendulum {
    constructor(id) {
    	this.engine = Engine.create();
    	this.engine.velocityIterations = 12
    	this.engine.positionIterations = 12
    	this.engine.constraintIterations = 12
        this.world = this.engine.world;
        this.id = id
        this.angularVelocity = 0
        this.avgAngularVelocity = 0
    	this.points = 0
    	this.timeUp = 0
    	this.timeDown = 0
    	this.baseVel = 0

    	this.pointsInd = 0

    	let x = track_start + track_length/2
    	let y1 = track_height
    	//let y2 = Math.random() > 0.5 ? HEIGHT / 2 - rod_length : HEIGHT / 2 + rod_length
    	let y2 = track_height + rod_length
    	let length = rod_length

        this.p1 = Bodies.circle(x, y1, 20, {isStatic: true, frictionAir: 0, density: 1});
        World.add(this.world, this.p1);

        this.p2 = Bodies.circle(x, y2, 20, {density: 0.0000000001, frictionAir: 0.005});
        World.add(this.world, this.p2);

        this.constraint = Constraint.create({
            bodyA: this.p1,
            bodyB: this.p2,
            length: length,
            stiffness: 1
        });
        World.add(this.world, this.constraint);

        Runner.run(this.engine);
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

    move(speed) {
        let newX = this.p1.position.x + speed
        if(newX < track_start) newX = track_start
        else if(newX > track_start + track_length) newX = track_start + track_length
        Body.setPosition(this.p1, { x: newX, y: this.p1.position.y });

        let isUp = this.p2.position.y < this.p1.position.y - rod_length * 0.9
        if(isUp){
        	this.timeUp++
        	this.timeDown = 1
        	if(this.timeUp % t == 0){
        		// let d = Math.abs(this.p1.position.x - track_start + track_length/2)
        		// this.points += map(d, 0, track_start + track_length/2, 1, 0.5)
        		//let normalizedAngularVelocity = 1 - Math.abs(this.getAngularVelocity()) / maxAngVel;
        		// let avg = this.avgAngularVelocity / (timeG - timeGen)
        		// let normalizedAngularVelocity = 1 - avg / maxAngVel;
        		// this.points += normalizedAngularVelocity
        		this.points++
        		this.pointsInd = 1
        	}
        }

    	else{
    		if(Math.floor(this.timeUp / 60) > 0){
    			let bonus = Math.floor(this.timeUp / 60 )
        		this.points += bonus
    		}
        	
    		this.timeUp = 0
    		if(this.p2.position.y > this.p1.position.y){
    			if(this.timeDown % 30 == 0){
	    			if(this.points > 1){ 
	    				//this.points -= t * 0.05
	    				this.points -= 0.05
	    				this.pointsInd = -1
	    			}
	    			if(this.points < 0) this.points = 0
	    		}
	    		this.timeDown++
    		}
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
		
        pop()
    }
}