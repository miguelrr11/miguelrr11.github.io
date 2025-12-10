//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

const CHECK_NEW_SONG_MS = 2000

let song

let lastTimeCheckIfNewSong = 0


function setup(){
    createCanvas(WIDTH, HEIGHT)
    song = new Song('-', '-', 0, 0, 1000)
}

function draw(){
    background(0)

    checkIfNewSong()

    song.updateProgress()

    fill(255)
    rect(0, height/2, map(song.estimatedProgress_ms, 0, song.duration_ms, 0, width), 20)
    text(song.getProgressStr(), 10, 15) 
    text(song.artist, 10, 30)
    text(song.title, 10, 45)
    if(song.lyrics.length > 0){
        let lyrics = song.getCurrentLyrics()
        text(lyrics, 10, 60)
    }
}

async function checkIfNewSong(){
    if(Math.abs(lastTimeCheckIfNewSong - Date.now()) < CHECK_NEW_SONG_MS) return
    console.log("Checking if a new song is playing")
    let requestStartTime = Date.now()
    lastTimeCheckIfNewSong = requestStartTime
    let curSong = await getCurrentlyPlayingTrack()
    let requestEndTime = Date.now()
    let halfRoundTripTime = (requestEndTime - requestStartTime) / 2

    if(curSong && curSong.item.name != song.title){
        console.log("New song is playing: " + curSong.item.name)
        console.log(curSong)
        song = new Song(curSong.item.artists[0].name,
                        curSong.item.name,
                        Date.now() - curSong.progress_ms,
                        curSong.progress_ms + halfRoundTripTime,
                        curSong.item.duration_ms
        )
    }
    else if(curSong && curSong.item.name == song.title){
        // let estimated = song.estimatedProgress_ms
        // console.log("Estimated: " + song.estimatedProgress_ms)
        let realProgress = curSong.progress_ms + halfRoundTripTime
        song.correctDrift(realProgress)
        song.progress_ms = realProgress
        song.lastTimeUpdatedProgress = requestEndTime
        // console.log("Real: " + realProgress)
        // console.log("Real - Estimated: " + (realProgress - estimated).toFixed(2))
        // console.log("Playback rate: " + song.playbackRate.toFixed(3))
    }
}
