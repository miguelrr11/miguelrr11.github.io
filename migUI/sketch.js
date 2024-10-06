//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let panel
let back = 100

let cb1, cb2, cb3
let sl1, sl2, sl3
let tt, ss, ip, bt, cp
let th

function setup(){
    createCanvas(WIDTH+200, HEIGHT)
    let properties = {
        retractable: true,
        theme: "techno",
        title: "MIGUI DEMO"
    }
    panel = new Panel(properties)

    cb1 = panel.createCheckbox("RED", false)
    cb2 = panel.createCheckbox("Green", false)
    cb3 = panel.createCheckbox("Blue!", false)

    cp = panel.createColorPicker("color pick me")

    sl1 = panel.createSlider(0, 255, 100, "R", true)
    sl2 = panel.createSlider(0, 255, 0, "G", true)
    sl3 = panel.createSlider(0, 255, 0, "B", true)


    tt = panel.createText("COOL TITLE", true)

    ss = panel.createSelect(["COOL", "AMAZING", "FABULOUS"], "COOL")  

    panel.createText("Enter number between 0 and 255 below and press enter")
    ip = panel.createInput("Enter value ", setval)

    bt = panel.createButton("BLACK", f => back = 0)
    panel.createButton("GREY", f => back = 125)
    panel.createButton("WHITE", f => back = 255)

    th = panel.createSelect(["spiderman", "sublime", "blossom", "techno"], "techno", (f) => {
        panel.setTheme(th.getSelected())
    })
}


function setval(){
    sl1.setValue(ip.getText())
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
    noStroke()
    
    //bordeMIGUI = panel.getValue(3)
    tt.setText(ss.getSelected() + " TITLE")

    // fill(0, 255, 0)
    // ellipse(panel.sliders[1].sliderPos.x, panel.sliders[1].sliderPos.y, 10, 10)
    // fill(0, 0, 255)
    // ellipse(panel.sliders[1].pos.x, panel.sliders[1].pos.y, 10, 10)

    fill(cb1.isChecked()*255, cb2.isChecked()*255, cb3.isChecked()*255)
    ellipse(WIDTH/3, HEIGHT/3, 100, 100)
    
    let r = sl1.getValue()
    let g = sl2.getValue()
    let b = sl3.getValue()
    fill(r, g, b)
    ellipse(WIDTH/2, HEIGHT/2, 100, 100)

    fill(cp.getColor()) 
    ellipse(WIDTH*0.66, HEIGHT*0.66, 100, 100)

    //panel.changeColors(col, "#ffffff")

    panel.update()
    panel.show()

    // fill(255, 150)
    // noStroke()
    // ellipse(panel.lastElementPos.x, panel.lastElementPos.y, 5)
    // fill(0, 150)
    // ellipse(panel.lastElementcreateed.pos.x, panel.lastElementcreateed.pos.y, 10)
    // fill(255, 0, 0, 150)
    // if(panel.lastCB) ellipse(panel.lastCB.pos.x, panel.lastCB.pos.y, 5)
    // fill(0, 255, 0, 150)
    // if(panel.lastBU) ellipse(panel.lastBU.pos.x, panel.lastBU.pos.y, 5)


}


