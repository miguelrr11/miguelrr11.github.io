class MisileLauncher extends Nexus{
    constructor(pos){
        super()
		this.pos = pos 
		this.tam = 65
		this.range = 125

        this.cadencia = 10
		this.rate = 60/this.cadencia
		this.count = 60/this.cadencia //para que no ataquen a la vez

        this.trans = 0

		this.lifetime = 10

		this.pAttack = {color:['white'], 
						angle: [0, 360], 
						size: [30,34], 
						sizePercent: 0.95,
						speed: 6,
						gravity: false
					   };

		this.pActiveMuerte = {color:['white'], 
					   angle: [0, 360], 
					   size: [35,40], 
					   sizePercent: 0.95,
					   speed: 6,
					   gravity: false
					  };
    }

    update(){
		if(mouseIsPressed && dist(mouseX, mouseY, this.pos.x, this.pos.y) < this.tam){
			this.pos.x = mouseX
			this.pos.y = mouseY
		}

		if(frameCount % 60 == 0) this.lifetime--;

        this.count--
        this.count = constrain(this.count, 0, Infinity)
		if(this.count <= 0){
			if(this.attack(5, undefined, this.range, false, true, 200, 8)){ 
               // activeAnim.push(new Animation(this.pAttack, this.pos, 20)) 
               this.trans = 255
            }
		}
	}

	explode(){
		//this.attack(20, undefined, Infinity)
		activeAnim.push(new Animation(this.pActiveMuerte, this.pos.copy(), 10, "#f70c0c"))
		activeAnim.push(new Animation(this.pActiveMuerte, this.pos.copy(), 10, "#ff5252"))
		activeAnim.push(new Animation(this.pActiveMuerte, this.pos.copy(), 10, "#ab1a1a"))
		activeAnim.push(new Animation(this.pActiveMuerte, this.pos.copy(), 10, "#ed3939"))
	}

    show(){
        push()
		fill("#FF1E1E")
		noStroke()
		ellipse(this.pos.x, this.pos.y, this.tam)
		noFill()
		stroke("#FF8888")
		strokeWeight(3)
		ellipse(this.pos.x, this.pos.y, this.tam)

		stroke("#A73131")
		ellipse(this.pos.x, this.pos.y, this.tam+4)

		stroke("#801818")
		strokeWeight(3)
		ellipse(this.pos.x, this.pos.y, this.tam+5)

		stroke("#FFFFFF")
		strokeWeight(6)
		ellipse(this.pos.x, this.pos.y, this.tam+5)

		stroke("#FF0000")
		ellipse(this.pos.x, this.pos.y, this.tam+8)

		stroke("#960909")
		strokeWeight(3)
		ellipse(this.pos.x, this.pos.y, this.tam+12)

		stroke("white")
		strokeWeight(1)
		ellipse(this.pos.x, this.pos.y, this.tam-10)

		this.discLinesEllipse("#FF4040", this.pos, this.range, 50, nexus.t*6)

        noStroke()
        fill(255, 255, 255, this.trans)
        ellipse(this.pos.x, this.pos.y, 40)
        this.trans--
        if(this.trans < 0) this.trans = 0

		pop()
    }
}