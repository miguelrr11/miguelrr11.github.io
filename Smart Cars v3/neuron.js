class neuron{
	constructor(){
		this.value = 0
		this.weights = []
		this.bias = 0
	}

	generateRandomWeights(len){
		for(let i = 0; i < len; i++){
			this.weights[i] = random(-1, 1)
		}
	}

	generateRandomBias(){
		this.bias = random(-0.1, 0.1)
	}


}