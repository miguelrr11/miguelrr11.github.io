class Chip{
    constructor(name, inputs, outputs) {
        this.name = name;
        this.externalName = undefined
        this.inputs = Array(inputs).fill(0);
        this.outputs = Array(outputs).fill(0);

        this.components = [];
        this.chips = []; // Array of nested chips
        this.connections = [];
        this.inputsPos = []
        this.outputsPos = []
        this.x = roundNum(random(100, WIDTH - 100));
        this.y = roundNum(random(100, HEIGHT - 100));
        this.width = 80;
        this.height = Math.max(this.inputs.length, this.outputs.length) * (tamCompNodes+4) + tamCompNodes;
        this.isSub = false
        this.col = roundNum(Math.random() * 150)
        this.setIOpos(true, true)
    }

    setIOpos(inputs, outputs){
        if(inputs){
            let yValues = this.centerComponents(this.inputs.length)
            for (let i = 0; i < this.inputs.length; i++) {
                this.inputsPos[i] = { x: inputX, y: roundNum(yValues[i])}
            }
        }
        if(outputs){
            let yValues = this.centerComponents(this.outputs.length)
            for (let i = 0; i < this.outputs.length; i++) {
                this.outputsPos[i] = { x: outputX , y: roundNum(yValues[i])}
            }
        }
    }

    centerComponents(numComponents, totalHeight = HEIGHT, componentHeight = tamBasicNodes) {
        const spacing = map(numComponents, 0, maxIO, 45, 5.5)
        const totalSpacing = (numComponents - 1) * spacing
        const totalComponentsHeight = numComponents * componentHeight + totalSpacing
        const startY = (totalHeight - totalComponentsHeight) / 2

        let yValues = []
        for (let i = 0; i < numComponents; i++) {
            let y = startY + i * (componentHeight + spacing)
            yValues.push(y)
        }

        return yValues
    }

    addComponent(name, type, externalName = "", aux = 2, path = undefined) {
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
            if(type == 'DISPLAY') this.components.push(new Display(name, aux));
            else if(type == 'CLOCK') this.components.push(new Clock(name, aux));
            else if(type == 'BUS') this.components.push(new Bus(name, path));
            else this.components.push(new Component(name, type));
        }
    }

    _cloneChipRecursively(chip) {
        const newChip = new Chip(chip.name, chip.inputs.length, chip.outputs.length);
        newChip.externalName = chip.externalName
        newChip.isSub = true
        newChip.inputs = chip.inputs.slice()
        newChip.x = roundNum(chip.x)
        newChip.y = roundNum(chip.y)
        let newComponents = []
        for(let comp of chip.components){
            switch(comp.type){
                case 'DISPLAY':
                    let disp = new Display(comp.name, comp.inputs.length)
                    disp.x = roundNum(comp.x)
                    disp.y = roundNum(comp.y)
                    newComponents.push(disp)
                    break
                case 'CLOCK':
                    let cloc = new Clock(comp.name, comp.outputs.length)
                    cloc.x = roundNum(comp.x)
                    cloc.y = roundNum(comp.y)
                    newComponents.push(cloc)
                    break
                case 'BUS':
                    newComponents.push(new Bus(comp.name, comp.path.slice(), roundNum(comp.x), roundNum(comp.y)))
                    break
                default:
                    newComponents.push(new Component(comp.name, comp.type, roundNum(comp.x), roundNum(comp.y)))
            }
        }
        newChip.components = newComponents
        //newChip.components = chip.components.map(comp => new Component(comp.name, comp.type, roundNum(comp.x), roundNum(comp.y)));
        newChip.chips = chip.chips.map(subChip => this._cloneChipRecursively(subChip));
        newChip.inputsPos = chip.inputsPos.slice()
        newChip.outputsPos = chip.outputsPos.slice()
        //newChip.connections = chip.connections.map(conn => ({ ...conn }));
        newChip.connections = chip.connections.map(conn => new Connection(conn.fromComponent + "", conn.fromIndex, 
                                                                          conn.toComponent + "", conn.toIndex,
                                                                          conn.path.slice(), conn.fromConnPos, 
                                                                          newChip));
        return newChip;
    }

    connect(fromComponent, fromIndex, toComponent, toIndex, path, fromConnPos = undefined, draggingFromConn = undefined) {
        this.connections = this.connections.filter(
            connection => !(connection.toComponent === toComponent && connection.toIndex === toIndex 
                        && this._getComponentOrChip(connection.toComponent).type !== "BUS")
        );
        if(draggingFromConn){
            draggingFromConn.subConnections.push({fromComponent, 
                                                  toComponent,
                                                  fromIndex,
                                                  toIndex})
        }
        let newConn = new Connection(fromComponent, fromIndex, toComponent, toIndex, path, fromConnPos)
        // newConn.id = idConn
        // idConn++
        this.connections.push(newConn);
    }

    simulate() {
        //set states of buses
        for (let comp of this.components) {
            if(comp.type != "BUS") continue
            let connectedValues = []
            for(let conn of this.connections){
                if(conn.toComponent == comp.name){
                    let connectedComp = this._getComponentOrChip(conn.fromComponent)
                    if(connectedComp){
                        if(connectedComp == this) connectedValues.push(this.inputs[conn.fromIndex])
                        else if(connectedComp == comp) connectedValues.push(comp.state)
                        else connectedValues.push(connectedComp.outputs[conn.fromIndex])
                        
                    }
                }
            }
            comp.state = calculateBusState(connectedValues)
        }

        for (let connection of this.connections) {
            const from = this._getComponentOrChip(connection.fromComponent);
            const to = this._getComponentOrChip(connection.toComponent);

            if (from && to && from === this) {
                if (to instanceof Chip) {
                    if(to == this){
                        this.outputs[connection.toIndex] = from.inputs[connection.fromIndex]
                    }
                    else to.setInput(connection.toIndex, this.inputs[connection.fromIndex]);
                } 
                else {
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

        for (let conn of this.connections) {
            const from = this._getComponentOrChip(conn.fromComponent);
            const to = this._getComponentOrChip(conn.toComponent);
            if (from && to && from !== this && to !== this) {
                if (to instanceof Chip) {
                    to.setInput(conn.toIndex, from.getOutput(conn.fromIndex));
                } 
                else if(from.type != 'BUS'){
                    to.setInput(conn.toIndex, from.getOutput(conn.fromIndex));
                }
                else{
                    to.setInput(conn.toIndex, from.state);
                }
            }
        }

        for (let conn of this.connections) {
            if (conn.toComponent === 'OUTPUTS') {
                const from = this._getComponentOrChip(conn.fromComponent);
                if((from instanceof Chip) || (from instanceof Component && from.type != 'BUS')) this.outputs[conn.toIndex] = from.getOutput(conn.fromIndex);
                else this.outputs[conn.toIndex] = from.state
            }
        }
    }

    show() {
        this.height = Math.max(this.inputs.length, this.outputs.length) * (tamCompNodes+4) + tamCompNodes;
        push()
        //draw connections
        for(let c of chip.connections){ 
                c.show(chip) 
        }
        pop()

        //draw components
        for (let component of this.components) {
            component.show();
        }

        //draw chips
        for (let chip of this.chips) {
            this.showSC(chip)
        }

        //draw comp/chip in front
        if(frontComp){ 
            frontComp.isSub ? this.showSC(frontComp) : frontComp.show()
        } 

        

        //draw inputs and outputs
        stroke(0)
        strokeWeight(strokeLight)
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

            //noFill() /////////////////////
            line(0, this.inputsPos[i].y + tamCompNodes / 2, inputX, this.inputsPos[i].y + tamCompNodes / 2)
            rect(inputX, this.inputsPos[i].y, tamCompNodes, tamCompNodes)
            fill(this.inputs[i] === 0 ? colorOff : colorOn);
            rect(inputToggleX, this.inputsPos[i].y + tamCompNodes / 2 - tamBasicNodes / 2, tamBasicNodes, tamBasicNodes)
        }

        stroke(0)
        strokeWeight(strokeLight)
        for (let i = 0; i < this.outputs.length; i++) {
            let connOut = isInputConnectedToMainChip(this, i, true, true)
            if(!connOut) fill(colorDisconnected)
            else fill(this.outputs[i] === 0 || this.outputs[i] === 2 ? colorOff : colorOn);

            if(hoveredNode && hoveredNode.comp == 'OUTPUTS' && hoveredNode.index == i){
                stroke(colorSelected)
                strokeWeight(strokeSelected)
            }
            else{
                stroke(0)
                strokeWeight(strokeLight)
            }

            //noFill() /////////////////////
            line(outputX, this.outputsPos[i].y + tamCompNodes / 2, WIDTH, this.outputsPos[i].y + tamCompNodes / 2)
            rect(outputX, this.outputsPos[i].y, tamCompNodes, tamCompNodes)
            fill(this.outputs[i] === 0 ? colorOff : (this.outputs[i] === 1 ? colorOn : colorFloating));
            rect(outputToggleX, this.outputsPos[i].y + tamCompNodes / 2 - tamBasicNodes / 2, tamBasicNodes, tamBasicNodes)
        }

        this.showPrevIO()

        
    }

    showPrevIO(){
        if(addingInput != null){
            fill(255, 100)
            line(tamBasicNodes, addingInput, inputX, addingInput)
            rect(inputX, addingInput - tamCompNodes / 2, tamCompNodes, tamCompNodes)
            rect(inputToggleX, addingInput - tamBasicNodes / 2, tamBasicNodes, tamBasicNodes)
        }
        if(addingOutput != null){
            fill(255, 100)
            line(outputX + tamCompNodes, addingOutput, WIDTH - tamBasicNodes, addingOutput)
            rect(outputX, addingOutput - tamCompNodes/2, tamCompNodes, tamCompNodes)
            rect(outputToggleX, addingOutput - tamBasicNodes / 2, tamBasicNodes, tamBasicNodes)
        }   
    }

    showSC(chip){
        push()
        if(chip.col) fill(chip.col);
        else fill(100)
        chip == selectedComp ? stroke(colorSelected) : stroke(darkenColor(chip.col));
        strokeWeight(strokeLight)
        rect(chip.x, chip.y, chip.width, chip.height);

        //inputs
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

        //outputs
        let multOut = (chip.height - tamCompNodes) /  chip.outputs.length
        off = multOut / 2
        for (let i = 0; i < chip.outputs.length; i++) {
            // let connOut = isInputConnectedToMainChip(chip, i, true)
            // if(!connOut) fill(colorDisconnected)
            // else fill(chip.outputs[i] === 0 ? colorOff : colorOn);
            fill(chip.outputs[i] === 0 ? colorOff : colorOn);

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


        // fill(colorOn);
        // stroke(colorOff)
        fill(getTextColor(chip.col))
        noStroke()
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

    addInput(y = undefined){
        if(this.inputs.length > maxIO) return false
        this.inputs.push(0)
        //this.setIOpos(true, false)
        this.inputsPos.push({x: inputX, y: y - tamCompNodes/2})
    }

    removeInput(index = undefined){
        index != undefined ? this.inputs.splice(index, 1) : this.inputs.pop()
        index != undefined ? this.inputsPos.splice(index, 1) : this.inputsPos.pop()
        //this.setIOpos(true, false)
    }

    addOutput(y = undefined){
        if(this.outputs.length > maxIO) return false
        this.outputs.push(0)
        //this.setIOpos(false, true)
        this.outputsPos.push({x: outputX, y: y - tamCompNodes/2})
    }

    removeOutput(index = undefined){
        index != undefined ? this.outputs.splice(index, 1) : this.outputs.pop()
        index != undefined ? this.outputsPos.splice(index, 1) : this.outputsPos.pop()
        //this.setIOpos(false, true)
    }

    //CHIP
    getInputPosition(index, centered = false) {
        let pos = this.inputsPos[index]
        let center = centered ? tamCompNodes / 2 : 0
        return {x: pos.x + center, y: pos.y + center}
    }
    getOutputPosition(index, centered = false) {
        let pos = this.outputsPos[index]
        let center = centered ? tamCompNodes / 2 : 0
        return {x: pos.x + center, y: pos.y + center}
    }

    getInputTogglePosition(index) {
        let pos = this.inputsPos[index]
        return {x: inputToggleX, y: pos.y - tamBasicNodes / 4}
    }
    getOutputTogglePosition(index) {
        let pos = this.outputsPos[index]
        return {x: outputToggleX, y: pos.y - tamBasicNodes / 4}
    }

    //SUB-CHIP
    getInputPositionSC(index, centered = false) {
        let multIn = (this.height - tamCompNodes) /  this.inputs.length
        let off = multIn / 2
        let center = centered ? tamCompNodes / 2 : 0
        return { x: roundNum(this.x - tamCompNodes / 2), y: roundNum(this.y + index * multIn + off + center)};
    }
    getOutputPositionSC(index, centered = false) {
        let multOut = (this.height - tamCompNodes) /  this.outputs.length
        let off = multOut / 2
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

    getConnection(fromC, fromI, toC, toI){
        for(let i = 0; i < this.connections.length; i++){
            let auxConn = this.connections[i]
            if(auxConn.fromComponent == fromC &&
               auxConn.toComponent == toC &&
               auxConn.fromIndex == fromI &&
               auxConn.toIndex == toI){
                return auxConn
            }
        }
    }



}


