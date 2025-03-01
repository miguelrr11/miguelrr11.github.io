//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 900
const HEIGHT = 600

const colBack = "#3c3c3c"

let panel, fontPanel
let inputTask

function preload(){
    fontPanel = loadFont("migUI/main/bnr.ttf")
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
    panel = new Panel({
        retractable: false,
        title: "TODOs",
        theme: 'light',
        w: WIDTH,
        x: 0,
        h: HEIGHT,
        y: 0,
        automaticHeight: false
    }, fontPanel)
    inputTask = panel.createInput('Create Task', addTask, true)
}

function addTask(task){
    console.log(task)
}

function draw(){
    background(colBack)

    panel.update()
    panel.show()

}
