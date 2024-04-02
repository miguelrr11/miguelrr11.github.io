// 5--4--4--5

class nn{
	constructor(){
		this.input = []
		this.hidden1 = []
		this.hidden2 = []
		this.output = []
		this.Ninput = 19
		this.Nhidden1 = 15
		this.Nhidden2 = 10
		this.Noutput = 3
	}

	init(){
		for(let i = 0; i < this.Ninput; i++){
			let n = new neuron()
			n.generateRandomWeights(this.Nhidden1)
			this.input.push(n)
		}
		for(let i = 0; i < this.Nhidden1; i++){
			let n = new neuron()
			n.generateRandomWeights(this.Nhidden2)
			n.generateRandomBias()
			this.hidden1.push(n)
		}
		for(let i = 0; i < this.Nhidden2; i++){
			let n = new neuron()
			n.generateRandomWeights(this.Noutput)
			n.generateRandomBias()
			this.hidden2.push(n)
		}
		for(let i = 0; i < this.Noutput; i++){
			this.output.push(new neuron())
		}
	}

	
	updateInput(s){
		for(let i = 0; i < 8; i++){
			this.input[i].value = s.detectFood[i]
		}
		for(let i = 8; i < 11; i++){
			this.input[i].value = s.detectColl[i-8]
		}
		for(let i = 11; i < 15; i++){
			this.input[i].value = s.detectSpeed[i-11]
		}
		for(let i = 15; i < 19; i++){
			this.input[i].value = s.detectFoodAux[i-15]
		}
		
	}

	updateHidden(){
		for(let i = 0; i < this.Nhidden1; i++){
			let h = this.hidden1[i]
			let prod_sum_input = this.prodSum(this.input, i)
			prod_sum_input += h.bias
			prod_sum_input = this.sigmoid(prod_sum_input)
			h.value = prod_sum_input
		}
		for(let i = 0; i < this.Nhidden2; i++){
			let h = this.hidden2[i]
			let prod_sum_input = this.prodSum(this.hidden1, i)
			prod_sum_input += h.bias
			prod_sum_input = this.sigmoid(prod_sum_input)
			h.value = prod_sum_input
		}
	}

	
	updateOutput(){
		for(let i = 0; i < this.Noutput; i++){
			let o = this.output[i]
			let prod_sum_hidden = this.prodSum(this.hidden2, i)
			prod_sum_hidden = this.sigmoid(prod_sum_hidden)
			o.value = prod_sum_hidden
		}
	}


	prodSum(arr, index){
		let res = 0
		for(let i = 0; i < arr.length; i++){
			res += arr[i].weights[index] * arr[i].value
		}
		return res
	}

	sigmoid(x){
		return 1.0 / (1.0 + exp(-x))
	}
	
	decideOutput(){
		let max = 0
		let res = 0
		for(let i = 0; i < this.Noutput; i++){
			if(this.output[i].value > max){
				max = this.output[i].value
				res = i
			}
		}
		return res
	}

	//Cruzar dos neural networks
	cruzarNN(n1, n2){
		let resNN = new nn()
		resNN.init()
		for(let i = 0; i < this.Ninput; i++){
			resNN.input[i] = this.cruzarN(n1.input[i], n2.input[i], this.Nhidden1)
		}
		for(let i = 0; i < this.Nhidden; i++){
			resNN.hidden1[i] = this.cruzarN(n1.hidden1[i], n2.hidden1[i], this.Nhidden2)
		}
		for(let i = 0; i < this.Nhidden; i++){
			resNN.hidden2[i] = this.cruzarN(n1.hidden2[i], n2.hidden2[i], this.Noutput)
		}
		//let i = random()
		// if(i < 0.33) resNN.input[floor(random(0, this.Ninput))].weights[floor(random(0, this.Nhidden1))] = random(-1, 1)
		// else if(i < 0.66) resNN.hidden1[floor(random(0, this.Nhidden1))].weights[floor(random(0, this.Nhidden2))] = random(-1, 1)
		// else resNN.hidden2[floor(random(0, this.Nhidden2))].weights[floor(random(0, this.Noutput))] = random(-1, 1)
		// while(random() < mutFactor){
		// 	let i = random()
		// 	if(i < 0.33) resNN.input[floor(random(0, this.Ninput))].weights[floor(random(0, this.Nhidden1))] = random(-1, 1)
		// 	else if(i < 0.66) resNN.hidden1[floor(random(0, this.Nhidden1))].weights[floor(random(0, this.Nhidden2))] = random(-1, 1)
		// 	else resNN.hidden2[floor(random(0, this.Nhidden2))].weights[floor(random(0, this.Noutput))] = random(-1, 1)
		// }
		return resNN
	}

	//Cruzar dos neuronas
	cruzarN(n1, n2, len){
		let n = new neuron()
		n.generateRandomWeights(len)
		n.generateRandomBias()
		for(let i = 0; i < len; i++){
			// n.weights[i] = (n1.weights[i] + n2.weights[i])/2
			// n.bias = (n1.bias + n2.bias)/2

			if(random() < 0.5) n.weights[i] = n1.weights[i]
			else n.weights[i] = n2.weights[i]
			if(random() < 0.5) n.bias = n1.bias
			else n.bias = n2.bias
		}
		// if(random() < mutFactor){
		// 	n.weights[floor(random(0, len))] = random(-1, 1)
		// }
		return n
	}

}














