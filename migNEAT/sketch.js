//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let nns
let nn1, nn2, nn3

function setup(){
    createCanvas(WIDTH, HEIGHT)

    // nns = new Population(100, 3, 5, 
    //             (value, bias) => {return Math.max(0, value + bias)}, 
    //             (value, bias) => {return value + bias})

    nn1 = new NN(3, 5, 
                 (value, bias) => {return Math.max(0, value + bias)}, 
                 (value, bias) => {return value + bias}, true, 0, 0, 300, 300)
    nn2 = new NN(3, 5, 
                 (value, bias) => {return Math.max(0, value + bias)}, 
                 (value, bias) => {return value + bias}, true, 0, 300, 300, 300)
    // nn3 = new NN(3, 5, 
    //              (value, bias) => {return Math.max(0, value + bias)}, 
    //              (value, bias) => {return value + bias}, true, 300, 150, 300, 300)

    nn3 = crossoverNN(nn1, nn2)

    // let connections = []
    // let hidden = []
    // let id = 8
    // hidden.push(new Neuron(0, (value, bias) => {return Math.max(0, value + bias)}, id++))
    // hidden.push(new Neuron(0, (value, bias) => {return Math.max(0, value + bias)}, id++))
    // connections.push(new Connection(nn3.inputs[0].id, hidden[0].id, 0))
    // connections.push(new Connection(hidden[0].id, nn3.outputs[0].id, 0))
    // connections.push(new Connection(hidden[0].id, nn3.outputs[1].id, 0))
    // connections.push(new Connection(hidden[0].id, nn3.outputs[2].id, 0))
    // connections.push(new Connection(nn3.inputs[2].id, hidden[1].id, 0))
    // connections.push(new Connection(hidden[1].id, hidden[0].id, 0))
    // connections.push(new Connection(hidden[1].id, nn3.outputs[2].id, 0))

    // nn3.setTopology(hidden, connections)
}

function crossoverNN(parent1, parent2) {
    // Create a new neural network instance
    const child = new NN(
        parent1.inputs.length,
        parent1.outputs.length,
        parent1.func_hidden,
        parent1.func_out,
        parent1.softmax,
        300, 150, 300, 300
    );
    child.inputs = []
    child.hidden = []
    child.outputs = []
    child.particles = []
    child.constraints = []
    child.connections = []

    // Copy neurons from both parents, avoiding duplicate IDs
    const uniqueNeurons = new Map();

    function addUniqueNeuron(neuron) {
        if (!uniqueNeurons.has(neuron.id)) {
            uniqueNeurons.set(neuron.id, new Neuron(
                neuron.bias,
                neuron.activation,
                neuron.id,
                neuron.isInput,
                neuron.isOutput
            ));
        }
    }

    parent1.inputs.forEach(addUniqueNeuron);
    parent2.inputs.forEach(addUniqueNeuron);
    parent1.hidden.forEach(addUniqueNeuron);
    parent2.hidden.forEach(addUniqueNeuron);
    parent1.outputs.forEach(addUniqueNeuron);
    parent2.outputs.forEach(addUniqueNeuron);

    // Assign neurons to the child network
    uniqueNeurons.forEach((neuron) => {
        if (neuron.isInput) child.inputs.push(neuron);
        else if (neuron.isOutput) child.outputs.push(neuron);
        else child.hidden.push(neuron);
    });


    // Create new connections for the child from parent connections, avoiding cycles
    const allConnections = [...parent1.connections, ...parent2.connections];
    const uniqueConnections = new Map();

    allConnections.forEach((conn) => {
        const key = `${conn.from}-${conn.to}`;
        if (!uniqueConnections.has(key)) {
            // Randomly choose the weight from one of the parents
            const weight = Math.random() < 0.5 ? conn.weight : conn.weight;
            uniqueConnections.set(key, new Connection(conn.from, conn.to, weight));
        }
    });

    // Assign connections to the child network
    uniqueConnections.forEach((conn) => {
        child.connections.push(conn);
    });

  

    child.initViz()

    return child;
}






function keyPressed(){
    //nns.selectRandomNN()
    if(mouseX > width || mouseY > height) return
    nn1.createRandomConnection()
    nn1.createRandomHidden()
    nn2.createRandomConnection()
    nn2.createRandomHidden()

    nn3 = crossoverNN(nn1, nn2)
}

function mousePressed(){
    if(mouseX > width || mouseY > height) return
    for(let inp of nn1.inputs) inp.value = Math.random()
    for(let inp of nn2.inputs) inp.value = Math.random()
    for(let inp of nn3.inputs) inp.value = Math.random()
}   


function draw(){
    background(255)

    // nns.update()
    // nns.show()

    nn1.update()
    nn1.show()
    nn2.update()
    nn2.show()
    nn3.update()
    nn3.show()
}
