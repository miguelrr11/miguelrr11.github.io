//Langton's Loop Cellular Automata
//Miguel Rodríguez
//17-04-24

const WIDTH = 600
const HEIGHT = 600
let board = []
let new_board = []
let n = 300
let tam_cell = WIDTH/n
let ruleSet = []
let windxy
let range = 60
let count = 0

function preload(){
    let xhr = new XMLHttpRequest();
    nombreArchivo = 'ruleSet.txt'; // Cambia esto por la ruta de tu archivo

  xhr.onload = function() {
    if (xhr.status === 200) {
      let contenido = xhr.responseText;
      let lineas = contenido.split('\n');

      lineas.forEach(function(linea) {
        let numeroStr = linea.trim().toString();
        // Verifica si la longitud de la cadena es de 6 dígitos
        if (numeroStr.length === 6 && /^\d+$/.test(numeroStr)) {
          ruleSet.push(numeroStr); // Almacena el número como cadena
        }
      });
    }
  };

  xhr.open('GET', nombreArchivo);
  xhr.send();
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
    background(0)
    noStroke()
    density = pixelDensity()
    adjustedWidth = width * density;
    windxy = floor(n/2)

    for(let i = 0; i < n; i++){
        board[i] = []
        new_board[i] = []
        for(let j = 0; j < n; j++){
            board[i][j] = 0
            new_board[i][j] = 0
        }
    }

    
    ruleSet.sort()

    let initial = [0,2,2,2,2,2,2,2,2,0,0,0,0,0,
                   2,1,7,0,1,4,0,1,4,2,0,0,0,0,
                   2,0,2,2,2,2,2,2,0,2,0,0,0,0,
                   2,7,2,0,0,0,0,2,1,2,0,0,0,0,
                   2,1,2,0,0,0,0,2,1,2,0,0,0,0,
                   2,0,2,0,0,0,0,2,1,2,0,0,0,0,
                   2,7,2,0,0,0,0,2,1,2,0,0,0,0,
                   2,1,2,2,2,2,2,2,1,2,2,2,2,2,
                   2,0,7,1,0,7,1,0,7,1,1,1,1,1,
                   0,2,2,2,2,2,2,2,2,2,2,2,2,2]

    let max = floor(n/2)-5
    let index = 0
    for(let j = max; j < max+10; j++){
        for(let i = max; i < max+14; i++){
            board[i][j] = initial[index]
            index++
        }
    }

    
}

function draw(){
    background(0)
    noStroke()

    for(let j = 0; j < 5; j++){
        for(let i = 0; i < n; i++){
            for(let j = 0; j < n; j++){
                new_board[i][j] = getNewState(i, j)
            }
        }
    
        board = new_board
        new_board = []
        for(let i = 0; i < n; i++){
            new_board[i] = []
            for(let j = 0; j < n; j++){
                new_board[i][j] = 0
            }
        }
    }
    
    loadPixels()
    drawBoard(board)
    updatePixels()
    
}


function getNewStateAux(c, t, r, b, l){
    for(let k = 0; k < ruleSet.length; k++){
        let rule = ruleSet[k]
        let Cr = getIntPos(rule, 5)
        let Tr = getIntPos(rule, 4)
        let Rr = getIntPos(rule, 3)
        let Br = getIntPos(rule, 2)
        let Lr = getIntPos(rule, 1)
        if(Cr == c && Tr == t && Rr == r && Br == b && Lr == l){
            return getIntPos(rule, 0)
        }
    } 
}


function getNewState(i, j){
    let C = board[i][j]
    let L, T
    if(i-1 < 0) L = board[n-1][j]
    else L = board[(i-1)%n][j]
    if(j-1 < 0) T = board[i][n-1]
    else T = board[i][(j-1)%n]
    let R = board[(i+1)%n][j]
    let B = board[i][(j+1)%n]
    
    if(C == 0 && T == 0 && R == 0 && B == 0 && L == 0) return 0

    for(let k = 0; k < ruleSet.length; k++){
        let rule = ruleSet[k]
        let Cr = getIntPos(rule, 5)
        let Tr = getIntPos(rule, 4)
        let Rr = getIntPos(rule, 3)
        let Br = getIntPos(rule, 2)
        let Lr = getIntPos(rule, 1)
        if(Cr == C && Tr == T && Rr == R && Br == B && Lr == L){
            return getIntPos(rule, 0)
        }
        if(Cr == C && Tr == L && Rr == T && Br == R && Lr == B){
            return getIntPos(rule, 0)
        }
        if(Cr == C && Tr == B && Rr == L && Br == T && Lr == R){
            return getIntPos(rule, 0)
        }
        if(Cr == C && Tr == R && Rr == B && Br == L && Lr == T){
            return getIntPos(rule, 0)
        }
    } 
}


function getIntPos(num, pos){
    var digit = num.charAt(5-pos);
    return Number(digit); 
}

function drawBoard(mat){
    fill(255)
    noStroke()
    let col;
    for(let i = 0; i < n; i++){
        for(let j = 0; j < n; j++){
            switch (mat[i][j]){
            case 0: continue
            case 1:
                col = [0, 0, 255]
                break
            case 2:
                col = [255, 0, 0]
                break
            case 3: 
                col = [0, 255, 0]
                break
            case 4:
                col = [255, 255, 0]
                break
            case 5:
                col = [255, 0, 255]
                break
            case 6 : 
                col = [255, 255, 255]
                break
            case 7 :
                col = [100, 100, 255]
                break
            }
            drawFastRect(i*tam_cell, j*tam_cell, tam_cell, tam_cell, col[0], col[1], col[2])
        }
    }
}