const TIME_STEP = 0.1
const REST_DISTANCE = 100

let G, R, W

class Neuron{
    constructor(activation = undefined, id = -1, bias = 0, isInput = false, isOutput = false){
        this.activation = activation
        this.id = id
        this.bias = bias
        this.value = 0
        this.isInput = isInput
        this.isOutput = isOutput
    }
}

class Connection{
    constructor(from, to, weight = 0, enabled = true){
        this.from = from
        this.to = to
        this.weight = weight
        this.enabled = enabled
        this.innovationNumber = -1
    }
}

class NN{
    constructor(n_in, n_out, func_hidden, func_out, population, softmax = true, x = 0, y = 0, w = width, h = height){
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
        this.population = population
        this.initConnChance = 0.5

        this.x = x
        this.y = y
        this.w = w
        this.h = h

        this.id

        this.fitness = 0
        this.species = undefined

        this.initNN(n_in, n_out)
        this.initViz()
    }

    initNN(n_in, n_out){
        //input layer - no bias
        for(let i = 0; i < n_in ; i++){ 
            let neuron = new Neuron((value) => {return value}, this.idCounter, 0, true)
            this.inputs.push(neuron)
            this.idCounter++
        }
        //bias input
        let neuron = new Neuron((value) => {return value}, this.idCounter, 0, true)
        neuron.value = 1
        //neuron.value = 0
        this.inputs.push(neuron)
        this.idCounter++
        //output layer - bias
        for(let i = 0; i < n_out; i++){ 
            let neuron = new Neuron(this.func_out, this.idCounter, getSmallBias(), false, true)
            this.outputs.push(neuron)
            this.idCounter++
        }
        //connections should be the 10-20% of all possible connections
        let connectionMade = false;
        for (let inp of this.inputs) {
            for (let out of this.outputs) {
                if (Math.random() < this.initConnChance) {
                    let conn = new Connection(inp.id, out.id, getSmallBias())
                    conn.innovationNumber = this.population.getInnovationNumber(conn)
                    this.connections.push(conn);

                    connectionMade = true
                }
            }
        }
        if(!connectionMade){
            let randomInput = this.inputs[Math.floor(Math.random() * this.inputs.length)];
            let randomOutput = this.outputs[Math.floor(Math.random() * this.outputs.length)];
            let conn = new Connection(randomInput.id, randomOutput.id, getSmallBias())
            conn.innovationNumber = this.population.getInnovationNumber(conn)
            this.connections.push(conn);
        }
    }

    initViz() {
        this.particles = []
        this.constraints = []

        let multIn = this.h / this.inputs.length
        let multOffIn = multIn / 2 + this.y

        let multOut = this.h / this.outputs.length
        let multOffOut = multOut / 2 + this.y

        let off = 50 
        for(let i = 0; i < this.inputs.length; i++){
            this.particles.push(new ParticleNEAT(off + this.x, i * multIn + multOffIn, true, this.inputs[i].id))
        }
        for(let i = 0; i < this.outputs.length; i++){
            this.particles.push(new ParticleNEAT(this.w - off + this.x, i * multOut + multOffOut, true, this.outputs[i].id))
        }
        for(let h of this.hidden){
            let particle = new ParticleNEAT(random(this.x + this.w), random(this.y + this.h), false, h.id)
            this.particles.push(particle)
        }

        let neuronMap = this.getNeuronMap()
        let particleMap = this.getParticleMap()

        for(let conn of this.connections){
            let from = neuronMap.get(conn.from)
            let to = neuronMap.get(conn.to)
            this.constraints.push(new ConstraintNEAT(particleMap.get(from.id), particleMap.get(to.id)))
        }
    }

    setTopology(hidden, connections){
        this.hidden = hidden
        this.connections = connections
        this.initViz()
    }

    getOutputIndex() {
        return this.outputs.reduce((maxIndex, out, i) => out.value > this.outputs[maxIndex].value ? i : maxIndex, 0);
    }

    getOutput(){
        return this.outputs[this.getOutputIndex()].value
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

    // createParticlesHidden(){
    //     for(let h of this.hidden){
    //         let particle = new ParticleNEAT(random(this.x + this.w), random(this.y + this.h), false, h.id)
    //         this.particles.push(particle)
    //     }
    // }

    // createConstraintsHidden(){
    //     let particleMap = this.getParticleMap()
    //     for(let conn of this.connections){
    //         let fromPart = particleMap.get(conn.from)
    //         let toPart = particleMap.get(conn.to)
    //         this.constraints.push(new ConstraintNEAT(fromPart, toPart))
    //     }
    // }

    getNewId(){
        let id = 0
        while ([...this.inputs, ...this.hidden, ...this.outputs].some(obj => obj.id === id)) {
            id++
        }
        return id
    }

    createRandomHidden(){
        let index = -1
        let iter = 0
        while(index == -1 && iter != 100){
            iter++
            let indexAux = Math.floor(Math.random() * this.connections.length)
            if(this.connections[indexAux] && this.connections[indexAux].enabled){
                index = indexAux
                break
            }
        }
        if(index == -1) return

        let hidden = new Neuron(this.func_hidden, this.getNewId(), getSmallBias())
        this.hidden.push(hidden)

        let neuronMap = this.getNeuronMap()
        let particleMap = this.getParticleMap()

        //let index = Math.floor(Math.random() * this.connections.length)
        let conn = this.connections[index]
        let fromNeuron = neuronMap.get(conn.from)
        let toNeuron = neuronMap.get(conn.to)

        let fromPart = particleMap.get(fromNeuron.id)
        let toPart = particleMap.get(toNeuron.id)

        let x = (fromPart.pos.x + toPart.pos.x) * 0.5
        let y = (fromPart.pos.y + toPart.pos.y) * 0.5
        let ds = dist(fromPart.pos.x, fromPart.pos.y, x, y)

        let particle = new ParticleNEAT(x, y, false, hidden.id)
        this.particles.push(particle)

        //nuevas conexiones con weight = 1
        let conn1 = new Connection(fromNeuron.id, hidden.id, 1)
        let conn2 = new Connection(hidden.id, toNeuron.id, this.connections[index].weight)
        conn1.innovationNumber = this.population.getInnovationNumber(conn1)
        conn2.innovationNumber = this.population.getInnovationNumber(conn2)
        this.connections.push(conn1)
        this.connections.push(conn2)

        this.constraints.push(new ConstraintNEAT(fromPart, particle, ds))
        this.constraints.push(new ConstraintNEAT(particle, toPart, ds))

        //this.connections.splice(index, 1)
        this.connections[index].enabled = false
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
            return;
        }

        const index = Math.floor(Math.random() * possibleConnections.length);
        const newConnection = possibleConnections[index];

        let conn = new Connection(newConnection.from, newConnection.to, getSmallBias())
        conn.innovationNumber = this.population.getInnovationNumber(conn)
        this.connections.push(conn);

        let fromPart = particleMap.get(possibleConnections[index].from)
        let toPart = particleMap.get(possibleConnections[index].to)
        this.constraints.push(new ConstraintNEAT(fromPart, toPart))
    }

    removeRandomConnection(){
        if(this.connections.length == 0) return
        let enabledConns = this.connections.filter(conn => conn.enabled);

        if (enabledConns.length > 0) {
            let randomIndex = Math.floor(Math.random() * enabledConns.length);
            let connToRemove = enabledConns[randomIndex];

            let indexToRemove = this.connections.indexOf(connToRemove);
            if (indexToRemove !== -1) {
                this.connections.splice(indexToRemove, 1);

                let neuronMap = this.getNeuronMap()
                let particleMap = this.getParticleMap()
                this.constraints = []
                for(let conn of this.connections){
                    let from = neuronMap.get(conn.from)
                    let to = neuronMap.get(conn.to)
                    this.constraints.push(new ConstraintNEAT(particleMap.get(from.id), particleMap.get(to.id)))
                }
            }
        }
    }

    removeRandomHidden(){
        if(this.hidden.length == 0) return

        let index = Math.floor(Math.random() * this.hidden.length)
        let hidden = this.hidden[index]
        for(let i = 0; i < this.connections.length; i++){
            let conn = this.connections[i]
            if(conn.to == hidden.id || conn.from == hidden.id){
                this.connections.splice(i, 1)
                i--
            }
        }
        
        this.hidden.splice(index, 1)

        let particleIndex = this.particles.findIndex(par => par.id == hidden.id)
        this.particles.splice(particleIndex, 1)

        let neuronMap = this.getNeuronMap()
        let particleMap = this.getParticleMap()

        this.constraints = []
        for(let conn of this.connections){
            let from = neuronMap.get(conn.from)
            let to = neuronMap.get(conn.to)
            this.constraints.push(new ConstraintNEAT(particleMap.get(from.id), particleMap.get(to.id)))
        }
    }

    setRandomWeight(func){
        if(this.connections.length == 0) return
        let enabledConns = this.connections.filter(conn => conn.enabled);

        if (enabledConns.length > 0) {
            let randomIndex = Math.floor(Math.random() * enabledConns.length);
            let conn = this.connections[randomIndex]
            conn.weight = func(conn.weight)
        }
    }

    setInputs(inputs){
        if(inputs.length != this.inputs.length - 1){
            console.log("inputs size doesnt match NN")
            return
        }
        this.inputs.forEach((inp, index) => {
            if(index == this.inputs.length - 1) return
            inp.value = inputs[index];
        });
    }

    update() {
        //debug
        //for (let inp of this.inputs) inp.value = random();

        let orderedList = this.getOrderedNeurons([...this.inputs, ...this.outputs, ...this.hidden]);
        let neuronMap = new Map([...this.inputs, ...this.outputs, ...this.hidden].map(neuron => [neuron.id, neuron]));

        for (let neuronId of orderedList) {
            let neuron = neuronMap.get(neuronId);

            if (!this.inputs.includes(neuron)) {
                let incomingConnections = this.connections.filter(conn => conn.to === neuron.id && conn.enabled);
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
        // if(this.softmax){ 
        //     let connectedOutputs = this.outputs.filter(output => 
        //         this.connections.some(conn => conn.to === output.id && conn.enabled)
        //     );
        //     this.applySoftmax(connectedOutputs);
        // }
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
            let conn = this.connections.find(conn => conn.from == from.id && conn.to == to.id && conn.enabled)
            if(conn) c.show(conn.weight, from.value)
        }
        //p.show(round(neurons.get(p.id).value, 1))
        let largestOutput = this.outputs[this.getOutputIndex()]
        for(let p of this.particles){ 
            let neuron = neurons.get(p.id)
            let out = neuron.isOutput ? (largestOutput.id == p.id ? true : false) : false
            p.show(round(neuron.value, 1), round(neuron.bias, 1), out, (neuron.isInput || neuron.isOutput) && (neuron.id != this.inputs.length-1))
        }
        noFill()
        stroke(150)
        strokeWeight(1)
        //rect(this.x + .5, this.y + .5, this.w - 1, this.h - 1)
        pop()
    }

    getOrderedNeurons(neurons = [...this.inputs, ...this.outputs, ...this.hidden], connections = this.connections){
        let adjacencyList = new Map()
        let inDegree = new Map()

        for (let neuron of neurons) {
            adjacencyList.set(neuron.id, [])
            inDegree.set(neuron.id, 0)
        }

        for (let connection of connections) {
            if(!connection.enabled) continue
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
            console.error("cycle" + this.id)
            noLoop()
            //throw new Error("The neural network has a cycle and cannot be executed in topological order.")
        }

        return executionOrder
    }

    getNeuronMap(neurons = [...this.inputs, ...this.outputs, ...this.hidden]){
        let neuronMap = new Map()
        for (let neuron of neurons) {
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

    findConnection(from, to){
        for(let conn of this.connections){
            if(conn.from == from && conn.to == to) return conn
        }
        return false
    }

    isOrdered(ordered, from, to){
        for(let o of ordered){
            if(o == to) return false
            else if(o == from) return true
        }
    }

    selectRandomEnabledConnection(){
        if(this.connections.length == 0) return
        let enabledConns = this.connections.filter(conn => conn.enabled);

        if (enabledConns.length > 0) {
            let randomIndex = Math.floor(Math.random() * enabledConns.length);
            let conn = this.connections[randomIndex]
            return conn
        }

        return undefined
    }

    selectRandomBiasedNeuron(){
        let biasedNeurons = [...this.hidden, ...this.outputs]
        return biasedNeurons[Math.floor(Math.random() * biasedNeurons.length)]
    }

    setFitness(fitness){
        this.fitness = fitness
    }
}

class Population{
    constructor(size, n_in, n_out, func_hidden, func_out, softmax = true, x = 0, y = 0, w = width, h = height){
        this.NNs = []
        this.species = new Map()
        this.size = size
        this.fittest = undefined
        
        this.gen = 0
        this.idCounter = 0

        this.uniqueConnections = new Map()

        this.randomConfig = {
            init_mean: 0,
            init_stdev: 1,
            min: -30,
            max: 30,
            mut_pow: .05  //0.05
        }

        this.mutationConfig = {
            change_weight: .8,   
                adjust_weight: 0.8,
                new_weight: 0.1,
            change_bias: .8,     
                adjust_bias: 0.7,
                new_bias: 0.1,
            new_neuron: 0.03,      
            new_conn: 0.03,
            remove_neuron: 0.03,
            remove_conn: 0.03
        }

        // this.randomConfig = {
        //     init_mean: 0,
        //     init_stdev: 1,
        //     min: -30,
        //     max: 30,
        //     mut_pow: .5  //0.05
        // }

        // this.mutationConfig = {
        //     change_weight: 1,   
        //         adjust_weight: 0.8,
        //         new_weight: 0.1,
        //     change_bias: 1,     
        //         adjust_bias: 0.7,
        //         new_bias: 0.1,
        //     new_neuron: 0.2,      
        //     new_conn: 0.2,
        //     remove_neuron: 0.2,
        //     remove_conn: 0.2
        // }

        this.x = x
        this.y = y
        this.w = w
        this.h = h

        this.initNNs(size, n_in, n_out, func_hidden, func_out, softmax = true)
        this.selectedNN = this.NNs[0]

        this.totalFitness = 0

        
    }

    getTotalFitness(){
        let sum = 0
        for(let nn of this.NNs){
            sum += nn.fitness
        }
        return sum / this.size
    }

    getSpecies(id){
        for(let species of this.species){
            if(species[0].species == id) return species
        }
    }

    getInnovationNumber(conn){
        if(!this.uniqueConnections.has(`${conn.from}-${conn.to}`)){ 
            this.uniqueConnections.set(`${conn.from}-${conn.to}`, conn)
        }
        const keyToFind = `${conn.from}-${conn.to}`;
        const keysArray = Array.from(this.uniqueConnections.keys());
        const indexOfKey = keysArray.indexOf(keyToFind);
        return indexOfKey
    }

    addRandomHidden(){
        for(let nn of this.NNs) nn.createRandomHidden()
    }

    selectRandomNN(){
        this.selectedNN = this.NNs[Math.floor(Math.random() * this.NNs.length)]
    }

    setRandomValues(){
        for(let nn of this.NNs){
            for(let inp of nn.inputs) inp.value = Math.random() > 0.5 ? 0 : 1
        }
    }

    setValues(values, index){
        this.NNs[index].setInputs(values)
    }

    initNNs(size, n_in, n_out, func_hidden, func_out, softmax = true){
        for(let i = 0; i < size; i++){
            let nn = new NN(n_in, n_out, 
                            func_hidden, func_out, 
                            this, softmax, this.x, this.y, this.w, this.h
                            )
            nn.id = this.idCounter++
            this.NNs.push(nn)
        }
    }

    //checkear lengths TODO
    setFitness(fitness){
        for(let i = 0; i < fitness.length; i++){
            this.NNs[i].setFitness(fitness[i])
        }
    }

    /*
        result = [50% best of each species mutated + elites not mutated]
    */
    evolvePopulation(simple = false){
        this.idCounter = 0
        //calcular especies 
        this.assignSpecies()

        //seleccion NNs
        let toBeMutated, elites
        if(!simple) [toBeMutated, elites] = this.selectNNs()
        else [toBeMutated, elites] = this.simpleSelectNNs()
        let mutatedNNs = []

        this.totalFitness = this.getTotalFitness()
        //console.log("total fitness: " + this.totalFitness)
        //console.log(toBeMutated, elites)

        //crossover
        while(!simple && mutatedNNs.length < this.size - elites.length){
            let p1Index = Math.floor(Math.random() * toBeMutated.length);
            let p1 = toBeMutated[p1Index]
            let p2 = this.selectRandomFromSpecies(p1.species)

            let child = this.crossoverNN(p1, p2);
            mutatedNNs.push(child);
        }



        //mutation
        if(!simple) for(let nn of mutatedNNs){
            if(Math.random() < this.mutationConfig.change_weight){
                let conn = nn.selectRandomEnabledConnection()
                //console.log("conn antes " + conn.weight)
                if(Math.random() < this.mutationConfig.adjust_weight){ 
                    if(conn) conn.weight = this.mutateDelta(conn.weight)
                    //console.log("conn despues adjust " + conn.weight)
                }
                else{ 
                    if(conn) conn.weight = this.newValue()
                    //console.log("conn despues new " + conn.weight)
                }
                
            }
            if(Math.random() < this.mutationConfig.change_bias){
                let neuron = nn.selectRandomBiasedNeuron()
                //console.log("neuron antes " + neuron.bias)
                if(Math.random() < this.mutationConfig.adjust_bias){ 
                    neuron.bias = this.mutateDelta(neuron.bias)
                    //console.log("neuron despues adjust " + neuron.bias)
                }
                else {
                    neuron.bias = this.newValue()
                    //console.log("neuron despues new " + neuron.bias)
                }
            }
            if(Math.random() < this.mutationConfig.new_neuron)    nn.createRandomHidden()
            if(Math.random() < this.mutationConfig.new_conn)      nn.createRandomConnection()
            if(Math.random() < this.mutationConfig.remove_neuron) nn.removeRandomHidden()
            if(Math.random() < this.mutationConfig.remove_conn)   nn.removeRandomConnection()
        }
        else{
            while(mutatedNNs.length < Math.floor(this.size * 0.7)){
                let nn = toBeMutated[Math.floor(Math.random(toBeMutated.length))]
                let isOn = mutatedNNs.includes(nn)
                if(!isOn && Math.random() < this.mutationConfig.change_weight){
                    let conn = nn.selectRandomEnabledConnection()
                    //console.log("conn antes " + conn.weight)
                    if(Math.random() < this.mutationConfig.adjust_weight){ 
                        if(conn) conn.weight = this.mutateDelta(conn.weight)
                        //console.log("conn despues adjust " + conn.weight)
                    }
                    else{ 
                        if(conn) conn.weight = this.newValue()
                        //console.log("conn despues new " + conn.weight)
                    }
                    
                }
                if(!isOn && Math.random() < this.mutationConfig.change_bias){
                    let neuron = nn.selectRandomBiasedNeuron()
                    //console.log("neuron antes " + neuron.bias)
                    if(Math.random() < this.mutationConfig.adjust_bias){ 
                        neuron.bias = this.mutateDelta(neuron.bias)
                        //console.log("neuron despues adjust " + neuron.bias)
                    }
                    else {
                        neuron.bias = this.newValue()
                        //console.log("neuron despues new " + neuron.bias)
                    }
                }
                if(!isOn && Math.random() < this.mutationConfig.new_neuron)    nn.createRandomHidden()
                if(!isOn && Math.random() < this.mutationConfig.new_conn)      nn.createRandomConnection()
                if(!isOn && Math.random() < this.mutationConfig.remove_neuron) nn.removeRandomHidden()
                if(!isOn && Math.random() < this.mutationConfig.remove_conn)   nn.removeRandomConnection()

                mutatedNNs.push(nn)
            }
        }
        //console.log(mutatedNNs)

        this.NNs = [...mutatedNNs, ...elites]
        this.gen++
        
    }

    //el 85% de los que tienen fitness = 0 se eliminan
    selectNNs() {
        let toBeMutated = [];
        let elites = [];

        for (let [idx, species] of this.species.entries()) {
            // Normalization
            let maxFit = Math.max(0, ...species.NNs.map(nn => nn.fitness));
            if (maxFit > 0) {
                for (let nn of species.NNs) {
                    nn.fitness /= maxFit;
                }
            }

            // Quitar el 85% de los nn con fitness = 0
            for (let i = species.NNs.length - 1; i >= 0; i--) {
                let nn = species.NNs[i];
                if (nn.fitness === 0 && Math.random() < 0.85) {
                    species.NNs.splice(i, 1);
                }
            }

            species.NNs.sort((a, b) => b.fitness - a.fitness);

            let survival_thresh = 0.2
            if (species.NNs.length > 1) {
                species.NNs = species.NNs.slice(0, Math.max(1, Math.ceil(species.NNs.length * survival_thresh)));
            }

            // Elites son en 30% de cada especie, estos no mutan
            const indexElites = Math.max(1, Math.floor(species.NNs.length * 0.3));
            //const indexElites = 2
            let currentElites = species.NNs.slice(0, indexElites).filter(nn => nn.fitness !== 0);
            let currentToBeMutated = [...species.NNs]; // Deep copy if necessary

            elites = [...elites, ...currentElites];
            toBeMutated = [...toBeMutated, ...currentToBeMutated];
        }

        return [toBeMutated, elites];
    }


    selectRandomFromSpecies(id) {
        //this.assignSpecies();
        let species = this.species.get(id);
        if (species) { 
            let nn = species.NNs[Math.floor(Math.random() * species.NNs.length)];
            return nn
        }
    }

    showRandomFromSpecies(id){
        this.assignSpecies();
        let species = this.species.get(id);
        if (species) { 
            this.selectedNN = species.NNs[Math.floor(Math.random() * species.NNs.length)];
        }
    }


    /*
    this.species = [{representative: NN, 
                     NNs: [nn, nn, ... nn]},
                     {representative: NN, 
                     NNs: [nn, nn, ... nn]},
                     ...
                     ]
    */

    assignSpecies(compatibilityThreshold = 3) {
        //this.species = new Map();
        this.clearNNsFromSpecies()

        for (let nn of this.NNs) {
            let assignedSpecies = null;

            // Try to assign the neural network to an existing species
            for (let [idx, species] of this.species.entries()) {
                let representative = species.representative;

                if (this.isCompatible(nn, representative, compatibilityThreshold)) {
                    species.NNs.push(nn);  // Add nn to the list of neural networks for this species
                    nn.species = idx;  // Assign the species index to the neural network
                    assignedSpecies = idx;
                    break;
                }
            }

            // If no suitable species is found, create a new one
            if (assignedSpecies === null) {
                let newIdx = this.species.size;
                nn.species = newIdx;
                this.species.set(newIdx, {
                    representative: nn,  // Set the current nn as the representative
                    NNs: [nn]  // Initialize with the current nn
                });
            }
        }

        this.clearExinctSpecies()
    }

    clearNNsFromSpecies(){
        for (let species of this.species.values()) {
            species.NNs = [];
        }
    }

    clearExinctSpecies(){
        for (let [id, species] of this.species.entries()) {
            if (species.NNs.length === 0) {
                this.species.delete(id);
            }
        }
    }

    isCompatible(nn1, nn2, thresh) {
        const distance = this.calculateDistance(nn1, nn2);
        return distance < thresh;
    }

    calculateDistance(nn1, nn2) {
        const conns1 = nn1.connections; // Assuming each network has a list of connections
        const conns2 = nn2.connections;
        const hidden1 = nn1.hidden; // List of hidden neurons
        const hidden2 = nn2.hidden;

        let matchingGenes = 0;
        let weightDifferenceSum = 0;
        let disjointGenes = 0;
        let excessGenes = 0;

        // Sort connections by innovation number
        conns1.sort((a, b) => a.innovationNumber - b.innovationNumber);
        conns2.sort((a, b) => a.innovationNumber - b.innovationNumber);

        let i = 0;
        let j = 0;

        while (i < conns1.length && j < conns2.length) {
            const conn1 = conns1[i];
            const conn2 = conns2[j];

            if (conn1.innovationNumber === conn2.innovationNumber) {
                // Matching connections
                matchingGenes++;
                weightDifferenceSum += Math.abs(conn1.weight - conn2.weight);
                i++;
                j++;
            } else if (conn1.innovationNumber < conn2.innovationNumber) {
                // Disjoint gene in conns1
                disjointGenes++;
                i++;
            } else {
                // Disjoint gene in conns2
                disjointGenes++;
                j++;
            }
        }

        // Remaining connections are excess genes
        excessGenes += (conns1.length - i) + (conns2.length - j);

        // Calculate disjoint and excess hidden nodes
        let hiddenSet1 = new Set(hidden1.map(node => node.id));
        let hiddenSet2 = new Set(hidden2.map(node => node.id));
        let allHiddenIds = new Set([...hiddenSet1, ...hiddenSet2]);

        for (let id of allHiddenIds) {
            const inHidden1 = hiddenSet1.has(id);
            const inHidden2 = hiddenSet2.has(id);

            if (inHidden1 && inHidden2) {
                // Matching hidden nodes
                matchingGenes++;
            } else if (inHidden1 || inHidden2) {
                disjointGenes++;
            }
        }

        const C1 = 1.0; // Coefficient for excess genes
        const C2 = 1.0; // Coefficient for disjoint genes
        const C3 = 0.6; // Coefficient for weight differences

        const N = Math.max(conns1.length + hidden1.length, conns2.length + hidden2.length);
        const normalizedWeightDifference = matchingGenes > 0 ? weightDifferenceSum / matchingGenes : 0;

        const distance = (C1 * excessGenes + C2 * disjointGenes) / N + C3 * normalizedWeightDifference;
        return distance;
    }

    createMP(){
        let MP = []
        for(let r of this.NNs){
            if(r.fitness == 0) continue 
            for(let i = 0; i < r.fitness * 100; i++){
                MP.push(r)
            }
        }
        return MP
    }

    simpleSelectNNs() {
        this.NNs.sort((a, b) => b.fitness - a.fitness);
        const elites = this.NNs.slice(0, Math.floor(this.NNs.length * 0.3));

        const toBeMutated = this.NNs.slice(Math.floor(this.NNs.length * 0.3));
        const toBeMutatedNew = [];

        for (let nn of toBeMutated) {
            const repetitions = Math.floor(nn.fitness * 10) + 1;
            for (let i = 0; i < repetitions; i++) {
                toBeMutatedNew.push(nn);
            }
        }

        return [toBeMutatedNew, elites];
    }


    




    // selectNNs(){
    //     //normalization
    //     let maxFit = 0
    //     for(let nn of this.NNs){
    //         if(nn.fitness > maxFit) maxFit = nn.fitness
    //     }
    //     for(let nn of this.NNs){
    //         nn.fitness /= maxFit
    //     }
    //     //sorting
    //     this.NNs.sort((a, b) => b.fitness - a.fitness)
    //     let indexElites = Math.floor(this.size * 0.1)
    //     let elites = this.NNs.splice(0, indexElites)
    //     console.log(this.NNs)

    //     //this.createMP()
    //     //selection via tournament
    //     // let newNNs = []
    //     // for(let i = 0; i < this.size; i++){
    //     //     let winner = this.tournament()
    //     //     newNNs.push(winner)
    //     // }
    //     // newNNs = newNNs.concat(elites)
    //     // newNNs.sort((a, b) => b.fitness - a.fitness)

    //     return elites
    // }

    tournament(){
        //tournamentSize of 15% of the pop size
        let tournamentSize = Math.max(Math.ceil(this.size * 0.15), 2)
        let tournamentParticipants = [];

        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.NNs.length);
            tournamentParticipants.push(this.NNs[randomIndex]);
        }

        // Find the participant with the highest fitness
        let winner = tournamentParticipants[0];

        for (let i = 1; i < tournamentParticipants.length; i++) {
            if (tournamentParticipants[i].fitness > winner.fitness) {
                winner = tournamentParticipants[i];
            }
        }

        return winner;
    }

    crossoverNN(parent1, parent2) {
        const child = new NN(
            parent1.inputs.length,
            parent1.outputs.length,
            parent1.func_hidden,
            parent1.func_out,
            parent1.population,
            parent1.softmax,
            this.x, this.y, this.w, this.h
        );
        child.id = this.idCounter++;
        child.inputs = [];
        child.hidden = [];
        child.outputs = [];
        child.particles = [];
        child.constraints = [];
        child.connections = [];

        // Determine dominant and recessive parents
        const [dominant, recessive] = parent1.fitness >= parent2.fitness ? [parent1, parent2] : [parent2, parent1];

        // Crossover inputs
        for (let i = 0; i < dominant.inputs.length; i++) {
            let inpDom = dominant.inputs[i]
            let inpRec = recessive.inputs[i]
            if(Math.random() < 0.5) child.inputs.push(new Neuron(inpDom.activation, inpDom.id, inpDom.bias, inpDom.isInput, inpDom.isOutput));
            else child.inputs.push(new Neuron(inpRec.activation, inpRec.id, inpRec.bias, inpRec.isInput, inpRec.isOutput)); 
        }

        // Ensure bias neuron is set
        child.inputs[child.inputs.length - 1].value = 1;
        //child.inputs[child.inputs.length - 1].value = 0

        // Crossover outputs
        for (let i = 0; i < dominant.outputs.length; i++) {
            let inpDom = dominant.outputs[i]
            let inpRec = recessive.outputs[i]
            if(Math.random() < 0.5) child.outputs.push(new Neuron(inpDom.activation, inpDom.id, inpDom.bias, inpDom.isInput, inpDom.isOutput));
            else child.outputs.push(new Neuron(inpRec.activation, inpRec.id, inpRec.bias, inpRec.isInput, inpRec.isOutput)); 
        }

        // Determine which is dominant and which is recessive based on fitness
        let maxInnovationDominant = Math.max(...dominant.connections.map(c => c.innovationNumber));

        // Create a map of recessive connections for easy lookup
        let recessiveMap = new Map();
        for (let conn of recessive.connections) {
            recessiveMap.set(conn.innovationNumber, conn);
        }

        for (let conn of dominant.connections) {
            let matchingConn = recessiveMap.get(conn.innovationNumber);

            // If both parents have the connection, randomly select one
            if (matchingConn) {
                let chosenConn = Math.random() < 0.5 ? conn : matchingConn;
                let newConn = new Connection(chosenConn.from, chosenConn.to, chosenConn.weight);
                newConn.innovationNumber = chosenConn.innovationNumber;
                child.connections.push(newConn);
            } 
            // If the connection is only in the dominant genome, add it to the child
            else {
                if (conn.innovationNumber <= maxInnovationDominant) {
                    let newConn = new Connection(conn.from, conn.to, conn.weight);
                    newConn.innovationNumber = conn.innovationNumber;
                    child.connections.push(newConn);
                }
            }
        }

        let neuronIds = new Set();
        for (let conn of child.connections) {
            neuronIds.add(conn.from);
            neuronIds.add(conn.to);
        }


        // For simplicity, assuming both parent genomes contain the nodes
        // Create a map for all nodes from both parents
        let neuronMapDom = new Map();
        for (let neuron of dominant.hidden) {
            if (!neuronMapDom.has(neuron.id)) {
                neuronMapDom.set(neuron.id, neuron);
            }
        }
        let neuronMapRec = new Map();
        for (let neuron of recessive.hidden) {
            if (!neuronMapRec.has(neuron.id)) {
                neuronMapRec.set(neuron.id, neuron);
            }
        }

        // Now create nodes for the child constructor(activation = undefined, id = -1, isInput = false, isOutput = false){
        for (let nodeId of neuronIds) {
            if (neuronMapDom.has(nodeId)) {
                let originalNode = neuronMapDom.get(nodeId);
                let newNode = new Neuron(originalNode.activation, originalNode.id, originalNode.bias,
                                       originalNode.isInput, originalNode.isOutput);
                child.hidden.push(newNode);
            }
            else if (neuronMapRec.has(nodeId)) {
                let originalNode = neuronMapRec.get(nodeId);
                let newNode = new Neuron(originalNode.activation, originalNode.id, originalNode.bias,
                                       originalNode.isInput, originalNode.isOutput);
                child.hidden.push(newNode);
            }
        }

        child.idCounter = child.inputs.length + child.outputs.length + child.hidden.length;
        child.initViz();

        return child;
    }

    newValue(){
        // return constrain(randomGaussian(this.randomConfig.init_mean,
        //                                  this.randomConfig.init_stdev), -1, 1)
        return getSmallBias()
    }

    mutateDelta(value){
        let delta = randomGaussian(0, this.randomConfig.mut_pow)
        delta = constrain(delta, -0.1, 0.1)
        //console.log(delta)
        // return constrain(value + delta, -1, 1)
        return value + delta
    }

    update(){
        for(let nn of this.NNs) nn.update()
    }

    getFittest(){
        this.fittest = this.NNs[0]
        for(let nn of this.NNs){
            if(nn.fitness > this.fittest) this.fittest = nn
        }
        return this.fittest
    }

    show(fittest = false, random = false){
        if(fittest) this.selectedNN = this.getFittest()
        if(random) this.selectedNN = this.NNs[Math.floor(Math.random() * this.size)]
        this.selectedNN.show()
    }

    showIndex(index){
        this.NNs[index].show()
    }
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getSmallBias(){
    return constrain(randomGaussian(0, 1), -1, 1);  //[-1, 1]
}

function getBias(){
    return random(-1, 1) * 0.01
}

function getGaussianWeight() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Convert [0,1) to (0,1)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * 0.1; // Generates a weight using Box-Muller transform with std dev of 0.1
}


