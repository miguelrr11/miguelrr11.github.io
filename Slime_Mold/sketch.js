//Slime Mold Simulation
//Miguel Rodríguez
//09-09-2024

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600
const N = WIDTH //OBLIGATORIO
let c1 = [hexToRgb("#1d3557"), hexToRgb("#457b9d"), hexToRgb("#e63946")]
let c2 = [hexToRgb("#393e41"), hexToRgb("#fff8f0"), hexToRgb("#f4d35e")]
let c3 = [hexToRgb("#fbf5f3"), hexToRgb("#e28413"), hexToRgb("#000022")]
let c4 = [hexToRgb("#092327"), hexToRgb("#0b5351"), hexToRgb("#17B1AD")]
let activeCol

let dt = 5

const spacing = WIDTH/N
let grid = []
let new_grid = []

let coss = []
let sins = []

let agents = []
let nAgents = 2000

let neigh = [[-1, 0], [1, 0], [0, 1], [0, -1], [0, 0]]

let panel
let fov
let angle

let fps = 30
let fpsSum = 0

function reset(){
    grid = []
    new_grid = []
    agents = []
    for(let i = 0; i < N; i++){
        grid[i] = []
        new_grid[i] = []
        for(let j = 0; j < N; j++) grid[i][j] = 0
    }

    let selected = panel.getSelected(1)
    if(selected == "Random"){
        for(let i = 0; i < nAgents; i++) agents.push(new Agent(random(WIDTH), random(HEIGHT)))
    }
    else if(selected == "Circle"){
        for(let i = 0; i < nAgents; i++){
            let angle = random(TWO_PI)
            let vec = p5.Vector.fromAngle(angle)
            vec.setMag(random(300))
            agents.push(new Agent(vec.x + WIDTH/2, vec.y + HEIGHT/2, true))
        }
    }
    else if(selected == "Center")for(let i = 0; i < nAgents; i++) agents.push(new Agent(WIDTH/2, HEIGHT/2))
    else if(selected == "Noise"){
        let factor = 500
        for(let i = 0; i < nAgents; i++){
            let x = random(WIDTH/factor)
            let y = random(HEIGHT/factor)
            if(noise(x, y, frameCount) > 0.5) agents.push(new Agent(x*factor, y*factor)) 
        }
    }
}

function setup(){
    createCanvas(WIDTH+200, HEIGHT)
    
    for(let i = 0; i < N; i++){
        grid[i] = []
        new_grid[i] = []
        for(let j = 0; j < N; j++) grid[i][j] = 0
    }
    
    for(let i = 0; i < 6282; i++){
        coss[i] = Math.cos(i/1000)
        sins[i] = Math.sin(i/1000)
    }

    noStroke()
    panel = new Panel(WIDTH, 0, 200, HEIGHT, "SLIME MOLD", undefined, undefined, false)
    panel.addSlider(0, 120, 25, "Agent FOV", true)
    panel.addSlider(0, 90, 35, "Agent Steering", true)
    panel.addSlider(0, 15, 5, "dt", true)
    panel.addText("Themes:")
    panel.addSelect(["Spiderman", "Slime", "Rusty", "Techno"], "Spiderman")
    panel.addText("Starting state:")
    panel.addSelect(["Random", "Circle", "Center", "Noise"], "Center")
    panel.addCheckbox("Blurring", false)
    panel.addButton("Reset", reset)
    panel.addText()

    for(let i = 0; i < nAgents; i++) agents.push(new Agent(WIDTH/2, HEIGHT/2))
}

function draw(){
    //background(dark_col_rgb)
    fpsSum += frameRate()
    if(frameCount % 60 == 0){
        fps = fpsSum/60
        fpsSum = 0
    }

    fov = degreesToRadians(panel.getValue("Agent FOV"))
    angle = degreesToRadians(panel.getValue("Agent Steering"))
    dt = Math.floor(panel.getValue("dt"))
    panel.setText(2, "FPS: " + Math.floor(fps))
    let selected = panel.getSelected(0)
    if(selected == "Spiderman") activeCol = c1
    else if(selected == "Slime") activeCol = c2
    else if(selected == "Rusty") activeCol = c3
    else if(selected == "Techno") activeCol = c4
    panel.changeCols(activeCol[0], activeCol[2])

    
    
    let sum, ni, nj
    if (panel.isChecked(0) && frameCount % 2 == 0) {
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                sum = 0;
                for (let n of neigh) {
                    ni = i + n[0]
                    nj = j + n[1]

                    if (ni >= 0 && ni < N && nj >= 0 && nj < N) {
                        sum += grid[ni][nj];
                    }
                }

                new_grid[i][j] = sum / 5
            }
        }

        SWAP(grid, new_grid)
    }

    let i, j
    for (let t = 0; t < dt; t++) {
        for (let a of agents) {
            a.update();
            i = Math.max(0, Math.min(Math.floor(a.pos.x / spacing), N - 1))
            j = Math.max(0, Math.min(Math.floor(a.pos.y / spacing), N - 1))
            grid[i][j] = 1
        }
    }
    
    
    
    loadPixels()
    let factor = panel.isChecked(0) ? 0.006 * dt * 0.05 : 0.006 * dt * 0.2;
    let r, g, b, val, gridVal
    for(let i = 0; i < N; i++){
        for(let j = 0; j < N; j++){
            grid[i][j] -= factor

            if(grid[i][j] < 0) grid[i][j] = 0

            gridVal = grid[i][j]
            if(gridVal > 0.35){
                val = (gridVal - 0.35) * 1.54
                r = customLerp(activeCol[1][0], activeCol[2][0], val)
                g = customLerp(activeCol[1][1], activeCol[2][1], val)
                b = customLerp(activeCol[1][2], activeCol[2][2], val)
            }
            else{
                val = gridVal * 2.85
                r = customLerp(activeCol[0][0], activeCol[1][0], val)
                g = customLerp(activeCol[0][1], activeCol[1][1], val)
                b = customLerp(activeCol[0][2], activeCol[1][2], val)
            }
            drawFastRect(i * spacing, j * spacing, spacing, spacing, r, g, b)
        }
    }
    updatePixels()

    panel.update()
    panel.show()
    

    // noLoop()
    //for(let a of agents) a.showDebug()
}

function SWAP(x0, x) {
    let temp = x0.slice();  // Copy contents of x0
    x0.length = 0;          // Clear x0
    x0.push(...x);          // Copy contents of x to x0
    x.length = 0;           // Clear x
    x.push(...temp);        // Copy contents of temp (old x0) to x
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

function customLerp(a, b, amt){
    return (1-amt)*a + amt*b
}

function degreesToRadians(degrees) {
    return degrees * 0.017453292519943295; // Precomputed constant (Math.PI / 180)
}