class Song{
    constructor(artist, artistID, title, startTime, progress_ms, duration_ms, isPlaying){
        this.artist = artist
        this.artistID = artistID
        this.title = title
        this.startTime = startTime
        this.progress_ms = progress_ms
        this.estimatedProgress_ms = this.progress_ms
        this.duration_ms = duration_ms
        this.genres = []

        this.lastTimeUpdatedProgress = Date.now()
        this.lyrics = []
        this.lyricsState = 'searching' // 'searching', 'found', 'not found'
        this.curLyricsIdx = 0
        this.curLyricsIdxSmooth = 0
        this.isPlaying = isPlaying

        this.playbackRate = 1.0
        this.driftSmoothingFactor = .3
    }

    async fetchGenres(){
        try{
            let artistId = this.artistID
            let response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            if(response.ok){
                let data = await response.json()
                console.log(data)
                this.genres = data.genres //array of genres
            }
            else{
                console.error('Failed to fetch artist info')
                return null
            }
        }
        catch(error){
            console.error('Error fetching artist info:', error)
            return null
        }
    }

    async fetchLyrics(){
        this.lyrics = await fetchLyrics(this.artist, this.title)
        this.lyricsState = this.lyrics && this.lyrics.length > 0 ? 'found' : 'not found'
        this.curLyricsIdx = 0
        if(this.lyrics && this.lyrics.length > 0){
            for(let i = 0; i < this.lyrics.length; i++){
                if(this.lyrics[i].milliseconds <= this.estimatedProgress_ms){
                    this.curLyricsIdx = i
                }
                else{
                    break
                }
            }
        }
    }

    async setPosition(newPosition_ms){
        //call the api to set the position
        try{
            let response = await fetch('https://api.spotify.com/v1/me/player/seek?position_ms=' + Math.floor(newPosition_ms), {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            })
            if(!response.ok){
                console.error('Failed to set new position')
            }
            else{
                this.progress_ms = newPosition_ms
                this.estimatedProgress_ms = newPosition_ms
                this.lastTimeUpdatedProgress = Date.now()

                // Update current lyrics index
                this.curLyricsIdx = 0
                if(this.lyrics && this.lyrics.length > 0){
                    for(let i = 0; i < this.lyrics.length; i++){
                        if(this.lyrics[i].milliseconds <= this.estimatedProgress_ms){
                            this.curLyricsIdx = i
                        }
                        else{
                            break
                        }
                    }
                }
            }
        }
        catch(error){
            console.error('Error setting new position:', error)
        }
    }

    printLyrics(){
        if(!this.lyrics || this.lyrics.length == 0) return
        push()
        let spacingBetweenLines = 105
        fill(255)
        textAlign(CENTER, CENTER)
        rectMode(CENTER)
        for(let i = 0; i < this.lyrics.length; i++){
            let multiplier = i - this.curLyricsIdxSmooth
            if(Math.abs(multiplier) > 5) continue
            if(i == this.curLyricsIdx){ 
                textFont(bold)
                fill(255)
                textSize(32)
            }
            else{ 
                textFont(reg)
                fill(map(Math.abs(multiplier), 0, 5, 255, 0))
                textSize(map(Math.abs(multiplier), 0, 5, 32, 8))
            }
            let maxWidth = map(Math.abs(multiplier), 0, 5, 600, 150)
            text(this.lyrics[i].lyrics == " " ? '...' : this.lyrics[i].lyrics, width/2, height/2 + multiplier * spacingBetweenLines, maxWidth)
        }
        pop()
    }

    getCurrentLyrics(){
        if(!this.lyrics || this.lyrics.length == 0) return ""
        return this.lyrics[this.curLyricsIdx].lyrics
    }

    getProgressStr(){
        let mins = Math.floor((this.estimatedProgress_ms / 1000) / 60)
        let secs = Math.floor((this.estimatedProgress_ms / 1000) % 60)
        let str = mins + ":" + (secs < 10 ? '0' + secs : secs)
        return str
    }

    getLeftTimeStr(){
        let left_ms = this.duration_ms - this.estimatedProgress_ms
        let mins = Math.floor((left_ms / 1000) / 60)
        let secs = Math.floor((left_ms / 1000) % 60)
        let str = "-" + mins + ":" + (secs < 10 ? '0' + secs : secs)
        return str
    }

    updateProgress(){
        this.curLyricsIdxSmooth = lerp(this.curLyricsIdxSmooth, this.curLyricsIdx, 0.1)
        let timeElapsed = Date.now() - this.lastTimeUpdatedProgress
        let newEstimate = this.isPlaying ? this.progress_ms + (timeElapsed * this.playbackRate) : this.progress_ms
        this.estimatedProgress_ms = Math.max(this.estimatedProgress_ms, newEstimate)

        if(!this.lyrics || this.lyrics.length == 0) return
        if(this.lyrics[this.curLyricsIdx+1] && this.estimatedProgress_ms >= this.lyrics[this.curLyricsIdx+1].milliseconds){
            this.curLyricsIdx++
        }
    }

    correctDrift(realProgress_ms){
        let error = realProgress_ms - this.estimatedProgress_ms
        this.playbackRate += error * this.driftSmoothingFactor / 10000
        this.playbackRate = Math.max(0.95, Math.min(1.05, this.playbackRate))
    }
}