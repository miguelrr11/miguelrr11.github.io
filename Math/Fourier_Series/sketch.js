//Forier Series (square & triangle)
//Miguel Rodríguez
//23-04-24

const WIDTH = 900
const HEIGHT = 600
let t = 0
let wave = []
let sliderN
let sliderT
let select

function setup(){
    createCanvas(WIDTH, HEIGHT)
    sliderN = createSlider(1,15, 1)
    sliderT = createSlider(0.01, 0.2, 0.05, 0.01)
    select = createSelect()
    select.option('sq')
    select.option('tr')
    select.selected('sq')
}

function draw(){
    background(0)
    stroke(255)
    noFill()

    strokeWeight(1)
    translate(HEIGHT/2, HEIGHT/2)
    let x = 0 
    let y = 0
    let r = 0

    for(let i = 0; i < sliderN.value(); i++){
        let prevx = x  
        let prevy = y
        let n = 0

        if(select.selected() == 'sq'){
            n = i * 2 + 1
            r = 80 * (4 / (n * PI))
        }

        else if(select.selected() == 'tr'){
            n = (i+1) * Math.pow(-1, i+1)
            r = 160 * (2 / (n * PI))
        }
        
        stroke(255, 100)
        ellipse(prevx, prevy, r*2)
        x += (r * cos(n * t))
        y += (r * sin(n * t))
        stroke(255)
        line(x, y, prevx, prevy)
    }

    wave.unshift(y)

    strokeWeight(1)
    line(x, y, HEIGHT/2, wave[0])

    translate(HEIGHT/2, 0)
    beginShape()
    for(let i = 0; i < wave.length; i++){
        vertex(i, wave[i])
    }   
    endShape()

    if(wave.length > 700) wave.pop()

    t += sliderT.value()
}