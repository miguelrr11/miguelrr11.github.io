// 5--4--4--5

class nn{
	constructor(){
		this.input = []
		this.output = []
		this.Ninput = 5
		this.Noutput = 1
	}

	init(){
		for(let i = 0; i < this.Ninput; i++){
			let n = new neuron()
			n.generateRandomWeights(this.Noutput)
			this.input.push(n)
		}
		let n = new neuron()
		n.generateRandomBias(this.Noutput)
		this.output.push(n)
		
	}

	execute(b){
		this.updateInput(b)
		this.updateOutput()
		return this.decideOutput()
	}

	/*
	Input layer
	- altura bird
	- vel bird
	- pos_x entrada respectivo con bird
	- pos_y entrada respectivo con bird
	- altura entrada entre tubos
	*/
	updateInput(b){
		this.input[0].value = b.pos 
		this.input[1].value = b.speed
		this.input[2].value = nextPipe.x - bird_x
		this.input[3].value = nextPipe.y - b.pos
		this.input[4].value = altura_entry
	}

	updateOutput(){
		for(let i = 0; i < this.Noutput; i++){
			let o = this.output[i]
			let prod_sum = this.prodSum(this.input, i)
			prod_sum += o.bias
			prod_sum = this.relu(prod_sum)
			o.value = prod_sum
		}
	}

	prodSum(arr, index){
		let res = 0
		for(let i = 0; i < arr.length; i++){
			res += arr[i].weights[index] * arr[i].value
		}
		return res
	}

	relu(x){
		if(x < 0) return 0
		return x
	}
	
	//false -> doesnt fly
	//true -> flies
	decideOutput(){
		if(this.output[0].value == 0) return false
		return true
	}

	//Cruzar dos neural networks
	cruzarNN(n1, n2){
		let resNN = new nn()
		resNN.init()
		for(let i = 0; i < this.Ninput; i++){
			resNN.input[i] = this.cruzarN(n1.input[i], n2.input[i], this.Noutput)
		}
		this.cruzarN(n1.output[0], n2.output[0])
		//mutacion::::
		if(random() < mutFactor){
			if(random() < 0.8){
				resNN.input[floor(random(0, this.Ninput))].weights[0] = random(-1, 1)
			}
			else resNN.output[0].bias = random(-0.1, 0.1)
		}
		return resNN
	}

	//Cruzar dos neuronas
	cruzarN(n1, n2, len){
		let n = new neuron()
		n.generateRandomWeights(len)
		for(let i = 0; i < len; i++){
			if(random() < 0.5) n.weights[i] = n1.weights[i]
			else n.weights[i] = n2.weights[i]
			if(random() < 0.5) n.bias = n1.bias
			else n.bias = n2.bias
		}
		return n
	}

}














