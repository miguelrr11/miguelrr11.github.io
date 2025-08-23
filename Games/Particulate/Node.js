class Node{
    constructor(){
        this.pos = createVector(random(50, width - 50), random(50, height - 50));
        this.width = 70
        this.id = Node.id++;
    }

    static id = 0;

    reset(){
        for(let i = 0; i < this.inputs.length; i++){
            this.inputs[i] = undefined;
        }
        for(let i = 0; i < this.outputs.length; i++){
            this.outputs[i] = undefined;
        }
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
        fill(255)
        stroke(40)
        for(let i = 0; i < this.inputs.length; i++){
            let pos = this.getPinPos(i, 'input')
            fill(255)
            stroke(40)
            ellipse(pos.x, pos.y, RAD_PIN*2)
            if(isPinConnected(this, 'input', i)){ 
                fill(40)
                noStroke()
                ellipse(pos.x, pos.y, RAD_PIN*1.4)
            }
        }
        for(let i = 0; i < this.outputs.length; i++){
            fill(255)
            stroke(40)
            let pos = this.getPinPos(i, 'output')
            ellipse(pos.x, pos.y, RAD_PIN*2)
            if(isPinConnected(this, 'output', i)){
                fill(40)
                noStroke()
                ellipse(pos.x, pos.y, RAD_PIN*1.4)
            }
        }
    }

    showBox(){
        fill(210)
        stroke(40)
        rect(this.pos.x, this.pos.y, this.width, this.height)
    }

    showText(){
        textAlign(CENTER, CENTER)
        textSize(20)
        fill(40)
        noStroke()
        text(this.symbol, this.pos.x + this.width * 0.5, this.pos.y + 10);
        text(this.outputs[0] !== undefined ? round(this.outputs[0], 2) : '?', this.pos.x + this.width * 0.5, this.pos.y + this.height * 0.5)
    }

    show(){
        this.showBox();

        this.showText();

        this.showPins();
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

class NodeVariable extends Node{
    constructor(){
        super();
        this.inputs = new Array(1);
        this.outputs = new Array(1);
        this.value = undefined

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;

        this.symbol = 'Var'
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
    }

    evaluate(){
        if(this.checkUndefinedInputs()) return

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
        this.outputs = new Array(1);

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;

        this.symbol = '/'
    }

    evaluate(){
        if(this.checkUndefinedInputs()) return

        if(this.inputs[0] !== undefined && this.inputs[1] !== undefined){
            this.outputs[0] = this.inputs[0] / this.inputs[1];
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
    }

    evaluate(){
        if(this.checkUndefinedInputs()) return

        this.outputs[0] = Math.random();
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

        this.tags = ['Color', 'Size', 'Vel_X', 'Vel_Y', 'Acc_X', 'Acc_Y', 'Count']

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;
        //this.width = 100

        this.symbol = ''
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

    showPins(){
        push()
        fill(255)
        stroke(40)
        textAlign(LEFT, CENTER)
        textSize(10)
        for(let i = 0; i < this.inputs.length; i++){
            let pos = this.getPinPos(i, 'input')
            fill(255)
            stroke(40)
            ellipse(pos.x, pos.y, RAD_PIN*2)
            if(isPinConnected(this, 'input', i)){ 
                fill(40)
                noStroke()
                ellipse(pos.x, pos.y, RAD_PIN*1.4)
            }
            noStroke()
            fill(20)
            textSize(14)
            text(this.tags[i], pos.x + RAD_PIN + 5, pos.y)
        }
        for(let i = 0; i < this.outputs.length; i++){
            fill(255)
            stroke(40)
            let pos = this.getPinPos(i, 'output')
            ellipse(pos.x, pos.y, RAD_PIN*2)
            if(isPinConnected(this, 'output', i)){
                fill(40)
                noStroke()
                ellipse(pos.x, pos.y, RAD_PIN*1.4)
            }
        }
        pop()
    }

    showText(){
        textAlign(CENTER, CENTER)
        textSize(20)
        fill(40)
        noStroke()
        text(this.symbol, this.pos.x + this.width * 0.5, this.pos.y + 15);
    }
}

class NodeEmitter extends Node{
    constructor(){
        super();
        this.inputs = new Array(1);
        this.outputs = new Array(0);

        this.height = Math.max(this.inputs.length, this.outputs.length) * (HEIGHT_NODE + 4) + HEIGHT_NODE;
        this.symbol = '→'

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
        textAlign(CENTER, CENTER)
        textSize(20)
        fill(40)
        noStroke()
        text(this.symbol, this.pos.x + this.width * 0.5, this.pos.y + 15);
    }
}