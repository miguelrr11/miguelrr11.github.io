//NEAT algorithm v1 (XOR)
//Miguel Rodríguez
//06-11-2024

p5.disableFriendlyErrors = true
const WIDTH = 600 + 300
const HEIGHT = 600

let nns
let size = 100
let font 

function preload(){
    font = loadFont('mono.ttf')
    
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
    textFont(font)

    nns = new Population(size, 2, 1, 
                (value, bias) => {return Math.tanh(value + bias)}, 
                (value, bias) => {return Math.tanh(value + bias)}, false)

     // nns = new Population(size, 2, 1, 
     //            (value, bias) => {return 1 / (1 + Math.exp(-(value + bias)))}, 
     //            (value, bias) => {return 1 / (1 + Math.exp(-(value + bias)))}, false)
}


let fitness = []

function xor(){
    let i = 0;
    for(let nn of nns.NNs){
        let totalError = 0;
        for(let values of [[0,0],[0,1],[1,0],[1,1]]){
            nn.setInputs(values);
            nn.update();

            let a = values[0];
            let b = values[1];
            let expectedOutput = a !== b ? 1 : 0; // XOR expected output
            let outputValue = nn.outputs[0].value; // Raw output value

            let error = Math.pow(expectedOutput - outputValue, 2); // Squared error
            totalError += error;
        }
        fitness[i] = (4 - totalError); // Max fitness is 4 when error is 0
        i++;
    }
}


let solFound = false
let index = 0

function run(){
    fitness = []
    for(let i = 0; i < size; i++) fitness[i] = 0

    xor()

    let sum = fitness.reduce((acc, obj) => acc + obj, 0);
    if(sum / (size * 4) > 0.9){ 
        solFound = true
        index = 0
        console.log("sol found in " + nns.gen + " gens")
        console.log(nns)
        nns.show(true)
    }
    

    nns.setFitness(fitness)
    nns.evolvePopulation()
}


function mousePressed(){
    if(!solFound) nns.selectedNN = nns.NNs[index%size]
    else{
        let values = [[0,0],[0,1],[1,0],[1,1]]
        nns.setValues(values[(index)%4])
    }
    index++
}   

function keyPressed(){
    if(solFound){
        nns.selectedNN = nns.NNs[index%size]
        index++
    }
}


function draw(){
    background("#FFFDF0")

    //nns.setRandomValues()
    if(!solFound) run()
    nns.update()
    nns.show(!solFound)

    push()
    textSize(15)
    textAlign(LEFT, TOP)
    text("NEAT algorithm learns XOR gate", 20, 20)
    text("Generation: " + nns.gen, 20, 40)
    pop()

}

