// Enigma Machine
// Miguel Rodríguez
// 04-08-2025

p5.disableFriendlyErrors = true
const WIDTH = 900
const HEIGHT = 850
const WIDTHUI = 400

const yRotors = 0
const yLamps = 100
const yKeys = 300
const yPlugs = 550

let keys = ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O',    
               'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K',
            'P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L'
]

let order = [17, 23, 5, 18, 20, 26, 21, 9, 15, 
                1, 19, 4, 6, 7, 8, 10, 11,
             16, 25, 24, 3, 22, 2, 14, 13, 12 
]

let inputText = ''
let outputText = ''

async function setup(){
    createCanvas(WIDTH + WIDTHUI, HEIGHT)
    let font = await loadFont('font.otf')
    textFont(font)
}

function draw(){
    background(0)

    noStroke()

    drawRotors()
    drawLamps()
    drawKeys()
    drawPlugs()
    drawUI()
}

function drawRotors(){
    push()
    fill(40)
    rect(0, yRotors, WIDTH, yLamps)

    fill(10)
    let sizeSq = 45
    let y = yLamps * 0.5
    let x = WIDTH * 0.5
    let spacing = 30
    let s1 = createVector(x - spacing - sizeSq, y)
    let s2 = createVector(x, y)
    let s3 = createVector(x + spacing + sizeSq, y)
    rectMode(CENTER)

    rect(s2.x, s2.y, sizeSq, sizeSq)
    rect(s1.x, s1.y, sizeSq, sizeSq)
    rect(s3.x, s3.y, sizeSq, sizeSq)

    fill(255)
    textSize(25)
    textAlign(CENTER, CENTER)
    text(offset1, s3.x, s3.y + 2)
    text(offset2, s2.x, s2.y + 2)
    text(offset3, s1.x, s1.y + 2)

    pop()
}

function drawLamps(){
    push()
    fill(40)
    rect(0, yLamps, WIDTH, yKeys)

    textAlign(CENTER, CENTER)
    textSize(30)

    let sp1 = WIDTH / 10
    let size = 55
    let y = yLamps + sp1 * 0.3
    let x = sp1 
    for(let i = 0; i < keys.length; i++){
        fill(30)
        stroke(50)
        strokeWeight(3)
        ellipse(x, y, size, size)

        fill(210)
        //noStroke()
        strokeWeight(1.5)
        stroke(210)
        text(keys[i], x, y + 3)

        x += sp1
        if(i == 8){ 
            y += sp1 * 0.7
            x = sp1 + sp1 * 0.5
        }
        if(i == 16){ 
            y += sp1 * 0.7
            x = sp1 
        }
    }

    pop()
}

function drawKeys(){
    push()
    

    fill(50)
    rect(0, yKeys, WIDTH, yPlugs)

    textAlign(CENTER, CENTER)
    textSize(30)

    let sp1 = WIDTH / 10
    let size = 60
    let y = yKeys + sp1 * 0.5
    let x = sp1 
    for(let i = 0; i < keys.length; i++){
        fill(30)
        stroke(150)
        strokeWeight(3)
        ellipse(x, y, size, size)

        fill(250)
        noStroke()
        text(keys[i], x, y + 3)

        x += sp1
        if(i == 8){ 
            y += sp1 * 0.85
            x = sp1 + sp1 * 0.5
        }
        if(i == 16){ 
            y += sp1 * 0.85
            x = sp1 
        }
    }

    pop()
}

function drawPlugs(){
    push()
    fill(70)
    rect(0, yPlugs, WIDTH, HEIGHT)

    textAlign(CENTER, CENTER)
    textSize(14)

    let sp1 = WIDTH / 10
    let size = 23
    let y = yPlugs + sp1 * 0.5
    let x = sp1 
    let sp2 = size 
    for(let i = 0; i < keys.length; i++){
        fill(10)
        stroke(230)
        strokeWeight(4)
        ellipse(x, y, size, size)
        ellipse(x, y + size * 1.8, size, size)

        fill(250)
        noStroke()
        text(keys[i], x - sp2, y + size * 0.9)
        text(order[i], x + sp2, y + size * 0.9)

        x += sp1
        if(i == 8){ 
            y += sp1 * 1
            x = sp1 + sp1 * 0.5
        }
        if(i == 16){ 
            y += sp1 * 1
            x = sp1 
        }
    }

    pop()
}

function drawUI(){
    push()
    
    pop()
}