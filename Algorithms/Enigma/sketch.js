// Enigma Machine
// Miguel Rodríguez
// 04-08-2025

p5.disableFriendlyErrors = true
const WIDTH = 900
const HEIGHT = 850
const WIDTHUI = 400

let font

let darkCol = '#432818'
let lightCol = '#D0B784'
let medCol = '#99582a'

const yRotors = 0
const yLamps = 100
const yKeys = 300
const yPlugs = 550

let desc = 'La máquina Enigma fue desarrollada por la firma alemana Scherbius para proteger las comunicaciones militares y navales en la Segunda Guerra Mundial. Su funcionamiento se basa en un conjunto de rotores intercambiables y un panel de conexiones que, al pasar corriente eléctrica por distintos circuitos, transforma cada letra de un mensaje en otra de forma polialfabética; al aplicar la misma configuración de rotores y conexiones en receptores idénticos, es posible descifrar el mensaje.'

let keys = ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O',    
               'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K',
            'P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L'
]

let order = [17, 23, 5, 18, 20, 26, 21, 9, 15, 
                1, 19, 4, 6, 7, 8, 10, 11,
             16, 25, 24, 3, 22, 2, 14, 13, 12 
]

let keyButtons = []

let inputText = ''
let outputText = ''
let activeLamp = undefined

function keyPressed(){
    let char = key.toUpperCase()
    for(let button of keyButtons){
        if(button.char == char){
            inputChar(button)
            button.time = 15
        }
    }
}

async function setup(){
    createCanvas(WIDTH + WIDTHUI, HEIGHT)
    font = await loadFont('font.otf')
    textFont(font)

    createButtons()
}

function draw(){
    background(0)

    noStroke()

    handleKeys()

    drawRotors()
    drawLamps()
    drawKeys()
    drawPlugs()
    drawUI()
}

function mouseClicked(){
    
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
    textFont(font)
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
    textFont(font)

    let sp1 = WIDTH / 10
    let size = 55
    let y = yLamps + sp1 * 0.3
    let x = sp1 
    for(let i = 0; i < keys.length; i++){
        fill(30)
        if(activeLamp != undefined && activeLamp.char == keys[i]){
            if(activeLamp.going == 'up'){
                activeLamp.time = lerp(activeLamp.time, 100, 0.2)
                fill(activeLamp.time, activeLamp.time, 0)
                if(activeLamp.time > 90) activeLamp.going = 'down'
            }
            else{
                activeLamp.time = lerp(activeLamp.time, 0, 0.2)
                fill(activeLamp.time, activeLamp.time, 0)
                if(activeLamp.time < 30) activeLamp = undefined
            }
            
        }
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
    
    textFont(font)

    fill(50)
    rect(0, yKeys, WIDTH, yPlugs)

    textAlign(CENTER, CENTER)

    let size = 60
    for(let i = 0; i < keyButtons.length; i++){
        let button = keyButtons[i]

        fill(30)
        stroke(150)
        button.state == 'none' ? strokeWeight(3) : strokeWeight(5)
        size = button.state == 'pressed' ? 67 : 60
        ellipse(button.x, button.y, size, size)

        fill(250)
        noStroke()
        button.state == 'pressed' ? textSize(38) : textSize(30)
        text(button.char, button.x, button.y + 3)
    }

    pop()
}

function drawPlugs(){
    push()
    fill(70)
    rect(0, yPlugs, WIDTH, HEIGHT)

    textAlign(CENTER, CENTER)
    textSize(14)
    textFont(font)

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

    

    fill(darkCol)
    rect(WIDTH, 0, width, HEIGHT)

    rectMode(CENTER)
    fill(lightCol)
    rect(WIDTH + WIDTHUI * 0.5, HEIGHT *0.5, WIDTHUI - 30, HEIGHT - 30)

    textFont(font)
    textAlign(CENTER, CENTER)
    textSize(35)
    fill(darkCol)
    text('MÁQUINA ENIGMA', WIDTH + WIDTHUI * 0.5, 50)

    stroke(darkCol)
    strokeWeight(1.5)
    line(WIDTH + 30, 80, width - 30, 80)

    noStroke()
    textSize(13.5)
    textAlign(LEFT, TOP)
    text(desc, WIDTH + WIDTHUI * 0.5, 95, WIDTHUI-70)

    textWrap(CHAR)

    textSize(18)
    text('TEXTO DE ENTRADA', WIDTH + 30, 330)
    textSize(15)
    text(inputText, WIDTH + WIDTHUI * 0.5, 355, WIDTHUI-70)
    noFill()
    stroke(darkCol)
    strokeWeight(1.5)
    push()
    rectMode(CORNER)
    rect(WIDTH + 30, 350, WIDTHUI - 60, 200)
    pop()

    textSize(18)
    fill(darkCol)
    noStroke()
    text('TEXTO ENCRIPTADO', WIDTH + 30, 580)
    textSize(15)
    text(outputText, WIDTH + WIDTHUI * 0.5, 605, WIDTHUI-70)
    noFill()
    stroke(darkCol)
    strokeWeight(1.5)
    rectMode(CORNER)
    rect(WIDTH + 30, 600, WIDTHUI - 60, 200)

    pop()
}

function createButtons(){

    let sp1 = WIDTH / 10
    let y = yKeys + sp1 * 0.5
    let x = sp1 
    for(let i = 0; i < keys.length; i++){

        keyButtons.push({
            char: keys[i],
            x: x,
            y: y,
            state: 'none',
            time: 0
        })

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

function handleKeys(){
    for(let button of keyButtons){
        if(dist(mouseX, mouseY, button.x, button.y) < 31){
            if(button.state != 'pressed' && mouseIsPressed){ 
                inputChar(button)
            }
            else if(!mouseIsPressed) button.state = 'hover'
            break
        }
        else if(button.time == 0) button.state = 'none'
        button.time--
        if(button.time < 0) button.time = 0
    }
}

function inputChar(button){
    inputText += button.char
    let encodedChar = getCodedChar(button.char)
    outputText += encodedChar
    activeLamp = {
        char: encodedChar,
        time: 30,
        going: 'up'
    }
    button.state = 'pressed'
}