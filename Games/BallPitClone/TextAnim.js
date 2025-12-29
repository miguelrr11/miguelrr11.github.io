class TextAnim{
    constructor(text, x, y, col, size) {
        this.text = text;
        this.pos = createVector(x, y);
        this.size = size ? size : 18;
        this.col1 = [...col]    //fill
        this.col2 = [0,0,0]           //stroke
        this.val = 0
        this.phase = 0

        this.rot = true

        this.pauseCounter = 15
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

        fill(...col1)
        stroke(...col2)
        strokeWeight(4 * this.val)
        
        text(this.text, 0, 0)
        
        pop()
    }

}