//Logic Sim (Not finished)
//Miguel Rodríguez
//20-04-24

const WIDTH = 1000
const HEIGHT = 750
let comps = []
let chips = []
let uniendo = false
let moviendo
let btn_spawn_or, btn_spawn_not, btn_spawn_and, btn_clear, btn_create
let btn_more_inputs, btn_less_inputs, btn_more_outputs, btn_less_outputs
let input_name
let edge_comp_in, edge_comp_out
let select_chip
let btn_spawn_chip
let img_trash


function preload() {
  img_trash = loadImage('trash.png');
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
    
    edge_comp_in = new component('', 0, 3, true, 'input')
    edge_comp_out = new component('', 1, 0, true,  'output')
    comps.push(edge_comp_in, edge_comp_out)

    btn_spawn_and = createButton('Spawn AND')
    btn_spawn_or = createButton('Spawn OR')
    btn_spawn_not = createButton('Spawn NOT')
    btn_clear = createButton('Clear')
    input_name = createInput()
    btn_create = createButton('Create')
    btn_less_inputs = createButton('- in')
    btn_more_inputs = createButton('+ in')
    btn_less_outputs = createButton('- out')
    btn_more_outputs = createButton('+ out')
    select_chip = createSelect()
    btn_spawn_chip = createButton('Add')
    
    btn_spawn_and.mousePressed(spawnAND)
    btn_spawn_or.mousePressed(spawnOR)
    btn_spawn_not.mousePressed(spawnNOT)
    btn_clear.mousePressed(clearComps)
    btn_create.mousePressed(createComponent)

    btn_less_inputs.mousePressed(lessIn)
    btn_more_inputs.mousePressed(moreIn)
    btn_less_outputs.mousePressed(lessOut)
    btn_more_outputs.mousePressed(moreOut)

    btn_spawn_chip.mousePressed(spawnSelected)

    
    strokeWeight(8)
}

function spawnAND(){
    comps.push(new component('AND'))
}
function spawnOR(){
    comps.push(new component('OR'))
}
function spawnNOT(){
    comps.push(new component('NOT'))
}
function spawnSelected(){
    for(let c of chips){
        if(c.type == select_chip.selected()){
            const seen = new WeakSet();

            const jsonString = JSON.stringify(c, (key, value) => {
                if (typeof value === "object" && value !== null) {
                if (seen.has(value)) {
                return; // Omit circular references
            }
                seen.add(value);
            }
                return value;
            });

            console.log(jsonString.inputs);
            makeChip(jsonString)

            // let new_c = c.dupe(c)
            // comps.splice(1, 0, new_c)
            // break
        }
    }
}
function clearComps(){
    comps = []
    edge_comp_in = new component('', 0, 3, true, 'input')
    edge_comp_out = new component('', 1, 0, true, 'output')
    comps.push(edge_comp_in, edge_comp_out)
}
function lessIn(){
    if(edge_comp_in.n_out > 0){
        edge_comp_in.n_out--
        edge_comp_in.outputs.pop()
        edge_comp_in.update_pos_nodos()
    }   
}
function moreIn(){
    if(edge_comp_in.n_out < 8){
        edge_comp_in.n_out++
        edge_comp_in.outputs.push(new nodo('output'))
        edge_comp_in.update_pos_nodos()
    }
}
function lessOut(){
    if(edge_comp_out.n_in > 0){
        edge_comp_out.n_in--
        edge_comp_out.inputs.pop()
        edge_comp_out.update_pos_nodos()
    }
}
function moreOut(){
    if(edge_comp_out.n_in < 8){
        edge_comp_out.n_in++
        edge_comp_out.inputs.push(new nodo('input'))
        edge_comp_out.update_pos_nodos()
    }
}

// He perdido 4 kilos haciendo esto
function createComponent(){
    edge_comp_in.isEdge = false
    edge_comp_out.isEdge = false
    edge_comp_in.n_in = edge_comp_in.n_out
    edge_comp_out.n_out = edge_comp_out.n_in
    edge_comp_in.reset_inputs()
    edge_comp_out.reset_outputs()
    edge_comp_in.type = 'BRIDGE'
    edge_comp_out.type = 'BRIDGE'
    let c = new chip(input_name.value(), comps, edge_comp_in.inputs, edge_comp_out.outputs)
    clearComps()
    comps.splice(1, 0, c)
    chips.push(c)
    select_chip.option(c.type)
}


function checkDelete(){
    for(let i = 0; i < comps.length; i++){
        if(dist(comps[i].pos.x, comps[i].pos.y, WIDTH, HEIGHT) < 150){
            for(let k = 0; k < comps[i].outputs.length; k++){
                for(let j = 0; j < comps[i].outputs[k].compsConnected.length; j++){
                    if(comps[i].outputs[k].compsConnected[j]) comps[i].outputs[k].compsConnected[j].eliminarConexion(comps[i].outputs[k])
                }
            }
            comps.splice(i, 1)
        }
    }
}


function draw(){
    background(50)
    image(img_trash, WIDTH-80, HEIGHT-80, 70, 70)

    edge_comp_in.show()
    edge_comp_out.show()

    for(let c of comps){
        c.update_val()
        c.show()
    }
    
    if(uniendo){ 
        stroke(!uniendo.val*255)
        line(uniendo.pos.x, uniendo.pos.y, mouseX, mouseY)
    }

    if(!mouseIsPressed) moviendo = undefined  

    // uniendo es el output
    // unido es el input
    // la conexion se realiza asi: output -----> input
    if(!mouseIsPressed && uniendo){ 
        for(let c of comps){
            let unido = c.click_nodo(mouseX, mouseY, false, true)
            if(unido){
                if(!unido.connected.includes(uniendo) && unido.connected.length == 0){unido.connected.push(uniendo)}
                uniendo.compsConnected.push(c)
                break
            }
        }
        uniendo = undefined
    }

    push()
    noStroke()
    textFont("Courier")
    textSize(20)
    fill(255)
    text("Manten pulsado cualquier tecla para arrastrar componentes", 20, HEIGHT - 20)
    pop()

    checkDelete()
}

function logPath(){
    console.log(edge_comp_out.inputs[0].connected[0])
}

function mouseClicked(){
    for(let c of comps){
        if(c.click_nodo(mouseX, mouseY)) break
    }
}

function mouseDragged(){
    if(keyIsPressed && mouseX < WIDTH && mouseY < HEIGHT){
        for(let i = comps.length-1; i >= 0; i--){
            let c = comps[i]
            if(c.click_comp(mouseX, mouseY)) break
        }  
    }
    else if(mouseX < WIDTH && mouseY < HEIGHT && !uniendo){
        for(let c of comps){
            uniendo = c.click_nodo(mouseX, mouseY, true, false)
            if(uniendo) break
        }
    }
}
