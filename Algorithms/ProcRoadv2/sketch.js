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
const WIDTH = 800
const HEIGHT = 600

let SHOW_ROAD = false
let SHOW_PATHS = true
let SHOW_NODES = true

let SHOW_CONNECTORS = true
let SHOW_INTERSECSEGS = true
let SHOW_TAGS = true
let SHOW_SEGS_DETAILS = true

let road, menu
let lastHash

let auxShow = []

function setup(){
    createCanvas(WIDTH, HEIGHT)
    road = new Road()
    menu = new Menu()
    lastHash = ''
}

function draw(){
    background(10)

    showCurrent()

    auxShow = []

    let currentHash = JSON.stringify(road, (key, value) => (key === 'road' ? undefined : value))
    if(currentHash != lastHash){ 
        road.setPaths()
        road.trimAllIntersections()
    }
    
    menu.update()


    if(SHOW_ROAD) road.show()
    if(SHOW_NODES) road.showNodes()
    if(SHOW_PATHS) road.showPaths()
    if(SHOW_CONNECTORS) road.showConnectors()
    if(SHOW_INTERSECSEGS) road.showIntersecSegs()

    menu.show() 

    //showAux()

    lastHash = currentHash
}

function showAux(){
    push()
    stroke(0, 255, 0)
    strokeWeight(8)
    if(auxShow) {
        auxShow.forEach(intersection => {
            point(intersection.x, intersection.y)
        })
    }
    pop()
}
