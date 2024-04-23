//Curves Table Lissajous
//Miguel Rodríguez
//19-04-24


const WIDTH = 1400
const HEIGHT = 750
let angle
let rad
let offset
let rows
let cols
let curves = []
let slider
let oldValSlider = 50
let offset_x = 150
let offset_y = 50

function setup(){
    createCanvas(WIDTH, HEIGHT)
    noFill()
    stroke(255)
    angle = -HALF_PI
    colorMode(HSB)
    slider = createSlider(20, 100, oldValSlider, 1)
    reset()
}

function reset(){
    rad = slider.value()
    offset = rad+10
    rows = floor((WIDTH-150)/(offset))
    cols = floor((HEIGHT-150)/(offset))
    for(let i = 0; i < rows; i++){
        curves[i] = []
        for(let j = 0; j < cols; j++){
            curves[i][j] = new curve((map(i, 0, rows, 0, 360) + map(j, 0, cols, 0, 360))/2)
        }
    }
    oldValSlider = rad
}

function draw(){
    background(0)

    if(oldValSlider != slider.value()) reset()

    for(let i = 0; i < rows; i++){
        let x = rad/2 * cos(angle * (i+1)) + offset_x + i*offset
        let y = rad/2 * sin(angle * (i+1)) + offset_y
        strokeWeight(3)
        stroke(map(i, 0, rows, 0, 360), 100, 100)
        ellipse(offset_x + i*offset, offset_y, rad)
        strokeWeight(1)
        stroke(0, 0, 25)
        line(x, 0, x, HEIGHT)
        stroke(255)
        strokeWeight(8)
        point(x, y)
        for(let k = 0; k < cols; k++){
            curves[i][k].setX(x)
        }
    }

    for(let j = 0; j < cols; j++){
        let x = rad/2 * cos(angle * (j+1)) + offset_y
        let y =rad/2 * sin(angle * (j+1)) + offset_x + j*offset
        strokeWeight(3)
        stroke(map(j, 0, cols, 0, 360), 100, 100)
        ellipse(offset_y, offset_x + j*offset, rad)
        stroke(0, 0, 25)
        strokeWeight(1)
        line(0, y, WIDTH, y)
        stroke(255)
        strokeWeight(8)
        point(x, y)
        for(let k = 0; k < rows; k++){
            curves[k][j].setY(y)
        }
    }


    for(let i = 0; i < rows; i++){
        for(let j = 0; j < cols; j++){
            if(angle >= TWO_PI) curves[i][j].clear()
            else{
                curves[i][j].add()
                curves[i][j].show()
            }
        }
    }

    if(angle >= TWO_PI) angle = -HALF_PI
    else angle += 0.01
}