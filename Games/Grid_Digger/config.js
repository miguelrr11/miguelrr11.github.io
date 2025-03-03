
// NO CAMBAIAR NADA DESDE AQUI
let cellsPerCol = 30
let cellsPerRow = Math.round(cellsPerCol*1.78)

let cellPixelSize = 30
let mapSize = 61

const HEIGHT = cellPixelSize * cellsPerCol
const WIDTH = cellPixelSize * cellsPerRow
// HASTA AQUI

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

let maxHealthCell = 6        //vida de los bloques normales
let maxHealthCellMat = 10    //vida de los bloques de materiales
let baseHpCellExp = 20       //vida de los barriles explosivos

let coolDownMovement = 15 //frames
let coolDownMining = 15 //frames (nunca menor que 2 porque sino no se ve el efecto de minado)

let transitioning = false
let transitionFrames = 30
let transitionFramesCounter = transitionFrames
let transitionChunk = undefined
let transitionChunkPos = undefined
let translationPlayer

let sclNoiseMovement = 0.00025        //para las cells que no se ven y las lineas topograficas

let animations = []

let fovRadius = 15      //la luz que tu emites (no ves a traves de las paredes)
let fovRadiusWall = 5    //es como un sensor que te permite ver que hay en las paredes a tu alrededor (5)
let fovRadiusWallSq = fovRadiusWall * fovRadiusWall

let mat1Name = 'Shlob'
let mat2Name = 'Flonk'
let mat3Name = 'Tribnub'

let posNexo1
let posNexo2
let posNexo3

/*
Proceso generacion terreno
1. Todo es solido
2. Se generan caminos (aire) y bloques indestructibles y bombas
3. Se generan cumulos de diferentes materiales
*/

/*
MATERIALS:
0 = air
1 = MAT1
2 = MAT2
3 = MAT3
4 = UNDESTROYABLE
5 = BOMB

6 = NEXO_UPGRADE_MAT1 - VEL MOVIMIENTO
7 = NEXO_UPGRADE_MAT2 - VEL MINADO
8 = NEXO_UPGRADE_MAT3 - CAMPO VISION
*/