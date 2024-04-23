//Rock Paper Scissors
//Miguel Rodríguez
//18-04-24

/*
0 gana a 1
1 gana a 2
2 gana a 0
*/

const WIDTH = 500
const HEIGHT = 500
let board = []
let new_board = []
let n = 250
let tam_cell = WIDTH/n


function setup(){
    createCanvas(WIDTH, HEIGHT)
    background(0)
    noStroke()


    for(let i = 0; i < n; i++){
        board[i] = []
        new_board[i] = []
        for(let j = 0; j < n; j++){
            board[i][j] = floor(random(0,4))
            new_board[i][j] = 0
        }
    }
}

function draw(){
    background(0)
    for(let i = 0; i < n; i++){
        for(let j = 0; j < n; j++){
            new_board[i][j] = getNewState(i, j)
        }
    }

    drawBoard(new_board)

    for(let i = 0; i < n; i++){
        for(let j = 0; j < n; j++){
            board[i][j] = new_board[i][j];
            new_board[i][j] = 0;
        }
    }
    
}



function getNewState(x, y){
    let n0 = 0  
    let n1 = 0  
    let n2 = 0 
    let cur = board[x][y] 
    for(let i = -1; i < 2; i++){
       for(let j = -1; j < 2; j++){
            if(i == 0 && j == 0) continue
            if(x+i < 0 || x+i >= n || y+j < 0 || y+j >= n) continue
            if(board[x+i][y+j] == 0) n0++
            else if(board[x+i][y+j] == 1) n1++
            else if(board[x+i][y+j] == 2) n2++
        }    
    }
    if(cur == 0 && n2 >= 2) return 2
    if(cur == 1 && n0 >= 2) return 0
    if(cur == 2 && n1 >= 2) return 1
    else return cur
}





function drawBoard(mat){
    for(let i = 0; i < n; i++){
        for(let j = 0; j < n; j++){
            switch (mat[i][j]){
            case 0: fill(50, 83, 121)
                break
            case 1: fill(221, 84, 113)
                break
            case 2: fill(248, 211, 119)
                break
            }
            rect(i*tam_cell, j*tam_cell, tam_cell, tam_cell)
        }
    }
}


