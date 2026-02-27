//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true


let sheet

function setup(){
    createCanvas(WIDTH, HEIGHT)
    sheet = new Sheet()
}

function draw(){
    background(255)

    sheet.showGrid()
}
