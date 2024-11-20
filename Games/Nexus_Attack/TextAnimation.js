class TextAnimation{
    constructor(text, pos, size, col){
        this.text = text
        this.pos = pos
        this.size = size
        this.col = col
        this.trans = 255
        this.finished = false
    }

    isFinished(){
        return this.finished
    }

    show(){
        push()
        textSize(this.size)
        textFont('Gill Sans')
        this.col.setAlpha(this.trans)
        fill(this.col)
        noStroke()
        text(this.text, this.pos.x, this.pos.y);
        pop()
        this.trans -= 5.5
        this.pos.y -= 0.65
        if(this.trans <= 0) this.finished = true
    }

}