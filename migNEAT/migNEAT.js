const TIME_STEP = 0.1
const REST_DISTANCE = 100

let G, R, W

class Neuron{
    constructor(bias, activation, id, isInput = false, isOutput = false){
        this.bias = bias
        this.activation = activation
        this.id = id
        this.value = 0
        this.isInput = isInput
        this.isOutput = isOutput
    }
}

class Connection{
    constructor(from, to, weight){
        this.from = from
        this.to = to
        this.weight = weight
    }
}

class NN{
    constructor(n_in, n_out, func_hidden, func_out, softmax = true){
        G = color(17, 242, 103)
        R = color(242, 17, 58)
        W = color(242, 229, 203)
        this.inputs = []
        this.outputs = []
        this.hidden = []
        this.connections = []
        this.particles = []
        this.constraints = []
        this.idCounter = 0
        this.func_hidden = func_hidden
        this.func_out = func_out
        this.softmax = softmax
        this.fitness = 0
        this.initNN(n_in, n_out)
        this.initViz()
    }

    // conecta n_in con n_out (solo UN output)
    initNN(n_in, n_out){
        //input layer
        for(let i = 0; i < n_in; i++){ 
            let neuron = new Neuron(0, (value, bias) => {return value}, this.idCounter, true)
            this.inputs.push(neuron)
            this.idCounter++
        }
        //output layer
        for(let i = 0; i < n_out; i++){ 
            let neuron = new Neuron(getSmallBias(), this.func_out, this.idCounter, false, true)
            this.outputs.push(neuron)
            this.idCounter++
        }
        //connections should be the 10-20% of all possible connections
        let connectionMade = false;
        for (let inp of this.inputs) {
            for (let out of this.outputs) {
                if (Math.random() < 0.15) {
                    this.connections.push(new Connection(inp.id, out.id, random(-1, 1)));
                    connectionMade = true
                }
            }
        }
        if(!connectionMade){
            let randomInput = this.inputs[Math.floor(Math.random() * this.inputs.length)];
            let randomOutput = this.outputs[Math.floor(Math.random() * this.outputs.length)];
            this.connections.push(new Connection(randomInput.id, randomOutput.id, random(-1, 1)));
        }
    }
//map(Math.random(), 0, 1, -0.01, 0.01)


    initViz() {
    	this.particles = []
        this.constraints = []

        let multIn = HEIGHT/  this.inputs.length
        let multOffIn = multIn / 2

        let multOut = HEIGHT/  this.outputs.length
        let multOffOut = multOut / 2

        let off = 50
		for(let i = 0; i < this.inputs.length; i++){
			this.particles.push(new Particle(off, i * multIn + multOffIn, true, this.inputs[i].id))
		}
		for(let i = 0; i < this.outputs.length; i++){
			this.particles.push(new Particle(WIDTH - off, i * multOut + multOffOut, true, this.outputs[i].id))
		}
		for(let i = 0; i < this.hidden.length; i++){
			this.particles.push(new Particle(HEIGHT / 2, WIDTH / 2, false, this.hidden[i].id))
		}

		let neuronMap = this.getNeuronMap()
        let particleMap = this.getParticleMap()

		for(let conn of this.connections){
	        let from = neuronMap.get(conn.from)
	        let to = neuronMap.get(conn.to)
	        this.constraints.push(new Constraint(particleMap.get(from.id), particleMap.get(to.id)))
		}
	}

    update() {
        //debug
        //for (let inp of this.inputs) inp.value = random();

        let orderedList = this.getOrderedNeurons([...this.inputs, ...this.outputs, ...this.hidden]);
        let neuronMap = new Map([...this.inputs, ...this.outputs, ...this.hidden].map(neuron => [neuron.id, neuron]));

        for (let neuronId of orderedList) {
            let neuron = neuronMap.get(neuronId);

            if (!this.inputs.includes(neuron)) {
                let incomingConnections = this.connections.filter(conn => conn.to === neuron.id);
                let sum = 0;
                for (let conn of incomingConnections) {
                    let fromNeuron = neuronMap.get(conn.from);
                    sum += fromNeuron.value * conn.weight;
                }
                neuron.value = neuron.activation(sum, neuron.bias);
            }
        }

        // Apply Softmax to output neurons
        // Ignores unconnected outputs  
        if(this.softmax){ 
            let connectedOutputs = this.outputs.filter(output => 
                this.connections.some(conn => conn.to === output.id)
            );
            this.applySoftmax(connectedOutputs);
        }
    }

    //returns the index of the output with largest value
    getOutput() {
	    return this.outputs.reduce((maxIndex, out, i) => out.value > this.outputs[maxIndex].value ? i : maxIndex, 0);
	}


    applySoftmax(arr = this.outputs) {
        const values = arr.map(obj => obj.value);
        const maxValue = Math.max(...values); // For numerical stability
        const expValues = values.map(value => Math.exp(value - maxValue));
        const sumExpValues = expValues.reduce((a, b) => a + b, 0);
        const softmaxValues = expValues.map(value => value / sumExpValues);

        arr.forEach((obj, index) => {
            obj.value = softmaxValues[index];
        });
    }

    createRandomHidden(){
    	let hidden = new Neuron(getSmallBias(),  this.func_hidden, this.idCounter++)
    	this.hidden.push(hidden)

    	let neuronMap = this.getNeuronMap()
        let particleMap = this.getParticleMap()

    	let index = Math.floor(Math.random() * this.connections.length)
    	let conn = this.connections[index]
    	let fromNeuron = neuronMap.get(conn.from)
    	let toNeuron = neuronMap.get(conn.to)

        let fromPart = particleMap.get(fromNeuron.id)
        let toPart = particleMap.get(toNeuron.id)

        let x = (fromPart.pos.x + toPart.pos.x) * 0.5
        let y = (fromPart.pos.y + toPart.pos.y) * 0.5
        let ds = dist(fromPart.pos.x, fromPart.pos.y, x, y)

        let particle = new Particle(x, y, false, hidden.id)
        this.particles.push(particle)

        //nuevas conexiones con weight = 1
    	this.connections.push(new Connection(fromNeuron.id, hidden.id, 1))
    	this.connections.push(new Connection(hidden.id, toNeuron.id, 1))

        this.constraints.push(new Constraint(fromPart, particle, ds))
        this.constraints.push(new Constraint(particle, toPart, ds))

    	this.connections.splice(index, 1)
        index = this.constraints.findIndex(cons => cons.p1 == fromPart && cons.p2 == toPart)
        this.constraints.splice(index, 1)
        //this.constraints.filter(cons => cons.p1 != fromPart && cons.p2 != toPart)
		//this.initViz()
    }

	createRandomConnection() {
	    let possibleConnections = [];
	    let orderedNeurons = this.getOrderedNeurons()
        let particleMap = this.getParticleMap()

	    this.inputs.concat(this.hidden).forEach(fromNeuron => {
	        this.hidden.concat(this.outputs).forEach(toNeuron => {
	            if (fromNeuron.id !== toNeuron.id && this.isOrdered(orderedNeurons, fromNeuron.id, toNeuron.id)) {
	                possibleConnections.push({ from: fromNeuron.id, to: toNeuron.id });
	            }
	        });
	    });

	    possibleConnections = possibleConnections.filter(connection => {
	        return !this.connections.some(
	            existingConnection => 
	                existingConnection.from === connection.from && existingConnection.to === connection.to
	        );
	    });

	    if (possibleConnections.length === 0) {
	        console.log("No possible new connections available.");
	        return;
	    }

	    const index = Math.floor(Math.random() * possibleConnections.length);
	    const newConnection = possibleConnections[index];

	    this.connections.push(new Connection(newConnection.from, newConnection.to, random(-1,1)));

        let fromPart = particleMap.get(possibleConnections[index].from)
        let toPart = particleMap.get(possibleConnections[index].to)
        this.constraints.push(new Constraint(fromPart, toPart))
	}

    setInputs(inputs){
        if(inputs.length != this.inputs.length){
            console.log("inputs size doesnt match NN")
            return
        }
        this.inputs.forEach((inp, index) => {
            inp.value = inputs[index];
        });
    }


    show(){
    	let neurons = this.getNeuronMap()
    	let particles = this.getParticleMap()
    	for(let p of this.particles){
    		//p.applyForce(createVector(0, 10))
    		//p.repel(this.particles, 100)
            p.applyForce(createVector(cos(noise(p.pos.x, p.pos.y, frameCount)) * 10, sin(noise(p.pos.x, p.pos.y, frameCount)) * 10 ))
    		p.update(TIME_STEP)
	        p.constrainToBounds()
    	}
    	for(let i = 0; i < 5; i++){
	        for(let c of this.constraints) c.satisfy()
	    }
		push()
	    stroke(255, 100)
	    for(let c of this.constraints){
	    	let from = neurons.get(c.p1.id)
	    	let to = neurons.get(c.p2.id)
	    	let conn = this.connections.find(conn => conn.from == from.id && conn.to == to.id)
	        c.show(conn.weight)
	    }
	    //p.show(round(neurons.get(p.id).value, 1))
	    let largestOutput = this.outputs[this.getOutput()]
	    for(let p of this.particles){ 
	    	let neuron = neurons.get(p.id)
	    	let out = neuron.isOutput ? (largestOutput.id == p.id ? true : false) : false
	    	p.show(round(neuron.value, 1), out)
	    }
	    pop()
    }

    getOrderedNeurons(neurons = [...this.inputs, ...this.outputs, ...this.hidden]){
        let adjacencyList = new Map()
        let inDegree = new Map()

        for (let neuron of neurons) {
            adjacencyList.set(neuron.id, [])
            inDegree.set(neuron.id, 0)
        }

        for (let connection of this.connections) {
            adjacencyList.get(connection.from).push(connection.to)
            inDegree.set(connection.to, inDegree.get(connection.to) + 1)
        }

        let executionOrder = []
        let queue = []

        for (let [neuronId, degree] of inDegree.entries()) {
            if (degree === 0) {
                queue.push(neuronId)
            }
        }

        while (queue.length > 0) {
            let current = queue.shift()
            executionOrder.push(current)

            for (let neighbor of adjacencyList.get(current)) {
                inDegree.set(neighbor, inDegree.get(neighbor) - 1)
                if (inDegree.get(neighbor) === 0) {
                    queue.push(neighbor)
                }
            }
        }

        if (executionOrder.length !== neurons.length) {
        	console.log("cycle")
            //throw new Error("The neural network has a cycle and cannot be executed in topological order.")
        }

        return executionOrder
    }

    activationFunction(x) {
        // Using a sigmoid activation function
        return 1 / (1 + Math.exp(-x))
    }

    getNeuronMap(){
    	let neuronMap = new Map()
    	for (let neuron of [...this.inputs, ...this.outputs, ...this.hidden]) {
            neuronMap.set(neuron.id, neuron)
        }
        return neuronMap
    }

    getParticleMap(){
    	let particleMap = new Map()
    	for(let particle of this.particles){
        	particleMap.set(particle.id, particle)
        }
        return particleMap
    }

    isOrdered(ordered, from, to){
    	for(let o of ordered){
    		if(o == to) return false
    		else if(o == from) return true
    	}
    }
}

class Population{
    constructor(size, n_in, n_out, func_hidden, func_out, softmax = true){
        this.NNs = []
        this.initNNs(size, n_in, n_out, func_hidden, func_out, softmax = true)
        this.selectedNN = this.NNs[Math.floor(Math.random() * size)]
    }

    selectRandomNN(){
        this.selectedNN = this.NNs[Math.floor(Math.random() * this.NNs.length)]
    }

    initNNs(size, n_in, n_out, func_hidden, func_out, softmax = true){
        for(let i = 0; i < size; i++){
            this.NNs.push(new NN(n_in, n_out, 
                func_hidden, func_out, softmax
                )
            )
        }
    }

    update(){
        for(let nn of this.NNs) nn.update()
    }

    show(){
        this.selectedNN.show()
    }
}

function getRandomElement(arr) {
 	return arr[Math.floor(Math.random() * arr.length)];
}

function getSmallBias(){
    return Math.random() * 0.01
}
