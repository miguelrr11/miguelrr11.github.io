/*
1. Se dibuja el suelo y las rocas con su color
2. Encima de cada celda se dibuja su correspondiente oscuridad
*/



// BIOMA 1 - PÁRAMO ROCOSO
let colSueloBioma1 = hexToRgb("#9A8C98")
let colSueloBioma1_2 = hexToRgb("#C9ADA7")
let colRocaBioma1 = hexToRgb("#4A4E69")
let colOscuridad1 = hexToRgb("#1F1F36")
let colOscuridad1_2 = hexToRgb("#363852")

//BIOMA 2 - BOSQUE FRONDOSO
let colSueloBioma2 = hexToRgb("#778745")
let colSueloBioma2_2 = hexToRgb("#786C3F")
let colRocaBioma2 = hexToRgb("#283618")
let colOscuridad2 = hexToRgb("#152F15")
let colOscuridad2_2 = hexToRgb("#162716")

//BIOMA 3 - CUEVAS IGNIFUGAS
let colSueloBioma3 = hexToRgb("#e36414")
let colSueloBioma3_2 = hexToRgb("#A98879")
let colRocaBioma3 = hexToRgb("#6a040f")
let colOscuridad3 = hexToRgb("#612026")
let colOscuridad3_2 = hexToRgb("#583C3C")

//BIOMA 4 - DESIERTO SALADO
let colSueloBioma4 = hexToRgb("#ffe5ec")
let colSueloBioma4_2 = hexToRgb("#E5B3C1")
let colRocaBioma4 = hexToRgb("#a4133c")
let colOscuridad4 = hexToRgb("#661426")
let colOscuridad4_2 = hexToRgb("#6D1F30")

//BIOMA 5 - PLAYA CRUSTÁCEA
let colSueloBioma5 = hexToRgb("#a2d2ff")
let colSueloBioma5_2 = hexToRgb("#ABADF5")
let colRocaBioma5 = hexToRgb("#843FDE")
let colOscuridad5 = hexToRgb("#7038A8")
let colOscuridad5_2 = hexToRgb("#6F3A90")

//MISCELANEA
let colUnd = hexToRgb("#38160d")   //undestructible
let colUndMat = hexToRgb("#5c3324")   //undestructible
let colCellExp = hexToRgb("#d00000")   //cell explosivo
let colMatExp = hexToRgb("#e85d04")   //material explosivo

// MATERIALES
let colMat1 = hexToRgb("#90e0ef")  //ellipse
let colMat2 = hexToRgb("#e76f51")  //square
let colMat3 = hexToRgb("#a7c957")  //triangle

let colors = [colMat1, colMat2, colMat3, colUndMat, colMatExp]

let colMat1Dark = hexToRgb("#082F36")  //ellipse
let colMat2Dark = hexToRgb("#361107")  //square
let colMat3Dark = hexToRgb("#252E0F")  //triangle

let colMat1Medium = hexToRgb("#147C8F")  //ellipse
let colMat2Medium = hexToRgb("#902C14")  //square
let colMat3Medium = hexToRgb("#566C23")  //triangle