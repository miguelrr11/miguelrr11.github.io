//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 700

let panel
let back = 100

let cb1, cb2, cb3
let sl1, sl2, sl3
let tt, ss, ip, bt, cp
let th
let np1, np2
let opp

let widthPanel = 245

let panel2

let fontPanel

function preload(){
    fontPanel = loadFont("../migUI/main/bnr.ttf")
}

function setup(){
    createCanvas(WIDTH+widthPanel, HEIGHT)
    panel = new Panel({
        retractable: true,
        theme: "techno",
        title: "MIGUI DEMO",
        w: widthPanel,
        x: WIDTH,
        font: fontPanel,
    })
    cb1 = panel.createCheckbox("RED", false)
    cb2 = panel.createCheckbox("Green", false)
    cb3 = panel.createCheckbox("Blue!", false)

    cp = panel.createColorPicker("color pick me")

    sl1 = panel.createSlider(0, 255, 100, "R", true)
    sl2 = panel.createSlider(0, 255, 0, "G", true)
    sl3 = panel.createSlider(0, 255, 0, "B", true)

    tt = panel.createText("COOL TITLE", true)

    ss = panel.createSelect(["COOL", "AMAZING", "FABULOUS"], "COOL")  

    panel.createSeparator()

    panel.createText("Enter number between 0 and 255 below and press enter")
    ip = panel.createInput("Enter value ")
    ip.setFunc(setval)

    panel.createSeparator()

    bt = panel.createButton("BLACK")
    let bt2 = panel.createButton("GREY")
    let bt3 = panel.createButton("WHITE")
    bt.setFunc(f => back = 0)
    bt2.setFunc(f => back = 125)
    bt3.setFunc(f => back = 255)

    th = panel.createSelect(["spiderman", "sublime", "blossom", "techno"], "techno")
    th.setFunc(f => {panel.setTheme(th.getSelected())})
    
    np1 = panel.createNumberPicker("Add circ.", 0, 22, 1, 1)
    np1.setFunc(npMinus, true)

    opp = panel.createOptionPicker("options", ["a", "b", "c"])
}


function npMinus(arg){
    console.log(arg)
}

function setval(){
    sl1.setValue(ip.getText())
}

function logInput(text){
    console.log(text)
}

function hola(){
    back = Math.random() * 255
}

function adios(){
    console.log("adios")
}

// function mouseClicked(){
//     // if(mouseX < WIDTH){
//     //     panel2 = new Panel({
//     //         x: mouseX,
//     //         y: mouseY,
//     //         theme: 'techno'
//     //     })
//     //     panel2.createInput()
//     //     panel2.inputs[0].active = true
//     // }

//     panel2 = new Input(mouseX, mouseY, "Enter name of pin", () => {
//         name = panel2.getText()
//         panel2 = null
//     }, [23, 177, 173], [9, 35, 39])
// }

let name


function draw(){
    background(back)
    noStroke()

    fill(140)
    for(let i = 0; i < np1.getValue(); i++) ellipse(30, i*30+35, 22)
    
    tt.setText(ss.getSelected() + " TITLE")


    fill(cb1.isChecked()*255, cb2.isChecked()*255, cb3.isChecked()*255)
    ellipse(WIDTH/3, HEIGHT/3, 100, 100)
    
    let r = sl1.getValue()
    let g = sl2.getValue()
    let b = sl3.getValue()
    fill(r, g, b)
    ellipse(WIDTH/2, HEIGHT/2, 100, 100)

    fill(cp.getColor()) 
    ellipse(WIDTH*0.66, HEIGHT*0.66, 100, 100)


    panel.update()
    panel.show()

    if(panel2){
        panel2.active = true
        panel2.update()
        panel2.show()
    }
    

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


