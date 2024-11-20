class nodo{

	constructor(type){
		this.pos = createVector(0,0)
		this.val = false
		this.connected = []
		this.type = type
		this.compsConnected = []
	}

	toggle_val(){
		this.val = !this.val
	}

	dupe(){
		let newNodo = new nodo(this.type)
		let newPos = this.pos.copy()
		newNodo.pos = newPos
		let newConnected = []
		for(let i = 0; i < this.connected.length; i++){
			let newConnectedNodo = this.connected[i].dupe()
			newConnected.push(newConnectedNodo)
		}
		newNodo.connected = newConnected
		newNodo.connected = this.connected.slice()
		return newNodo
	}

	show(col, isEdge){
		push()
		if(!isEdge){
			//if(this.type == 'input'){
				for(let c of this.connected){
					stroke(255)
					if(c.val) stroke(0)
					strokeWeight(7)
					line(this.pos.x, this.pos.y, c.pos.x, c.pos.y)
				}
			//}
			
			stroke(col)
			strokeWeight(4)
			fill(255)
			ellipse(this.pos.x, this.pos.y, 25)
			noStroke()
			fill(0)
			if(this.val) ellipse(this.pos.x, this.pos.y, 15)
		}
		else{
			//if(this.type == 'input'){
				for(let c of this.connected){

					stroke(255)
					if(c.val) stroke(0)
					strokeWeight(7)
					line(this.pos.x, this.pos.y, c.pos.x, c.pos.y)
				}
			//}
			strokeWeight(4)
			noStroke()
			fill(255)
			ellipse(this.pos.x, this.pos.y, 60)
			noStroke()
			fill(0)
			if(this.val) ellipse(this.pos.x, this.pos.y, 50)
		}
		pop()
	}
}