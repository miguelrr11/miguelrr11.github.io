//Fractal Dimension
//Miguel Rodríguez
//08/03/2025


let nPoints = 350
let select, slider, deterministaCB
let oldSelect, determinista = false
const WIDTH = 600
const HEIGHT = 600

let helecho = {
    transformaciones: [
        {a:  0.00, b:  0.00, c:  0.00, d:  0.16, e:  0.00, f:  0.00, p: 0.01},
        {a:  0.85, b:  0.04, c: -0.04, d:  0.85, e:  0.00, f:  1.60, p: 0.85},
        {a:  0.20, b: -0.26, c:  0.23, d:  0.22, e:  0.00, f:  1.60, p: 0.07},
        {a: -0.15, b:  0.28, c:  0.26, d:  0.24, e:  0.00, f:  0.44, p: 0.07}
    ],
    size: 50,
    center: {x: WIDTH/2, y: HEIGHT/2}
};

let sierpinski = {
    transformaciones: [
        {a:  0.5, b:  0.00, c:  0.00, d:  0.5, e:  0.00, f:  0.00, p: 0.333},
        {a:  0.5, b:  0.00, c:  0.00, d:  0.5, e:  0.50, f:  0.00, p: 0.333},
        {a:  0.5, b:  0.00, c:  0.00, d:  0.5, e:  0.25, f:  0.5,  p: 0.333},
    ],
    size: 350,
    center: {x: WIDTH/2, y: HEIGHT/2}
}

let agujas = {
    transformaciones: [
        {a:  0.0, b:  -0.50, c:  0.50, d:  0.0, e:  0.50, f:  0.00, p: 0.333},
        {a:  0.0, b:  0.50, c:  -0.50, d:  0.0, e:  0.50, f:  0.50, p: 0.333},
        {a:  0.5, b:  0.00, c:  0.00, d:  0.5, e:  0.25, f:  0.5,  p: 0.333},
    ],
    size: 500,
    center: {x: WIDTH/2, y: HEIGHT/2}
}

let laberinto = {
    transformaciones: [
        {a:  0.333, b:  0.00, c:  0.00, d:  0.333, e:  0.333, f:  0.666, p: 0.333},
        {a:  0.000, b:  0.333, c:  1.00, d:  0.0, e:  0.666, f:  0.0, p: 0.333},
        {a:  0.000, b:  -0.333, c:  1.00, d:  0.0, e:  0.333, f:  0.0,  p: 0.333},
    ],
    size: 500,
    center: {x: WIDTH/2, y: HEIGHT/2}
}

let arbol = {
    transformaciones: [
        {a:  0.195, b:  -0.488, c:  0.34, d:  0.443, e:  0.4431, f:  0.2452, p: 0.2},
        {a:  0.462, b:  0.414, c:  -0.252, d:  0.361, e:  0.2511, f:  0.5692, p: 0.2},
        {a:  -0.058, b:  -0.07, c:  0.453, d:  -0.111, e:  0.5976, f:  0.0969,  p: 0.2},
        {a:  -0.035, b:  0.070, c:  -0.469, d:  -0.022, e:  0.4884, f:  0.5069, p: 0.2},
        {a:  -0.637, b:  0.0, c:  0.0, d:  0.501, e:  0.8562, f:  0.2513, p: 0.2}
    ],
    size: 500,
    center: {x: WIDTH/2, y: HEIGHT/2}
}

let mapaTrans = new Map()
//mapaTrans.set('Helecho', helecho)
mapaTrans.set('Sierpinski', sierpinski)
mapaTrans.set('Agujas', agujas)
mapaTrans.set('Laberinto', laberinto)
//mapaTrans.set('Arbol', arbol)

let listaTrans = Array.from(mapaTrans.keys())

let transformaciones
let inputs, semillasTexto
let semillas = [[0, 0]]
let panel

let fontPanel
function preload(){
    fontPanel = loadFont("migUI/main/bnr.ttf")
}

let UImap = new Map()
let initialPos = {x: WIDTH + 20, y: 95}
let wSliders = 85
let hElements = 13
let yOffset = 20
function crateTransUI(){
    let tx = panel.createText('Offset       Trig         Trig Offset   Time        Sign    Enabled', false, undefined, false)
    tx.reposition(initialPos.x+30, initialPos.y - 20)
    for(let i = 0; i < 6; i++){
        let c
        if(i == 0) c = 'A'
        else if(i == 1) c = 'B'
        else if(i == 2) c = 'C'
        else if(i == 3) c = 'D'
        else if(i == 4) c = 'E'
        else if(i == 5) c = 'F'
        let tx = panel.createText(c)
        tx.reposition(initialPos.x, initialPos.y + i * yOffset + 2)

        let offsetSlider = panel.createSlider(0, 0.01, 0, '', false)
        offsetSlider.reposition(initialPos.x + 30, initialPos.y + i * yOffset, wSliders, hElements)

        let trigSelect = panel.createOptionPicker('', ['cos', 'sin', 'tan'])
        trigSelect.reposition(initialPos.x + 30 + wSliders + 10, initialPos.y + i * yOffset, wSliders, hElements)

        let trigOffsetSlider = panel.createSlider(-Math.PI, Math.PI, 0, '', false)
        trigOffsetSlider.reposition(initialPos.x + 30 + 2 * wSliders + 20, initialPos.y + i * yOffset, wSliders, hElements)

        let timeSlider = panel.createSlider(1, 300, 100, '', false)
        timeSlider.reposition(initialPos.x + 30 + 3 * wSliders + 30, initialPos.y + i * yOffset, wSliders, hElements)

        let signCheckBox = panel.createCheckbox('', false)
        signCheckBox.reposition(initialPos.x + 30 + 4 * wSliders + 40, initialPos.y + i * yOffset, hElements, hElements)

        let enabledCheckBox = panel.createCheckbox('', true)
        enabledCheckBox.reposition(initialPos.x + 30 + 5 * wSliders + 20, initialPos.y + i * yOffset, hElements, hElements)

        let elements = {
            offset: offsetSlider,
            trig: trigSelect,
            trigOffset: trigOffsetSlider,
            time: timeSlider,
            sign: signCheckBox,
            enabled: enabledCheckBox
        }
        UImap.set(i, elements)
    }
}

function setup(){
    createCanvas(WIDTH+540, HEIGHT);
    background(0);
    stroke(255); 
    transformaciones = agujas;
    panel = new Panel({
        title: 'Fractal Dimension',
        x: WIDTH,
        y: 0,
        w: 540,
        h: HEIGHT,
        retractable: false,
        automaticHeight: false
    }, fontPanel)

    let chooseFractalSelect = panel.createOptionPicker('Choose Fractal', listaTrans, (value) => {
        transformaciones = mapaTrans.get(value)
    })
    chooseFractalSelect.w = 150
    crateTransUI()
    dibujarFractal();
}

function draw(){
    background(0);
    modifyFractal()
    push()
    dibujarFractal();
    pop()
    panel.update();
    panel.show();
}

function modifyFractal() {
    const props = ['a', 'b', 'c', 'd', 'e', 'f'];
    for (let t of transformaciones.transformaciones) {
      for (let j = 0; j < props.length; j++) {
        let ui = UImap.get(j);
        let trig = ui.trig.getSelected();
        let trigFunc = trig === 'cos' ? Math.cos : trig === 'sin' ? Math.sin : Math.tan;
        if (ui.enabled.isChecked()) {
          t[props[j]] += (ui.offset.getValue() * trigFunc(ui.time.getValue() + ui.trigOffset.getValue())) * (ui.sign.isChecked() ? -1 : 1);
        }
      }
    }
  }
  

function getEdges(points, size){
    //returns the min and max value of X and Y of the points so I can resize the canvas
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let meanX = 0;
    let meanY = 0;
    for (let p of points) {
        if (p[0] < minX) minX = p[0];
        if (p[0] > maxX) maxX = p[0];
        if (p[1] < minY) minY = p[1];
        if (p[1] > maxY) maxY = p[1];
        meanX += p[0];
        meanY += p[1];
    }
    return {minX: minX*size, maxX: maxX*size, minY: minY*size, maxY: maxY*size, meanX: meanX/points.length*size, meanY: meanY/points.length*size};
}

function dibujarFractal(){
    // Compute the fractal points from the seeds
    let logPoints = Math.log2(nPoints);
    let puntos = [[0, 0]]
    for (let iter = 0; iter < logPoints; iter++) {
        let nuevosPuntos = [];
        for (let p of puntos) {
            for (let t of transformaciones.transformaciones) {
                let xNew = t.a * p[0] + t.b * p[1] + t.e;
                let yNew = t.c * p[0] + t.d * p[1] + t.f;
                nuevosPuntos.push([xNew, yNew]);
            }
        }
        puntos = nuevosPuntos;
    }

    let edges = getEdges(puntos, 1);
    
    push();
    stroke(255, 140);
    strokeWeight(2);
    for (let p of puntos) {
        let x = mapp(p[0], edges.minX, edges.maxX, 0, WIDTH);
        let y = mapp(p[1], edges.minY, edges.maxY, HEIGHT, 0);
        point(x, y);
    }
    pop();
}

