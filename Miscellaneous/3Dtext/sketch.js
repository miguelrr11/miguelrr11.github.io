//3D Text
//Miguel Rodríguez
//16-09-2025

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let points, font, endPoints, focusPoint
let length = 30

async function setup(){
    createCanvas(WIDTH, HEIGHT)
    font = await loadFont('font.ttf')

    let size = 140
    textFont(font)
    textSize(size)
    fill(255)
    noStroke()

    let str = 'Cool 3D'
    points = []
    let x = 50
    for(let i = 0; i < str.length; i++){
        let char = str.charAt(i)
        let charPoints = font.textToPoints(char, x, height/2 - 50, size, {
            sampleFactor: 0.5,
            simplifyThreshold: 0
        })
        for(let j = 0; j < charPoints.length - 1; j++){
            let p = charPoints[j]
            if(dist(p.x, p.y, charPoints[j+1].x, charPoints[j+1].y) > 5){
                charPoints.splice(j+1, 0, {x: -1, y: -1} )
                j++
            }
        }
        points = points.concat(charPoints)
        points.push({x: -1, y: -1})
        x += textWidth(char) + 15
    }
    
    focusPoint = createVector(width/2, height)

    createEndPoints()
}

function createEndPoints(){
    endPoints = []
    for(let i = 0; i < points.length; i++){
        let p = points[i]
        if(p.x === -1 && p.y === -1){
            endPoints.push({x: -1, y: -1})
            continue
        }
        let angle = atan2(focusPoint.y - p.y, focusPoint.x - p.x)
        let endPoint = createVector(p.x + cos(angle) * length, p.y + sin(angle) * length)
        endPoints.push(endPoint)
    }
}

function draw(){
    background(0)
    //text('3D Text', width/2, height/2)

    // focusPoint.x = mouseX < width / 2 ? -2000 : 2000
    // focusPoint.y = mouseY < height / 2 ? -2000 : 2000
    focusPoint.x = width / 2 + Math.sin(frameCount * 0.01) * 2000
    focusPoint.y = height / 2 + Math.cos(frameCount * 0.01) * 2000
    length = map(mouseX, 0, width, 1, 100)
    createEndPoints()

    strokeWeight(3)
    stroke(190)
    noFill()

    beginShape()
    for(let i = 0; i < endPoints.length; i++){
        let p = endPoints[i]
        if(p.x === -1 && p.y === -1){
            endShape()
            beginShape()
            continue
        }
        vertex(p.x, p.y)
    }
    endShape()

    strokeWeight(1)
    stroke(255)
    noFill()

    beginShape()
    for(let i = 0; i < points.length; i++){
        let p = points[i]
        if(p.x === -1 && p.y === -1){
            endShape()
            beginShape()
            continue
        }
        vertex(p.x, p.y)
    }
    endShape()



    for(let i = 0; i < points.length; i++){
        let p = points[i]
        if(p.x === -1 && p.y === -1){
            continue
        }
        line(p.x, p.y, endPoints[i].x, endPoints[i].y)
    }
}
