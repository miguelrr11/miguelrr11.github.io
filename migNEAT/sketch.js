//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let nns

function setup(){
    createCanvas(WIDTH, HEIGHT)

    nns = new Population(100, 3, 5, 
                (value, bias) => {return Math.max(0, value + bias)}, 
                (value, bias) => {return value + bias})
}

function mouseClicked(){
    nns.selectRandomNN()
}         


function draw(){
    background(255)

    nns.update()
    nns.show()
}
