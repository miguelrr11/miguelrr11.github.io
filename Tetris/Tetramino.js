const color_I = "#87DFFF"
const color_J = "#92A4F4"
const color_L = "#FDC695"
const color_O = "#FFF59E"
const color_S = "#BDF5AB"
const color_T = "#F0C0F4"
const color_Z = "#FBA2A2"
const color_Back = "#FFF7E5"
const color_Lines = "#D7C498"
const color_Text = "#BBA46E"
const color_Preview = "#9F9F9F"
const color_Back_Button = "#E7D6AE"

function drawNextTetra(){
	let tetraToDraw 
	if(next == "I") tetraToDraw = new Tetramino_I(0, true)
	else if(next == "J") tetraToDraw = new Tetramino_J(0, true)
	else if(next == "L") tetraToDraw = new Tetramino_L(0, true)
	else if(next == "O") tetraToDraw = new Tetramino_O(0, true)
	else if(next == "S") tetraToDraw = new Tetramino_S(0, true)
	else if(next == "T") tetraToDraw = new Tetramino_T(0, true)
	else if(next == "Z") tetraToDraw = new Tetramino_Z(0, true)

	for(let p of tetraToDraw.pieces){
		p.show(tamNextCell, 1)
	}
}

function getNextTetra(){
	let aux = random()
	let interval = 1/7
	if(aux < interval) next = "I"
	else if(aux < interval*2) next = "J"
	else if(aux < interval*3) next = "L"
	else if(aux < interval*4) next = "O"
	else if(aux < interval*5) next = "S"
	else if(aux < interval*6) next = "T"
	else next = "Z"
	while(next == current.type){
		let aux = random()
		let interval = 1/7
		if(aux < interval) next = "I"
		else if(aux < interval*2) next = "J"
		else if(aux < interval*3) next = "L"
		else if(aux < interval*4) next = "O"
		else if(aux < interval*5) next = "S"
		else if(aux < interval*6) next = "T"
		else next = "Z"
	}
}

function spawnTetraSpecific(tet){
	if(tet == "I") current = new Tetramino_I()
	else if(tet == "J") current = new Tetramino_J()
	else if(tet == "L") current = new Tetramino_L()
	else if(tet == "O") current = new Tetramino_O()
	else if(tet == "S") current = new Tetramino_S()
	else if(tet == "T") current = new Tetramino_T()
	else if(tet == "Z") current = new Tetramino_Z()
}

function spawnTetra(){
	if(next == "I") current = new Tetramino_I()
	else if(next == "J") current = new Tetramino_J()
	else if(next == "L") current = new Tetramino_L()
	else if(next == "O") current = new Tetramino_O()
	else if(next == "S") current = new Tetramino_S()
	else if(next == "T") current = new Tetramino_T()
	else if(next == "Z") current = new Tetramino_Z()
	getNextTetra()
}

function checkGO(){
	bool = true
	for(let p of current.pieces){
		if(p.pos.y > 4){
			bool = false
			break
		}
	}
	if(bool){ 
		gameOver = true
		drawNextTetra()
	    drawPreview()
	    drawHold()
	    drawBoard()
	    drawGrid()
	    drawGO()
		console.log("GAME OVER")
	}
}

function checkLineClear(){
	n_lineas = 0
	for(let j = 0; j < 25; j++){
		linea_llena = true
		for(let i = 0; i < nWidth; i++){
			if(board[i][j] == undefined){
				linea_llena = false
				break
			}
		}
		if(linea_llena){ 
			n_lineas++
			clearLine(j)
		}
	}
	if(n_lineas == 1) score += 100
	if(n_lineas == 2) score += 300
	if(n_lineas == 3) score += 500
	if(n_lineas == 4) score += 800
}

function clearLine(y){
	for(let i = 0; i < nWidth; i++){
		cell = board[i][y]
		cell.tetra.pieces.pop(cell)
		board[i][y] = undefined
		if(cell.tetra.pieces.length == 0) tetras.pop(cell.tetra)
	}
	score += 100
	fallEverything(y)
}

function fallEverything(y){
	for(let j = 0; j < 25; j++){
		for(let i = 0; i < nWidth; i++){
			if(j >= y) continue
			if(board[i][j] != undefined){
				board[i][j].nextPos = createVector(board[i][j].pos.x, board[i][j].pos.y+1)
			}
		}
	}
	update()
}

function drawPreview(){
	if(current.type == "I") preview = new Tetramino_I(0, true)
	else if(current.type == "J") preview = new Tetramino_J(0, true)
	else if(current.type == "L") preview = new Tetramino_L(0, true)
	else if(current.type == "O") preview = new Tetramino_O(0, true)
	else if(current.type == "S") preview = new Tetramino_S(0, true)
	else if(current.type == "T") preview = new Tetramino_T(0, true)
	else if(current.type == "Z") preview = new Tetramino_Z(0, true)


	let fin = false
	let deltaY = 1

	while(!fin){
		for(let p of current.pieces){
			let totalY = p.pos.y + deltaY
			if(totalY > 24){ 
				deltaY--
				fin = true
				break
			}
			if(board[p.pos.x][totalY] != undefined && board[p.pos.x][totalY].tetra == current){
				continue
			}
			if(board[p.pos.x][totalY] != undefined && board[p.pos.x][totalY].tetra != current){
				deltaY--
				fin = true
				break
			}
		}
		if(!fin) deltaY++
	}


	for(let i = 0; i < current.pieces.length; i++){
		let p = preview.pieces[i]
		p.pos = createVector(current.pieces[i].pos.x, current.pieces[i].pos.y + deltaY)
		p.show(tamCell, 2)
	}
}

function drawHold(){
	if(!holded) return
	let aux
	if(holded == "I") aux = new Tetramino_I(0, true)
	else if(holded == "J") aux = new Tetramino_J(0, true)
	else if(holded == "L") aux = new Tetramino_L(0, true)
	else if(holded == "O") aux = new Tetramino_O(0, true)
	else if(holded == "S") aux = new Tetramino_S(0, true)
	else if(holded == "T") aux = new Tetramino_T(0, true)
	else if(holded == "Z") aux = new Tetramino_Z(0, true)

	for(let p of aux.pieces){
		p.show(tamNextCell, 3)
	}
}

function hold(){
	//solo ocurre una vez
	if(holded == undefined){
		taken_out = true
		holded = current.type
		for(let p of current.pieces){
			board[p.pos.x][p.pos.y] = undefined
		}
		spawnTetra(next)
	}
	//ocurre cada vez que quieras guardar la pieza y no lo hayas hecho antes
	else if(!taken_out){
		taken_out = true
		tmp = current.type
		for(let p of current.pieces){
			board[p.pos.x][p.pos.y] = undefined
		}
		spawnTetraSpecific(holded)
		holded = tmp
	}
}


class Tetramino{
	constructor(){
		this.pieces = []
		this.rotationState = 0
	}

	moveRight(){
		for(let p of this.pieces){
			if(p.clearR(this)) continue
			return
		}
		for(let p of this.pieces){
			p.moveR()
		}
		update()
	}

	moveLeft(){
		for(let p of this.pieces){
			if(p.clearL(this)) continue
			return
		}
		for(let p of this.pieces){
			p.moveL()
		}
		update()
	}

	moveMostDown(){
		for(let i = 0; i < current.pieces.length; i++){
			this.pieces[i].nextPos = preview.pieces[i].pos
		}
		score += (preview.pieces[0].pos.y - current.pieces[0].pos.y) * 2
	}

	fall(pts){
		let bool = true
		for(let p of this.pieces){
			if(p.clearY(this)) continue
			else if(this == current){
				bool = false
				taken_out = false
				checkGO()
				checkLineClear()
				spawnTetra()
			}
			return
		}
		if(bool){
			for(let p of this.pieces){
				p.fall()
			}
			if(pts) score++
		}
		
	}
	
}
	
class Tetramino_I extends Tetramino{
	constructor(rotationState, bool){
		super(rotationState)
		this.pieces = []
		this.spawn(bool)
		if(!bool) tetras.push(this)
		this.type = "I"
	}

	rotate(){

		let rotated = false
		let x = this.pieces[0].pos.x 
		let y = this.pieces[0].pos.y
		if(this.rotationState == 0){
			if(y+1 > 24 || y-2 < 0 || x+2 >nWidth-1) return
			if(board[x+2][y-1] == undefined &&
			   board[x+2][y+1] == undefined &&
			   board[x+2][y+2] == undefined){
				this.pieces[0].nextPos = createVector(x+2, y-1)
				this.pieces[1].nextPos = createVector(x+2, y)
				this.pieces[2].nextPos = createVector(x+2, y+1)
				this.pieces[3].nextPos = createVector(x+2, y+2)
				rotated = true
				
			}
		}
		else if(this.rotationState == 1){
			if(x+1 >nWidth-1 || y+2 > 24 || x-2 < 0) return
			if(board[x-2][y-2] == undefined &&
			   board[x-1][y-2] == undefined &&
			   board[x+1][y-2] == undefined){
				this.pieces[3].nextPos = createVector(x-2, y+2)
				this.pieces[2].nextPos = createVector(x-1, y+2)
				this.pieces[1].nextPos = createVector(x, y+2)
				this.pieces[0].nextPos = createVector(x+1, y+2)	
				rotated = true
			}
		}
		else if(this.rotationState == 2){
			if(y-2 < 0 || x-2 < 0 || y+1 > 24) return
			if(board[x-2][y+1] == undefined &&
			   board[x-2][y-1] == undefined &&
			   board[x-2][y-2] == undefined){
				this.pieces[0].nextPos = createVector(x-2, y+1)
				this.pieces[1].nextPos = createVector(x-2, y)
				this.pieces[2].nextPos = createVector(x-2, y-1)
				this.pieces[3].nextPos = createVector(x-2, y-2)
				rotated = true
			}
		}
		else if(this.rotationState == 3){
			if(y-2 < 0 || x+2 >nWidth-1 || x-1 < 0) return
			if(board[x-1][y-2] == undefined &&
			   board[x+1][y-2] == undefined &&
			   board[x+2][y-2] == undefined){
				this.pieces[0].nextPos = createVector(x-1, y-2)
				this.pieces[1].nextPos = createVector(x, y-2)
				this.pieces[2].nextPos = createVector(x+1, y-2)
				this.pieces[3].nextPos = createVector(x+2, y-2)
				rotated = true
			}
		}
		if(rotated){
			this.rotationState++
			this.rotationState = (this.rotationState) % 4
			update()
		}
		
	}

	spawn(bool){
		if(bool == undefined){
			let x = floor(random(0, 6))
			let y = 4
			this.pieces.push(new Cell(x, y, color_I, this),
							 new Cell(x+1, y, color_I, this),
							 new Cell(x+2, y, color_I, this),
							 new Cell(x+3, y, color_I, this))
		}
		else{
			let x = 0
			let y = 0
			this.pieces.push(new Cell(x, y, color_I, this, true),
							 new Cell(x+1, y, color_I, this, true),
							 new Cell(x+2, y, color_I, this, true),
							 new Cell(x+3, y, color_I, this, true))
		}
		
	}

}

class Tetramino_J extends Tetramino{
	constructor(rotationState, bool){
		super(rotationState)
		this.pieces = []
		this.spawn(bool)
		if(!bool) tetras.push(this)
		this.type = "J"
	}

	rotate(){
		let x = this.pieces[1].pos.x 
		let y = this.pieces[1].pos.y
		let rotated = false
		if(this.rotationState == 0){
			if(y-1 < 0 || x+1 >nWidth-1 || x-1 < 0) return
			if(board[x-1][y-1] == undefined &&
			   board[x-1][y] == undefined &&
			   board[x+1][y] == undefined){
				this.pieces[0].nextPos = createVector(x-1, y-1)
				this.pieces[2].nextPos = createVector(x-1, y)
				this.pieces[3].nextPos = createVector(x+1, y)
				rotated = true
			}
		}
		else if(this.rotationState == 1){
			if(y-1 < 0 || x+1 >nWidth-1 || y+1 > 24) return
			if(board[x+1][y-1] == undefined &&
			   board[x][y-1] == undefined &&
			   board[x][y+1] == undefined){
				this.pieces[0].nextPos = createVector(x+1, y-1)
				this.pieces[2].nextPos = createVector(x, y-1)
				this.pieces[3].nextPos = createVector(x, y+1)
				rotated = true
			}
		}
		else if(this.rotationState == 2){
			if(y+1 > 24 || x+1 >nWidth-1 || x-1 < 0) return
			if(board[x+1][y+1] == undefined &&
			   board[x+1][y] == undefined &&
			   board[x-1][y] == undefined){
				this.pieces[0].nextPos = createVector(x+1, y+1)
				this.pieces[2].nextPos = createVector(x+1, y)
				this.pieces[3].nextPos = createVector(x-1, y)
				rotated = true
			}
		}
		else if(this.rotationState == 3){
			if(y-1 < 0 || x-1 < 0 || y+1 > 24) return
			if(board[x-1][y+1] == undefined &&
			   board[x][y+1] == undefined &&
			   board[x][y-1] == undefined){
				this.pieces[0].nextPos = createVector(x-1, y+1)
				this.pieces[2].nextPos = createVector(x, y+1)
				this.pieces[3].nextPos = createVector(x, y-1)
				rotated = true
			}
		}
		if(rotated){
			this.rotationState++
			this.rotationState = (this.rotationState) % 4
			update()	
		}
	}
	
	spawn(bool){
		if(bool == undefined){
			let x = floor(random(1, nWidth))
			let y = 2
			this.pieces.push(new Cell(x, y, color_J, this),
							 new Cell(x, y+1, color_J, this),
							 new Cell(x, y+2, color_J, this),
							 new Cell(x-1, y+2, color_J, this))
		}
		else{
			let x = 0
			let y = 0
			this.pieces.push(new Cell(x, y, color_J, this, true),
							 new Cell(x, y+1, color_J, this, true),
							 new Cell(x, y+2, color_J, this, true),
							 new Cell(x-1, y+2, color_J, this, true))
		}
		
	}

}

class Tetramino_L extends Tetramino{
	constructor(rotationState, bool){
		super(rotationState)
		this.pieces = []
		this.spawn(bool)
		if(!bool) tetras.push(this)
		this.type = "L"
	}

	rotate(){
		let x = this.pieces[1].pos.x 
		let y = this.pieces[1].pos.y
		let rotated = false
		if(this.rotationState == 0){
			if(y+1 > 24 || x+1 >nWidth-1 || x-1 < 0) return
			if(board[x+1][y] == undefined &&
			   board[x-1][y] == undefined &&
			   board[x-1][y+1] == undefined){
				this.pieces[0].nextPos = createVector(x+1, y)
				this.pieces[2].nextPos = createVector(x-1, y)
				this.pieces[3].nextPos = createVector(x-1, y+1)
				rotated = true
			}
		}
		else if(this.rotationState == 1){
			if(y-1 < 0 || x-1 < 0 || y+1 > 24) return
			if(board[x][y+1] == undefined &&
			   board[x][y-1] == undefined &&
			   board[x-1][y-1] == undefined){
				this.pieces[0].nextPos = createVector(x, y+1)
				this.pieces[2].nextPos = createVector(x, y-1)
				this.pieces[3].nextPos = createVector(x-1, y-1)
				rotated = true
			}
		}
		else if(this.rotationState == 2){
			if(y-1 < 0 || x+1 >nWidth-1 || x-1 < 0) return
			if(board[x-1][y] == undefined &&
			   board[x+1][y] == undefined &&
			   board[x+1][y-1] == undefined){
				this.pieces[0].nextPos = createVector(x-1, y)
				this.pieces[2].nextPos = createVector(x+1, y)
				this.pieces[3].nextPos = createVector(x+1, y-1)
				rotated = true
			}
		}
		else if(this.rotationState == 3){
			if(y-1 < 0 || x+1 >nWidth-1 || y+1 > 24) return
			if(board[x][y-1] == undefined &&
			   board[x][y+1] == undefined &&
			   board[x+1][y+1] == undefined){
				this.pieces[0].nextPos = createVector(x, y-1)
				this.pieces[2].nextPos = createVector(x, y+1)
				this.pieces[3].nextPos = createVector(x+1, y+1)
				rotated = true
			}
		}
		if(rotated){
			this.rotationState++
			this.rotationState = (this.rotationState) % 4
			update()	
		}
	}

	spawn(bool){
		if(bool == undefined){
			let x = floor(random(0,nWidth-1))
			let y = 2
			this.pieces.push(new Cell(x, y, color_L, this),
							 new Cell(x, y+1, color_L, this),
							 new Cell(x, y+2, color_L, this),
							 new Cell(x+1, y+2, color_L, this))
		}
		else{
			let x = 0
			let y = 0
			this.pieces.push(new Cell(x, y, color_L, this, true),
							 new Cell(x, y+1, color_L, this, true),
							 new Cell(x, y+2, color_L, this, true),
							 new Cell(x+1, y+2, color_L, this, true))
		}
		
	}

}

class Tetramino_O extends Tetramino{
	constructor(rotationState, bool){
		super(rotationState)
		this.pieces = []
		this.spawn(bool)
		if(!bool) tetras.push(this)
		this.type = "O"
	}

	rotate(){
		return
	}

	spawn(bool){
		if(bool == undefined){
			let x = floor(random(0,nWidth-1))
			let y = 3
			this.pieces.push(new Cell(x, y, color_O, this),
							 new Cell(x, y+1, color_O, this),
							 new Cell(x+1, y, color_O, this),
							 new Cell(x+1, y+1, color_O, this))
		}
		else{
			let x = 0
			let y = 0
			this.pieces.push(new Cell(x, y, color_O, this, true),
							 new Cell(x, y+1, color_O, this, true),
							 new Cell(x+1, y, color_O, this, true),
							 new Cell(x+1, y+1, color_O, this, true))
		}
		
	}
	
}

class Tetramino_Z extends Tetramino{
	constructor(rotationState, bool){
		super(rotationState)
		this.pieces = []
		this.spawn(bool)
		tetras.push(this)
		this.type = "Z"
	}

	rotate(){
		let x = this.pieces[2].pos.x 
		let y = this.pieces[2].pos.y
		let rotated = false

		if(this.rotationState == 0){

			if(y+1 > 24 || x+1 >nWidth-1 || y-1 < 0) return
			if(board[x+1][y-1] == undefined &&
			   board[x][y+1] == undefined){
				this.pieces[0].nextPos = createVector(x+1, y-1)
				this.pieces[1].nextPos = createVector(x+1, y)
				this.pieces[3].nextPos = createVector(x, y+1)
				rotated = true
			}
		}
		else if(this.rotationState == 1){
			if(x+1 >nWidth-1 || x-1 < 0 || y+1 > 24) return
			if(board[x+1][y+1] == undefined &&
			   board[x-1][y] == undefined){
				this.pieces[0].nextPos = createVector(x+1, y+1)
				this.pieces[1].nextPos = createVector(x, y+1)
				this.pieces[3].nextPos = createVector(x-1, y)
				rotated = true
			}
		}
		else if(this.rotationState == 2){
			if(y-1 < 0 || y+1 > 24 || x-1 < 0) return
			if(board[x][y-1] == undefined &&
			   board[x-1][y+1] == undefined){
				this.pieces[0].nextPos = createVector(x, y-1)
				this.pieces[1].nextPos = createVector(x-1, y)
				this.pieces[3].nextPos = createVector(x-1, y+1)
				rotated = true
			}
		}
		else if(this.rotationState == 3){
			if(y-1 < 0 || x+1 >nWidth-1 || x-1 < 0) return
			if(board[x+1][y] == undefined &&
			   board[x-1][y-1] == undefined){
				this.pieces[0].nextPos = createVector(x+1, y)
				this.pieces[1].nextPos = createVector(x, y-1)
				this.pieces[3].nextPos = createVector(x-1, y-1)
				rotated = true
			}
		}

		if(rotated){
			this.rotationState++
			this.rotationState = (this.rotationState) % 4
			update()	
		}
	}

	spawn(bool){
		if(bool == undefined){
			let x = floor(random(0, 8))
			let y = 3
			this.pieces.push(new Cell(x, y, color_Z, this),
							 new Cell(x+1, y, color_Z, this),
							 new Cell(x+1, y+1, color_Z, this),
							 new Cell(x+2, y+1, color_Z, this))
		}
		else{
			let x = 0
			let y = 0
			this.pieces.push(new Cell(x, y, color_Z, this, true),
							 new Cell(x+1, y, color_Z, this, true),
							 new Cell(x+1, y+1, color_Z, this, true),
							 new Cell(x+2, y+1, color_Z, this, true))
		}
		
	}
	
}

class Tetramino_S extends Tetramino{
	constructor(rotationState, bool){
		super(rotationState)
		this.pieces = []
		this.spawn(bool)
		if(!bool) tetras.push(this)
		this.type = "S"
	}

	rotate(){
		let x = this.pieces[1].pos.x 
		let y = this.pieces[1].pos.y
		let rotated = false

		if(this.rotationState == 0){
			if(y+1 > 24 || x+1 >nWidth-1 || y-1 < 0) return
			if(board[x+1][y+1] == undefined &&
			   board[x+1][y] == undefined){
				this.pieces[0].nextPos = createVector(x, y-1)
				this.pieces[2].nextPos = createVector(x+1, y)
				this.pieces[3].nextPos = createVector(x+1, y+1)
				rotated = true
			}
		}
		else if(this.rotationState == 1){
			if(x+1 >nWidth-1 || x-1 < 0 || y+1 > 24) return
			if(board[x][y+1] == undefined &&
			   board[x-1][y+1] == undefined){
				this.pieces[0].nextPos = createVector(x+1, y)
				this.pieces[2].nextPos = createVector(x, y+1)
				this.pieces[3].nextPos = createVector(x-1, y+1)
				rotated = true
			}
		}
		else if(this.rotationState == 2){
			if(y-1 < 0 || y+1 > 24 || x-1 < 0) return
			if(board[x-1][y] == undefined &&
			   board[x-1][y-1] == undefined){
				this.pieces[0].nextPos = createVector(x, y+1)
				this.pieces[2].nextPos = createVector(x-1, y)
				this.pieces[3].nextPos = createVector(x-1, y-1)
				rotated = true
			}
		}
		else if(this.rotationState == 3){
			if(y-1 < 0 || x+1 >nWidth-1 || x-1 < 0) return
			if(board[x][y-1] == undefined &&
			   board[x+1][y-1] == undefined){
				this.pieces[0].nextPos = createVector(x-1, y)
				this.pieces[2].nextPos = createVector(x, y-1)
				this.pieces[3].nextPos = createVector(x+1, y-1)
				rotated = true
			}
		}

		if(rotated){
			this.rotationState++
			this.rotationState = (this.rotationState) % 4
			update()	
		}
	}

	spawn(bool){
		if(bool == undefined){
			let x = floor(random(0, 8))
			let y = 3
			this.pieces.push(new Cell(x, y+1, color_S, this),
							 new Cell(x+1, y+1, color_S, this),
							 new Cell(x+1, y, color_S, this),
							 new Cell(x+2, y, color_S, this))
		}
		else{
			let x = 0
			let y = 0
			this.pieces.push(new Cell(x, y+1, color_S, this, true),
							 new Cell(x+1, y+1, color_S, this, true),
							 new Cell(x+1, y, color_S, this, true),
							 new Cell(x+2, y, color_S, this, true))
		}
		
	}
	
}

class Tetramino_T extends Tetramino{
	constructor(rotationState, bool){
		super(rotationState)
		this.pieces = []
		this.spawn(bool)
		if(!bool) tetras.push(this)
		this.type = "T"
	}

	rotate(){
		let x = this.pieces[1].pos.x 
		let y = this.pieces[1].pos.y
		let rotated = false

		if(this.rotationState == 0){
			if(y+1 > 24 || x-1 < 0 || y-1 < 0) return
			if(board[x][y-1] == undefined){
				this.pieces[0].nextPos = createVector(x, y-1)
				this.pieces[2].nextPos = createVector(x, y+1)
				this.pieces[3].nextPos = createVector(x-1, y)
				rotated = true
			}
		}
		else if(this.rotationState == 1){
			if(x+1 >nWidth-1 || x-1 < 0 || y-1 < 0) return
			if(board[x+1][y] == undefined){
				this.pieces[0].nextPos = createVector(x+1, y)
				this.pieces[2].nextPos = createVector(x, y-1)
				this.pieces[3].nextPos = createVector(x-1, y)
				rotated = true
			}
		}
		else if(this.rotationState == 2){
			if(y-1 < 0 || y+1 > 24 || x+1 >nWidth-1) return
			if(board[x][y+1] == undefined){
				this.pieces[0].nextPos = createVector(x, y+1)
				this.pieces[2].nextPos = createVector(x+1, y)
				this.pieces[3].nextPos = createVector(x, y-1)
				rotated = true
			}
		}
		else if(this.rotationState == 3){
			if(y+1 > 24 || x+1 >nWidth-1 || x-1 < 0) return
			if(board[x-1][y] == undefined){
				this.pieces[0].nextPos = createVector(x-1, y)
				this.pieces[2].nextPos = createVector(x, y+1)
				this.pieces[3].nextPos = createVector(x+1, y)
				rotated = true
			}
		}

		if(rotated){
			this.rotationState++
			this.rotationState = (this.rotationState) % 4
			update()	
		}
	}

	spawn(bool){
		if(bool == undefined){
			let x = floor(random(0, 8))
			let y = 3
			this.pieces.push(new Cell(x, y, color_T, this),
							 new Cell(x+1, y, color_T, this),
							 new Cell(x+2, y, color_T, this),
							 new Cell(x+1, y+1, color_T, this))
		}
		else{
			let x = 0
			let y = 0
			this.pieces.push(new Cell(x, y, color_T, this, true),
							 new Cell(x+1, y, color_T, this, true),
							 new Cell(x+2, y, color_T, this, true),
							 new Cell(x+1, y+1, color_T, this, true))
		}
		
	}

}

