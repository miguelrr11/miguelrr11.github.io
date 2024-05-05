class Animation{
	//tipo de fountain, posicion, duracion en segundos
	constructor(p, pos, dur, col, deg){
		this.pos = pos
		this.emitter = new Fountain(null, p, pos.x, pos.y)
		if(col) this.emitter.colors[0] = col
		if(deg) this.emitter.f.angle = [deg, deg]
		this.nPart = Math.ceil(dur)
	}

	isFinished(){
		return this.emitter.length == 0
	}

	show(){
		push()
		this.emitter.location = this.pos
		if(this.nPart > 0) this.emitter.Create()
	    this.emitter.Draw()
	    this.emitter.Step()
	    this.nPart--
	    pop()
	}

}