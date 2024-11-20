class population{
	constructor(n){
		this.snakes = []
		this.nSnakes = n
		this.steps = 0
		this.end = 1000
		this.media = 0

		this.bestSnake = undefined
	}

	init(){
		for(let i = 0; i < this.nSnakes; i++){
			let s = new snake(floor(nCells/2), floor(nCells/2))
			//let s = new snake(floor(random(0, nCells)), floor(random(0, nCells)), floor(random(0, nCells)), floor(random(0, nCells)))
			s.init()
			this.snakes.push(s)
		}
		this.bestSnake = this.snakes[0]
	}

	goLeft(s){
		if(s.speed.x == 1 && s.speed.y == 0) return createVector(0, -1)
		else if(s.speed.x == -1 && s.speed.y == 0) return createVector(0, 1)
		else if(s.speed.x == 0 && s.speed.y == 1) return createVector(1, 0)
		else if(s.speed.x == 0 && s.speed.y == -1) return createVector(-1, 0)
	}

 	goRight(s){
		if(s.speed.x == 1 && s.speed.y == 0) return createVector(0, 1)
		else if(s.speed.x == -1 && s.speed.y == 0) return createVector(0, -1)
		else if(s.speed.x == 0 && s.speed.y == 1) return createVector(-1, 0)
		else if(s.speed.x == 0 && s.speed.y == -1) return createVector(1, 0)
	}

	
	run(){
		let sum = 0
		for(let s of this.snakes){
			if(s.alive){
				s.brain.updateInput(s)
				s.brain.updateHidden()
			    s.brain.updateOutput()

			    let decision = s.brain.decideOutput()
			    if(decision == 0) s.update(s.speed)	//UP (ir recto)
			    else if(decision == 1) s.update(this.goLeft(s)) //LEFT (girar izq)
			    else if(decision == 2) s.update(this.goRight(s))  //RIGHT (girar dcha)
			    s.show()
				s.detectorSpeed()
				s.detectorFood()
				s.detectorFoodAux()
				s.detectorColl()
			}
			if(s.tail.length > this.bestSnake.tail.length && s.alive){ 
				this.bestSnake = s
			}
			sum += s.tail.length
		}
		this.bestSnake.show(true)
		//this.snakes[0].show()
		//console.log(this.bestSnake)
		this.media = sum/nSnakes
		this.steps++
	}

	checkEndGen(){
		let allCrashed = true
		for(let s of this.snakes){
			if(s.alive){
				allCrashed = false
			}
		}
		if(allCrashed) return true
		if(this.steps > this.end && this.bestSnake.tail.length < 15) return true
		return false
	}

	calcularFitness(){
		let max = 0
		for(let s of this.snakes){
			//s.fit = (s.tail.length+1) + (1/dist(s.head.x, s.head.y, s.food.x, s.food.y))*10
			s.fit = (s.tail.length+1)
			if(s.fit > max){
				max = s.fit
			}
		}
		for(let s of this.snakes){
			s.fit = s.fit/max
		}
	}

	generarMP(){
		this.snakes.sort(function(a, b) {
		    return (b.fit) - (a.fit);
		});
		let MP = []
		for(let i = 0; i < nSnakesPool; i++){
			if(this.snakes[i].tail.length > 5) MP.push(this.snakes[i])
			else break
			//MP.push(this.snakes[i])
		}
		if(MP.length == 0) MP.push(random(this.snakes))
		console.log(MP)
		return MP
	}

	generarNewSnakes(MP){
		let newSnakes = []
		for(let i = 0; i < nSnakes; i++){
		    let s1 = MP[0]
		    let s2 = random(MP)

		    //let s = new snake(floor(random(0, nCells)), floor(random(0, nCells)), floor(random(0, nCells)), floor(random(0, nCells)))
			let s = new snake(floor(nCells/2), floor(nCells/2))
			s.init()


		    s.brain = s.brain.cruzarNN(s1.brain, s2.brain)
		    newSnakes.push(s)
		}
		this.snakes = newSnakes
	}
		
	


}













