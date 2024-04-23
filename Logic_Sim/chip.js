class chip extends component{

	constructor(type, components, inputs, outputs){
		super(type)
		this.components = components
		this.inputs = inputs
		this.outputs = outputs 
		this.n_in = inputs.length
		this.n_out = outputs.length
		this.width = 100
		let n
		if(this.n_in >= this.n_out) n = this.n_in  
		else n = this.n_out
		this.height = 35*n+5
	}

	// AAAAAAAAAAAAAAHHHHHHHHHHHHHHHAJLSGDFCLKUB AVETYOPIAEUSZUYW
	dupe(){
		let newComps = []
		for(let i = 0; i < this.components.length; i++){
			let newComp = this.components[i].dupe()
			newComps.push(newComp)
		}
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
		let newChip = new chip(this.type, newComps, newInputs, newOutputs)
		newChip.inputs = newInputs
		newChip.outputs = newOutputs
		newChip.components = newComps
		newChip.pos = this.pos.copy()
		newChip.color = this.color
		return newChip
	}


	update_val(){
		for(let c of this.components){
			c.update_val()
			//c.show()
		}

	}
}