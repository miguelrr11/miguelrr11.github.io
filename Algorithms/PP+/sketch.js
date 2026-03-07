//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let it 

function setup(){
    createCanvas(WIDTH, HEIGHT)
    it = new Interpreter()
    it.set(sourceCode)
    it.run()
}

function draw(){
    background(0)
}
