//Grid Digger
//Miguel Rodríguez
//Started on 20-02-2025

p5.disableFriendlyErrors = true


let currentChunk, chunkUp, chunkDown, chunkLeft, chunkRight
let player, anims, curLightMap, transitionLightMap

let SHOW_DEBUG = false

let plotFps, plotAnims

let nFPS = 5
let FPSarr = Array(nFPS).fill(60)
let meanFPS = 60

let showingMinimap = false

function preload(){
    imgNexo1 = loadImage('images/shoe.png')
    imgNexo2 = loadImage('images/pickaxe.png')
    imgNexo3 = loadImage('images/sensor.png')

    //loadAllSounds()

    diggingSounds.push(loadSound('Sounds/Stone_dig1.ogg'))
    diggingSounds.push(loadSound('Sounds/Stone_dig2.ogg'))
    diggingSounds.push(loadSound('Sounds/Stone_dig3.ogg'))
    diggingSounds.push(loadSound('Sounds/Stone_dig4.ogg'))
    diggingSounds.push(loadSound('Sounds/Stone_dig1shifted.ogg'))
    diggingSounds.push(loadSound('Sounds/Stone_dig2shifted.ogg'))
    diggingSounds.push(loadSound('Sounds/Stone_dig3shifted.ogg'))
    diggingSounds.push(loadSound('Sounds/Stone_dig4shifted.ogg'))

    hittingSounds.push(loadSound('Sounds/Stone_hit1.ogg'))
    hittingSounds.push(loadSound('Sounds/Stone_hit2.ogg'))
    hittingSounds.push(loadSound('Sounds/Stone_hit3.ogg'))
    hittingSounds.push(loadSound('Sounds/Stone_hit4.ogg'))
    hittingSounds.push(loadSound('Sounds/Stone_hit5.ogg'))
    hittingSounds.push(loadSound('Sounds/Stone_hit6.ogg'))

    fuseSound = loadSound('Sounds/tnt.mp3')
}

function setup(){
    createCanvas(WIDTH+400, HEIGHT)
    //pixelDensity(1)   // no parece mejorar fps
    loadChunks(0, 0)
    prepareSpawn()
    player = new Player()
    anims = new AnimationManager()
    initLighting()
    initMinimap()
    
    //loadAllImages()
    initTopo()

    computeLightingGrid(curLightMap)

    plotFps = new MigPLOT(WIDTH, 0, 400, 200, [], 'FPS', 'Time')
    plotFps.setScroll(100)
    plotFps.maxGlobal = 80
    plotFps.minGlobal = 20
    plotAnims = new MigPLOT(WIDTH, 200, 400, 200, [], 'Anims', 'Time')
    plotAnims.setScroll(100)
    //plotAnims.maxGlobal = 1500
    plotAnims.minGlobal = 0
    console.log('--------------------------------')

}


function draw(){
    background(0)
    showingMinimap = keyIsPressed && keyCode == 32

    player.update()
    anims.update()


    showChunk()
    player.show()
    anims.show()

    plotFps.feed(meanFPS)
    plotFps.show()
    plotAnims.feed(anims.nParticles)
    plotAnims.show()

    

    updateTopo()
    showTopo(showingMinimap)

    updateMinimap()
    showMinimap()

    

    //remove las fps and push fps
    FPSarr.shift()
    FPSarr.push((frameRate()))
    meanFPS = Math.round(FPSarr.reduce((a, b) => a + b) / FPSarr.length)
}

function mouseClicked(){
    let x = floor(mouseX / cellPixelSize)
    let y = floor(mouseY / cellPixelSize)
    currentChunk[x][y].illuminate()
    
    console.log(curLightMap.lightingGrid[x][y])
    console.log(currentChunk[x][y])
}

function mouseDragged(){
}

function keyReleased(){
    if(keyCode == 32){
        blurredFrame = undefined
    }
}

function keyPressed(){
    let offset = 1
    if(keyCode == 65) moveToChunk(-offset, 0)       //a
    else if(keyCode == 68) moveToChunk(offset, 0)   //d
    else if(keyCode == 87) moveToChunk(0, offset)   //w
    else if(keyCode == 83) moveToChunk(0, -offset)  //s
    else if(keyCode == 80) generateImageMap(3)      //p
}
