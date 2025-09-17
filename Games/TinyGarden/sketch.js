//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600
const WIDTH_UI = 250

let gardenSize = 3
let garden = []
let gold = 10
let spotCost = 10

let panel, font

async function setup(){
    createCanvas(WIDTH + WIDTH_UI, HEIGHT)
    
    for(let i = 0; i < gardenSize; i++){
        garden[i] = []
        for(let j = 0; j < gardenSize; j++){
            garden[i][j] = new Spot(i, j)
        }
    }
    garden[1][1].buy()

    font = await loadFont("migUI/main/font.ttf")
    panel = new Panel({
        x: WIDTH,
        darkCol: "#dda15e",
        lightCol: "#754316",
        h: HEIGHT,
        automaticHeight: false,
        w: WIDTH_UI,
        title: "TINY GARDEN",
        font: font
    })
    panel.createSeparator()
    let goldText = panel.createText('', true, true)
    goldText.setFunc(() => {return 'Gold: ' + gold})
    panel.lastElementPos.y += 15
    panel.createSeparator()
}

function draw(){
    background(0)

    for(let i = 0; i < garden.length; i++){
        for(let j = 0; j < garden[0].length; j++){
            garden[i][j].update()
            garden[i][j].show()
        }
    }

    panel.update()
    panel.show()
    
}


