class TextAnim{
    constructor(text) {
        this.text = text;
        this.pos = createVector(0, 0);
        this.size = 50;
        this.col1 = [214, 40, 40]
        this.col2 = [252, 191, 73]
        this.val = 0
        this.phase = 0

        this.rot = true

        this.pauseCounter = 20
    }

    finished(){
        return this.val < 0.01 && this.phase == 2
    }

    show(){
        push()
        if(this.phase == 0) this.val = lerp(this.val, 1, 0.3)
        else if(this.phase == 1) this.pauseCounter--
        else this.val = lerp(this.val, 0, 0.3)
        if(this.pauseCounter <= 0) this.phase = 2
        if(this.val > 0.999 && this.phase == 0){ 
            this.phase = 1
            this.val = 1
        }

        let col1 = lerppColor(this.col1, this.col2, this.val)
        let col2 = lerppColor(this.col1, this.col2, 1 - this.val)

        translate(this.pos.x, this.pos.y)
        if(this.rot) rotate(this.val * PI + PI)
        else rotate(0)

        textAlign(CENTER, CENTER)
        textSize(this.size * this.val)
        let trans = 255 * this.val

        stroke(255, 100)
        strokeWeight(6 * this.val)
        noFill()
        text(this.text, 0, 0)

        fill(...col1, trans)
        stroke(...col2, trans)
        strokeWeight(4 * this.val)
        
        text(this.text, 0, 0)
        
        pop()
    }

}