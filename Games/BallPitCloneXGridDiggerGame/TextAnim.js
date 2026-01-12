class TextAnim{
    constructor(text, x, y, col, size) {
        this.text = text;
        this.pos = createVector(x, y);
        this.size = size ? size : 18;
        this.col1 = [...col]    //fill
        this.col1[3] = 255
        this.col2 = this.col1[0] == 255 && this.col1[1] == 255 && this.col1[2] == 255 ? [0,0,0] : [255,255,255]     //stroke
        this.col2[3] = 255
        this.val = 0
        this.phase = 0

        this.rot = false
        this.rotOffset = random(-PI/8, PI/8)

        this.pauseCounter = 1
    }

    finished(){
        return this.val < 0.01 && this.phase == 2
    }

    show(onlyUpdate = false){
        push()
        if(this.phase == 0) this.val = lerp(this.val, 1, 0.2)
        else if(this.phase == 1) this.pauseCounter--
        else this.val = lerp(this.val, 0, 0.2)
        if(this.pauseCounter <= 0) this.phase = 2
        if(this.val > 0.999 && this.phase == 0){ 
            this.phase = 1
            this.val = 1
        }
        if(this.phase == 2){
            this.col1[3] = this.val * 255
            this.col2[3] = this.val * 255
        }

        let col1 = lerppColor(this.col1, this.col2, this.val)
        let col2 = lerppColor(this.col1, this.col2, 1 - this.val)

        //translate(this.pos.x, this.pos.y)

        //rotate() tanks performance
        // if(this.rot) rotate(this.val * PI + PI)
        // else rotate(0)
        //rotate(this.rotOffset)

        if(!onlyUpdate){
            textAlign(CENTER, CENTER)
            textSize(this.size * this.val)

            fill(...col1)
            stroke(...col2)
            strokeWeight(4 * this.val)
            
            text(this.text, this.pos.x, this.pos.y)
        }
        
        pop()
    }

}