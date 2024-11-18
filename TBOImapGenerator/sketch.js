//Proceduran TBOI map generator
//Miguel Rodríguez
//18-11-2024

p5.disableFriendlyErrors = true
const WIDTH = 500
const HEIGHT = 500

const nRooms = 10
const tamRoom = WIDTH/nRooms
const roomLimit = nRooms * 10
let map

let images = new Map()

function preload(){
    images.set('1x1', loadImage('images/1x1.png'))
    images.set('shop', loadImage('images/Shop.png'))
    images.set('boss', loadImage('images/Boss.png'))
    images.set('treasure', loadImage('images/Treasure.png'))
    images.set('2x2', loadImage('images/2x2.png'))
    images.set('secret', loadImage('images/secret.png'))
    images.set('superSecret', loadImage('images/superSecret.png'))
    images.set('curse', loadImage('images/curse.png'))
    images.set('sacrifice', loadImage('images/sacrifice.png'))
    images.set('library', loadImage('images/library.png'))
    images.set('challenge', loadImage('images/challenge.png'))
    images.set('planetarium', loadImage('images/planetarium.png'))
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
    map = new TBOImap()
    map.generate()
    frameRate(5)
}

function draw(){
    background("#693C31")
    map.generateRooms()
    map.show()
}
