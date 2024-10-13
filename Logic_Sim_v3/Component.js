class Component {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.inputs = type === 'NOT' ? [0] : [0, 0];
        this.outputs = [0];
        this.x = random(100, WIDTH - 100);
        this.y = random(100, HEIGHT - 100);
        this.width = 80;
        this.height = Math.max(this.inputs.length, this.outputs.length) * (tamCompNodes + 4) + tamCompNodes;

        switch(type){
        case 'NOT' :        {this.col = colsComps[0]; break}
        case 'AND' :        {this.col = colsComps[1]; break}
        case 'OR' :         {this.col = colsComps[2]; break}
        case 'CLOCK' :      {this.col = colsComps[3]; break}
        case 'DISPLAY' :    {this.col = colsComps[4]; break}
        }
    }

    simulate() {
        if (this.type === 'AND') this.outputs[0] = this.inputs[0] && this.inputs[1];
        else if (this.type === 'OR') this.outputs[0] = this.inputs[0] || this.inputs[1];
        else if (this.type === 'NOT') this.outputs[0] = this.inputs[0] ? 0 : 1;
        else if(this.type === 'CLOCK'){
            let state = Math.floor(frameCount / 30) % 2 === 0;
            this.outputs = new Array(this.outputs.length).fill(state ? 1 : 0);
        }
    }

    show() {
        push();
        fill(this.col);
        strokeWeight(strokeLight);
        if(this == selectedComp) stroke(colorSelected)
        rect(this.x, this.y, this.width, this.height);

        let multIn = (this.height - tamCompNodes) / this.inputs.length;
        let off = multIn / 2;
        for (let i = 0; i < this.inputs.length; i++) {
            let connInp = isInputConnectedToMainChip(this, i, false)
            if(!connInp) fill(colorDisconnected)
            else fill(this.inputs[i] === 0 ? colorOff : colorOn);

            if(hoveredNode && hoveredNode.comp == this && hoveredNode.index == i && hoveredNode.side == 'input'){
                stroke(colorSelected)
                strokeWeight(strokeSelected)
            }
            else{
                this == selectedComp ? stroke(colorSelected) : stroke(0);
                strokeWeight(strokeLight)
            }
            

            rect(this.x - tamCompNodes / 2, this.y + i * multIn + off, tamCompNodes, tamCompNodes);
        }

        let multOut = (this.height - tamCompNodes) / this.outputs.length;
        off = multOut / 2;
        for (let i = 0; i < this.outputs.length; i++) {
            let connOut = isInputConnectedToMainChip(this, i, true)
            if(!connOut) fill(colorDisconnected)
            else fill(this.outputs[i] === 0 ? colorOff : colorOn);

            if(hoveredNode && hoveredNode.comp == this && hoveredNode.index == i && hoveredNode.side == 'output'){
                stroke(colorSelected)
                strokeWeight(strokeSelected)
            }
            else{
                stroke(0)
                strokeWeight(strokeLight)
            }

            this == selectedComp ? stroke(colorSelected) : stroke(0);
            fill(this.outputs[i] === 0 ? colorOff : colorOn);
            rect(this.x + this.width - tamCompNodes / 2, this.y + i * multOut + off, tamCompNodes, tamCompNodes);
        }

        fill(0);
        stroke(0)
        fill(colorOn);
        stroke(colorOff)
        strokeWeight(.75)
        textSize(20);
        textAlign(CENTER, CENTER);
        text(this.type, this.x + this.width / 2, this.y + this.height / 2);
        pop();
    }

    setInput(index, value) {
        this.inputs[index] = value;
    }

    getOutput(index) {
        return this.outputs[index];
    }

    getInputPosition(index) {
        let multIn = (this.height - tamCompNodes) / this.inputs.length;
        let off = multIn / 2;
        return { x: this.x - tamCompNodes / 2, y: this.y + index * multIn + off };
    }

    getOutputPosition(index) {
        let multOut = (this.height - tamCompNodes) / this.outputs.length;
        let off = multOut / 2;
        return { x: this.x + this.width - tamCompNodes / 2, y: this.y + index * multOut + off };
    }

    inBounds(x, y) {
        return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
    }

    move(x, y, offx, offy) {
        this.x = x + offx;
        this.y = y + offy;
    }
}

class Display extends Component {
    constructor(name, nIn) {
        super(name, 'DISPLAY')
        this.inputs = new Array(nIn).fill(0);
        this.outputs = []
        this.height = constrain(this.inputs.length * (tamCompNodes + 4) + tamCompNodes, 84, Infinity)
        this.width = 100

        this.signed = false
    }

    inBoundsSign(){
        let a = this.x + 20
        let b = this.y + this.height - 20
        let w = 15
        let h = 10
        return mouseX >= a && mouseX <= a + w &&
               mouseY >= b && mouseY <= b + h
    }

    toggleSign(){
        this.signed = !this.signed
    }

    show() {
        push();
        fill(this.col);
        this == selectedComp ? stroke(colorSelected) : stroke(0);
        strokeWeight(2);
        rect(this.x, this.y, this.width, this.height);

        let multIn = (this.height - tamCompNodes) / this.inputs.length;
        let off = multIn / 2;
        for (let i = 0; i < this.inputs.length; i++) {
            fill(this.inputs[i] === 0 ? colorOff : colorOn);
            

            if(hoveredNode && hoveredNode.comp == this && hoveredNode.index == i && hoveredNode.side == 'input'){
                stroke(colorSelected)
                strokeWeight(strokeSelected)
            }
            else{
                this == selectedComp ? stroke(colorSelected) : stroke(0);
                strokeWeight(strokeLight)
            }

            rect(this.x - tamCompNodes / 2, this.y + i * multIn + off, tamCompNodes, tamCompNodes);
        }

        noStroke()
        fill(210)
        textSize(11)
        let textR = this.signed ? "Signed" : "Unsigned"
        text(textR, this.x + 40, this.y + this.height - 10)
        stroke(180)
        rect(this.x + 20, this.y + this.height - 20, 15, 10)

        fill(0)
        noStroke()
        let offR = this.signed ? 7.5 : 0
        rect(this.x + 20 + offR, this.y + this.height - 20, 7.5, 10)


        fill(colorOn);
        stroke(colorOff)
        textSize(30);
        textAlign(CENTER, CENTER);
        let tx = !this.signed ? parseInt(this.inputs.join(''), 2).toString() : ((binaryArray) => {
            const binaryString = binaryArray.join('');
            const isNegative = binaryArray[0] === 1;
            const value = parseInt(binaryString, 2);
            return (isNegative ? value - (2 ** binaryArray.length) : value).toString();
        })(this.inputs)
        text(tx, this.x + this.width / 2, this.y + this.height / 2);
        pop();
    }
}

class Clock extends Component {
    constructor(name, nOut) {
        super(name, 'CLOCK')
        this.inputs = []
        this.outputs = new Array(nOut).fill(0);
        this.height = this.outputs.length * (tamCompNodes + 4) + tamCompNodes;
        this.width = 30
    }

    show() {
        push();
        fill(this.col);
        this == selectedComp ? stroke(colorSelected) : stroke(0);
        strokeWeight(2);
        rect(this.x, this.y, this.width, this.height);

        let multOut = (this.height - tamCompNodes) / this.outputs.length;
        let off = multOut / 2;
        for (let i = 0; i < this.outputs.length; i++) {
            fill(this.outputs[i] === 0 ? colorOff : colorOn);

            if(hoveredNode && hoveredNode.comp == this && hoveredNode.index == i && hoveredNode.side == 'input'){
                stroke(colorSelected)
                strokeWeight(strokeSelected)
            }
            else{
                this == selectedComp ? stroke(colorSelected) : stroke(0);
                strokeWeight(strokeLight)
            }

            this == selectedComp ? stroke(colorSelected) : stroke(0);
            rect(this.x + this.width - tamCompNodes / 2, this.y + i * multOut + off, tamCompNodes, tamCompNodes);
        }

        pop();
    }
}
