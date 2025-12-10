class Song{
    constructor(artist, title, startTime, progress_ms){
        this.artist = artist
        this.title = title
        this.startTime = startTime
        this.progress_ms = progress_ms
        this.estimatedProgress_ms = this.progress_ms
        this.lastTimeUpdatedProgress = Date.now()
    }

    updateProgress(){
        let timeElapsed = Date.now() - this.lastTimeUpdatedProgress
        this.estimatedProgress_ms = this.progress_ms + timeElapsed
    }
}