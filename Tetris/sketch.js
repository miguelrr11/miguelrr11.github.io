//10x20
// Z - rotate
// X - place piece the down
// C - hold piece 

const tamCell = 25
const tamNextCell = tamCell*0.82
const WIDTH = 10*tamCell
const HEIGHT = 20*tamCell

let board = []
let newBoard = []
let tetras = []
let current 
let next
let preview

let taken_out = false
let holded

let coolDown = 0
let timeStep = 0
let score = 0

let gameOver = false

function mouseClicked(){
    console.log(floor(mouseX/tamCell), floor(mouseY/tamCell))
}

function keyPressed(){
    if(keyCode == 32) noLoop()
    else if(keyCode == 13) loop()
    else if(keyCode == 39) current.moveRight()
    else if(keyCode == 37) current.moveLeft()
    else if(keyCode == 90) current.rotate()
    else if(keyCode == 88) current.moveMostDown()
    else if(keyCode == 67) hold()
    coolDown = 20
}

//avanzar todos los tetraminos a la vez
function gameStep(){
    for(t of tetras) t.fall()
    update()
}

function update(){
    for(let i = 0; i < 10; i++){
        for(let j = 0; j < 25; j++){
            cell = board[i][j]
            if(cell != undefined){
                newBoard[cell.nextPos.x][cell.nextPos.y] = cell
                cell.pos = cell.nextPos.copy()
            }

        }
    }
    for(let i = 0; i < 10; i++){
        for(let j = 0; j < 25; j++){
            board[i][j] = newBoard[i][j]
            newBoard[i][j] = undefined
        }
    }
    
}

function init(){
    board = []
    newBoard = []
    tetras = []
    current = undefined
    next = undefined
    preview = undefined

    taken_out = false
    holded = undefined

    coolDown = 0
    timeStep = 0
    score = 0
    for(let i = 0; i < 10; i++){
        board[i] = []
        newBoard[i] = []
    }
    let aux = random()
    let interval = 1/7
    if(aux < interval) current = new Tetramino_I()
    else if(aux < interval*2) current = new Tetramino_J()
    else if(aux < interval*3) current = new Tetramino_L()
    else if(aux < interval*4) current = new Tetramino_O()
    else if(aux < interval*5) current = new Tetramino_S()
    else if(aux < interval*6) current = new Tetramino_T()
    else current = new Tetramino_Z()
    getNextTetra()
}


function setup(){
    createCanvas((WIDTH+170), HEIGHT+50)
    
    init()
}

function draw(){
    coolDown--
    if (keyIsPressed && timeStep % 3 == 0){ 
        if(keyCode == 40) current.fall(true)
        if(coolDown <= 0 && keyCode == 39) current.moveRight()
        if(coolDown <= 0 && keyCode == 37) current.moveLeft()
        update()
    }
    background(color_Back)
    timeStep++
    if(timeStep % 20 == 0){
        gameStep()
        timeStep = 0
    }
    if(!gameOver){
        drawNextTetra()
        drawPreview()
        drawHold()
        drawBoard()
        drawGrid()
    }
    if(gameOver) drawGO()
}

function drawGO(){
    push()
    translate(70, 250)
    noStroke()
    fill(color_Text)
    textFont("Gill Sans")
    textSize(60)
    text("GAME", 0, 0)
    text("OVER", 7, 60)
    pop()
}

function drawBoard(){
    push()
    for(let i = 0; i < 10; i++){
        for(let j = 4; j < 25; j++){
            if(board[i][j] != undefined) board[i][j].show(tamCell)
        }
    }
    pop()
    push()
    translate(WIDTH+50,0)
    textFont("Gill Sans")
    textSize(30)
    fill(color_Text)
    text("NEXT", 9, 45)
    noFill()
    strokeWeight(2)
    stroke(color_Text)
    rect(0, 60, 98, 98)
    translate(0, 150)
    fill(color_Text)
    noStroke()
    text("HOLD", 9, 45)
    noFill()
    stroke(color_Text)
    rect(0, 60, 98, 98)
    noStroke()
    fill(color_Text)
    translate(0, 185)
    textSize(17)
    text("Z - Rotate", 0, 0)
    text("X - Place", 0, 20)
    text("C - Hold", 0, 40)
    text("SCORE", 0, 80)
    textSize(30)
    text(score, 0, 110)
    pop()
}

function drawGrid(){
    push()
    stroke(color_Lines)
    strokeWeight(2)
    translate(25, 25)
    for(let i = 0; i < 21; i++){
        line(0, i*tamCell, 10*tamCell, i*tamCell)
    }
    for(let j = 0; j < 11; j++){
        line(j*tamCell, HEIGHT, j*tamCell, 0)   
    }
    pop()
}