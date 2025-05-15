class Button{
    constructor(x, y, width, height, text, col, textColor){
        this.x = x
        this.y = y
        this.w = width
        this.h = height
        this.text = text
        this.color = col
    }

    isMouseOver(){
        return mouseX > this.x && mouseX < this.x + this.width && 
        mouseY > this.y && mouseY < this.y + this.height;
    }

    show(){
        if(this.isMouseOver()){
            console.log(this.text)
        }
        push()
        noStroke()
        fill(this.color)
        rect(this.x, this.y, this.w, this.h, 10)
        fill(255)
        textAlign(CENTER, CENTER)
        textSize(20)
        text(this.text, this.x + this.w / 2, this.y + this.h / 2 + 1.5)
        pop()
    }
}