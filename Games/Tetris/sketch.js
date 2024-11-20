//Tetris
//Miguel Rodríguez
//23-07-2024

p5.disableFriendlyErrors = true;
const nWidth = 10
const tamCell = 25
const tamNextCell = tamCell*0.82
const WIDTH = nWidth*tamCell
const HEIGHT = 20*tamCell

let board = []
let newBoard = []
let tetras = []
let current 
let next
let preview

let isPaused = false
let taken_out = false
let holded

let coolDown = 0
let timeStep = 0
let score = 0

let gameOver = false

let posPauseX = WIDTH+50
let posPauseY = 430
let posRestartX = WIDTH+50
let posRestartY = 490
let widthButton = 98
let heightButton = 35

let gameSpeed = 60

function mouseClicked(){
    if(isMouseOverPause()){
        isPaused = !isPaused
    }
    else if(isMouseOverRestart()){
        isPaused = false
        init()
    }
}

function keyPressed(){
    if(gameOver) return
    if(keyCode == 32){ 
        isPaused = !isPaused
        return
    }
    if(keyCode == 39) current.moveRight()
    if(keyCode == 37) current.moveLeft()
    if(keyCode == 90) current.rotate()
    if(keyCode == 88) current.moveMostDown()
    if(keyCode == 67) hold()
    coolDown = 20
}

//avanzar todos los tetraminos a la vez
function gameStep(){
    //for(t of tetras) t.fall() asi no funciona el tetris, cateto
    current.fall()
    
}

function update(){
    for(let i = 0; i < nWidth; i++){
        for(let j = 0; j < 25; j++){
            cell = board[i][j]
            if(cell != undefined){
                newBoard[cell.nextPos.x][cell.nextPos.y] = cell
                cell.pos = cell.nextPos.copy()
            }

        }
    }
    for(let i = 0; i < nWidth; i++){
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
    gameOver = false

    coolDown = 0
    timeStep = 0
    score = 0
    for(let i = 0; i < nWidth; i++){
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
    if (!gameOver && !isPaused  && keyIsPressed && timeStep % 3 == 0){ 
        if(keyCode == 40) current.fall(true)
        if(coolDown <= 0 && keyCode == 39) current.moveRight()
        if(coolDown <= 0 && keyCode == 37) current.moveLeft()
    }
    background(color_Back)
    timeStep++
    if(((timeStep % gameSpeed) == 0) && !gameOver && !isPaused){
        gameStep()
        timeStep = 0
        
    }
    if(score >= 20000) gameSpeed = 20
    else gameSpeed = floor(map(score, 0, 20000, 60, 20))
    update()
    drawNextTetra()
    drawPreview()
    drawHold()
    drawBoard()
    drawGrid()
    drawButtons()
    if(gameOver) drawGO()
}

function isMouseOverPause(){
    return (mouseX >= posPauseX && mouseX <= posPauseX+widthButton &&
            mouseY >= posPauseY && mouseY <= posPauseY+heightButton)
}

function isMouseOverRestart(){
    return (mouseX >= posRestartX && mouseX <= posRestartX+widthButton &&
            mouseY >= posRestartY && mouseY <= posRestartY+heightButton)
}

function drawButtons(){
    push()
    textSize(22)
    textFont("Gill Sans")
    strokeWeight(2)
    translate(posPauseX, posPauseY)
    noFill()
    if(isMouseOverPause()) fill(color_Back_Button)
    stroke(color_Text)
    rect(0, 0, widthButton, heightButton)
    noStroke()
    fill(color_Text)
    if(!isPaused) text("PAUSE", 17, 24)
    else text("RESUME", 10, 24)
    stroke(color_Text)
    noFill()
    if(isMouseOverRestart()) fill(color_Back_Button)
    translate(posRestartX-posPauseX, posRestartY-posPauseY)
    rect(0, 0, widthButton, heightButton)
    noStroke()
    fill(color_Text)
    text("RESTART", 6, 24)
    pop()
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
    for(let i = 0; i < nWidth; i++){
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
    //text("SCORE", 0, 65)
    textSize(30)
    text(score, 0, 77)
    pop()
}

function drawGrid(){
    push()
    stroke(color_Lines)
    strokeWeight(2)
    translate(25, 25)
    for(let i = 0; i < 21; i++){
        line(0, i*tamCell, nWidth*tamCell, i*tamCell)
    }
    for(let j = 0; j < nWidth+1; j++){
        line(j*tamCell, HEIGHT, j*tamCell, 0)   
    }
    pop()
}