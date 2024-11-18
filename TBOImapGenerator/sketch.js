//Proceduran TBOI map generator
//Miguel Rodríguez
//18-11-2024

p5.disableFriendlyErrors = true
const WIDTH = 500
const HEIGHT = 500

const nRooms = 15
const tamRoom = WIDTH/nRooms
const roomLimit = nRooms * 10
let map

let images = new Map()

function preload(){
    images.set('1x1', loadImage('1x1.png'))
    images.set('shop', loadImage('Shop.png'))
    images.set('boss', loadImage('Boss.png'))
    images.set('treasure', loadImage('Treasure.png'))
    images.set('2x2', loadImage('2x2.png'))
    images.set('secret', loadImage('Secret.png'))
    images.set('superSecret', loadImage('SuperSecret.png'))
    images.set('curse', loadImage('Curse.png'))
    images.set('sacrifice', loadImage('Sacrifice.png'))
    images.set('library', loadImage('Library.png'))
    images.set('challenge', loadImage('Challenge.png'))
    images.set('planetarium', loadImage('Planetarium.png'))
}

function mouseClicked(){
    map.generate()
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
    map = new TBOImap()
    map.generate()
    frameRate(10)
}

function draw(){
    background("#693C31")
    map.generateRooms()
    map.show()
}
