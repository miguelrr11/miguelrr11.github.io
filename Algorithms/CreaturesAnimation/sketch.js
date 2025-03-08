//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600
let creature

function setup(){
    createCanvas(WIDTH, HEIGHT)
    creature = new Creature(width/2, height/2)
}

function draw(){
    background(180)
    creature.update()
    if(mouseIsPressed){
        creature.showGoalPoints()
        creature.showLimbsPos()
        creature.showDistances()
    }
    creature.show()
}
