class population{
	constructor(cars){
		this.cars = cars
		this.steps = 0
		this.end = 1600
		this.fastestCar = undefined
		this.podium = []
		this.first = undefined
	}

	/*
	o0: steer left
	o1: steer right
	o2: dont steer
	o3: accelerate
	o4: decelerate
	*/
	run(){
		for(let c of this.cars){
	    if(!c.crashed){
		    c.brain.updateInput(c)
		    c.brain.updateHidden()
		    c.brain.updateOutput()
		    let decision = c.brain.decideOutput()
		    if(decision == 0){
		      c.update(-1, 0)
		    }
		    else if(decision == 1){
		      c.update(1, 0)
		    }
		    else if(decision == 2){
		      c.update(0, 0)
		    }
		    else if(decision == 3){
		      c.update(0, 1)
		    }
		    else if(decision == 4){
		      c.update(0, -1)
		    }
		    // console.log(c.brain.output[0], c.brain.output[1])
		    // c.update(c.brain.output[0], c.brain.output[1])
		    this.getFirst()
		    if(this.first == c) c.show(true)
		    else c.show()
		    //c.showRays()
	    } 
	  }
	  this.steps++
	}

	checkEndGen(){
		let allCrashed = true
		let allFin = true
		for(let c of this.cars){
			if(!c.crashed){
				allCrashed = false
			}
		}
		for(let c of this.cars){
			if(!c.fin && !c.crashed){
				allFin = false
			}
		}
		if(allCrashed || allFin) return true
		if(this.steps > this.end) return true
		return false
	}

	calcularFitness(){
		let last_check = checkpoints[checkpoints.length-1].id
		let sum = 0
		for(let c of this.cars){
			if(c.posRace == 0) c.posRace = 1
			c.fit = c.posRace/last_check
			sum += c.fit
		}
		fitMeans.push(round(sum/Ncars, 2))
	}

	generarMP(){
		this.cars.sort(function(a, b) {
		    return b.fit - a.fit;
		});
		let MP = []
		if(this.podium.length == 2){
			MP.push(this.podium[0])
			MP.push(this.podium[1])
		}
		else{
			MP.push(this.cars[0])
			MP.push(this.cars[1])
		}
		return this.cars
	}

	generarNewCars(MP){
		let newCars = []
		for(let i = 0; i < Ncars; i++){
			// let c1 = random(MP)
		    // let c2 = this.cars[floor(random(0, Ncars/10))]
		    let c1 = MP[0]
		    let c2 = MP[1]
		    let newCar = new car(500 + map(i, 0, Ncars, 0, 50), 400)
		    let n = new nn()
			n.init()
			newCar.update(0)
			newCar.brain = n 
		    newCar.brain = newCar.brain.cruzarNN(c1.brain, c2.brain)
		    newCars.push(newCar)
		}
		this.cars = newCars
	}
		
	

	// calcularFitness(){
	// 	let last_check = checkpoints[checkpoints.length-1].id
	// 	let maxFit = 0
	// 	for(let c of this.cars){
	// 		if(c.posRace == 0) c.posRace = 1
	// 		c.fit = c.posRace/last_check
	// 		if(c.crashed && !c.fin) c.fit /= 10
	// 		if(c.fin) c.fit *= 10
	// 		if(this.fastestCar != undefined && this.fastestCar == c) c.fit *= 5
	// 		if(c.fit > maxFit) maxFit = c.fit
	// 	}
	// 	let sum = 0
	// 	for(let c of this.cars){
	// 		c.fit /= maxFit
	// 		sum += c.fit
	// 	}
	// 	fitMean.html("Fitness medio: " + sum/this.cars.length)
	// }


	// generarMP(){
	// 	let MP = []
	// 	for(let c of this.cars){
	// 		for(let i = 0; i < c.fit * 100; i++){
	// 			MP.push(c)
	// 		}
	// 	}
	// 	console.log(MP.length)
	// 	return MP
	// }

	// generarNewCars(MP){
	// 	let newCars = []
	//     for(let i = 0; i < Ncars; i++){
	//       let c1 = random(MP)
	//       let c2 = random(MP)
	//       // while(c1 == c2){
	//       //   c2 = random(MP)
	//       // }
	//       let newCar = new car()
	//       let n = new nn()
	// 	  n.init()
	// 	  newCar.update(0)
	// 	  newCar.brain = n 
	//       newCar.brain = newCar.brain.cruzarNN(c1.brain, c2.brain)
	//       if(random() < 0.01) newCar.brain.init()
	//       newCars.push(newCar)
	// 	}
	// 	this.cars = newCars
	// }

	getFirst(){
		if(this.fastestCar && !this.fastestCar.crashed) return this.first = this.fastestCar
		else{
			let res = this.cars[0]
			for(let c of this.cars){
				if(c.posRace > res.posRace) res = c
			}
			this.first = res
		}
		
	}

}













