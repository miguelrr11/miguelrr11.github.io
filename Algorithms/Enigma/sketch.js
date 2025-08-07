// Enigma Machine
// Miguel Rodríguez
// 04-08-2025

p5.disableFriendlyErrors = true
const WIDTH = 900
const HEIGHT = 850
const WIDTHUI = 400

const wPlug = 37
const hPlug = 78

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

let physicalConnections = []

let keyButtons = []
let plugButtons = []

let inputText = ''
let outputText = ''
let activeLamps = []
let activeConnections = []

let buttonReplace
let buttonReplaceOn = false

let plugging = undefined

function mouseReleased(){
    buttonReplaceOn = false
}

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
    createPlugButtons()
    createButtonReplace()
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
    
    if(plugging){
        physicalConnections[physicalConnections.length - 1].moving.pos.x = mouseX
        physicalConnections[physicalConnections.length - 1].moving.pos.y = mouseY
    }
    for(let connection of physicalConnections){
        push()
        for(let particle of connection.particles){
            particle.applyForce(createVector(0, 10)) // gravity
            particle.update(deltaTime * 0.01)
        }
        pop()
        push()
        for(let constraint of connection.constraints){
            constraint.satisfy()
        }
        let lamp = isActiveConn(connection.charA) || isActiveConn(connection.charB)
        if(lamp){
            if(lamp.going == 'up'){
                lamp.time = lerpp(lamp.time, 100, 0.2)
                if(lamp.time > 90) lamp.going = 'down'
            }
            else{
                lamp.time = lerpp(lamp.time, 0, 0.2)
                if(lamp.time < 30) lamp = undefined
            }
            if(lamp == undefined) fill(30)
        }
        let col = lamp ? [lamp.time, lamp.time, 0] : 20
        for(let i = 0; i < connection.particles.length - 1; i++){
            let p1 = connection.particles[i]
            let p2 = connection.particles[i + 1]
            stroke(col)
            strokeWeight(12)
            line(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y)
        }
        pop()
    }

    drawPlugBoardConnections()
}

function mouseClicked(){
    //check for plugboard connections
    if(mouseY > yPlugs && mouseY < HEIGHT){
        for(let button of plugButtons){
            if(inBounds(mouseX, mouseY, button.x, button.y, wPlug, hPlug)){
                if(plugging && !button.plugged){
                    addPlug(plugging.char, button.char)
                    plugging.plugged = true
                    button.plugged = true
                    //createPhysicalConnection(plugging, button)
                    let lastConnection = physicalConnections[physicalConnections.length - 1]
                    let lastParticle = lastConnection.particles[lastConnection.particles.length - 1]
                    lastConnection.moving = lastParticle
                    lastParticle.isPinned = true
                    lastParticle.pos = createVector(button.x + wPlug * 0.5, button.y + hPlug * 0.5)
                    lastConnection.charB = button.char
                    plugging = undefined
                }
                else if(!plugging && !button.plugged){
                    plugging = button
                    button.plugged = true
                    createPhysicalConnection(plugging)
                }
            }
        }
    }
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

    rect(s2.x, s2.y, sizeSq, sizeSq, 4)
    rect(s1.x, s1.y, sizeSq, sizeSq, 4)
    rect(s3.x, s3.y, sizeSq, sizeSq, 4)

    fill(255)
    textSize(25)
    textFont(font)
    textAlign(CENTER, CENTER)

    goalOff1 = lerpp(goalOff1, offset1, 0.2)
    goalOff2 = lerpp(goalOff2, offset2, 0.2)
    goalOff3 = lerpp(goalOff3, offset3, 0.2)

    for(let i = 0; i < 26; i++){
        let y1 = s1.y + i * sizeSq - goalOff3 * sizeSq + 3
        text(i, s1.x, y1)

        let y2 = s2.y + i * sizeSq - goalOff2 * sizeSq + 3
        text(i, s2.x, y2)

        let y3 = s3.y + i * sizeSq - goalOff1 * sizeSq + 3
        text(i, s3.x, y3)
    }

    rectMode(CORNER)
    fill(40)
    let sp3 = (yLamps - sizeSq) * 0.5
    rect(0, 0, WIDTH, sp3)
    rect(0, yLamps - sp3, WIDTH, yLamps)

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
        let activeLamp = isActiveLamp(keys[i])
        if(activeLamp){
            if(activeLamp.going == 'up'){
                activeLamp.time = lerpp(activeLamp.time, 100, 0.2)
                fill(activeLamp.time, activeLamp.time, 0)
                if(activeLamp.time > 90) activeLamp.going = 'down'
            }
            else{
                activeLamp.time = lerpp(activeLamp.time, 0, 0.2)
                fill(activeLamp.time, activeLamp.time, 0)
                if(activeLamp.time < 30) activeLamp = undefined
            }
            if(activeLamp == undefined) fill(30)
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

    cleanLamps()

    pop()
}

function cleanLamps(){
    for(let i = activeLamps.length-1; i >= 0; i--){
        if(activeLamps[i].time <= 0.5){
            activeLamps.splice(i, 1)
        }
    }
}

//not used
function dimLamps(){
    if(!keyIsPressed){
        for(let lamp of activeLamps){
            lamp.going = 'down'
            lamp.time = lerpp(lamp.time, 0, 0.2)
        }
    }
}

function isActiveLamp(char){
    for(let lamp of activeLamps){
        if(lamp.char == char) return lamp
    }
    return undefined
}

function isActiveConn(char){
    for(let lamp of activeConnections){
        if(lamp.char == char) return lamp
    }
    return undefined
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
        size = button.state == 'pressed' ? 52 : 60
        ellipse(button.x, button.y, size, size)

        fill(250)
        noStroke()
        button.state == 'pressed' ? textSize(25) : textSize(30)
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
        let button = plugButtons[i]
        let hover = inBounds(mouseX, mouseY, button.x, button.y, wPlug, hPlug)

        if(hover){
            fill(255, 80)
            noStroke()
            rect(button.x, button.y, wPlug, hPlug, 8)
        }

        fill(10)
        stroke(230)
        strokeWeight(4)
        ellipse(x, y, size, size)
        ellipse(x, y + size * 1.8, size, size)

        fill(250)
        noStroke()
        text(keys[i], x - sp2 * 1.2, y + size * 0.9)
        text(order[i], x + sp2 * 1.2, y + size * 0.9)

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

    let inB = inBounds(mouseX, mouseY, buttonReplace.pos.x - buttonReplace.size * 0.5, buttonReplace.pos.y - buttonReplace.size * 0.5, buttonReplace.size, buttonReplace.size)
    if(inB){
        fill(255, 80)
        if(mouseIsPressed && !buttonReplaceOn){
            inputText = outputText
            outputText = getCodedInput(inputText)
            buttonReplaceOn = true
        }
    }
    rectMode(CENTER)
    rect(buttonReplace.pos.x, buttonReplace.pos.y, buttonReplace.size, buttonReplace.size)
    stroke(darkCol)
    strokeWeight(2)
    drawArrowTip(buttonReplace.pos.x, buttonReplace.pos.y - buttonReplace.size * 0.3, PI / 2, buttonReplace.size * 0.3)
    line(buttonReplace.pos.x, buttonReplace.pos.y - buttonReplace.size * 0.3,
         buttonReplace.pos.x, buttonReplace.pos.y + buttonReplace.size * 0.3)

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

function createPlugButtons(){
    let sp1 = WIDTH / 10
    let size = 23
    let y = yPlugs + sp1 * 0.5
    let x = sp1
    for(let i = 0; i < keys.length; i++){

        let ax = x - size * 0.8
        let ay = y - size * 0.8

        plugButtons.push({
            char: keys[i],
            x: ax,
            y: ay,
            state: 'none',
            plugged: false,
        })

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
    pushCharToLamps(encodedChar)
    pushCharToConns(button.char)
    button.state = 'pressed'
}

function pushCharToLamps(char){
    for(let lamp of activeLamps){
        if(lamp.char == char){ 
            lamp.time = 30
            lamp.going = 'up'
            return
        }
    }
    activeLamps.push({
        char: char,
        time: 30,
        going: 'up'
    })
}

function pushCharToConns(char){
    for(let lamp of activeConnections){
        if(lamp.char == char){ 
            lamp.time = 30
            lamp.going = 'up'
            return
        }
    }
    activeConnections.push({
        char: char,
        time: 30,
        going: 'up'
    })
}

function drawDebugPlugs(){
    push()
    noFill()
    stroke(255, 0, 0)
    strokeWeight(2)
    for(let button of plugButtons){
        let x = button.x
        let y = button.y
        let w = wPlug
        let h = hPlug
        rect(x, y, w, h, 5)
    }
    pop()
}

function inBounds(x, y, a, b, w, h) {
    return x < a + w && x > a && y < b + h && y > b;
}

function drawPlugBoardConnections(){
    push()
    stroke(255, 0, 0)
    strokeWeight(2)
    let drawnConnections = new Set()
    for (let [a, b] of plugBoard.entries()) {
        if (!drawnConnections.has(a + b) && !drawnConnections.has(b + a)) {
            let buttonA = plugButtons.find(btn => btn.char === a);
            let buttonB = plugButtons.find(btn => btn.char === b);
            if (buttonA && buttonB) {
                drawPlug(buttonA);
                drawPlug(buttonB);
                drawnConnections.add(a + b);
            }
        }
    }
    if(plugging){
        stroke(0, 255, 0)
        strokeWeight(3)
        drawPlug(plugging)
        //line(mouseX, mouseY, plugging.x + wPlug * 0.5, plugging.y + hPlug * 0.5)
    }
    pop()
}

function drawPlug(plug){
    push()
    fill(80)
    stroke(50)
    strokeWeight(3)
    rect(plug.x, plug.y, wPlug, hPlug, 12)
    stroke(200)
    fill(180)
    ellipse(plug.x + wPlug * 0.5, plug.y + hPlug * 0.5, wPlug * 0.6)
    stroke(130)
    line(plug.x + wPlug * 0.5 - 5, plug.y + hPlug * 0.5 - 5, 
            plug.x + wPlug * 0.5 + 5, plug.y + hPlug * 0.5 + 5);
    pop()
}

function createPhysicalConnection(p1){
    let pos1 = createVector(p1.x + wPlug * 0.5, p1.y + hPlug * 0.5)
    let pos2 = createVector(mouseX, mouseY)
    let nParticles = 20
    let particles = []
    let constraints = []
    for(let i = 0; i < nParticles; i++){
        let t = i / (nParticles - 1)
        let x = lerpp(pos1.x, pos2.x, t)
        let y = lerpp(pos1.y, pos2.y, t)
        particles.push(new Particle(x, y, false))
    }
    for(let i = 0; i < nParticles - 1; i++){
        let p1 = particles[i]
        let p2 = particles[i + 1]
        let c = new Constraint(p1, p2)
        constraints.push(c)
    }
    let p11 = particles[0]
    let p22 = particles[particles.length - 1]
    p11.isPinned = true
    p22.isPinned = true
    physicalConnections.push({
        particles: particles,
        constraints: constraints,
        moving: p22,
        charA: p1.char,
        charB: undefined,
    })

}

function createButtonReplace(){
    let pos = createVector(width - 45, HEIGHT - 275)
    let size = 30
    buttonReplace = {
        pos, 
        size
    }
}