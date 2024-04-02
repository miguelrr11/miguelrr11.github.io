class snake{
	constructor(x, y){
		this.head = createVector(x, y)
		this.speed = createVector(0, -1)
		this.tail = [createVector(this.head.x, this.head.y+1), createVector(this.head.x, this.head.y+2)]
		this.food = createVector(floor(random(0, nCells)), floor(random(0, nCells)))
		//this.food = createVector(5, 5)
		this.alive = true
		this.timeAlive = 0
		this.timeLeft = timeLeftTotal

		this.detectFood = []	//8
		this.detectSpeed = []	//4
		this.detectColl = []	//4
		this.detectFoodAux = [] //4

		this.brain = new nn()

		this.fit = 0
	}

	init(){
		this.detectorSpeed()
		this.detectorFood()
		this.detectorColl()
		this.detectorFoodAux()
		this.brain.init()
	}

	checkColl(i, j){
		if(this.head.x+i < 0 || this.head.x+i > nCells-1 || this.head.y+j < 0 || this.head.y+j > nCells-1){
			return true
		}
		for(let t of this.tail){
			if(t.x == this.head.x+i && t.y == this.head.y+j) return true
		}
		return false
	}

	checkCollFood(i, j){
		for(let t of this.tail){
			if(t.x == i && t.y == j) return true
		}
		return false
	}

	// [n, ne, e, se, s, sw, w, nw]
	detectorColl(){
		this.detectColl = [0,0,0,0]
		if(this.checkColl(1, 0)) this.detectColl[0] = 1
		if(this.checkColl(0, 1)) this.detectColl[1] = 1
		if(this.checkColl(-1, 0)) this.detectColl[2] = 1
		if(this.checkColl(0, -1)) this.detectColl[3] = 1

		if(this.speed.x == 0 && this.speed.y == -1){}
		else if(this.speed.x == 0 && this.speed.y == 1){this.rol(this.detectColl, 2)}
		else if(this.speed.x == 1 && this.speed.y == 0){this.rol(this.detectColl, 3)}
		else if(this.speed.x == -1 && this.speed.y == 0){this.rol(this.detectColl, 1)}

		this.detectColl.splice(1,1)
		//console.log(this.detectColl)
	}

	detectorSpeed(){
		this.detectSpeed = [0,0,0,0]
		if(this.speed.x == 1) this.detectSpeed[0] = 1
		else if(this.speed.x == -1) this.detectSpeed[1] = 1
		else if(this.speed.y == 1) this.detectSpeed[2] = 1
		else if(this.speed.y == -1) this.detectSpeed[3] = 1
	}

	rol(arr, n){
		for(let i = 0; i < n; i++){
			arr.unshift(arr.pop())
		}
	}

	detectorFood(){
		this.detectFood = [0,0,0,0,0,0,0,0]
		let bool = false


		if(this.head.x == this.food.x){
			if((this.head.y > this.food.y)) this.detectFood[2] = 1
			else this.detectFood[6] = 1
			bool = true
		}
		else if(this.head.y == this.food.y){
			if((this.head.x > this.food.x)) this.detectFood[4] = 1
			else this.detectFood[0] = 1
			bool = true
		}
		else if(abs(this.head.x - this.food.x) == abs(this.head.y - this.food.y)){
			if(this.head.x - this.food.x > 0 && this.head.y - this.food.y > 0) this.detectFood[3] = 1
			else if(this.head.x - this.food.x < 0 && this.head.y - this.food.y > 0) this.detectFood[1] = 1
			else if(this.head.x - this.food.x > 0 && this.head.y - this.food.y < 0) this.detectFood[5] = 1
			else if(this.head.x - this.food.x < 0 && this.head.y - this.food.y < 0) this.detectFood[7] = 1
			bool = true
		}

		if(bool){
			if(this.speed.x == 0 && this.speed.y == -1){}
			else if(this.speed.x == 0 && this.speed.y == 1){this.rol(this.detectFood, 4)}
			else if(this.speed.x == 1 && this.speed.y == 0){this.rol(this.detectFood, 2)}
			else if(this.speed.x == -1 && this.speed.y == 0){this.rol(this.detectFood, 6)}
		}
	}

	detectorFoodAux(){
		this.detectFoodAux = [0,0,0,0]

		if(this.head.x < this.food.x) this.detectFoodAux[0] = 1 	//comida a la der
		if(this.head.y < this.food.y) this.detectFoodAux[1] = 1 	//comida abajo
		if(this.head.x > this.food.x) this.detectFoodAux[2] = 1  	//comida a la izq
		if(this.head.y > this.food.y) this.detectFoodAux[3] = 1  	//comida arriba

		if(this.speed.x == 0 && this.speed.y == -1){}
		else if(this.speed.x == 0 && this.speed.y == 1){this.rol(this.detectFoodAux, 2)}
		else if(this.speed.x == 1 && this.speed.y == 0){this.rol(this.detectFoodAux, 3)}
		else if(this.speed.x == -1 && this.speed.y == 0){this.rol(this.detectFoodAux, 1)}

		//console.log(this.detectFoodAux)
	}

	update(dir){
		
		if(this.alive){
			this.timeAlive++
			this.timeLeft--
			this.tail.unshift(this.head.copy())
			this.tail.pop()
			if(dir.x * this.speed.x < 0 || dir.y * this.speed.y < 0) this.head.add(this.speed)
			else{
				this.speed = dir
				this.head.add(this.speed)
			}
			if(this.checkColl(0,0)) this.alive = false
			else if(this.head.x == this.food.x && this.head.y == this.food.y){
				this.timeLeft = timeLeftTotal
				this.tail.push(this.head.copy())
				this.food = createVector(floor(random(0, nCells)), floor(random(0, nCells)))
				while(this.checkCollFood(this.food.x, this.food.y)){
					this.food = createVector(floor(random(0, nCells)), floor(random(0, nCells)))
				}
			}
			
		}
		if(this.timeLeft < 0) this.alive = false
		
	}

	show(bool){
		push()
		rectMode(CENTER)
		translate(tamCell/2, tamCell/2)
		stroke(0)
		if(bool) fill(0, 255, 0)
		else fill(255, 255, 255, 50)
		rect(this.head.x*tamCell, this.head.y*tamCell, tamCell, tamCell)
		for(let t of this.tail){
			rect(t.x*tamCell, t.y*tamCell, tamCell, tamCell)
		}
		fill(255, 0, 0, 100)
		rect(this.food.x*tamCell, this.food.y*tamCell, tamCell, tamCell)
		pop()

	}

}  

