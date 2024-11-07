class bird{
    constructor(pos){
        this.pos = pos
        this.speed = 2
        this.ac = 0.55
        this.score = 0
        this.alive = true
        this.brain = new nn()
        this.fit = 0
    }

    hop(){
        this.speed = -9
    }

    update(){
        this.speed += this.ac
        this.pos += this.speed
        this.pos = constrain(this.pos, 0, height)
        if(this.pos <= 0 || this.pos >= height){ 
            this.alive = false
        }
    }

    show(){
        push()
        fill(242,234,91,100)
        ellipse(bird_x, this.pos, 25)
        pop()
    }
}