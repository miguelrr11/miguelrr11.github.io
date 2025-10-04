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
const WIDTH = 1400
const HEIGHT = 700

let SHOW_ROAD = false
let SHOW_PATHS = true
let SHOW_NODES = true
let SHOW_CONNECTORS = false
let SHOW_INTERSECSEGS = true

let SHOW_TAGS = false
let SHOW_SEGS_DETAILS = false

let tool

let auxShow = []

function setup(){
    createCanvas(WIDTH, HEIGHT)
    tool = new Tool()
}

function draw(){
    background(10)
    tool.update()
    tool.show()
}

