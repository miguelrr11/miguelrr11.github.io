class Node{
    constructor(){
        this.pos = createVector(random(50, width - 50), random(50, height - 50));
        this.width = 70
    }

    getPinPos(pinIndex, side){
        let x = side == 'input' ? this.pos.x : this.pos.x + this.width
        let n = side == 'input' ? this.inputs.length : this.outputs.length
        let div = this.height / (n + 1)
        let y = div * (pinIndex + 1) + this.pos.y
        return {x, y}
    }

    pinInBounds(){
        for(let i = 0; i < this.inputs.length; i++){
            let pos = this.getPinPos(i, 'input')
            if(dist(mouseX, mouseY, pos.x, pos.y) < RAD_PIN) return {node: this, side: 'input', index: i}
        }
        for(let i = 0; i < this.outputs.length; i++){
            let pos = this.getPinPos(i, 'output')
            if(dist(mouseX, mouseY, pos.x, pos.y) < RAD_PIN) return {node: this, side: 'output', index: i}
        }
    }

    show(){
        textAlign(CENTER, CENTER)
        textSize(20)
        fill(210)
        stroke(40)
        rect(this.pos.x, this.pos.y, this.width, this.height)
        fill(40)
        noStroke()
        text(this.symbol, this.pos.x + this.width * 0.5, this.pos.y + 15);
        text(this.outputs[0] !== undefined ? this.outputs[0] : '?', this.pos.x + this.width * 0.5, this.pos.y + this.height * 0.5)

        fill(255)
        stroke(40)
        for(let i = 0; i < this.inputs.length; i++){
            let pos = this.getPinPos(i, 'input')
            ellipse(pos.x, pos.y, RAD_PIN*2)
        }
        for(let i = 0; i < this.outputs.length; i++){
            let pos = this.getPinPos(i, 'output')
            ellipse(pos.x, pos.y, RAD_PIN*2)
        }
    }
}

class NodeConstant extends Node{
    constructor(value){
        super();
        this.inputs = new Array(0);
        this.outputs = new Array(1);

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;

        this.value = value;
        this.outputs[0] = this.value;

        this.symbol = ''
    }

    evaluate(){
        this.outputs[0] = this.value;
    }

}

class NodeSum extends Node{
    constructor(){
        super();
        this.inputs = new Array(2);
        this.outputs = new Array(1);

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;

        this.symbol = '+'
    }

    evaluate(){
        let sum = 0;
        for(let i = 0; i < this.inputs.length; i++){
            if(this.inputs[i] !== undefined) sum += this.inputs[i];
        }
        this.outputs[0] = sum;
    }
}
