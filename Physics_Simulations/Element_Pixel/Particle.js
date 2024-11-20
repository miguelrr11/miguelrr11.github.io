class Particle{
	constructor(pos){
		this.pos = pos
		this.nextPos = pos
	}

	step(){
		// if(grid[IX(this.pos.x, this.pos.y)].type == "water" && this.type == 'sand'){
		// 	grid[IX(this.nextPos.x, this.nextPos.y)] = grid[IX(this.pos.x, this.pos.y)]
		// }
		//next_grid[IX(this.pos.x, this.pos.y)] = undefined
		next_grid[IX(this.nextPos.x, this.nextPos.y)] = this
		this.pos = this.nextPos.copy()
	}

	getFinalPosVertical(x, y, targetY){
		let res = createVector(x, y)
		for(let i = y+1; i < targetY; i++){
			if(!this.empty(x, i)){
				res.y = i-1
				return res
			}
		}
		res.y = targetY
		return res
	}

	getFinalPosHorizontal(x, y, targetX){
		let res = createVector(x, y)
		targetX = constrain(targetX, 0, N-1)
		let starting = targetX > x ? 1 : -1
		for(let i = x+starting; i < targetX; i += starting){
			if(this.empty(i, y)) res.x = i
			else return res
			// else if(i < 0 || i >= N-1){
			// 	return res
			// }
		}
		return res
	}
}

class Sand_Particle extends Particle{
	constructor(pos){
		super(pos)
		this.type = 'sand'
		this.mat = 'solid'
		this.movable = true
		this.nextPos = pos.copy()
		this.density = 1

		this.displacementRate = 1
		this.gravity = 0.04
	}

	update(){
		let x = this.pos.x  
		let y = this.pos.y
		this.displacementRate = (this.displacementRate+this.gravity)
		//abajo empty
		if(y+1 < N && this.empty(x, y+1)) {
			next_grid[IX(this.pos.x, this.pos.y)] = undefined
			let finalPos = this.getFinalPosVertical(x, y, y+Math.round(this.displacementRate))
			this.nextPos = finalPos.copy()
			return
		}
		//abajo liquido
		if(y+1 < N && this.inLiquid(x, y+1)) {
			next_grid[IX(this.pos.x, this.pos.y)] = new Water_Particle(createVector(this.pos.x, this.pos.y))
			this.nextPos = createVector(x, y+1)
			return
		}
		//diagonales empty
		if(x+1 < N && y+1 < N && this.empty(x+1, y+1)) {
			next_grid[IX(this.pos.x, this.pos.y)] = undefined
			this.nextPos = createVector(x+1, y+1);
			return
		}
		if(x-1 >= 0 && y+1 < N && this.empty(x-1, y+1)) {
			next_grid[IX(this.pos.x, this.pos.y)] = undefined
			this.nextPos = createVector(x-1, y+1); 
			return
		}
		//diagonales liquido
		// if(x+1 < N && y+1 < N && this.inLiquid(x+1, y+1)) {
		// 	this.nextPos = createVector(x+1, y+1)
		// 	next_grid[IX(this.pos.x, this.pos.y)] = new Water_Particle(createVector(this.pos.x, this.pos.y))
		// 	return
		// }
		// if(x-1 >= 0 && y+1 < N && this.inLiquid(x-1, y+1)) {
		// 	this.nextPos = createVector(x, y+1)
		// 	next_grid[IX(this.pos.x, this.pos.y)] = new Water_Particle(createVector(this.pos.x, this.pos.y))
		// 	return
		// }
		this.nextPos = this.pos.copy()
	}

	empty(i, j){
	    return grid[IX(i, j)] == undefined
	}

	inLiquid(i, j){
	    return grid[IX(i, j)] != undefined && grid[IX(i, j)].type == "water"
	}

	show(){
		push()
		noStroke()
		fill(col_sand)
		rect(this.pos.x * tamCell, this.pos.y * tamCell, tamCell, tamCell)
		pop()
	}
}

class Water_Particle extends Particle{
	constructor(pos){
		super(pos)
		this.type = 'water'
		this.mat = 'liquid'
		this.movable = true
		this.nextPos = pos
		this.speed
		this.density = 0.5

		this.displacementRate = 1
		this.gravity = 0.04

		this.lateralDisplacement = 5
	}

	empty(i, j){
	    return grid[IX(i, j)] == undefined && next_grid[IX(i, j)] == undefined
	}

	update(){
		let x = this.pos.x  
		let y = this.pos.y
		this.displacementRate = (this.displacementRate+this.gravity)
		//vertical
		if(y+1 < N && this.empty(x, y+1)) {
			next_grid[IX(this.pos.x, this.pos.y)] = undefined
			let finalPos = this.getFinalPosVertical(x, y, y+Math.round(this.displacementRate))
			this.nextPos = finalPos.copy()
			//this.nextPos = createVector(x, y+1)
			return
		}
		//diagonal
		if(x+1 < N && y+1 < N && this.empty(x+1, y+1)) {
			next_grid[IX(this.pos.x, this.pos.y)] = undefined
			this.nextPos = createVector(x+1, y+1); 
			return
		}
		if(x-1 >= 0 && y+1 < N && this.empty(x-1, y+1)) {
			next_grid[IX(this.pos.x, this.pos.y)] = undefined
			this.nextPos = createVector(x-1, y+1); 
			return
		}
		//horizontal
		let r = random()
		if(x-1 >= 0 && r < 0.5 && this.empty(x-1, y)) {
			next_grid[IX(this.pos.x, this.pos.y)] = undefined
			let finalPos = this.getFinalPosHorizontal(x, y, x-this.lateralDisplacement)
			this.nextPos = finalPos.copy()
			this.nextPos = createVector(x-1, y)
			return
		}
		if(x+1 < N && r > 0.5 && this.empty(x+1, y)) {
			next_grid[IX(this.pos.x, this.pos.y)] = undefined
			let finalPos = this.getFinalPosHorizontal(x, y, x+this.lateralDisplacement)
			this.nextPos = finalPos.copy()
			this.nextPos = createVector(x+1, y)
			return
		}
		this.nextPos = this.pos.copy()
	}

	show(){
		push()
		noStroke()
		fill(col_water)
		rect(this.pos.x * tamCell, this.pos.y * tamCell, tamCell, tamCell)
		pop()
	}
}

class Wood_Particle extends Particle{
	constructor(pos){
		super(pos)
		this.type = 'wood'
		this.mat = 'solid'
		this.movable = false
		this.nextPos = pos
		this.speed
		this.density = 1
	}

	empty(i, j){
	    return grid[IX(i, j)] == undefined && next_grid[IX(i, j)] == undefined
	}

	update(){
		this.nextPos = this.pos.copy()
	}

	show(){
		push()
		noStroke()
		fill(col_wood)
		rect(this.pos.x * tamCell, this.pos.y * tamCell, tamCell, tamCell)
		pop()
	}
}