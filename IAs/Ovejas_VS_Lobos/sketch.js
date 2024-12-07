//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
let entorno
let found
let pos

function setup(){
    createCanvas(WIDTH, HEIGHT)
    entorno = new Entorno()
    fill(255)
}

function mouseClicked(){
    found = entorno.findClosest(createVector(mouseX, mouseY), 50, 'food')
    if(found) entorno.eat(found)
    pos = createVector(mouseX, mouseY)
}

function draw(){
    background(0)
    entorno.show()
    if(found) ellipse(found.x + TAM_CELL*0.5, found.y + TAM_CELL*0.5, 10)
    noFill()
    if(pos) ellipse(pos.x, pos.y, 100)
}
