class Song{
    constructor(artist, title, startTime, progress_ms, duration_ms){
        this.artist = artist
        this.title = title
        this.startTime = startTime
        this.progress_ms = progress_ms
        this.estimatedProgress_ms = this.progress_ms
        this.duration_ms = duration_ms

        this.lastTimeUpdatedProgress = Date.now()
        this.lyrics = []
        this.curLyricsIdx = 0

        this.playbackRate = 1.0
        this.driftSmoothingFactor = 5
    }

    async fetchLyrics(){
        this.lyrics = await fetchLyrics(this.artist, this.title)
    }

    getCurrentLyrics(){
        if(this.curLyricsIdx > this.lyrics.length) return this.lyrics[this.curLyricsIdx].lyrics
        if(this.estimatedProgress_ms >= this.lyrics[this.curLyricsIdx+1].milliseconds){
            this.curLyricsIdx++
            return this.lyrics[this.curLyricsIdx].lyrics
        }
        else return this.lyrics[this.curLyricsIdx].lyrics
    }

    getProgressStr(){
        let mins = Math.floor((this.estimatedProgress_ms / 1000) / 60)
        let secs = Math.floor((this.estimatedProgress_ms / 1000) % 60)
        let str = mins + ":" + (secs < 10 ? '0' + secs : secs)
        return str
    }

    updateProgress(){
        let timeElapsed = Date.now() - this.lastTimeUpdatedProgress
        let newEstimate = this.progress_ms + (timeElapsed * this.playbackRate)
        this.estimatedProgress_ms = Math.max(this.estimatedProgress_ms, newEstimate)
    }

    correctDrift(realProgress_ms){
        let error = realProgress_ms - this.estimatedProgress_ms
        console.log(error.toFixed(2))
        this.playbackRate += error * this.driftSmoothingFactor / 10000
        this.playbackRate = Math.max(0.95, Math.min(1.05, this.playbackRate))
    }
}