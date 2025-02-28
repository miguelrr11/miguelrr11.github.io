class AnimationManager{
    constructor(){
        this.animations = []
        this.nParticles = 0
    }

    addAnimation(x, y, type, i, j){
        this.animations.push(new Animation(x, y, type, i, j))
    }

    update(){
        this.nParticles = 0
        for(let i = this.animations.length - 1; i >= 0; i--){
            this.animations[i].update()
            if(this.animations[i].finished()) this.animations.splice(i, 1)
            else this.nParticles += this.animations[i].particlesAlive
        }
    }

    show(){
        for(let a of this.animations) a.show()
    }
}