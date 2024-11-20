class Animation{
	//tipo de fountain, posicion, duracion en segundos
	constructor(p, pos, dur, col, deg){
		this.pos = pos
		this.emitter = new Fountain(null, p, pos.x, pos.y)
		if(col) this.col = col
		if(deg) this.emitter.f.angle = [deg, deg]
		this.nPart = Math.ceil(dur)
	}

	isFinished(){
		return this.emitter.length == 0
	}

	show(){
		push()
		this.emitter.location = this.pos
		if(this.col) this.emitter.colors[0] = this.col
		if(this.nPart > 0) this.emitter.CreateN()
	    this.emitter.Draw()
	    this.emitter.Step()
	    this.nPart--
	    pop()
	}

}