class population{
	constructor(birds){
		this.birds = birds
		this.steps = 0
		this.end = 1600
		this.alive = birds[0]
		this.scoreTotal = 0
		this.gen = 0
	}

	run(){
		this.scoreTotal = 0
		let pipe1 = pipes[0]
 		let pipe2 = pipes[1]
		for(let b of this.birds){
			this.scoreTotal += b.score
			if(b.alive){
				this.alive = b
				if(b.brain.execute(b)) b.hop()
				b.update()
				if(pipe1.collision(b.pos) || pipe2.collision(b.pos)) b.alive = false
				if(bird_x >= pipe1.x1-2 && bird_x <= pipe1.x1+2) b.score += 1
				if(pipe1.x1 < -25) flag = true

				if(pipes[0].x1 > bird_x){
					nextPipe = createVector(pipes[0].x1, pipes[0].y2 + altura_entry/2)
				}
				else nextPipe = createVector(pipes[2].x1, pipes[2].y2 + altura_entry/2)
				
			}
			if(!b.alive) b.update()
			if(b.pos < height) b.show()
		}
		if(flag){
			pipes.shift()
			pipes.shift()
			generatePipe(620)
			flag = false
		}
	  	this.steps++
		
	}

	createNextGen(){
		this.calcularFitness()
		let MP = this.generarMP()
		this.generarNewBirds(MP)
		this.gen++
	}

	checkEndGen(){
		for(let b of this.birds){
			if(b.alive) return false
		}
		return true
	}

	calcularFitness(){
		let max = 0
		for(let b of this.birds){
			if(b.score > max) max = b.score
		}
		for(let b of this.birds){
			b.fit = b.score/max
		}
	}

	generarMP(){
		this.birds.sort(function(a, b) {
		    return b.fit - a.fit;
		});
		let MP = []
		for(let i = 0; i < 5; i++){
			MP.push(this.birds[i])
		}
		return MP
	}

	generarNewBirds(MP){
		let newBirds = []
		for(let i = 0; i < nBirds; i++){
			let b1 = random(MP)
		    let b2 = random(MP)
		    let newBird = new bird(height/2)
		    newBird.brain = newBird.brain.cruzarNN(b1.brain, b2.brain)
		    newBirds.push(newBird)
		}
		this.birds = newBirds
	}

}













