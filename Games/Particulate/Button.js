const W_BUTTON = 60
const H_BUTTON = 60

class Button{
    constructor(pos, label, callback){
        this.pos = pos;
        this.label = label;
        this.callback = callback;
        this.beingPressed = false
    }

    show(){
        let showPressed = false
        if(mouseIsPressed && !this.beingPressed && this.isMouseOver()){
            this.callback();
            this.beingPressed = true
            showPressed = true
        }
        else if(!mouseIsPressed) this.beingPressed = false
        showPressed ? fill(160) : fill(255);
        stroke(40);
        rect(this.pos.x, this.pos.y, W_BUTTON, H_BUTTON);
        fill(0);
        noStroke();
        textSize(24)
        textAlign(CENTER, CENTER);
        text(this.label, this.pos.x + W_BUTTON / 2, this.pos.y + H_BUTTON / 2);
    }

    isMouseOver(){
        return mouseX > this.pos.x && mouseX < this.pos.x + W_BUTTON && mouseY > this.pos.y && mouseY < this.pos.y + H_BUTTON;
    }
}