const WIDTH = 600
const HEIGHT = 600

let cellsPerRow = 20
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

/*
Proceso generacion terreno
1. Todo es solido
2. Se generan caminos (aire)
3. Se generan cumulos de diferentes materiales
*/