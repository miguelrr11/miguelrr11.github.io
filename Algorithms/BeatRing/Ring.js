class Ring{
    constructor(rad, beats, sounds){
        this.pos = createVector(width / 2, height / 2)
        this.beats = beats
        this.fills = new Array(this.beats).fill(0)
        this.sounds = sounds
        
        this.rad = rad
        this.smallRad = 25
        this.fillsPos = this.getFillsPos()

        this.BPM = 30                                   // Beats per Minute
        this.FPB = (3600 / this.BPM) / this.beats       // Frames per Beat at 60 fps
        this.frameCounter = 0
        this.beatIndex = 0
        this.playing = false
        this.muted = false
        this.col = undefined

        console.log(this.FPB * this.beats)
    }

    fill(arr){
        for(let index of arr){
            this.fills[index] = 1
        }
    }

    toggleMute(){
        this.muted = !this.muted
    }

    togglePlay(){
        this.playing = !this.playing
    }

    setPos(pos){
        this.pos = pos ? pos : this.pos
        this.fillsPos = this.getFillsPos()
    }

    getFillsPos(){
        let pos = []
        let dAngle = TWO_PI / this.beats
        for(let angle = -HALF_PI; angle < TWO_PI-HALF_PI; angle += dAngle){
            let x = this.pos.x + Math.cos(angle) * this.rad
            let y = this.pos.y + Math.sin(angle) * this.rad
            pos.push({x, y})
        }
        return pos
    }

    checkClick(doubleClick = false){
        let beat = 0
        for(let pos of this.fillsPos){
            if(dist(pos.x, pos.y, mouseX, mouseY) < this.smallRad){ 
                if(!doubleClick) this.fills[beat] = this.fills[beat] == 0 ? 1 : 0
                else{
                    this.beats--
                    this.fills.splice(beat, 1)
                    this.setPos()
                    this.setBPM()
                }
                break
            }
            beat++
        }
    }

    setBPM(BPM){
        this.BPM = BPM == undefined ? this.BPM : BPM
        this.FPB = (3600 / this.BPM) / this.beats
        this.frameCounter = 0
        this.beatIndex = 0
    }

    update(){
        if(!this.playing) return
        this.frameCounter++
        if(this.frameCounter > this.FPB){
            this.frameCounter = 0
            this.beatIndex++
            this.beatIndex = this.beatIndex % this.beats
            if(this.fills[this.beatIndex] == 1 && !this.muted) this.sounds[this.beatIndex % nSounds].play()
        }
    }

    show(showPoly = true){
        push()

        noFill()
        stroke(255)
        strokeWeight(3.5)
        ellipse(this.pos.x, this.pos.y, this.rad * 2)
        
        let beat = 0
        let fillsLines = []
        for(let pos of this.fillsPos){
            if(this.fills[beat] == 1){
                fillsLines.push({x: pos.x, y: pos.y})
            }
            beat++
        }

        if(showPoly){
            stroke(this.col)
            if(fillsLines.length > 1) fillsLines.push(fillsLines[0])
            noFill()
            beginShape()
            for(let p of fillsLines) vertex(p.x, p.y)
            endShape()
        }

        fill(0)
        stroke(255)

        beat = 0
        for(let pos of this.fillsPos){
            if(this.fills[beat] == 1){
                fill(this.col)
            }
            else fill(0)
            let rad = beat == this.beatIndex ? this.smallRad * 1.2 : this.smallRad
            ellipse(pos.x, pos.y, rad)

            beat++
        }

        pop()
    }
}