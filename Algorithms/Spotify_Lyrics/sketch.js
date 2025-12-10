//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let song = undefined

let lastTimeCheckIfNewSong = 0


function setup(){
    createCanvas(WIDTH, HEIGHT)
}

function draw(){
    background(0)

    checkIfNewSong()

    if(song) song.updateProgress()
}

async function checkIfNewSong(){
    if(Math.abs(lastTimeCheckIfNewSong - Date.now()) < 2500) return
    console.log("Checking if a new song is playing")
    lastTimeCheckIfNewSong = Date.now()
    let curSong = await getCurrentlyPlayingTrack()
    let timeElapsedForAsync = Date.now() - lastTimeCheckIfNewSong
    if(song == undefined || (curSong && curSong.item.name != song.title)){
        console.log("New song is playing: " + curSong.item.name)
        song = new Song(curSong.item.artists[0].name,
                        curSong.item.name,
                        Date.now() - curSong.progress_ms,
                        curSong.progress_ms
        )
    }
    else if(curSong && curSong.item.name == song.title){
        let estimated = song.estimatedProgress_ms
        console.log("Estimated: " + song.estimatedProgress_ms)
        song.progress_ms = curSong.progress_ms - timeElapsedForAsync
        song.lastTimeUpdatedProgress = Date.now()
        console.log("Real: " + song.progress_ms)
        console.log("Real - Estimated: " + (song.progress_ms - estimated))
    }
}
