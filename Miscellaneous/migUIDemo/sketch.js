//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 800

let panel, panel2
let back = 100

let cb1, cb2, cb3
let sl1, sl2, sl3
let tt, ss, ip, bt, cp
let th
let np1, np2
let opp
let plot

let widthPanel = 245

let tabs

let fontPanel

let feed1, feed2


async function setup(){
    createCanvas(WIDTH+widthPanel, HEIGHT)
    fontPanel = await loadFont("../migUI/main/bnr.ttf")

    tabs = new TabManager({
        retractable: false,
        theme: "techno",
        title: "MIGUI DEMO",
        w: widthPanel,
        x: WIDTH,
        font: fontPanel,
    })

    panel = tabs.createTab('TAB 1')

    // panel = new Panel({
    //     retractable: false,
    //     theme: "techno",
    //     title: "MIGUI DEMO",
    //     w: widthPanel,
    //     x: WIDTH,
    //     font: fontPanel,
    // })
    cb1 = panel.createCheckbox("RED", false)
    cb2 = panel.createCheckbox("Green", false)
    cb3 = panel.createCheckbox("Blue!", false)
    cb1.setHoverText("Click to toggle red")
    cb2.setHoverText("Click to toggle green")
    cb3.setHoverText("Click to toggle blue")

    cp = panel.createColorPicker("color pick me")
    cp.setHoverText("Click to pick a color")

    sl1 = panel.createSlider(0, 255, 100, "R", true)
    sl2 = panel.createSlider(0, 255, 0, "G", true)
    sl3 = panel.createSlider(0, 255, 0, "B", true)
    sl1.setHoverText("Click to set red value")
    sl2.setHoverText("Click to set green value")
    sl3.setHoverText("Click to set blue value")

    tt = panel.createText("COOL TITLE", true)

    ss = panel.createSelect(["COOL", "AMAZING", "FABULOUS"], "COOL")
    ss.setHoverText("Click to select a value")

    panel.createSeparator()

    panel.createText("Enter number between 0 and 255 below and press enter")
    ip = panel.createInput("Enter value ")
    ip.setFunc(setval)
    ip.setHoverText("Click to set value for slider 1")

    panel.createSeparator()

    bt = panel.createButton("BLACK")
    let bt2 = panel.createButton("GREY")
    let bt3 = panel.createButton("WHITE")
    bt.setFunc(f => back = 0)
    bt2.setFunc(f => back = 125)
    bt3.setFunc(f => back = 255)
    bt.setHoverText("Click to set background to black")
    bt2.setHoverText("Click to set background to grey")
    bt3.setHoverText("Click to set background to white")

    th = panel.createSelect(["spiderman", "sublime", "blossom", "techno"], "techno")
    th.setFunc(f => {panel.setTheme(th.getSelected())})
    th.setHoverText("Click to change theme")
    
    np1 = panel.createNumberPicker("Add circles", 0, 22, 1, 1)
    np1.setHoverText("Click to add circles")
    np1.setFunc(npMinus, true)


    plot = panel.createPlot("Plot", 4)
    plot.setFunc(plotInput)
    plot.setHoverText("The plot shows values for sin, cos, noise and random")

    panel2 = tabs.createTab('TAB 2')
    // panel2 = new Panel({
    //     retractable: true,
    //     theme: "sublime",
    //     title: "MIGUI DEMO 2",
    //     w: widthPanel,
    //     x: WIDTH,
    //     y: 0,
    //     font: fontPanel,
    // })
    panel2.createText("COOL TITLE 2", true)
    panel2.createText("Enter number between 0 and 255 below and press enter")
    ip2 = panel2.createInput("Enter value ")
    ip2.setFunc(setval)
    ip2.setHoverText("Click to set value for slider 1")
    panel2.createSeparator()
    panel2.createText("Enter number between 0 and 255 below and press enter")
    ip3 = panel2.createInput("Enter value ")
    ip3.setFunc(setval)
    panel2.createSeparator()

    tabs.createTab('TAB 3')
    tabs.createTab('EVEN MORE TABS')
    tabs.createTab('ONE MORE')

    feed1 = panel.createCheckbox("feed sin", true)
    feed2 = panel.createCheckbox("feed cos", false)
    feed3 = panel.createCheckbox("feed noi", false)
    feed4 = panel.createCheckbox("feed ran", false)

    plot.setColors([
        255, 180, 120, 70 
    ])
    
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

let name

let n = 0
let showingPanel = 0

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

    if(keyIsPressed && mouseIsPressed){
        tabs.reposition(mouseX, mouseY)
    }

    // panel.update()
    // panel.show()

    if(feed1.isChecked()) plot.feed(Math.sin(frameCount * 0.01) * 100)
    if(feed2.isChecked()) plot.feed(Math.cos(frameCount * 0.01) * 50, 1)
    if(feed3.isChecked()) plot.feed(noise(frameCount * 0.01) * 100, 2)
    if(feed4.isChecked()) plot.feed(random() * 100, 3)

    tabs.update()
    tabs.show()


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

function plotInput(){
    return
    switch(opp.getSelected()){
        case 'sin':
            plot.title = "Sin"
            n = sin(frameCount * 0.01) * 100
            break
        case 'random':
            plot.title = "Random"
            n = random() * 100
            break
        case 'noise':
            plot.title = "Noise"
            n = noise(frameCount * 0.01) * 100
            break
    }

    return n
}