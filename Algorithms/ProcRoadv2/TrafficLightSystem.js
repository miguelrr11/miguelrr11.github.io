class TrafficLightSystem{
    constructor(intersection, phases){
        this.phases = phases
        this.intersection = intersection
        this.currentPhaseIndex = 0
        this.timeInCurrentPhase = 0

        this.phaseDuration = 3*60
    }

    update(deltaMult){
        this.timeInCurrentPhase += deltaTime/16 * deltaMult
        if(this.timeInCurrentPhase >= this.phaseDuration){
            this.timeInCurrentPhase = 0
            this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.phases.length
        }
    }

    show(){
        push()
        strokeWeight(2)
        stroke(255, 50, 70)
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
        stroke(70, 255, 50)
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