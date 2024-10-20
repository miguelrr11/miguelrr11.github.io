class Component {
    constructor(name, type, x = undefined, y = undefined) {
        this.name = name;
        this.type = type;
        this.inputs = type === 'NOT' ? [0] : [0, 0];
        this.outputs = [0];
        this.x = x ? x : random(100, WIDTH - 100);
        this.y = y ? y : random(100, HEIGHT - 100);
        this.width = 80;
        this.height = Math.max(this.inputs.length, this.outputs.length) * (tamCompNodes + 4) + tamCompNodes;

        switch(type){
            case 'NOT' :        {this.col = colsComps[0]; break}
            case 'AND' :        {this.col = colsComps[1]; break}
            case 'OR' :         {this.col = colsComps[2]; break}
            case 'CLOCK' :      {this.col = colsComps[3]; break}
            case 'DISPLAY' :    {this.col = colsComps[4]; break}
            case 'TRI' :        {this.col = colsComps[5]; break}
        }
    }

    simulate() {
        if (this.type === 'AND'){ 
            this.outputs[0] = (this.inputs[0] == 1 && this.inputs[1] == 1) ? 1 : 0
        }
        else if (this.type === 'OR'){
            this.outputs[0] = (this.inputs[0] == 1 || this.inputs[1] == 1) ? 1 : 0
        }
        else if (this.type === 'NOT'){ 
            this.outputs[0] = this.inputs[0] == 1 ? 0 : (this.inputs[0] == 0 ? 1 : 1)
        }
        else if(this.type === 'CLOCK'){
            let state = Math.floor(frameCount / 10) % 2 === 0;
            this.outputs = new Array(this.outputs.length).fill(state ? 1 : 0);
        }
        else if(this.type === "TRI"){
            this.outputs[0] = this.inputs[1] === 1 ? this.inputs[0] : 2 //output es input[0] si input[1] == 1, si no, output = 2 (estado floating)
        }
        else if(this.type === "BUS"){
            //iterar sobre todos los inputs del bus:
                // - todos los outputs de los comps conectados al bus
                // - si hay algun desigual: state = undefined
                // - si todos los valores son iguales: state = ese valor
                // - el valor 2 (floating) no cuenta
                /*
                    - (0,0,0) : 0
                    - (0,1,0) : undefined
                    - (0,1,2) : undefined
                    - (2,2,1) : 1
                    - (2,2,2) : 2
                */
            
            this.outputs[0] = this.state
        }
    }

    show() {
        push();
        fill(this.col);
        strokeWeight(strokeLight);
        this == selectedComp ? stroke(colorSelected) : stroke(darkenColor(this.col));
        rect(this.x, this.y, this.width, this.height);

        let multIn = (this.height - tamCompNodes) / this.inputs.length;
        let off = multIn / 2;
        for (let i = 0; i < this.inputs.length; i++) {
            let connInp = isInputConnectedToMainChip(this, i, false)
            if(!connInp) fill(colorDisconnected)
            else fill(this.inputs[i] === 0 ? colorOff : (this.inputs[i] === 1 ? colorOn : colorFloating));

            if(hoveredNode && hoveredNode.comp == this && hoveredNode.index == i && hoveredNode.side == 'input'){
                stroke(colorSelected)
                strokeWeight(strokeSelected)
            }
            else{
                this == selectedComp ? stroke(colorSelected) : stroke(0);
                strokeWeight(strokeLight)
            }
            
            //noFill()////////////////////
            rect(this.x - tamCompNodes / 2, this.y + i * multIn + off, tamCompNodes, tamCompNodes);
        }

        let multOut = (this.height - tamCompNodes) / this.outputs.length;
        off = multOut / 2;
        for (let i = 0; i < this.outputs.length; i++) {
            // let connOut = isInputConnectedToMainChip(this, i, true)
            // if(!connOut) fill(colorDisconnected)
            // else fill(this.outputs[i] === 0 ? colorOff : colorOn);
            fill(this.outputs[i] === 0 ? colorOff : (this.outputs[i] === 1 ? colorOn : colorFloating));

            if(hoveredNode && hoveredNode.comp == this && hoveredNode.index == i && hoveredNode.side == 'output'){
                stroke(colorSelected)
                strokeWeight(strokeSelected)
            }
            else{
                this == selectedComp ? stroke(colorSelected) : stroke(0);
                strokeWeight(strokeLight)
            }

            //noFill()////////////////////
            rect(this.x + this.width - tamCompNodes / 2, this.y + i * multOut + off, tamCompNodes, tamCompNodes);
        }

        fill(getTextColor(this.col))
        noStroke()
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

    getInputPosition(index, centered = false) {
        // if(this.type == 'BUS') {
        //     console.log("esto no deberia de pasar")
        //     return -1
        // }
        let multIn = (this.height - tamCompNodes) / this.inputs.length;
        let off = multIn / 2;
        let center = centered ? tamCompNodes / 2 : 0
        return { x: roundNum(this.x - tamCompNodes / 2 + center), y: roundNum(this.y + index * multIn + off + center)};
    }

    getOutputPosition(index, centered = false) {
        // if(this.type == 'BUS') {
        //     console.log("esto no deberia de pasar")
        //     return -1
        // }
        let multOut = (this.height - tamCompNodes) / this.outputs.length;
        let off = multOut / 2;
        let center = centered ? tamCompNodes / 2 : 0
        return { x: roundNum(this.x + this.width - tamCompNodes / 2), y: roundNum(this.y + index * multOut + off + center)};
    }

    inBounds(x, y) {
        return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
    }

    move(x, y, offx, offy) {
        this.x = roundNum(x + offx);
        this.y = roundNum(y + offy);
    }
}

class Display extends Component {
    constructor(name, nIn) {
        super(name, 'DISPLAY')
        this.pos = 
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
        this == selectedComp ? stroke(colorSelected) : stroke(darkenColor(this.col));
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
        this == selectedComp ? stroke(colorSelected) : stroke(darkenColor(this.col));
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

class Bus extends Component {
    constructor(name, path){
        super(name, 'BUS')
        this.state = 2      //el bus empieza con valor floating
        this.path = path
        this.col
        this.inputs = [2]
        this.x = path[0].x
        this.y = path[0].y
        this.width = 12
        this.height = 12
    }

    move(x, y, offx, offy) {
        this.path[0].x = roundNum(x + offx);
        this.path[0].y = roundNum(y + offy);
        this.x = this.path[0].x
        this.y = this.path[0].y
    }

    inBoundConn(){
        let res = isMouseTouchingLine(this.path, tamCollConn);
        if(res) return {x: res.x, y: res.y, bus: this, i: res.i}
        return undefined
    }

    setCol(){
        switch(this.state){
        case 0:
            this.col = colorOff
            break
        case 1:
            this.col = colorOn
            break
        case 2:
            this.col = colorFloating
            break
        case undefined:
            this.col = Math.random() > 0.5 ? colorOff : colorOn
            break
        }
    }

    show(){
        push()
        this.setCol()
        stroke(this.col);
        this.state ? strokeWeight(strokeOn) : strokeWeight(strokeOff)
        noFill()

        let inB = false
        if(hoveredNode.comp == null && hoveredComp == null){
            let res = this.inBoundConn()
            if(res) inB = true
        }
        
        //dibujar path
        if(inB) strokeWeight(6.5)
        let drawPath = []
        for(let p of this.path) drawPath.push(createVector(p.x, p.y))
        drawBezierPath(drawPath)

        //dibujar extremos
        fill(0)
        noStroke()
        rectMode(CENTER)
        //if(this.inBounds(mouseX, mouseY)) fill(colorOff)
        rect(this.path[0].x, this.path[0].y, 12)
        rect(this.path[this.path.length-1].x, this.path[this.path.length-1].y, 12)
        pop()
    }
}

















