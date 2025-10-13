//Second Attempt at Procedural Road Generation
//Miguel Rodríguez
//01-10-2025

/*
    PIENSA ANTES de programar
    TODO diseñado a base de IDs
    Todos los segmentos empiezan y acaban en nodos
    Los nodos SON las intersecciones
    Los nodos tienen carriles de entrada y carriles de salida
    TODO lo hace el usuario, nada de intersecciones automaticas (igual en el futuro)
    NO hay distincion entre carril en un sentido y carril en otro, porque eso depende del contexto
    NUNCA guardar objetos dentro de objetos (nodos en segmentos por ejemplo), siempre guardar los IDs
    NUNCA guardar vectores de p5, siempre {x, y} simples (convertir a vectores p5 cuando sea necesario, pero solo para hacer calculos)
    Funciones SIMPLES, evitar spaguetti a toda costa
    Angulos en radianes
    MUCHA PROTECCION ANTE ERRORES para no arrastrarlos 
    NOMBRES de variables y funciones CLAROS
    SIEMPRE revisar lo que programe la IA
 */

p5.disableFriendlyErrors = true
let WIDTH = 1400
let HEIGHT = 700

let SHOW_ROAD = false
let SHOW_PATHS = true
let SHOW_NODES = true
let SHOW_CONNECTORS = false
let SHOW_INTERSECSEGS = true

let SHOW_TAGS = false
let SHOW_SEGS_DETAILS = false

let tool
let cars = []

let auxShow = []


async function setup(){
    WIDTH = windowWidth
    HEIGHT = windowHeight
    createCanvas(WIDTH, HEIGHT)
    tool = new Tool()
    let font = await loadFont('font.ttf')
    textFont(font)
}

function addCars(num){
    for(let i = 0; i < num; i++){
        let car = new Car(tool.road)
        cars.push(car)
    }
}

function draw(){
    //background('#F1DBB7')
    background(50)
    //auxShow = []
    if(auxShow.length > 1000) auxShow.splice(0, auxShow.length - 100)

    //background(60)
    tool.update()
    tool.show()
    

    if(cars.length > 0){
        push()
        translate(tool.xOff, tool.yOff)
        scale(tool.zoom)
        cars[0].setStyle()
        for(let car of cars) {
            car.update()
            car.show()
        }
        pop()
    }

    push()
    translate(tool.xOff, tool.yOff)
    scale(tool.zoom)
    fill(0, 255, 0)
    stroke(255)
    strokeWeight(1)
    for(let i = 0; i < auxShow.length; i++){
        fill(0, 255, 0)
        ellipse(auxShow[i].x, auxShow[i].y, map(i, 0, auxShow.length, 2, 6))    
    }
    stroke(255, 0, 0)
    noFill()
    beginShape()
    for(let i = 0; i < auxShow.length; i++){
        vertex(auxShow[i].x, auxShow[i].y)    
    }
    endShape()
    pop()
}

