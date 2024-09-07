//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let panel

function setup(){
    createCanvas(WIDTH+200, HEIGHT)
    panel = new Panel(WIDTH, 0, 200, HEIGHT, "COLOR \nCONTROLS", [255, 0, 0])
    panel.addCheckbox(false, "RED")
    panel.addCheckbox(false, "Green")
    panel.addCheckbox(false, "Blue!")

    panel.addSlider(0, 255, 0, "R", true)
    panel.addSlider(0, 255, 0, "G", true)
    panel.addSlider(0, 255, 0, "B", true)


    panel.addText("hola", false)
    panel.addText("HOLA", true)
    panel.addText("hola", false)

    panel.addSelect(["option 1", "option 2", "option 3"], "option 2")    

    panel.addInput("Enter text", logInput)
    panel.addInput()

    panel.addButton("Start", hola)
}

function logInput(text){
    console.log(text)
}

function hola(){
    console.log("hola")
}

function adios(){
    console.log("adios")
}


function draw(){
    background(100)
    panel.update()
    panel.show()

    // fill(0, 255, 0)
    // ellipse(panel.sliders[1].sliderPos.x, panel.sliders[1].sliderPos.y, 10, 10)
    // fill(0, 0, 255)
    // ellipse(panel.sliders[1].pos.x, panel.sliders[1].pos.y, 10, 10)

    panel.changeFunc(0, adios)

    fill(panel.isChecked(0) ? 255 : 0, panel.isChecked(1) ? 255 : 0, panel.isChecked(2) ? 255 : 0)
    ellipse(WIDTH/3, HEIGHT/3, 100, 100)

    let selected = panel.getSelected(0)
    if(selected == "pene") console.log("caca de la vaca")
    
    let r = panel.value(0)
    let g = panel.value(1)
    let b = panel.value(2)
    fill(r, g, b)
    ellipse(WIDTH/2, HEIGHT/2, 100, 100)


}
