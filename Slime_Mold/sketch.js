//Slime Mold Simulation
//Miguel Rodríguez
//09-09-2024

p5.disableFriendlyErrors = true
const WIDTH = 700
const HEIGHT = 700
let c1 = [hexToRgb("#1d3557"), hexToRgb("#457b9d"), hexToRgb("#e63946")]
let c2 = [hexToRgb("#393e41"), hexToRgb("#f4d35e"), hexToRgb("#fff8f0")]
let c3 = [hexToRgb("#fbf5f3"), hexToRgb("#e28413"), hexToRgb("#000022")]
let c4 = [hexToRgb("#092327"), hexToRgb("#0b5351"), hexToRgb("#17B1AD")]
let activeCol

let dt = 5
const N = WIDTH
const spacing = WIDTH/N
let grid = []
let new_grid = []

let agents = []
let nAgents = 2000

let neigh = [[-1, 0], [1, 0], [0, 1], [0, -1], [0, 0]]
// let neigh = [[-1, -1], [0, -1], [1, -1],
//                    [-1, 0], [0, 0], [1, 0],
//                    [-1, 1], [0, 1], [1, 1]]

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
    if(frameCount % 30 == 0){
        fps = fpsSum/30
        fpsSum = 0
    }

    fov = radians(panel.getValue("Agent FOV"))
    angle = radians(panel.getValue("Agent Steering"))
    dt = Math.floor(panel.getValue("dt"))
    panel.setText(2, "FPS: " + Math.floor(fps))
    let selected = panel.getSelected(0)
    if(selected == "Spiderman") activeCol = c1
    else if(selected == "Slime") activeCol = c2
    else if(selected == "Rusty") activeCol = c3
    else if(selected == "Techno") activeCol = c4
    panel.changeCols(activeCol[0], activeCol[2])
    
    if(panel.isChecked(0)){
        for(let i = 0; i < N; i++){
            for(let j = 0; j < N; j++){
                let sum = 0
                for(let n of neigh){ 
                    if(i + n[0] < 0 || i + n[0] > N-1 || j + n[1] < 0 || j + n[1] > N-1) continue
                    sum += grid[i + n[0]][j + n[1]]
                }
                new_grid[i][j] = sum/5
            }
        }
        
        for(let i = 0; i < N; i++){
            for(let j = 0; j < N; j++){
                grid[i][j] = new_grid[i][j]
            }
        }
    }
    

    for(let i = 0; i < dt; i++){
        for(let a of agents){
            a.update()
            let i = constrain(floor(a.pos.x / spacing), 0, N-1)
            let j = constrain(floor(a.pos.y / spacing), 0, N-1)
            grid[i][j] = 1
        }
    }
    
    
    loadPixels()
    let factorNoBlur = 0.006*dt*0.2
    let factorBlur = 0.006*dt*0.05
    let bool = panel.isChecked(0)
    for(let i = 0; i < N; i++){
        for(let j = 0; j < N; j++){
            new_grid[i] = []
            if(!bool) grid[i][j] -= factorNoBlur
            else grid[i][j] -= factorBlur
            if(grid[i][j] < 0) grid[i][j] = 0
            let r, g, b
            if(grid[i][j] > 0.35){
                let val = mapp(grid[i][j], 0.35, 1, 0, 1)
                r = customLerp(activeCol[1][0], activeCol[2][0], val)
                g = customLerp(activeCol[1][1], activeCol[2][1], val)
                b = customLerp(activeCol[1][2], activeCol[2][2], val)
            }
            else{
                let val = mapp(grid[i][j], 0, 0.35, 0, 1)
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