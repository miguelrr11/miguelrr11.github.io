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
const WIDTH = 600
const HEIGHT = 600

let road

function setup(){
    createCanvas(WIDTH, HEIGHT)
    road = new Road()
}

function draw(){
    background(0)

    showCurrent()
    road.show()

    
}
