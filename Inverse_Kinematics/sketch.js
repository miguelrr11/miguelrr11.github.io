//Inverse Kinematics
//Miguel Rodríguez Rodríguez
//30-08-2024

const WIDTH = 1200
const HEIGHT = 800

let chains = []
const n = 100
let selector
let oldSelected = 'fabric'

let slider
let oldSlider = 3


function setup(){
    createCanvas(WIDTH, HEIGHT)
    for(let i = 0; i < HEIGHT*2+WIDTH*2; i += 10){
        if(i < WIDTH) chains.push(new Chain(createVector(i, 0), n, 10))
        else if(i < WIDTH+HEIGHT) chains.push(new Chain(createVector(WIDTH, i%HEIGHT), n, 10))
        else if(i < WIDTH*2+HEIGHT) chains.push(new Chain(createVector(i%WIDTH, HEIGHT), n, 10))
        else if(i < HEIGHT*2+WIDTH*2) chains.push(new Chain(createVector(0, i%HEIGHT), n, 10))
    }
    selector = createSelect()
    selector.option('fabric')
    selector.option('snake')
    selector.option('robot')
    selector.option('simple')
    selector.selected('snake')

    slider = createSlider(1, 20, 3, 1)
}

function mouseWheel(){
    if(selector.selected() == 'fabric'){
       if(chains[0].segments.length == 1){
            chains = []
            for(let i = 0; i < HEIGHT*2+WIDTH*2; i += 10){
                if(i < WIDTH) chains.push(new Chain(createVector(i, 0), n, 10))
                else if(i < WIDTH+HEIGHT) chains.push(new Chain(createVector(WIDTH, i%HEIGHT), n, 10))
                else if(i < WIDTH*2+HEIGHT) chains.push(new Chain(createVector(i%WIDTH, HEIGHT), n, 10))
                else if(i < HEIGHT*2+WIDTH*2) chains.push(new Chain(createVector(0, i%HEIGHT), n, 10))
            }
        }
        else{
            for(let c of chains){
                c.segments.splice(-1, 1)
            }
        } 
    }
    
    return false
}

function draw(){
    background(0)
    if(oldSelected != selector.selected()){
        oldSelected = selector.selected()
        if(oldSelected == 'fabric'){
            chains = []
            for(let i = 0; i < HEIGHT*2+WIDTH*2; i += 10){
                if(i < WIDTH) chains.push(new Chain(createVector(i, 0), n, 10))
                else if(i < WIDTH+HEIGHT) chains.push(new Chain(createVector(WIDTH, i%HEIGHT), n, 10))
                else if(i < WIDTH*2+HEIGHT) chains.push(new Chain(createVector(i%WIDTH, HEIGHT), n, 10))
                else if(i < HEIGHT*2+WIDTH*2) chains.push(new Chain(createVector(0, i%HEIGHT), n, 10))
            }
        }
        else if(oldSelected == 'snake'){
            chains = []
            chains.push(new Chain(createVector(WIDTH/2, HEIGHT/2), 200, 5))
        }
        else if(oldSelected == 'robot'){
            chains = []
            chains.push(new Chain(createVector(WIDTH/2, HEIGHT), 10, 50))
        }
        else if(oldSelected == 'simple'){
            chains = []
            chains.push(new Chain(createVector(WIDTH/2, HEIGHT/2), 3, 100))
        }
    }
    if(oldSelected == 'simple' && oldSlider != slider.value()){
        oldSlider = slider.value()
        chains = []
        chains.push(new Chain(createVector(WIDTH/2, HEIGHT/2), oldSlider, 300/oldSlider))
        
    }
    for(let c of chains){
        c.update(oldSelected)
        c.show(oldSelected)
    }
}