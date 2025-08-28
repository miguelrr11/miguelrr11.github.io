const W_BUTTON = 50
const H_BUTTON = 30

class Button{
    constructor(pos, label, callback, check){
        this.pos = pos;
        this.label = label;
        this.callback = callback;
        this.check = check;
        this.beingPressed = false
        this.hovered = false
        this.node = undefined
        this.txsize = 20

        fill(0);
        noStroke();
        textSize(this.txsize)

        this.w = 20
        this.h = this.w
    }

    setWidthByLabel(){
        fill(0);
        noStroke();
        textSize(this.txsize)
        this.w = textWidth(this.label) + 15;
        this.h = H_BUTTON
    }

    setPos(pos){
        if(!this.pos) this.pos = createVector(0, 0);
        this.pos.x = pos.x == undefined ? this.pos.x : pos.x;
        this.pos.y = pos.y == undefined ? this.pos.y : pos.y;
    }

    update(){
        let showPressed = false
        let mouseOver = this.isMouseOver()
        if(mouseIsPressed && !this.beingPressed && mouseOver){
            this.callback();
            this.beingPressed = true
            showPressed = true
            if(this.node) this.node.highlight = true
        }
        else if(!mouseIsPressed) this.beingPressed = false
        this.hovered = mouseOver
    }

    show(){
        this.update()
        if(this.node) this.node.showSymbolPin()
        else{
            (this.beingPressed || this.hovered) ? fill(DARK_COL) : fill(LIGHT_COL);
            
            stroke(VERY_DARK_COL);
            if(this.check && !this.check()) stroke(DARK_COL)
            this.beingPressed ? strokeWeight(2.5) : strokeWeight(1.5);
            rect(this.pos.x, this.pos.y, this.w, this.h);
            fill(0);

            if(this.check && !this.check()) fill(MED_COL)
            noStroke();
            textSize(this.txsize + 2)
            textAlign(CENTER, CENTER);
            text(this.label, this.pos.x + this.w / 2, this.pos.y + this.h / 2 - 3);
        }
    }

    isMouseOver(){
        if(!this.node) return inBounds(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h);
        return dist(mouseX, mouseY, this.pos.x, this.pos.y) < this.w;
    }
}