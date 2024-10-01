//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let panel
let back = 100

function setup(){
    createCanvas(WIDTH+200, HEIGHT)
    let properties = {
        retractable: true,
        theme: "blossom",
        automaticHeight: true
    }
    panel = new Panel(properties)

    panel.addCheckbox("RED", false)
    panel.addCheckbox("Green", false)
    panel.addCheckbox("Blue!", false)

    panel.addColorPicker("color pick me")

    panel.addSlider(0, 255, 100, "R", true)
    panel.addSlider(0, 255, 0, "G", true)
    panel.addSlider(0, 255, 0, "B", true)


    panel.addText("COOL TITLE", true)

    panel.addSelect(["OPTION 1", "option 2", "option 3"], "option 2")  

    
    panel.addInput("Enter value fasdfasdfasdfasdf", setval)
    panel.addText("Enter value below\nand press enter")

    panel.addButton("GGGGGGrsdgtsdgfsagsdfgfsdgsdfgsdgsdfr", hola)
}


function setval(value){
    panel.setValue(0, value)
}

function logInput(text){
    console.log(text)
}

function hola(){
    back = random() * 255
}

function adios(){
    console.log("adios")
}


function draw(){
    background(back)
    
    panel.update()
    
    panel.show()

    //bordeMIGUI = panel.getValue(3)

    // fill(0, 255, 0)
    // ellipse(panel.sliders[1].sliderPos.x, panel.sliders[1].sliderPos.y, 10, 10)
    // fill(0, 0, 255)
    // ellipse(panel.sliders[1].pos.x, panel.sliders[1].pos.y, 10, 10)

    fill(panel.isChecked(0) ? 255 : 0, panel.isChecked(1) ? 255 : 0, panel.isChecked(2) ? 255 : 0)
    ellipse(WIDTH/3, HEIGHT/3, 100, 100)



    let selected = panel.getSelected(0)
    if(selected == "pene") console.log("caca de la vaca")
    
    let r = panel.getValue(0)
    let g = panel.getValue(1)
    let b = panel.getValue(2)
    fill(r, g, b)
    ellipse(WIDTH/2, HEIGHT/2, 100, 100)

    let col = panel.getColor(0)
    fill(col) 
    ellipse(WIDTH*0.66, HEIGHT*0.66, 100, 100)

    //panel.changeColors(col, "#ffffff")

    // fill(255)
    // ellipse(panel.lastElementPos.x, panel.lastElementPos.y, 10, 10)


}
