class Node{
    constructor(){
        this.pos = createVector(random(50, width - 50), random(50, height - 50));
        this.width = 70
        this.id = NodeID++
        this.moved = false
        this.highlight = false

        this.col = LIGHT_COL        //color for pin symbol
        this.txsize = 30
        this.inputTags = undefined
        this.outputTags = undefined
    }

    static id = 0;

    move(x, y){
        this.pos.x = Math.round(x / SNAP_PIXEL_SIZE) * SNAP_PIXEL_SIZE;
        this.pos.y = Math.round(y / SNAP_PIXEL_SIZE) * SNAP_PIXEL_SIZE;
    }

    acceptsConnection(side, index){
        if(side == 'output') return true
        for(let connection of graph.connections){
            if(side == 'input' && connection.toNode == this && connection.toPort == index) return false;
            if(side == 'output' && connection.fromNode == this && connection.fromPort == index) return false;
        }
        return true;
    }

    reset(){
        for(let i = 0; i < this.inputs.length; i++){
            this.inputs[i] = undefined;
        }
        for(let i = 0; i < this.outputs.length; i++){
            this.outputs[i] = undefined;
        }
    }

    setInput(index, value){
        this.inputs[index] = value;
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

    checkUndefinedInputs(){
        //return false
        for(let inp of this.inputs){
            if(inp === undefined){
                for(let i = 0; i < this.outputs.length; i++){
                    this.outputs[i] = undefined;
                }
                return true;
            }
        }
        return false;
    }

    showPins(){
        push()
        fill(LIGHT_COL)
        stroke(DARK_COL)
        rectMode(CENTER)
        textAlign(LEFT)
        for(let i = 0; i < this.inputs.length; i++){
            let pos = this.getPinPos(i, 'input')
            fill(LIGHT_COL)
            stroke(VERY_DARK_COL)
            square(pos.x, pos.y, RAD_PIN*2)
            if(isPinConnected(this, 'input', i)){ 
                fill(DARK_COL)
                noStroke()
                square(pos.x, pos.y, RAD_PIN*1.4)
            }
            if(this.inputTags && this.inputTags[i]) {
                noStroke()
                fill(20)
                textSize(17)
                text(this.inputTags[i], pos.x + RAD_PIN + 5, pos.y)
            }
        }
        for(let i = 0; i < this.outputs.length; i++){
            fill(LIGHT_COL)
            stroke(VERY_DARK_COL)
            let pos = this.getPinPos(i, 'output')
            square(pos.x, pos.y, RAD_PIN*2)
            if(isPinConnected(this, 'output', i)){
                fill(DARK_COL)
                noStroke()
                square(pos.x, pos.y, RAD_PIN*1.4)
            }
            if(this.outputTags && this.outputTags[i]) {
                push()
                textAlign(RIGHT)
                fill(20)
                noStroke()
                textSize(17)
                text(this.outputTags[i], pos.x - RAD_PIN - 5, pos.y)
                pop()
            }
        }
        fill(VERY_DARK_COL)
        noStroke()
        let r = selected == this ? SIZE_PIXEL * 1.5 : SIZE_PIXEL
        showCircle(this.pos.x + this.width / 2, this.pos.y, 7, r);

        fill(this.col)
        noStroke()
        ellipse(this.pos.x + this.width / 2, this.pos.y, 23)
        pop()
    }

    showBox(){
        fill(255)
        this.highlight ? stroke(VERY_DARK_COL) : stroke(MED_COL)
        this.highlight ? strokeWeight(2.8) : strokeWeight(2)
        let off = 3
        rect(this.pos.x - off, this.pos.y - off, this.width + off * 2, this.height + off * 2)
        fill(LIGHT_COL)
        noStroke()
        rect(this.pos.x, this.pos.y, this.width, this.height)
        
    }

    showSymbol(){
        textAlign(CENTER, CENTER)
        textSize(this.txsize)
        fill(VERY_DARK_COL)
        noStroke()
        text(this.symbol, this.pos.x + this.width * 0.5 + 1, this.pos.y - 3.5);
    }

    showText(){
        textAlign(CENTER, CENTER)
        textSize(20)
        fill(40)
        noStroke()
        text(this.outputs[0] !== undefined ? round(this.outputs[0], 1) : '?', this.pos.x + this.width * 0.5, this.pos.y + this.height * 0.5)
    }

    show(){
        this.showBox();
        this.showPins();

        this.showSymbol();
        this.showText();

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

        this.symbol = 'C'
        this.col = '#FFCFD2'
    }

    evaluate(){
        this.outputs[0] = this.value;
    }

}

class NodeVariable extends Node{
    constructor(){
        super();
        this.inputs = new Array(1);
        this.outputs = new Array(1);
        this.value = undefined

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;

        this.symbol = 'V'
        this.col = '#FDE4CF'
    }

    evaluate(){
        this.outputs[0] = this.inputs[0] !== undefined ? this.inputs[0] : this.value;
    }

}

class NodeSum extends Node{
    constructor(){
        super();
        this.inputs = new Array(2);
        this.outputs = new Array(1);

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;

        this.symbol = '+'
        this.col = '#90DBF4'
    }

    evaluate(){
        //if(this.checkUndefinedInputs()) return

        let sum = 0;
        for(let i = 0; i < this.inputs.length; i++){
            if(this.inputs[i] !== undefined) sum += this.inputs[i];
        }
        this.outputs[0] = sum;
    }
}

class NodeSubtract extends Node{
    constructor(){
        super();
        this.inputs = new Array(2);
        this.outputs = new Array(1);

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;

        this.symbol = '-'
        this.col = '#F1C0E8'
    }

    evaluate(){
        if(this.checkUndefinedInputs()) return

        if(this.inputs[0] !== undefined && this.inputs[1] !== undefined){
            this.outputs[0] = this.inputs[0] - this.inputs[1];
        }
    }
}

class NodeMultiply extends Node{
    constructor(){
        super();
        this.inputs = new Array(2);
        this.outputs = new Array(1);

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;

        this.symbol = '*'
        this.col = '#B9FBC0'
    }

    evaluate(){
        if(this.checkUndefinedInputs()) return

        if(this.inputs[0] !== undefined && this.inputs[1] !== undefined){
            this.outputs[0] = this.inputs[0] * this.inputs[1];
        }
    }
}

class NodeDivide extends Node{
    constructor(){
        super();
        this.inputs = new Array(2);
        this.outputs = new Array(2);

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;

        this.symbol = '/'
        this.col = '#FBF8CC'
        this.outputTags = ['/', '%'];
    }

    evaluate(){
        if(this.checkUndefinedInputs()) return

        if(this.inputs[0] !== undefined && this.inputs[1] !== undefined){
            this.outputs[0] = this.inputs[0] / this.inputs[1];
            this.outputs[1] = this.inputs[0] % this.inputs[1];
        }
    }
}

class NodePow extends Node{
    constructor(){
        super();
        this.inputs = new Array(2);
        this.outputs = new Array(1);

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;

        this.symbol = '^'
        this.col = '#fbcce7ff'
        this.inputTags = ['exp', 'base']
    }

    evaluate(){
        if(this.checkUndefinedInputs()) return

        if(this.inputs[0] !== undefined && this.inputs[1] !== undefined){
            this.outputs[0] = Math.pow(this.inputs[1], this.inputs[0]);
        }
    }
}

class NodeSin extends Node{
    constructor(){
        super();
        this.inputs = new Array(1);
        this.outputs = new Array(1);

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;

        this.symbol = 'sin'
        this.col = '#ccedfb'
        this.txsize = 18
    }

    evaluate(){
        if(this.checkUndefinedInputs()) return

        if(this.inputs[0] !== undefined){
            this.outputs[0] = Math.sin(this.inputs[0]);
        }
    }
}

class NodeCos extends Node{
    constructor(){
        super();
        this.inputs = new Array(1);
        this.outputs = new Array(1);

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;

        this.symbol = 'cos'
        this.col = '#ccedfb'
        this.txsize = 18
    }

    evaluate(){
        if(this.checkUndefinedInputs()) return

        if(this.inputs[0] !== undefined){
            this.outputs[0] = Math.cos(this.inputs[0]);
        }
    }
}

class NodeSqrt extends Node{
    constructor(){
        super();
        this.inputs = new Array(1);
        this.outputs = new Array(1);

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;

        this.symbol = '√'
    }

    evaluate(){
        if(this.checkUndefinedInputs()) return

        if(this.inputs[0] !== undefined){
            this.outputs[0] = Math.sqrt(this.inputs[0]);
        }
    }
}

class NodeLog extends Node{
    constructor(){
        super();
        this.inputs = new Array(1);
        this.outputs = new Array(1);

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;

        this.symbol = 'log'
        this.txsize = 18
    }

    evaluate(){
        if(this.checkUndefinedInputs()) return

        if(this.inputs[0] !== undefined){
            this.outputs[0] = Math.log(this.inputs[0]);
        }
    }
}

class NodeExp extends Node{
    constructor(){
        super();
        this.inputs = new Array(1);
        this.outputs = new Array(1);

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;

        this.symbol = 'exp'
        this.txsize = 18
    }

    evaluate(){
        if(this.checkUndefinedInputs()) return

        if(this.inputs[0] !== undefined){
            this.outputs[0] = Math.exp(this.inputs[0]);
        }
    }
}

class NodeRnd extends Node{
    constructor(){
        super();
        this.inputs = new Array(0);
        this.outputs = new Array(1);

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;

        this.symbol = 'rnd'
        this.txsize = 18
    }

    evaluate(){
        if(this.checkUndefinedInputs()) return

        this.outputs[0] = Math.random();
    }
}

class NodeChooser extends Node{
    constructor(){
        super();
        this.inputs = new Array(1);
        this.outputs = new Array(1);

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;

        this.symbol = '->'
    }

    setInput(index, value){
        if(value !== undefined){
            this.inputs[0] = value;
        }
    }

    acceptsConnection(side, index){
        return true;
    }

    evaluate(){
        if(this.inputs[0] !== undefined){
            this.outputs[0] = this.inputs[0]
        }
        else this.outputs[0] = undefined
    }

    showPins(){
        push()
        fill(LIGHT_COL)
        stroke(DARK_COL)
        rectMode(CENTER)
        textAlign(LEFT)
        for(let i = 0; i < 1; i++){
            let pos = {x: this.pos.x, y: this.pos.y + this.height / 2}
            fill(LIGHT_COL)
            stroke(VERY_DARK_COL)
            circle(pos.x, pos.y, RAD_PIN*2)
            if(isPinConnected(this, 'input', i)){ 
                fill(DARK_COL)
                noStroke()
                circle(pos.x, pos.y, RAD_PIN*1.4)
            }
            noStroke()
            fill(20)
            textSize(17)
            text(this.inputTags[i], pos.x + RAD_PIN + 5, pos.y)
        }
        for(let i = 0; i < 1; i++){
            fill(LIGHT_COL)
            stroke(VERY_DARK_COL)
            let pos = this.getPinPos(i, 'output')
            square(pos.x, pos.y, RAD_PIN*2)
            if(isPinConnected(this, 'output', i)){
                fill(DARK_COL)
                noStroke()
                square(pos.x, pos.y, RAD_PIN*1.4)
            }
        }
        fill(VERY_DARK_COL)
        noStroke()
        let r = selected == this ? SIZE_PIXEL * 1.5 : SIZE_PIXEL
        showCircle(this.pos.x + this.width / 2, this.pos.y, 7, r);

        fill(this.col)
        noStroke()
        ellipse(this.pos.x + this.width / 2, this.pos.y, 23)
        pop()
    }
}

class NodeCondEqual extends Node{
    constructor(value){
        super();
        this.inputs = new Array(1);
        this.outputs = new Array(2); // true output, false output
        this.value = value

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;

        this.symbol = '=='
        this.col = '#98F5E1'
        this.txsize = 22
    }

    

    evaluate(){
        if(this.checkUndefinedInputs()) return

        if(this.inputs[0] == this.value){
            this.outputs[0] = this.inputs[0];
            this.outputs[1] = undefined
        } 
        else {
            this.outputs[1] = this.inputs[0];
            this.outputs[0] = undefined
        }
    }

    showText(){
        textAlign(CENTER, CENTER)
        textSize(20)
        fill(40)
        noStroke()
        text(this.symbol + ' ' + this.value, this.pos.x + this.width * 0.5, this.pos.y + 15);
        text(this.inputs[0] == this.value, this.pos.x + this.width * 0.5, this.pos.y + this.height * 0.5)
    }
}

class NodeCondLess extends Node{
    constructor(value){
        super();
        this.inputs = new Array(1);
        this.outputs = new Array(2); // true output, false output
        this.value = value

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;

        this.symbol = '<'
        this.col = '#98F5E1'
    }

    

    evaluate(){
        if(this.checkUndefinedInputs()) return

        if(this.inputs[0] < this.value){
            this.outputs[0] = this.inputs[0];
            this.outputs[1] = undefined
        } 
        else {
            this.outputs[1] = this.inputs[0];
            this.outputs[0] = undefined
        }
    }

    showText(){
        textAlign(CENTER, CENTER)
        textSize(20)
        fill(40)
        noStroke()
        text(this.symbol + ' ' + this.value, this.pos.x + this.width * 0.5, this.pos.y + 15);
        text(this.inputs[0] < this.value, this.pos.x + this.width * 0.5, this.pos.y + this.height * 0.5)
    }
}

class NodeCondMore extends Node{
    constructor(value){
        super();
        this.inputs = new Array(1);
        this.outputs = new Array(2); // true output, false output
        this.value = value

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;

        this.symbol = '>'
        this.col = '#98F5E1'
    }

    

    evaluate(){
        if(this.checkUndefinedInputs()) return

        if(this.inputs[0] > this.value){
            this.outputs[0] = this.inputs[0];
            this.outputs[1] = undefined
        } 
        else {
            this.outputs[1] = this.inputs[0];
            this.outputs[0] = undefined
        }
    }

    showText(){
        textAlign(CENTER, CENTER)
        textSize(20)
        fill(40)
        noStroke()
        text(this.symbol + ' ' + this.value, this.pos.x + this.width * 0.5, this.pos.y + 15);
        text(this.inputs[0] > this.value, this.pos.x + this.width * 0.5, this.pos.y + this.height * 0.5)
    }
}

class NodeParticulate extends Node{
    constructor(){
        super();
        this.inputs = new Array(7);     //color and size
        this.outputs = new Array(1);

        this.inputTags = ['Color', 'Size', 'Vel_X', 'Vel_Y', 'Acc_X', 'Acc_Y', 'Count']

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;
        //this.width = 100

        this.symbol = 'P'
    }

    evaluate(){
        let count = this.inputs[6] !== undefined ? this.inputs[6] : 1
        this.outputs[0] = {
            particle :{
            pos: createVector(this.pos.x + this.width * 0.5, this.pos.y),
            vel: createVector(this.inputs[2] !== undefined ? this.inputs[2] : 0, this.inputs[3] !== undefined ? this.inputs[3] : 0),
            acc: createVector(this.inputs[4] !== undefined ? this.inputs[4] : 0, this.inputs[5] !== undefined ? this.inputs[5] : 1),
            lifetime: undefined,
            size: this.inputs[1],
            color: this.inputs[0]
        },
        NtoSpawn: count}
        return this.outputs[0];
    }

    showText(){
    }


}

class NodeEmitter extends Node{
    constructor(){
        super();
        this.inputs = new Array(1);
        this.outputs = new Array(0);

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;
        this.symbol = 'E'
        this.inputTags = ['Properties']

        this.NtoSpawn = 1;
        this.bucket = []
    }

    evaluate(){
        if(this.checkUndefinedInputs()) return
        this.NtoSpawn = this.inputs[0] !== undefined ? this.inputs[0].NtoSpawn : 1
        if(this.bucket.length >= this.NtoSpawn){
            for(let i = 0; i < this.NtoSpawn; i++){
                partMan.addParticle(this.bucket[i])
            }
            this.bucket = []
        }
        else {
            let options = this.inputs[0].particle
            this.bucket.push({
                pos: createVector(this.pos.x + this.width * 0.5, this.pos.y),
                vel: createVector(options.vel.x !== undefined ? options.vel.x : 0, 
                    options.vel.y !== undefined ? options.vel.y : 0),
                acc: createVector(options.acc.x !== undefined ? options.acc.x : 0, 
                    options.acc.y !== undefined ? options.acc.y : 1),
                lifetime: undefined,
                size: options.size,
                color: options.color
            });
        }
    }

    showText(){

    }


}