//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let it 

function setup(){
    createCanvas(WIDTH, HEIGHT)
    frameRate(60)
    it = new Interpreter()
    it.set(sourceCode)
    it.compile()
    it.run()
}

function draw(){
    it.callFunc(it.searchFunctionCall("draw"))
}
