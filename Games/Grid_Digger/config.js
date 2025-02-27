
let cellsPerCol = 30
let cellsPerRow = Math.round(cellsPerCol*1.78)
//let cellsPerRow = 30

let cellPixelSize = 30
let mapSize = 61

const HEIGHT = cellPixelSize * cellsPerCol
const WIDTH = cellPixelSize * cellsPerRow

let currentChunkPos

let chunks = new Map()

let deltaAir = 0.02     //determina la escla de los caminos (longitud)
let airWidth = 0.023    //determina la anchura de los caminos
let offsetAir2 = 512
// let airSeparation = 0.15    //determina la separacion entre caminos (se generan 3 caminos al lado de cada uno)
let deltaUnd = 0.025
let undWidth = 0.025

let deltaMat1 = 0.07
let deltaMat2 = 0.07
let deltaMat3 = 0.2
let offsetMat2 = 512
let offsetUnd = 432

let maxHealthCell = 10        //vida de los bloques normales
let maxHealthCellMat = 10    //vida de los bloques de materiales
let baseHpCellExp = 20       //vida de los barriles explosivos

let coolDownMovement = 2 //frames
let coolDownMining = 2 //frames (nunca menor que 2 porque sino no se ve el efecto de minado)

let transitioning = false
let transitionFrames = 30
let transitionFramesCounter = transitionFrames
let transitionChunk = undefined
let transitionChunkPos = undefined
let translationPlayer

let animations = []

let fovRadius = 15      //la luz que tu emites (no ves a traves de las paredes)
let fovRadiusWall = 100    //es como un sensor que te permite ver que hay en las paredes a tu alrededor (5)


/*
Proceso generacion terreno
1. Todo es solido
2. Se generan caminos (aire) y bloques indestructibles y bombas
3. Se generan cumulos de diferentes materiales
*/