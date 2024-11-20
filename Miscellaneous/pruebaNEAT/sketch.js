//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let nns
let child 

function setup(){
    createCanvas(WIDTH, HEIGHT)
    nns = new Population(2, 5, 3, (val, b) => {return constrain(val, 0, 1)}, (val, b) => {return val})
    for(let i = 0; i < 10; i++){
        nns.NNs[0].createRandomHidden()
        nns.NNs[1].createRandomHidden()
        nns.NNs[0].createRandomConnection()
        nns.NNs[1].createRandomConnection()
    }
    child = nns.crossoverNN(nns.NNs[0], nns.NNs[1]) 
}

function mousePressed(){
    child.createRandomConnection()
}

function keyPressed(){
    child.removeRandomConnection()
}

function draw(){
    background(0)
    child.update()
    child.show()
}
