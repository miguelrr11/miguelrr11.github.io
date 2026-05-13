class TrafficLightSystem{
    constructor(intersection, phases){
        this.phases = phases
        this.intersection = intersection
        this.currentPhaseIndex = floor(random(this.phases.length))
        this.phaseDuration = 5.5*60
        this.yellowDuration = 2*60
        this.isInYellow = false
        this.timeInCurrentPhase = random(this.phaseDuration)
    }

    /**
     * LOOP DE SEMAFOROS
     * The loop is as follows:
     * 1. Start with a random phase as active
     * 2. Stay in that phase for "phaseDuration" time
     * 3. Then, switch to yellow for "yellowDuration" time
     * 4. After that, switch to the next phase in the list and repeat from step 2
     */

    update(deltaMult){
        this.timeInCurrentPhase += deltaTime/16 * deltaMult
        if(!this.isInYellow && this.timeInCurrentPhase >= this.phaseDuration){
            this.timeInCurrentPhase = 0
            this.isInYellow = true
        }
        else if(this.isInYellow && this.timeInCurrentPhase >= this.yellowDuration){
            this.timeInCurrentPhase = 0
            this.isInYellow = false
            this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.phases.length
        }
    }

    isRed(intersecSegID){
        return this.isInYellow || !this.phases[this.currentPhaseIndex].includes(intersecSegID)
    }

    show(){
        push()
        strokeWeight(2)
        stroke(135, 50, 70)
        for(let i = 0; i < this.phases.length; i++){
            let phase = this.phases[i]
            if(i == this.currentPhaseIndex) continue
            for(let j = 0; j < phase.length; j++){
                let interSegID = phase[j]
                let interSeg = this.intersection.findInterSeg(interSegID)
                for(let b = 0; b < interSeg.bezierPoints.length-2; b+=2){
                    line(interSeg.bezierPoints[b], interSeg.bezierPoints[b+1], interSeg.bezierPoints[b+2], interSeg.bezierPoints[b+3])
                }
            }
        }
        strokeWeight(3)
        this.isInYellow ? stroke(200, 225, 50) : stroke(70, 255, 50)
        let activePhase = this.phases[this.currentPhaseIndex]
        for(let j = 0; j < activePhase.length; j++){
            let interSegID = activePhase[j]
            let interSeg = this.intersection.findInterSeg(interSegID)
            for(let b = 0; b < interSeg.bezierPoints.length-2; b+=2){
                line(interSeg.bezierPoints[b], interSeg.bezierPoints[b+1], interSeg.bezierPoints[b+2], interSeg.bezierPoints[b+3])
            }
        }
        pop()
    }
}