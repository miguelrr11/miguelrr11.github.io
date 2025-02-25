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
let colOscuridad2_2 = hexToRgb("#1C301C")

//BIOMA 3 - CUEVAS IGNIFUGAS
let colSueloBioma3 = hexToRgb("#e36414")
let colRocaBioma3 = hexToRgb("#6a040f")

//BIOMA 4 - DESIERTO SALADO
let colSueloBioma4 = hexToRgb("#ffe5ec")
let colRocaBioma4 = hexToRgb("#a4133c")

//BIOMA 5 - PLAYA CRUSTÁCEA
let colSueloBioma5 = hexToRgb("#a2d2ff")
let colRocaBioma5 = hexToRgb("#b388eb")

//MISCELANEA
let colUnd = hexToRgb("#38160d")   //undestructible
let colUndMat = hexToRgb("#5c3324")   //undestructible

// MATERIALES
let colMat1 = hexToRgb("#90e0ef")  //ellipse
let colMat2 = hexToRgb("#e76f51")  //square
let colMat3 = hexToRgb("#a7c957")  //triangle

let colors = [colMat1, colMat2, colMat3, colUndMat]