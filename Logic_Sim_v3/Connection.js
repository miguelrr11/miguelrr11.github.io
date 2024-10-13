class Connection{
	constructor(fromComponent, fromIndex, toComponent, toIndex, path){
		this.fromComponent = fromComponent
		this.fromIndex = fromIndex
		this.toComponent = toComponent
		this.toIndex = toIndex
		this.path = path
		this.pathColls = this.setCollsPath()
		let from = chip._getComponentOrChip(this.fromComponent);
        let to = chip._getComponentOrChip(this.toComponent);
        this.fromPos = from === chip ? chip.getInputPosition(this.fromIndex) : from.getOutputPosition(this.fromIndex);
        this.toPos = to === chip ? chip.getOutputPosition(this.toIndex) : to.getInputPosition(this.toIndex);
        this.fromPos.x += tamCompNodes / 2;
        this.fromPos.y += tamCompNodes / 2;
        this.toPos.x += tamCompNodes / 2;
        this.toPos.y += tamCompNodes / 2;
        this.state = this.fromComponent == 'INPUTS' ? from.inputs[this.fromIndex] : from.outputs[this.fromIndex]
	}

	setCollsPath(){
		let pathColls = []
		
	}

	show(comp){
		let from = chip._getComponentOrChip(this.fromComponent);
        let to = chip._getComponentOrChip(this.toComponent);

        if (from && to) {
            if(to.isSub){
                toPos = to === comp ? comp.getOutputPosition(this.toIndex) : to.getInputPositionSC(this.toIndex);
            }
            if(from.isSub){
                this.fromPos = from === comp ? comp.getInputPosition(this.fromIndex) : from.getOutputPositionSC(this.fromIndex);
            }

            this.state ? stroke(colorOn) : stroke(colorOff)
            this.state ? strokeWeight(strokeOn) : strokeWeight(strokeOff)

            noFill()

            beginShape()
            vertex(this.fromPos.x, this.fromPos.y)
            if(this.path) for(let p of this.path) vertex(p.x, p.y)
            vertex(this.toPos.x, this.toPos.y)
            endShape()
        }
	}
}