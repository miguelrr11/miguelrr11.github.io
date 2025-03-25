//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let points = []

function setup(){
    createCanvas(WIDTH, HEIGHT)
    stroke(255, 0, 0)
}

function touchStarted(){
    for(let touch of touches){
        points.push({
            x: touch.x,
            y: touch.y,
            framesLeft: 60 * 3
        })
    }
    touches = []
}

function draw(){
    background(255)
    for(let i = 0; i < points.length; i++){
        const p = points[i]
        p.framesLeft--
        if(p.framesLeft < 0){
            points.splice(i, 1)
            i--
            continue
        }
        stroke(255, 0, 0)
        strokeWeight(map(p.framesLeft, 0, 60 * 3, 0, 40))
        point(p.x, p.y)
    }
}
