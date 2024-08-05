class Level{
	constructor(n_balls, speed, n_balls_in_nexus, level_id){
		this.nexo = createVector(300, 300)
		this.nexoSize = 140
		this.balls = []
		this.speed = speed
		this.n_balls = n_balls
		this.n_balls_total = n_balls
		this.n_balls_in_nexus = n_balls_in_nexus
		this.ball = undefined
		this.moving = false
		this.finished = false
		this.level_id = level_id
		if(this.n_balls_in_nexus > 0) this.spawnInitialBalls()
		this.spawnBalls()
		this.animPhase = 0
	}

	spawnInitialBalls(){
		for(let i = 0; i < this.n_balls_in_nexus; i++){
			let angle = (TWO_PI/this.n_balls_in_nexus) * i
			let pos = createVector(300 + 200*cos(angle), 300 + 200*sin(angle))
			let ball = new Ball(pos)
			ball.angle = angle
			ball.orbiting = true
			this.balls.push(ball)
		}
	}

	shoot(){
		if(!this.finished) this.moving = true
	}

	spawnBalls(){
    	for(let i = 0; i < this.n_balls; i++){
    		this.balls.push(new Ball(createVector(300, 530 + i*43), this.n_balls-i))
    	}
    	this.ball = this.balls[this.n_balls_in_nexus]
	}

	nextBall(){
		this.ball = this.balls[this.n_balls_in_nexus + this.n_balls_total - this.n_balls + 1]
	}

	update(){
	    for(let b of this.balls){ 
	        b.orbit(this.speed)
	    }
	    if(this.moving && !this.finished){
	    	for(let b of this.balls){
	    		b.move()
	    	}
	    }
	    let bool
	    if(!this.finished) bool = this.checkCollision()
	    if(this.ball.pos.y <= 500 && this.n_balls > 0) {
	        this.moving = false
	        this.ball.orbiting = true
	        if(this.n_balls > 1) this.nextBall()
	        this.n_balls--
	    }
	    if(bool && this.n_balls == 0) this.finished = true
	}

	show(){
		push()
		fill(0)
	    ellipse(this.nexo.x, this.nexo.y, this.nexoSize, this.nexoSize)
	    for(let b of this.balls){ 
	        b.show(b.orbiting)
	    }
	    noStroke()
	    textFont("Gill Sans")
	    textAlign(CENTER)
	    fill(255)
	    textSize(60)
	    text(this.level_id, 300, 310)
	    textSize(20)
	    text("LEVEL", 300, 340)
	    pop()
	}

	showFinishedAnimation(){
		this.animPhase++
		if(this.animPhase == 70){
			this.balls = []
		}
		if(this.animPhase > 70 && this.animPhase < 94){
			this.nexoSize -= 6
		}
		if(this.animPhase > 94){
			this.nexoSize += 12
		}
		if(this.nexoSize > 140){
			nextLevel()
		}
		this.speed += 7
		if(this.speed > 100) this.speed = 100
		push()
		fill(0)
	    ellipse(this.nexo.x, this.nexo.y, this.nexoSize, this.nexoSize)
	    for(let b of this.balls){ 
	    	b.rad -= 2.5
	    	if(b.rad < 0) b.rad = 1
	        b.show(b.orbiting)
	    }
	    pop()
	}
	
	checkCollision(){
	    for(let b1 of this.balls){
	    	for(let b2 of this.balls){
	    		if(b1 == b2) continue
		        if(b1.collide(b2)){
		        	restartLevel()
		        	return false
		        }
	    	}
	    }
	    return true
	}
}