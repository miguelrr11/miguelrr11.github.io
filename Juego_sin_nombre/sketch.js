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
        fleet.update()
    }
    if(pausa) menu.showPausa()
    menu.show()

    for(let i = 0; i < activeAnimMenu.length; i++){
        let a = activeAnimMenu[i]
        a.show()
        if(a.isFinished()) activeAnimMenu.splice(i, 1)
    }

    

    p.html("activeAnim: " + activeAnim.length +
            "   fleet: " + fleet.enemies.length +
            "   rayos: " + rayos.length +
            "   moons: " + orbit.moons.length + 
            "   heat: " + floor(nexus.heat))
}




