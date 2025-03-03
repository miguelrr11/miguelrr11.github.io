let diggingSounds = []
let hittingSounds = []
let fuseSound

function loadAllSounds(){
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

//se rompe al picar
function playDiggingSound(){
    let sound = random(diggingSounds)
    sound.play()
}

//picar
function playHittingSound(){
    let sound = random(hittingSounds)
    sound.play()
}

function playFuseSound(){
    fuseSound.play()
}