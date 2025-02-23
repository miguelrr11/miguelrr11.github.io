const WIDTH = 600
const HEIGHT = 600

let cellsPerRow = 30
let cellPixelSize = WIDTH / cellsPerRow

let currentChunkPos

let chunks = new Map()

let deltaAir = 0.02     //determina la escla de los caminos (longitud)
let airWidth = 0.023    //determina la anchura de los caminos
let offsetAir2 = 512
// let airSeparation = 0.15    //determina la separacion entre caminos (se generan 3 caminos al lado de cada uno)

let deltaMat1 = 0.07
let deltaMat2 = 0.07
let deltaMat3 = 0.2
let offsetMat2 = 512

let colSuelo = 50
let colFullIluminated = 225
let wallFullIluminated = 100

let colMat1 = hexToRgb("#90e0ef")  //ellipse
let colMat2 = hexToRgb("#e76f51")  //square
let colMat3 = hexToRgb("#a7c957")  //triangle

let colors = [colMat1, colMat2, colMat3]

let coolDownMovement = 1 //frames
let coolDownMining = 2 //frames

let transitioning = false
let transitionFrames = 10
let transitionFramesCounter = transitionFrames
let transitionChunk = undefined
let transitionChunkPos = undefined
let translationPlayer

let maxHealthCell = 5

let animations = []

// fovRadius >= fovRadiusWall SIEMPRE !!!!!
let fovRadius = 20       //la luz que tu emites (no ves a traves de las paredes)
let fovRadiusWall = 20    //es como un sensor que te permite ver que hay en las paredes a tu alrededor (5)


/*
Proceso generacion terreno
1. Todo es solido
2. Se generan caminos (aire)
3. Se generan cumulos de diferentes materiales
*/