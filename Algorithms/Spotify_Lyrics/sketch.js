//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
let WIDTH = 600
let HEIGHT = 600

const CHECK_NEW_SONG_MS = 1000
const CHECK_QUEUE_MS = 15000
const imgSize = 85

let song
let queue = []

let lastTimeCheckIfNewSong = 0
let lastTimeCheckQueue = 0

let bold, reg, thin

let handCursor = false

let buttons = []


async function setup(){
    WIDTH = window.innerWidth
    HEIGHT = window.innerHeight
    createCanvas(WIDTH, HEIGHT)
    bold = await loadFont('bold.otf')
    reg = await loadFont('reg.otf')
    thin = await loadFont('thin.otf')
    textFont(reg)
    song = new Song('-', '-', 0, 0, 1000, false)
    initTopo(WIDTH, HEIGHT, drawingContext)

    buttons.push(new ButtonPlay(createVector(BASE_RAD_BUTTON + 10, height/2 - BASE_RAD_BUTTON - 10), () => {
        song.togglePlayPause()
    }, () => {
        return song.isPlaying
    }))
    buttons.push(new ButtonNext(createVector(BASE_RAD_BUTTON + 10, height/2 + BASE_RAD_BUTTON*2 + 10 - BASE_RAD_BUTTON - 10), () => {
        skipToNext()
    }))
}

function draw(){
    background(5)

    handCursor = false

    for(let b of buttons){
        if(b.hover()) handCursor = true
    }

    updateTopo()
    push()
    showTopo()
    pop()

    if(hasAccess) for(let b of buttons) b.show()

    checkIfNewSong()

    song.updateProgress()

    if(hasAccess){
        let trans = 0
        if(mouseX < imgSize + 20) trans = 255
        else trans = map(mouseX, imgSize + 20, imgSize + 120, 255, 0)

        let transRight = 0
        if(mouseX > width - (imgSize + 20)) transRight = 255
        else transRight = map(mouseX, width - (imgSize + 20), width - (imgSize + 120), 255, 0)

        searchHoverLink(trans)

        textSize(12)
        fill(255)

        let inBoundsOfBar = height - mouseY < 20

        // Progress bar
        stroke(150)
        strokeWeight(3)
        let curPosX = map(song.estimatedProgress_ms, 0, song.duration_ms, 10, width-10)
        line(10, height-5, curPosX, height-5)
        noStroke()

        // Progress text
        fill(200)
        text(song.getProgressStr(), 10, height - 15)

        // Song info and lyrics
        fill(200)
        text(song.title, 10, 15)
        textFont(thin)
        text(" \n" + song.artist, 10, 15)
        fill(255)

        // Genres
        // textFont(thin)
        // fill(225, trans)
        // text((song.genres.length == 0 ? "N/A" : song.genres.join("\n")), 10, 60 + 85)
        // textFont(reg)

        //Album name
        textFont(thin)
        fill(225, trans)
        text(song.albumName, 10, 60 + 85)
        textFont(reg)

        // Lyrics
        song.printLyrics()

        // Left time
        push()
        fill(200)
        textAlign(RIGHT)
        text(song.getLeftTimeStr(), width - 10, height - 15)
        pop()

        // Queue
        push()
        textAlign(RIGHT)
        fill(200)
        text("Up Next:", width - 10, 15)
        textFont(thin)
        text("\n" + (queue.length == 0 ? "No songs in queue" : queue[0]), width - 10, 15)
        fill(200, transRight)
        text("\n" + (queue.length == 0 ? "No songs in queue" : queue.join("\n")), width - 10, 15)
        pop()

        // Change position in song
        if(inBoundsOfBar){
            handCursor = true
            let newPos = map(mouseX, 0, width, 0, song.duration_ms)
            fill(255)
            ellipse(Math.max(Math.min(curPosX, mouseX), 10), height - 5, 10, 10)
            stroke(255)
            strokeWeight(3)
            line(10, height-5, Math.max(Math.min(curPosX, mouseX), 10), height-5)
            if(mouseIsPressed) song.setPosition(newPos)
        }

        //draw album art
        if(song.image != undefined && song.image.width > 0){
            
            tint(255, trans)
            image(song.image, 10, 40, imgSize, imgSize)
        }

    }
    else{
        push()
        fill(255)
        textSize(20)
        textAlign(CENTER, CENTER)
        text("Please click anywhere to log in", width/2, height/2)
        pop()
    }

    if(handCursor) cursor('pointer')
    else cursor('default')
}




function windowResized(){
    WIDTH = window.innerWidth
    HEIGHT = window.innerHeight
    resizeCanvas(WIDTH, HEIGHT)

    buttons[0].pos.set(BASE_RAD_BUTTON + 10, height/2 - BASE_RAD_BUTTON - 10)
    buttons[1].pos.set(BASE_RAD_BUTTON + 10, height/2 + BASE_RAD_BUTTON*2 + 10 - BASE_RAD_BUTTON - 10)
    
    actualCol = -25
    resizeTopo(WIDTH, HEIGHT)
}

function searchHoverLink(trans){
    push()
    rectMode(CORNER)
    textAlign(LEFT, TOP)
    let linkAreas = [
        {text: song.title, x: 10, y: 15, url: song.songURL},
        {text: song.artist, x: 10, y: 15 + textAscent() + textDescent(), url: song.artistURL},
        {text: song.albumName, x: 10, y: 60 + 85, url: song.albumURL}
    ]
    textSize(12)    
    for(let area of linkAreas){
        let bbox = textFont(reg).textBounds(area.text, area.x, area.y)
        if(mouseX >= bbox.x && mouseX <= bbox.x + bbox.w &&
           mouseY >= bbox.y - bbox.h && mouseY <= bbox.y){
            hoverLink = area.url
            stroke(200, trans)
            strokeWeight(1)
            line(bbox.x, bbox.y + 2, bbox.x + bbox.w, bbox.y + 2)
            if(mouseIsPressed){
                window.open(area.url, '_blank')
            }
            break
        }
    }
    pop()
}