class Connection{
	constructor(fromComponent, fromIndex, toComponent, toIndex, path, fromConnPos = undefined){
		this.fromComponent = fromComponent
		this.fromIndex = fromIndex
		this.toComponent = toComponent
		this.toIndex = toIndex
		this.path = path
		let from = chip._getComponentOrChip(this.fromComponent);
        let to = chip._getComponentOrChip(this.toComponent);
        if(fromConnPos) this.fromConnPos = fromConnPos
        this.fromPos = fromConnPos ? fromConnPos : (from === chip ? chip.getInputPosition(this.fromIndex) : from.getOutputPosition(this.fromIndex));
        this.toPos = to === chip ? chip.getOutputPosition(this.toIndex) : to.getInputPosition(this.toIndex);
        if(!fromConnPos){
            this.fromPos.x += tamCompNodes / 2;
            this.fromPos.y += tamCompNodes / 2;
            this.toPos.x += tamCompNodes / 2;
            this.toPos.y += tamCompNodes / 2;
        }

        this.pathColls = this.setCollsPath()
	}

    /*
    FIX: from subchip to subchip and from subchip to output
    */
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
            let w = x1 == x2 ? tamCollConn : Math.abs(x1 - x2)
            let h = y1 == y2 ? tamCollConn : Math.abs(y1 - y2)
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
                return {x, y}
            }
        }
        return undefined
    }

	show(comp){
		let from = chip._getComponentOrChip(this.fromComponent);
        let to = chip._getComponentOrChip(this.toComponent);
        let state = this.fromComponent == 'INPUTS' ? from.inputs[this.fromIndex] : from.outputs[this.fromIndex]

        if (from && to) {
            if(to.isSub){
                this.toPos = to === comp ? comp.getOutputPosition(this.toIndex) : to.getInputPositionSC(this.toIndex);
            }
            if(from.isSub){
                this.fromPos = from === comp ? comp.getInputPosition(this.fromIndex) : from.getOutputPositionSC(this.fromIndex);
            }

            state ? stroke(colorOn) : stroke(colorOff)
            state ? strokeWeight(strokeOn) : strokeWeight(strokeOff)

            noFill()

            beginShape()
            vertex(this.fromPos.x, this.fromPos.y)
            if(this.path) for(let p of this.path) vertex(p.x, p.y)
            vertex(this.toPos.x, this.toPos.y)
            endShape()

            stroke(255, 0, 0)
            strokeWeight(1)
            for(let p of this.pathColls){ 
                if(this.inBound(p)){
                    fill(255, 0, 0)
                }
                else noFill()
                rect(p.x, p.y, p.w, p.h)
            }
        }
	}
}



