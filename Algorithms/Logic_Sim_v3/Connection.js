class Connection{
    constructor(fromComponent, fromIndex, toComponent, toIndex, path, fromConnPos = undefined, isSub = undefined){
        this.fromComponent = fromComponent
        this.fromIndex = fromIndex
        this.toComponent = toComponent
        this.toIndex = toIndex
        this.path = path
        let from, to
        from = isSub ? isSub._getComponentOrChip(this.fromComponent) : chip._getComponentOrChip(this.fromComponent);
        to = isSub ? isSub._getComponentOrChip(this.toComponent) : chip._getComponentOrChip(this.toComponent);
        if(from.type != "BUS"){
            this.fromPos = (from === chip ? chip.getInputPosition(this.fromIndex, true) : 
                                        (from.isSub ? from.getOutputPositionSC(this.fromIndex, true) : 
                                                    from.getOutputPosition(this.fromIndex, true)));
        }
        else{
            this.fromPos = path[0]
        }
        if(to.type != "BUS"){
            this.toPos = to === chip ? chip.getOutputPosition(this.toIndex, true) : 
                                   (to.isSub ? to.getInputPositionSC(this.toIndex, true) : 
                                               to.getInputPosition(this.toIndex, true));
        }
        else{
            this.toPos = this.path[this.path.length - 1]
        }
        
        //connections that are attached to this one {}
        this.subConnections = []
    }

    move(x, y, offx, offy, index) {
        this.path[index].x = roundNum(x + offx);
        this.path[index].y = roundNum(y + offy);
    }

    inBound(seg){
        return mouseX >= seg.x && mouseX <= seg.x + seg.w &&
               mouseY >= seg.y && mouseY <= seg.y + seg.h 
    }

    inBoundConn(){
        let res = isMouseTouchingLine([this.fromPos, ...this.path, this.toPos], tamCollConn);
        if(res) return {x: res.x, y: res.y, conn: this, i: res.i}
        return undefined
    }



	show(comp){
        let from, to
		from = this.isSub ? isSub._getComponentOrChip(this.fromComponent) : chip._getComponentOrChip(this.fromComponent);
        to = this.isSub ? isSub._getComponentOrChip(this.toComponent) : chip._getComponentOrChip(this.toComponent);
        let state = this.fromComponent == 'INPUTS' ? from.inputs[this.fromIndex] : (from.type != 'BUS' ? from.outputs[this.fromIndex] : from.state)

        if (from && to) {
            if(to.isSub){
                this.toPos = to === comp ? comp.getOutputPosition(this.toIndex, true) : to.getInputPositionSC(this.toIndex, true);
            }
            else if(to.type != 'BUS'){
                this.toPos = this.isSub ? (to === this.isSub ? this.isSub.getOutputPosition(this.toIndex, true) : to.getInputPosition(this.toIndex, true)) :
                                          (to === chip ? chip.getOutputPosition(this.toIndex, true) : to.getInputPosition(this.toIndex, true))
            }
            if(from.isSub){
                this.fromPos = from === comp ? comp.getInputPosition(this.fromIndex, true) : from.getOutputPositionSC(this.fromIndex, true);
            }
            else if(from.type != 'BUS'){
                this.fromPos = this.isSub ? ((from === this.isSub ? this.isSub.getInputPosition(this.fromIndex, true) : from.getOutputPosition(this.fromIndex, true))) :
                                            ((from === chip ? chip.getInputPosition(this.fromIndex, true) : from.getOutputPosition(this.fromIndex, true)))
            }
        }

        //if(from.type == "BUS") this.fromPos = from.path[0]
        //if(to.type == "BUS") this.toPos = to.path[0]
        if(from && from.type == "BUS") this.fromPos = this.path[0]
        if(to && to.type == "BUS") this.toPos = this.path[this.path.length-1]
    
        //state ? stroke(colorOn) : stroke(colorOff)
        stroke(state === 0 ? colorOff : (state === 1 ? colorOn : colorFloating));
        state ? strokeWeight(strokeOn) : strokeWeight(strokeOff)
        noFill()

        let inB = false
        if(hoveredComp == null){
            let res = this.inBoundConn()
            if(res) inB = true
        }
        

        if(inB) strokeWeight(6.5)
        let drawPath = []
        drawPath.push(createVector(this.fromPos.x, this.fromPos.y))
        for(let p of this.path) drawPath.push(createVector(p.x, p.y))
        drawPath.push(createVector(this.toPos.x, this.toPos.y))
        drawBezierPath(drawPath)

        // beginShape()
        // vertex(this.fromPos.x, this.fromPos.y)
        // if(this.path) for(let p of this.path) vertex(p.x, p.y)
        // vertex(this.toPos.x, this.toPos.y)
        // endShape()

        ////debug colls
        // for(let p of this.pathColls){
        //     strokeWeight(1)
        //     stroke(255, 0, 0)
        //     noFill()
        //     rect(p.x, p.y, p.w, p.h)
        // }
        }
	}




