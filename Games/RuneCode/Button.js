class Button{
    constructor(x, y, width, height, text, col, textColor){
        this.x = x
        this.y = y
        this.w = width
        this.h = height
        this.text = text
        this.color = col
    }

    setFunc(func){
        this.func = func
    }

    execute(){
        if(this.func == undefined) return
        this.func()
    }

    setProperties(runebook, runeIndex, side){
        this.runebook = runebook
        this.runeIndex = runeIndex
        this.side = side
    }

    isMouseOver(){
        return mouseX > this.x && mouseX < this.x + this.w && 
        mouseY > this.y && mouseY < this.y + this.h;
    }

    show(){
        push()
        this.execute()
        noStroke()
        let hover = this.isMouseOver() || selectedButton == this
        if(hover){
            stroke(255)
            strokeWeight(mouseIsPressed ? 3.5 : 2)
            if(mouseIsPressed) {
                this.execute()
            }
        }
        // if(!this.isMouseOver() && selectedButton == this && mouseIsPressed){
        //     selectedButton = undefined
        // }
        fill(this.color)
        rect(this.x, this.y, this.w, this.h, 10)
        fill(255)
        noStroke()
        textAlign(CENTER, CENTER)
        textSize((hover && mouseIsPressed) ? 22 : 20)
        text(this.text, this.x + this.w / 2, this.y + this.h / 2 + 1.5)
        pop()
    }
}

class FunctionalButton extends Button{
    constructor(x, y, width, height, text, col, textColor){
        super(x, y, width, height, text, col, textColor)
        this.func = undefined
    }

    setFunc(func){
        this.func = func
    }

    show(){
        push()
        if(this.isMouseOver() && mouseIsPressed){ 
            this.execute()
        }
        noStroke()
        fill(this.color)
        rect(this.x, this.y, this.w, this.h, 10)
        fill(255)
        noStroke()
        textAlign(CENTER, CENTER)
        textSize(20)
        text(this.text, this.x + this.w / 2, this.y + this.h / 2 + 1.5)
        pop()
    }
}