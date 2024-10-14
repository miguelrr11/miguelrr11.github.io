class Chip{
    constructor(name, inputs, outputs) {
        this.name = name;
        this.externalName = undefined
        this.inputs = Array(inputs).fill(0);
        this.outputs = Array(outputs).fill(0);
        this.components = [];
        this.chips = []; // Array of nested chips
        this.connections = [];

        this.x = random(100, WIDTH - 100);
        this.y = random(100, HEIGHT - 100);
        this.width = 80;
        this.height = Math.max(this.inputs.length, this.outputs.length) * (tamCompNodes+4) + tamCompNodes;

        this.isSub = false

        this.col = Math.random() * 150
    }

     addComponent(name, type, externalName = "", inP = 2) {
        if (type === 'CHIP') {
            const chip = chipRegistry.find(chip => chip.name === name);
            if (chip) {
                const newChip = this._cloneChipRecursively(chip);
                newChip.isSub = true
                newChip.name += compNames
                newChip.externalName = externalName
                newChip.col = chip.col
                compNames++
                chipRegistry.push(newChip)
                this.chips.push(newChip);
            } 
            else {
                console.error(`Chip with name ${name} not found in registry`);
            }
        } else {
            if(type == 'DISPLAY') this.components.push(new Display(name, inP));
            else if(type == 'CLOCK') this.components.push(new Clock(name, inP));
            else this.components.push(new Component(name, type));
        }
    }

    _cloneChipRecursively(chip) {
        const newChip = new Chip(chip.name, chip.inputs.length, chip.outputs.length);
        newChip.inputs = chip.inputs.slice()
        newChip.x = chip.x
        newChip.y = chip.y
        newChip.components = chip.components.map(comp => new Component(comp.name, comp.type));
        newChip.chips = chip.chips.map(subChip => this._cloneChipRecursively(subChip));
        newChip.connections = chip.connections.map(conn => ({ ...conn }));
        return newChip;
    }

    connect(fromComponent, fromIndex, toComponent, toIndex, path, fromConnPos = undefined) {
        this.connections = this.connections.filter(
            connection => !(connection.toComponent === toComponent && connection.toIndex === toIndex)
        );
        let newConn = new Connection(fromComponent, fromIndex, toComponent, toIndex, path, fromConnPos)
        console.log(newConn)
        this.connections.push(newConn);
    }

    simulate() {
        for (let connection of this.connections) {
            const from = this._getComponentOrChip(connection.fromComponent);
            const to = this._getComponentOrChip(connection.toComponent);

            if (from && to && from === this) {
                if (to instanceof Chip) {
                    to.setInput(connection.toIndex, this.inputs[connection.fromIndex]);
                } else {
                    to.setInput(connection.toIndex, this.inputs[connection.fromIndex]);
                }
            }
        }

        for (let component of this.components) {
            component.simulate();
        }

        for (let chip of this.chips) {
            chip.simulate();
        }

        for (let connection of this.connections) {
            const from = this._getComponentOrChip(connection.fromComponent);
            const to = this._getComponentOrChip(connection.toComponent);
            if (from && to && from !== this && to !== this) {
                if (to instanceof Chip) {
                    to.setInput(connection.toIndex, from.getOutput(connection.fromIndex));
                } 
                else {
                    to.setInput(connection.toIndex, from.getOutput(connection.fromIndex));
                }
            }
        }

        for (let connection of this.connections) {
            if (connection.toComponent === 'OUTPUTS') {
                const from = this._getComponentOrChip(connection.fromComponent);
                this.outputs[connection.toIndex] = from.getOutput(connection.fromIndex);
            }
        }
    }

    show() {
        push()
        //draw connections
        for(let c of this.connections) c.show(this)
        pop()

        //draw inputs and outputs
        stroke(0)
        strokeWeight(strokeLight)
        let multIn = (HEIGHT - 200) /  this.inputs.length
        let off = multIn / 2 + 100
        for (let i = 0; i < this.inputs.length; i++) {
            let connInp = isInputConnectedToMainChip(this, i, false, true)
            if(!connInp) fill(colorDisconnected)
            else fill(this.inputs[i] === 0 ? colorOff : colorOn);

            if(hoveredNode && hoveredNode.comp == 'INPUTS' && hoveredNode.index == i){
                stroke(colorSelected)
                strokeWeight(strokeSelected)
            }
            else{
                stroke(0)
                strokeWeight(strokeLight)
            }

            line(0, off + i * multIn + tamCompNodes / 2, inputX, off + i * multIn + tamCompNodes / 2)
            rect(inputX, off + i * multIn, tamCompNodes, tamCompNodes);
            fill(this.inputs[i] === 0 ? colorOff : colorOn);
            rect(inputToggleX, off + i * multIn - tamBasicNodes/5, tamBasicNodes, tamBasicNodes);
        }

        stroke(0)
        strokeWeight(strokeLight)
        let multOut = (HEIGHT - 200) /  this.outputs.length
        off = multOut / 2 + 100
        for (let i = 0; i < this.outputs.length; i++) {
            let connOut = isInputConnectedToMainChip(this, i, true, true)
            if(!connOut) fill(colorDisconnected)
            else fill(this.outputs[i] === 0 ? colorOff : colorOn);

            if(hoveredNode && hoveredNode.comp == 'OUTPUTS' && hoveredNode.index == i){
                stroke(colorSelected)
                strokeWeight(strokeSelected)
            }
            else{
                stroke(0)
                strokeWeight(strokeLight)
            }

            line(outputX, off + i * multOut + tamCompNodes / 2, WIDTH, off + i * multOut + tamCompNodes / 2)
            rect(outputX, off + i * multOut, tamCompNodes, tamCompNodes);
            fill(this.outputs[i] === 0 ? colorOff : colorOn);
            rect(outputToggleX, off + i * multOut - tamBasicNodes/5, tamBasicNodes, tamBasicNodes);
        }   

        //draw components
        for (let component of this.components) {
            component.show();
        }

        //draw chips
        for (let chip of this.chips) {
            push()
            if(chip.col) fill(chip.col);
            else fill(100)
            chip == selectedComp ? stroke(colorSelected) : stroke(0);
            strokeWeight(strokeLight)
            rect(chip.x, chip.y, chip.width, chip.height);

            let multIn = (chip.height - tamCompNodes) /  chip.inputs.length
            let off = multIn / 2
            for (let i = 0; i < chip.inputs.length; i++) {
                let connInp = isInputConnectedToMainChip(chip, i, false)
                if(!connInp) fill(colorDisconnected)
                else fill(chip.inputs[i] === 0 ? colorOff : colorOn);

                if(hoveredNode && hoveredNode.comp == chip && hoveredNode.index == i && hoveredNode.side == 'input'){
                    stroke(colorSelected)
                    strokeWeight(strokeSelected)
                }
                else{
                    stroke(0)
                    strokeWeight(strokeLight)
                }
                if(chip == selectedComp) stroke(colorSelected)

                rect(chip.x - tamCompNodes / 2, chip.y + i * multIn + off, tamCompNodes, tamCompNodes);
            }

            let multOut = (chip.height - tamCompNodes) /  chip.outputs.length
            off = multOut / 2
            for (let i = 0; i < chip.outputs.length; i++) {
                let connOut = isInputConnectedToMainChip(chip, i, true)
                if(!connOut) fill(colorDisconnected)
                else fill(chip.outputs[i] === 0 ? colorOff : colorOn);

                if(hoveredNode && hoveredNode.comp == chip && hoveredNode.index == i && hoveredNode.side == 'output'){
                    stroke(colorSelected)
                    strokeWeight(strokeSelected)
                }
                else{
                    stroke(0)
                    strokeWeight(strokeLight)
                }
                if(chip == selectedComp) stroke(colorSelected)

                fill(chip.outputs[i] === 0 ? colorOff : colorOn);
                rect(chip.x + chip.width - tamCompNodes / 2, chip.y + i * multOut + off, tamCompNodes, tamCompNodes);
            }


            fill(colorOn);
            stroke(colorOff)
            strokeWeight(.5)
            textAlign(CENTER, CENTER)
            let spacedWords
            if(chip.externalName) spacedWords = wrapText(chip.externalName, chip.w, 14)
            else spacedWords = wrapText(chip.name, chip.w, 14)
            const fittedText = fitTextToRect(spacedWords, chip.width - tamCompNodes, chip.height, 18);
            textSize(14)
            if(chip.externalName && chip.externalName.length < 8) textSize(17)
            text(fittedText, chip.x + chip.width / 2, chip.y + chip.height / 2 - 10);
            pop()
        }


    }

    _getComponentOrChip(name) {
        if (name === 'INPUTS') return this;
        if (name === 'OUTPUTS') return this;
        let foundCo = this.components.find(comp => comp.name === name)
        let foundCh = this.chips.find(chip => chip.name === name);
        //console.log("fco: " + foundCo + " fch: " + foundCh + " name: " + name)
        return foundCo || foundCh
    }

    toggleInput(index){
        this.setInput(index, this.inputs[index] === 0 ? 1 : 0);
    }

    setInput(index, value) {
        this.inputs[index] = value;
    }

    getOutput(index) {
        return this.outputs[index];
    }

    //CHIP
    getInputPosition(index) {
        let multIn = (HEIGHT - 200) /  this.inputs.length
        let off = multIn / 2 + 100
        return { x: inputX, y: off + index * multIn};
    }
    getOutputPosition(index) {
        let multOut = (HEIGHT - 200) /  this.outputs.length
        let off = multOut / 2 + 100
        return { x: outputX, y: off + index * multOut};
    }

    getInputTogglePosition(index) {
        let multIn = (HEIGHT - 200) /  this.inputs.length
        let off = multIn / 2 + 100 - tamBasicNodes / 4
        return { x: inputToggleX, y: off + index * multIn};
    }
    getOutputTogglePosition(index) {
        let multOut = (HEIGHT - 200) /  this.outputs.length
        let off = multOut / 2 + 100
        return { x: outputToggleX, y: off + index * multOut};
    }

    //SUB-CHIP
    getInputPositionSC(index) {
        let multIn = (this.height - tamCompNodes) /  this.inputs.length
        let off = multIn / 2
        return { x: this.x - tamCompNodes / 2, y: this.y + index * multIn + off};
    }
    getOutputPositionSC(index) {
        let multOut = (this.height - tamCompNodes) /  this.outputs.length
        let off = multOut / 2
        return { x: this.x + this.width - tamCompNodes / 2, y: this.y + index * multOut + off};
    }

    inBounds(x, y) {
        return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
    }

    move(x, y, offx, offy) {
        this.x = x + offx;
        this.y = y + offy;
    }

    getInBoundsInputToggle(){
        for (let i = 0; i < this.inputs.length; i++) {
            let inputPos = this.getInputTogglePosition(i);
            if (
                mouseX >= inputPos.x && mouseX <= inputPos.x + tamBasicNodes &&
                mouseY >= inputPos.y && mouseY <= inputPos.y + tamBasicNodes
            ) {
                return i
            }
        }
    }

    getInBoundsOutputToggle(){
        for (let i = 0; i < this.outputs.length; i++) {
            let inputPos = this.getOutputTogglePosition(i);
            if (
                mouseX >= inputPos.x && mouseX <= inputPos.x + tamBasicNodes &&
                mouseY >= inputPos.y && mouseY <= inputPos.y + tamBasicNodes
            ) {
                return i
            }
        }
    }

    getInBoundsInput(){
        for (let i = 0; i < this.inputs.length; i++) {
            let inputPos = this.getInputPosition(i);
            if (
                mouseX >= inputPos.x && mouseX <= inputPos.x + tamCompNodes &&
                mouseY >= inputPos.y && mouseY <= inputPos.y + tamCompNodes
            ) {
                return i
            }
        }
    }

    getInBoundsOutput(){
        for (let i = 0; i < this.outputs.length; i++) {
            let inputPos = this.getOutputPosition(i);
            if (
                mouseX >= inputPos.x && mouseX <= inputPos.x + tamCompNodes &&
                mouseY >= inputPos.y && mouseY <= inputPos.y + tamCompNodes
            ) {
                return i
            }
        }
    }

}


