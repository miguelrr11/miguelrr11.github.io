class component{

	constructor(type, n_in, n_out, isEdge, dir){
		this.type = type
		if(isEdge){ 
			this.dir = dir
			this.isEdge = true
		}

		if(n_in != undefined) this.n_in = n_in
		else{
			if(type == 'AND' || type == 'OR') this.n_in = 2
			else this.n_in = 1
		} 
		if(n_out != undefined) this.n_out = n_out
		else this.n_out = 1

		this.inputs = []
		this.outputs = []

		this.pos = createVector(WIDTH/2, HEIGHT/2)

		this.color = color(random(0, 255), random(0, 255), random(0, 255))
		if(this.type == 'OR') this.color = color(51, 167, 255)
		else if(this.type == 'AND') this.color = color(255, 219, 51)
		else if(this.type == 'NOT') this.color = color(255, 74, 127)

		this.init_nodos(this.n_in, this.n_out)
		
		this.width = 100
		this.height = 35*this.n_in+5

		this.update_pos_nodos()
	}

	dupe(){
		let newPos = this.pos.copy()
		let newInputs = []
		for(let i = 0; i < this.n_in; i++){
			let newInput = this.inputs[i].dupe()
			newInputs.push(newInput)
		}
		let newOutputs = []
		for(let i = 0; i < this.n_out; i++){
			let newOutput = this.outputs[i].dupe()
			newOutputs.push(newOutput)
		}
		let newComp = new component(this.type, this.n_in, this.n_out)
		newComp.pos = newPos
		newComp.inputs = newInputs
		newComp.outputs = newOutputs
		newComp.color = this.color
		newComp.dir = this.dir
		newComp.isEdge = this.isEdge
		newComp.update_pos_nodos()
		return newComp
	}

	dupeC(){
		let newPos = this.pos.copy()
		let newInputs = []
		for(let i = 0; i < this.n_in; i++){
			let newInput = this.inputs[i].dupe()
			newInputs.push(newInput)
		}
		let newOutputs = []
		for(let i = 0; i < this.n_out; i++){
			let newOutput = this.outputs[i].dupe()
			newOutputs.push(newOutput)
		}
		let newComp = new component(this.type, this.n_in, this.n_out)
		newComp.pos = newPos
		newComp.inputs = newInputs
		newComp.outputs = newOutputs
		newComp.color = this.color
		newComp.dir = this.dir
		newComp.isEdge = this.isEdge
		newComp.update_pos_nodos()
		comps.push(newComp)
	}

	reset_inputs(){
		for(let i = 0; i < this.n_in; i++) this.inputs.push(new nodo('input'))
	}

	reset_outputs(){
		for(let i = 0; i < this.n_out; i++) this.outputs.push(new nodo('output'))
	}

	init_nodos(x, y){
		for(let i = 0; i < x; i++) this.inputs.push(new nodo('input'))
		for(let i = 0; i < y; i++) this.outputs.push(new nodo('output'))
	}

	eliminarConexion(nodoAborrar){
		for(let i = 0; i < this.inputs.length; i++){
			for(let j = 0; j < this.inputs[i].connected.length; j++){
				if(this.inputs[i].connected[j] == nodoAborrar){ 
					this.inputs[i].connected.splice(j, 1)
				}
			}
		}
	}

	//grita que le refactoricen
	click_nodo(x, y, unir, unido){
		let bool = false
		let rad = 15
		if(this.dir) rad = 30
		if(!unir && !unido){
			for(let i = 0; i < this.n_in; i++){
				if(this.inputs[i].connected.length == 0 && dist(x, y, this.inputs[i].pos.x, this.inputs[i].pos.y) < rad){ 
					this.inputs[i].toggle_val()
				}
				else if(dist(x, y, this.inputs[i].pos.x, this.inputs[i].pos.y) < rad){
					this.inputs[i].connected = []
				}
			}
			if(this.dir == 'input'){
				for(let i = 0; i < this.n_out; i++){
					if(this.outputs[i].connected.length == 0 && dist(x, y, this.outputs[i].pos.x, this.outputs[i].pos.y) < rad){ 
						this.outputs[i].toggle_val()
					}
					else if(dist(x, y, this.outputs[i].pos.x, this.outputs[i].pos.y) < rad){
						this.outputs[i].connected = []
					}
				}
			}
			
			return bool
		}
		//sacar conexion de nodo output
		else if(unir && !unido){
			for(let i = 0; i < this.n_out; i++){
				if(dist(x, y, this.outputs[i].pos.x, this.outputs[i].pos.y) < rad){ 
					return this.outputs[i]
				}
			}
		}
		//completar conexion a nodo input
		else if(!unir && unido){
			for(let i = 0; i < this.n_in; i++){
				if(dist(x, y, this.inputs[i].pos.x, this.inputs[i].pos.y) < rad){
					return this.inputs[i]
				}
			}
		}
		return undefined
		
	}

	click_comp(x, y){
		let bool = false
		let x1 = this.pos.x   
		let y1 = this.pos.y 
		let x2 = this.pos.x + this.width  
		let y2 = this.pos.y + this.height
		if(x1 <= x && x <= x2 && y1 <= y && y <= y2 && !moviendo){
			moviendo = this
		}
		if(moviendo == this && mouseIsPressed){
			this.pos.x = x - this.width/2
			this.pos.y = y - this.height/2 
			this.update_pos_nodos()
			bool = true
		}
		return bool
	}

	update_pos_nodos(){
		if(this.isEdge){
			let n
			if(this.dir == 'input') n = this.n_out
			else n = this.n_in
			let distn = (((n) * 90))/2.3
			distn = (HEIGHT/2) - distn

			for(let i = 0; i < this.n_in; i++){
				if(this.dir == "output") this.inputs[i].pos.x = WIDTH
				this.inputs[i].pos.y = distn + (i*90)
			}
			for(let i = 0; i < this.n_out; i++){
				if(this.dir == "input") this.outputs[i].pos.x = 0
				this.outputs[i].pos.y = distn + (i*90)
			}
		}
		else{
			for(let i = 0; i < this.n_in; i++){
				let aux = this.height/(this.n_in+1)
				this.inputs[i].pos.x = this.pos.x
				this.inputs[i].pos.y = this.pos.y+aux*(i+1)
			}
			for(let i = 0; i < this.n_out; i++){
				let aux = this.height/(this.n_out+1)
				this.outputs[i].pos.x = this.pos.x + this.width
				this.outputs[i].pos.y = this.pos.y+aux*(i+1)
			}
		}
		
	}

	setValueOutputs(val){
		for(let o of this.outputs){
			o.val = val
		}
	}

	update_val(){
		if(this.type == 'OR') this.setValueOutputs(this.inputs[0].val || this.inputs[1].val)
		else if(this.type == 'AND') this.setValueOutputs(this.inputs[0].val && this.inputs[1].val)
		else if(this.type == 'NOT') this.setValueOutputs(!this.inputs[0].val)
		else if(this.type == 'BRIDGE'){ 
			for(let i = 0; i < this.n_in; i++){
				this.outputs[i].val = this.inputs[i].val
			}
		}

		//propagar valor
		for(let i = 0; i < this.n_in; i++){
			if(this.inputs[i].connected.length > 0){
				this.inputs[i].val = this.inputs[i].connected[0].val
			}
		}
	}


	show(){
		if(this.isEdge){
			if(this.dir == "input") for(let i of this.outputs) i.show(0, true)
			else for(let o of this.inputs) o.show(0, true)
		}
		else{
			push()
			fill(this.color)
			noStroke()
			textAlign(CENTER)
			rect(this.pos.x, this.pos.y, this.width, this.height, 10, 10)
			fill(0)
			textFont('Courier')
			textSize(25)
			text(this.type, this.pos.x + this.width/2, this.pos.y+(this.height/2)+5)
			let offset = (50)/this.n_in
			pop()
	     
			for(let i of this.inputs) i.show(this.color)
			for(let o of this.outputs) o.show(this.color)
		}
		
	}

}

