class Connection{

    constructor(fromComponent, fromIndex, toComponent, toIndex, path, fromConnPos = undefined, isSub = undefined, pathColls = undefined, idConn = undefined){
        if(idConn != undefined) this.id = idConn
        this.fromComponent = fromComponent
        this.fromIndex = fromIndex
        this.toComponent = toComponent
        this.toIndex = toIndex
        this.path = path
        let from, to
        from = isSub ? isSub._getComponentOrChip(this.fromComponent) : chip._getComponentOrChip(this.fromComponent);
        to = isSub ? isSub._getComponentOrChip(this.toComponent) : chip._getComponentOrChip(this.toComponent);
        if(fromConnPos) this.fromConnPos = fromConnPos
        this.fromPos = fromConnPos ? fromConnPos : 
                                     (from === chip ? chip.getInputPosition(this.fromIndex, true) : 
                                                      (from.isSub ? from.getOutputPositionSC(this.fromIndex, true) : 
                                                                    from.getOutputPosition(this.fromIndex, true)));
        this.toPos = to === chip ? chip.getOutputPosition(this.toIndex, true) : 
                                   (to.isSub ? to.getInputPositionSC(this.toIndex, true) : 
                                               to.getInputPosition(this.toIndex, true));
        this.pathColls = pathColls ? pathColls : this.setCollsPath()

        //connections that are attached to this one {}
        this.subConnections = []
    }

    //constructor(fromComponent, fromIndex, toComponent, toIndex, path, fromConnPos = undefined, isSub = undefined, pathColls = undefined){
    //  this.fromComponent = fromComponent
    //  this.fromIndex = fromIndex
    //  this.toComponent = toComponent
    //  this.toIndex = toIndex
    //  this.path = path
    //     let from, to
    //  from = isSub ? isSub._getComponentOrChip(this.fromComponent) : chip._getComponentOrChip(this.fromComponent);
    //     to = isSub ? isSub._getComponentOrChip(this.toComponent) : chip._getComponentOrChip(this.toComponent);
    //     if(fromConnPos){
    //         let fromPos = (from === chip ? chip.getInputPosition(this.fromIndex, true) : 
    //                                     (from.isSub ? from.getOutputPositionSC(this.fromIndex, true) : 
    //                                                 from.getOutputPosition(this.fromIndex, true)));
    //         this.path.unshift({ x: fromConnPos.x, y: fromConnPos.y })
    //         //this.fromConnPos = fromConnPos
    //     }
    //     this.fromPos = (from === chip ? chip.getInputPosition(this.fromIndex, true) : 
    //                                     (from.isSub ? from.getOutputPositionSC(this.fromIndex, true) : 
    //                                                 from.getOutputPosition(this.fromIndex, true)));
    //     this.toPos = to === chip ? chip.getOutputPosition(this.toIndex, true) : 
    //                                (to.isSub ? to.getInputPositionSC(this.toIndex, true) : 
    //                                            to.getInputPosition(this.toIndex, true));
    //     this.pathColls = pathColls ? pathColls : this.setCollsPath()

    //     //connections that are attached to this one {}
    //     this.subConnections = []
    // }

	setCollsPath(){
		let pathColls = []
        let x1 = this.fromPos.x
        let y1 = this.fromPos.y
		for(let i = -1; i < this.path.length - 1; i++){
            if(i >= 0){
                x1 = this.path[i].x
                y1 = this.path[i].y 
            }
            let x2 = i == this.path.length - 1 ? this.toPos.x : this.path[i + 1].x
            let y2 = i == this.path.length - 1 ? this.toPos.y : this.path[i + 1].y
            let x = Math.min(x1, x2) - tamCollConn / 2
            let y = Math.min(y1, y2) - tamCollConn / 2
            let w = x1 == x2 ? tamCollConn : Math.abs(x1 - x2) + tamCollConn
            let h = y1 == y2 ? tamCollConn : Math.abs(y1 - y2) + tamCollConn
            if(y1 == y2){
                x += radCurveConn
                w -= radCurveConn*2
            }
            if(x1 == x2){
                y += radCurveConn
                h -= radCurveConn*2
            }
            x = roundNum(x)
            y = roundNum(y)
            w = roundNum(w)
            h = roundNum(h)
            pathColls.push({x, y, w, h})
        }
        return pathColls
	}

    inBound(seg){
        return mouseX >= seg.x && mouseX <= seg.x + seg.w &&
               mouseY >= seg.y && mouseY <= seg.y + seg.h 
    }

    inBoundConn(){
        for(let i = 0; i < this.pathColls.length; i++){
            let p = this.pathColls[i]
            if(this.inBound(p)){ 
                let x, y
                if(p.w == tamCollConn){
                    x = p.x + tamCollConn / 2
                    y = mouseY
                }
                else{
                    x = mouseX
                    y = p.y + tamCollConn / 2
                }
                return {x, y, conn: this, i}
            }
        }
        return undefined
    }

	show(comp){
        let from, to
		from = this.isSub ? isSub._getComponentOrChip(this.fromComponent) : chip._getComponentOrChip(this.fromComponent);
        to = this.isSub ? isSub._getComponentOrChip(this.toComponent) : chip._getComponentOrChip(this.toComponent);
        let state = this.fromComponent == 'INPUTS' ? from.inputs[this.fromIndex] : from.outputs[this.fromIndex]
        if(to.isSub){
            this.toPos = to === comp ? comp.getOutputPosition(this.toIndex, true) : to.getInputPositionSC(this.toIndex, true);
        }
        else {
            this.toPos = this.isSub ? (to === this.isSub ? this.isSub.getOutputPosition(this.toIndex, true) : to.getInputPosition(this.toIndex, true)) :
                                      (to === chip ? chip.getOutputPosition(this.toIndex, true) : to.getInputPosition(this.toIndex, true))
        }
        if(from.isSub && !this.fromConnPos){
            this.fromPos = from === comp ? comp.getInputPosition(this.fromIndex, true) : from.getOutputPositionSC(this.fromIndex, true);
        }
        else{ 
            this.fromPos = this.isSub ? (this.fromConnPos ? this.fromConnPos : (from === this.isSub ? this.isSub.getInputPosition(this.fromIndex, true) : from.getOutputPosition(this.fromIndex, true))) :
                                        (this.fromConnPos ? this.fromConnPos : (from === chip ? chip.getInputPosition(this.fromIndex, true) : from.getOutputPosition(this.fromIndex, true)))
        }

        // if (from && to) {
        //     if(to.isSub){
        //         this.toPos = to === comp ? comp.getOutputPosition(this.toIndex, true) : to.getInputPositionSC(this.toIndex, true);
        //     }
        //     else {
        //         this.toPos = this.isSub ? (to === this.isSub ? this.isSub.getOutputPosition(this.toIndex, true) : to.getInputPosition(this.toIndex, true)) :
        //                                   (to === chip ? chip.getOutputPosition(this.toIndex, true) : to.getInputPosition(this.toIndex, true))
        //     }
        //     if(from.isSub){
        //         this.fromPos = from === comp ? comp.getInputPosition(this.fromIndex, true) : from.getOutputPositionSC(this.fromIndex, true);
        //     }
        //     else{ 
        //         this.fromPos = this.isSub ? ((from === this.isSub ? this.isSub.getInputPosition(this.fromIndex, true) : from.getOutputPosition(this.fromIndex, true))) :
        //                                     ((from === chip ? chip.getInputPosition(this.fromIndex, true) : from.getOutputPosition(this.fromIndex, true)))
        //     }

            

            state ? stroke(colorOn) : stroke(colorOff)
            state ? strokeWeight(strokeOn) : strokeWeight(strokeOff)
            noFill()

            let inB = false
            if(hoveredNode.comp == null && hoveredComp == null){
                for(let p of this.pathColls){ 
                    if(this.inBound(p)){
                        inB = true
                        beingHoveredGlobal = true
                        break
                    }
                }
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




