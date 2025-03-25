//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let font
let points = []
let ogPoints = []

function preload(){
    font = loadFont('bnr.ttf')
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
    textFont(font)
    let fontSize = 150
    textSize(fontSize)
    let str = 'Hello'
    for(let i = 0; i < str.length; i++){
        let c = str.charAt(i)
        let w = textWidth(c)
        points.push(font.textToPoints(c, 100 + w * i, height/2, fontSize, {
            sampleFactor: 1
        }))
    }
    ogPoints = points.map(char => char.map(pt => {
        return {
            x: pt.x,
            y: pt.y,
            alpha: 255
        }
    }
    ))
    stroke(255)
    strokeWeight(1.5)
}


function draw(){
    background(0)
    fill(255)


    for(let char of points){
        for(let pt of char){
            //stroke(map(pt.alpha, 0, 255, 0, 255))
            stroke(255)
            //the points avoid the mouse
            let d = dist(pt.x, pt.y, mouseX, mouseY)
            if(d < 50 && !mouseIsPressed){
                pt.x += (pt.x - mouseX) / d * 5
                pt.y += (pt.y - mouseY) / d * 5
            }
            point(pt.x, pt.y)
            
    
        }
    }

    for(let i = 0; i < points.length; i++){
        let char = points[i]
        for(let j = 0; j < char.length; j++){
            let pt = char[j]
            //stroke(map(pt.alpha, 0, 255, 0, 255))
            stroke(255)
            //the points avoid the mouse
            let x, y
            let dir = p5.Vector.sub(createVector(mouseX, mouseY), createVector(pt.x, pt.y))
            let d = dir.mag() * 0.1
            dir.normalize()
            let r = 100
            if(d < r && !mouseIsPressed){
                x = pt.x - dir.x * r / d
                y = pt.y - dir.y * r / d
            }
            else{
                x = pt.x
                y = pt.y
            }
            //draw the points
            point(x, y)
            if(mouseIsPressed){
                pt.x = lerp(pt.x, ogPoints[i][j].x, 0.1)
                pt.y = lerp(pt.y, ogPoints[i][j].y, 0.1)
            }
        }
    }
    
}
