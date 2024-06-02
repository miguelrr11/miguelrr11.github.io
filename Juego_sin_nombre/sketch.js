//Proyecto empezado el 25-04-24

p5.disableFriendlyErrors = true;
const WIDTH = 1050
const HEIGHT = 750
// const WIDTH = 1900-300
// const HEIGHT = 1000
let nexus
let fleet
let rayos = []
let spawner
let orbit
let menu
let fps = 0
const animationLimit = 5000

const count_dif_tot = 60*5
let count_dif = count_dif_tot
let activeAnim = []
let activeAnimMenu = []

let pausa = false
let heatSprite

let p

let bh
let ml

function preload(){
    heatSprite = loadImage('heat_sprite.png')
}

function setup(){
    createCanvas(WIDTH + 300, HEIGHT)
    frameRate(60)
    nexus = new Nexus(createVector(WIDTH/2,HEIGHT/2))
    fleet = new Fleet(50)
    spawner = new Spawner(fleet, 5, 1, 1)
    orbit = new Orbit()
    menu = new Menu(createVector(WIDTH, 0), 300, HEIGHT)
    noSmooth()
    p = createP()

    //bh = new BlackHole(createVector(300, 300))
    //ml = new MisileLauncher(createVector(300, 300))
}


function draw(){

    if(isMouseInCanvas()) pausa = false
    else pausa = true
    if(!pausa){
        background(0)
        count_dif--
        if(count_dif <= 0){
            count_dif = count_dif_tot
            aumentarDificultadProg()
        }

        for(let i = 0; i < rayos.length; i++){
            let r = rayos[i]
            r.show()
            if(r.finished) rayos.splice(i, 1)
        }

        for(let i = 0; i < activeAnim.length; i++){
            let a = activeAnim[i]
            a.show()
            if(a.isFinished()) activeAnim.splice(i, 1)
        }

        spawner.update()
        nexus.update()
        orbit.update()

        // Hacer bien esta mierda
        if(bh){
            bh.update()
            bh.show()
        }
        if(ml){
            ml.update()
            ml.show()
        }

        fleet.update()
        
    }
    if(pausa) menu.showPausa()
    menu.show()

    for(let i = 0; i < activeAnimMenu.length; i++){
        let a = activeAnimMenu[i]
        push()
        a.show()
        pop()
        if(a.isFinished()) activeAnimMenu.splice(i, 1)
    }
    
    if(bh && bh.tam <= 0){ 
        bh.explode()
        bh = undefined
    }

    if(ml && ml.lifetime == 0){ 
        ml.explode()
        ml = undefined
    }
    

    

    p.html("activeAnim: " + activeAnim.length +
            "   fleet: " + fleet.enemies.length +
            "   rayos: " + rayos.length +
            "   moons: " + orbit.moons.length + 
            "   heat: " + floor(nexus.heat))
}




