class Cell{
	constructor(posX, posY, col, tetra, bool){
		this.pos = createVector(posX, posY)
		this.nextPos = createVector(posX, posY)
		this.col = col
		this.tetra = tetra
		if(bool == undefined) board[posX][posY] = this
	}

	fall(){
		if(this.pos.y < 24){
			//newBoard[this.pos.x][this.pos.y+1] = this
			this.nextPos = createVector(this.pos.x, this.pos.y+1)
		}
		else{
			this.nextPos = createVector(this.pos.x, this.pos.y)
			
		}
	}

	moveR(){
		if(this.pos.x < 10){
			//newBoard[this.pos.x][this.pos.y+1] = this
			this.nextPos = createVector(this.pos.x+1, this.pos.y)
		}
		else{
			this.nextPos = createVector(this.pos.x, this.pos.y)
			
		}
	}

	moveL(){
		if(this.pos.x > 0){
			//newBoard[this.pos.x][this.pos.y+1] = this
			this.nextPos = createVector(this.pos.x-1, this.pos.y)
		}
		else{
			this.nextPos = createVector(this.pos.x, this.pos.y)
			
		}
	}

	clearR(tet){
		for(let i = this.pos.x; i < 10; i++){
			let nextCell = board[i][this.pos.y]
			if(nextCell == undefined) {return true}
			if(nextCell.tetra == tet) {continue}
			if(nextCell.tetra != tet) {return false}
		}
		return false
	}

	clearL(tet){
		for(let i = this.pos.x; i >= 0; i--){
			let nextCell = board[i][this.pos.y]
			if(nextCell == undefined) {return true}
			if(nextCell.tetra == tet) {continue}
			if(nextCell.tetra != tet) {return false}
		}
		return false
	}


	clearY(tet){
		for(let j = this.pos.y+1; j < 26; j++){
			let nextCell = board[this.pos.x][j]
			if(j >= 25) return false
			if(nextCell == undefined) {return true}
			if(nextCell.tetra == tet) {continue}
			if(nextCell.tetra != tet) {return false}
		}
		return false
	}

	show(tam, num){
		if(this.pos.y < 5 && !num) return
		push()
		if(num == 1 || num == 3){
			if(num == 3) translate(0, 150)
			let type = this.tetra.type
			if(type == "I") translate(WIDTH+33, 175)
			else if(type == "J") translate(WIDTH+70, 155)
			else if(type == "L") translate(WIDTH+55, 155)
			else if(type == "O") translate(WIDTH+52, 166)
			else if(type == "S") translate(WIDTH+43, 165)
			else if(type == "T") translate(WIDTH+43, 165)
			else if(type == "Z") translate(WIDTH+43, 165)
		}
		noStroke()
		translate(0, -5*tam)
		translate(25, 25)
		fill(this.col)
		if(num == 2) fill(color_Preview)
		rect(this.pos.x * tam, this.pos.y * tam, tam, tam)
		pop()
	}

}