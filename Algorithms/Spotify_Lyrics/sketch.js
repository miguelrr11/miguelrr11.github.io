//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
let WIDTH = 600
let HEIGHT = 600

const CHECK_NEW_SONG_MS = 1000
const CHECK_QUEUE_MS = 15000

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

    buttons.push(new ButtonPlay(createVector(BASE_RAD_BUTTON + 10, height/2), () => {
        song.togglePlayPause()
    }, () => {
        return song.isPlaying
    }))
    buttons.push(new ButtonNext(createVector(BASE_RAD_BUTTON + 10, height/2 + BASE_RAD_BUTTON*2 + 10), () => {
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
        textFont(thin)
        fill(255, map(dist(mouseX, mouseY, 0, 0), 0, 300, 200, 0))
        text((song.genres.length == 0 ? "N/A" : song.genres.join("\n")), 10, 60)
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
        fill(255, map(dist(mouseX, mouseY, width, 0), 0, 300, 200, 0))
        text("\n" + (queue.length == 0 ? "No songs in queue" : queue.join("\n")), width - 10, 15)
        pop()

        // Change position in song
        if(inBoundsOfBar){
            handCursor = true
            let newPos = map(mouseX, 0, width, 0, song.duration_ms)
            fill(255)
            ellipse(Math.min(curPosX, mouseX), height - 5, 10, 10)
            stroke(255)
            strokeWeight(3)
            line(10, height-5, Math.min(curPosX, mouseX), height-5)
            if(mouseIsPressed) song.setPosition(newPos)
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

async function getQueue(){
    try{
        let response = await fetch('https://api.spotify.com/v1/me/player/queue', {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })
        if(response.ok){
            let data = await response.json()
            let q = data.queue
            return q.map(item => item.name).slice(0, 10)
        }
        else{
            console.error('Failed to fetch queue')
            return null
        }
    }
    catch(error){
        console.error('Error fetching queue:', error)
        return null
    }
}

async function checkIfNewSong(){
    if(!hasAccess || Math.abs(lastTimeCheckIfNewSong - Date.now()) < CHECK_NEW_SONG_MS) return
    let requestStartTime = Date.now()
    lastTimeCheckIfNewSong = requestStartTime

    let updatedQueue = false
    if(hasAccess && Math.abs(lastTimeCheckQueue - Date.now()) >= CHECK_QUEUE_MS) {
        queue = await getQueue()
        lastTimeCheckQueue = Date.now()
        updatedQueue = true
    }
    let curSong = await getCurrentlyPlayingTrack()
    let requestEndTime = Date.now()
    let halfRoundTripTime = (requestEndTime - requestStartTime) / 2

    if(curSong && curSong.item.name != song.title){
        console.log("New song is playing: " + curSong.item.name)
        console.log(curSong)
        song = new Song(curSong.item.artists[0].name,
                        curSong.item.artists[0].id,
                        curSong.item.name,
                        Date.now() - curSong.progress_ms,
                        curSong.progress_ms + halfRoundTripTime,
                        curSong.item.duration_ms,
                        curSong.is_playing
        )
        song.fetchLyrics()
        song.fetchGenres()
        if(!updatedQueue){
            queue = await getQueue()
            lastTimeCheckQueue = Date.now()
        }
    }
    else if(curSong && curSong.item.name == song.title){
        let realProgress = curSong.progress_ms + halfRoundTripTime
        song.correctDrift(realProgress)
        song.isPlaying = curSong.is_playing
        song.progress_ms = realProgress
        song.lastTimeUpdatedProgress = requestEndTime
    }
}


function windowResized(){
    WIDTH = window.innerWidth
    HEIGHT = window.innerHeight
    resizeCanvas(WIDTH, HEIGHT)
    
    actualCol = 0
    resizeTopo(WIDTH, HEIGHT)
}