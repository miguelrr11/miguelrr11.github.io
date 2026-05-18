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

let tool


async function setup(){
    WIDTH = windowWidth
    HEIGHT = windowHeight
    const c = createCanvas(windowWidth, windowHeight);
    c.parent('container');
    c.style('position', 'absolute');
    c.style('top', '0');
    c.style('left', '0');
    c.style('z-index', '2');
    let font = await loadFont('font.ttf')
    textFont(font)
    tool = new Tool()
}


function draw(){
    clear()
    tool.update()
    tool.show()

}

