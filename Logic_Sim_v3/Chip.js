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
    }

     addComponent(name, type, externalName = "", inP = 2) {
        if (type === 'CHIP') {
            const chip = chipRegistry.find(chip => chip.name === name);
            if (chip) {
                const newChip = this._cloneChipRecursively(chip);
                newChip.isSub = true
                newChip.name += compNames
                newChip.externalName = externalName
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
        newChip.components = chip.components.map(comp => new Component(comp.name, comp.type));
        newChip.chips = chip.chips.map(subChip => this._cloneChipRecursively(subChip));
        newChip.connections = chip.connections.map(conn => ({ ...conn }));
        return newChip;
    }

    connect(fromComponent, fromIndex, toComponent, toIndex) {
        this.connections = this.connections.filter(
            connection => !(connection.toComponent === toComponent && connection.toIndex === toIndex)
        );
        this.connections.push({ fromComponent, fromIndex, toComponent, toIndex });
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
                } else {
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
        for (let i = 0; i < this.connections.length; i++) {
            let connection = this.connections[i]
            const from = this._getComponentOrChip(connection.fromComponent);
            const to = this._getComponentOrChip(connection.toComponent);

            if (from && to) {
                let fromPos, toPos
                fromPos = from === this ? this.getInputPosition(connection.fromIndex) : from.getOutputPosition(connection.fromIndex);
                toPos = to === this ? this.getOutputPosition(connection.toIndex) : to.getInputPosition(connection.toIndex);
                let state = connection.fromComponent == 'INPUTS' ? from.inputs[connection.fromIndex] : from.outputs[connection.fromIndex]
                if(to.isSub){
                    toPos = to === this ? this.getOutputPosition(connection.toIndex) : to.getInputPositionSC(connection.toIndex);
                }
                if(from.isSub){
                    fromPos = from === this ? this.getInputPosition(connection.fromIndex) : from.getOutputPositionSC(connection.fromIndex);
                }
                if(connection.fromComponent == 'INPUTS'){fromPos.x += tamBasicNodes / 2; fromPos.y += tamBasicNodes / 2;}
                else{fromPos.x += tamCompNodes / 2; fromPos.y += tamCompNodes / 2;}
                if(connection.toComponent == 'OUTPUTS'){toPos.x += tamBasicNodes / 2; toPos.y += tamBasicNodes / 2;}
                else{toPos.x += tamCompNodes / 2; toPos.y += tamCompNodes / 2;}

                state ? stroke(colorOn) : stroke(colorOff)
                state ? strokeWeight(strokeOn) : strokeWeight(strokeOff)

                noFill()
                let x1 = fromPos.x
                let y1 = fromPos.y
                let x2 = toPos.x
                let y2 = toPos.y

                let controlX1 = x1 + controlDist;
                let controlY1 = y1

                let controlX2 = x2 - controlDist;
                let controlY2 = y2
                bezier(x1, y1, controlX1, controlY1, controlX2, controlY2, x2, y2);
            }
        }
        pop()

        //draw inputs and outputs
        stroke(0)
        strokeWeight(strokeOff)
        let multIn = (HEIGHT - 200) /  this.inputs.length
        let off = multIn / 2 + 100
        for (let i = 0; i < this.inputs.length; i++) {
            fill(this.inputs[i] === 0 ? colorOff : colorOn);
            line(0, off + i * multIn + tamBasicNodes / 2, tamBasicNodes, off + i * multIn + tamBasicNodes / 2)
            rect(20, off + i * multIn, tamBasicNodes, tamBasicNodes);
        }

        let multOut = (HEIGHT - 200) /  this.outputs.length
        off = multOut / 2 + 100
        for (let i = 0; i < this.outputs.length; i++) {
            fill(this.outputs[i] === 0 ? colorOff : colorOn);
            line(WIDTH - 50, off + i * multOut + tamBasicNodes / 2, WIDTH, off + i * multOut + tamBasicNodes / 2)
            rect(WIDTH - 50, off + i * multOut, tamBasicNodes, tamBasicNodes);
        }   

        //draw components
        for (let component of this.components) {
            component.show();
        }

        //draw chips
        for (let chip of this.chips) {
            push()
            fill(200);
            chip == selectedComp ? stroke(220) : stroke(0)
            strokeWeight(2)
            rect(chip.x, chip.y, chip.width, chip.height);

            let multIn = (chip.height - tamCompNodes) /  chip.inputs.length
            let off = multIn / 2
            for (let i = 0; i < chip.inputs.length; i++) {
                fill(chip.inputs[i] === 0 ? colorOff : colorOn);
                rect(chip.x - tamCompNodes / 2, chip.y + i * multIn + off, tamCompNodes, tamCompNodes);
            }

            let multOut = (chip.height - tamCompNodes) /  chip.outputs.length
            off = multOut / 2
            for (let i = 0; i < chip.outputs.length; i++) {
                fill(chip.outputs[i] === 0 ? colorOff : colorOn);
                rect(chip.x + chip.width - tamCompNodes / 2, chip.y + i * multOut + off, tamCompNodes, tamCompNodes);
            }


            fill(0)
            stroke(0)
            strokeWeight(.5)
            textAlign(CENTER, CENTER)
            let spacedWords = wrapText(chip.externalName, chip.w, 14)
            const fittedText = fitTextToRect(spacedWords, chip.width - tamCompNodes, chip.height, 18);
            textSize(14)
            if(chip.externalName.length < 8) textSize(17)
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
        return { x: 20, y: off + index * multIn};
    }
    getOutputPosition(index) {
        let multOut = (HEIGHT - 200) /  this.outputs.length
        let off = multOut / 2 + 100
        return { x: WIDTH - 50, y: off + index * multOut};
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
}