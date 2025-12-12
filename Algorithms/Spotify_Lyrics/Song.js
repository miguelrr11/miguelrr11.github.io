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
        this.driftSmoothingFactor = .3   //0.3

        // Offset in ms to delay lyrics (positive = lyrics appear later)
        // Adjust this value if lyrics still appear early/late
        this.lyricsOffset = 0

        this.colLyricsMult = 0
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
            this.syncLyricsIndex()
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
                this.syncLyricsIndex()
            }
        }
        catch(error){
            console.error('Error setting new position:', error)
        }
    }

    printLyrics(){
        if(!this.lyrics || this.lyrics.length == 0){
            if(this.lyricsState == 'not found'){
                push()
                fill(255)
                rectMode(CENTER)
                textAlign(CENTER, CENTER)
                noStroke()
                textSize(17)
                text('No lyrics were found for this song\n◡︵◡', width/2, height/2)
                pop()
            }
            return
        }
        push()
        let spacingBetweenLines = 105
        textAlign(CENTER, CENTER)
        rectMode(CENTER)
        for(let i = 0; i < this.lyrics.length; i++){
            let multiplier = i - this.curLyricsIdxSmooth
            if(Math.abs(multiplier) > 5) continue
            if(i == this.curLyricsIdx){ 
                textFont(bold)
                fill(255 * this.colLyricsMult)
                textSize(32)
            }
            else{ 
                textFont(reg)
                fill(map(Math.abs(multiplier), 0, 5, 255, 0) * this.colLyricsMult)
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
        let left_ms = Math.max(this.duration_ms - this.estimatedProgress_ms, 0)
        let mins = Math.floor((left_ms / 1000) / 60)
        let secs = Math.floor((left_ms / 1000) % 60)
        let str = "-" + mins + ":" + (secs < 10 ? '0' + secs : secs)
        return str
    }

    updateProgress(){
        this.curLyricsIdxSmooth = lerp(this.curLyricsIdxSmooth, this.curLyricsIdx, 0.1)
        let timeElapsed = Date.now() - this.lastTimeUpdatedProgress
        let newEstimate = this.isPlaying ? this.progress_ms + (timeElapsed * this.playbackRate) : this.progress_ms
        // Allow estimatedProgress to decrease when correcting drift (removed Math.max)
        this.estimatedProgress_ms = newEstimate

        if(!this.lyrics || this.lyrics.length == 0) return
        else if(this.lyrics && this.lyrics.length > 0) this.colLyricsMult = lerp(this.colLyricsMult, 1, 0.05)
        // Apply lyrics offset to delay lyric advancement
        let adjustedProgress = this.estimatedProgress_ms - this.lyricsOffset
        if(this.lyrics[this.curLyricsIdx+1] && adjustedProgress >= this.lyrics[this.curLyricsIdx+1].milliseconds){
            this.curLyricsIdx++
        }
    }

    async togglePlayPause(){
        try{
            let endpoint = this.isPlaying ? 'pause' : 'play'
            let response = await fetch('https://api.spotify.com/v1/me/player/' + endpoint, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            })
            this.isPlaying = !this.isPlaying
        }
        catch(error){
            console.error('Error toggling play/pause:', error)
        }
    }  

    correctDrift(realProgress_ms){
        let error = realProgress_ms - this.estimatedProgress_ms
        //console.log("Drift error: " + error.toFixed(2) + " ms")

        // Directly correct large drifts (> 200ms) immediately
        if(Math.abs(error) > 200){
            this.estimatedProgress_ms = realProgress_ms
            this.playbackRate = 1.0
            // Re-sync lyrics index when making large corrections
            this.syncLyricsIndex()
        }
        else{
            // For smaller drifts, use gradual playback rate adjustment
            this.playbackRate += error * this.driftSmoothingFactor / 10000
            this.playbackRate = Math.max(0.95, Math.min(1.05, this.playbackRate))
        }
    }

    syncLyricsIndex(){
        if(!this.lyrics || this.lyrics.length == 0) return
        let adjustedProgress = this.estimatedProgress_ms - this.lyricsOffset
        this.curLyricsIdx = 0
        for(let i = 0; i < this.lyrics.length; i++){
            if(this.lyrics[i].milliseconds <= adjustedProgress){
                this.curLyricsIdx = i
            }
            else{
                break
            }
        }
    }
}