const WIDTH = 600
const HEIGHT = 600

let cellsPerRow = 30
let cellPixelSize = WIDTH / cellsPerRow
let mapSize = 61

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

let maxHealthCell = 5        //vida de los bloques normales
let maxHealthCellMat = 10    //vida de los bloques de materiales
let baseHpCellExp = 20       //vida de los barriles explosivos

let coolDownMovement = 1 //frames
let coolDownMining = 5 //frames

let transitioning = false
let transitionFrames = 0
let transitionFramesCounter = transitionFrames
let transitionChunk = undefined
let transitionChunkPos = undefined
let translationPlayer



let animations = []

let fovRadius = 15      //la luz que tu emites (no ves a traves de las paredes)
let fovRadiusWall = 5    //es como un sensor que te permite ver que hay en las paredes a tu alrededor (5)


/*
Proceso generacion terreno
1. Todo es solido
2. Se generan caminos (aire)
3. Se generan cumulos de diferentes materiales
*/