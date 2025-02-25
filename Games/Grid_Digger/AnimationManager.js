class AnimationManager{
    constructor(){
        this.animations = []
    }

    addAnimation(x, y, type, i, j){
        this.animations.push(new Animation(x, y, type, i, j))
    }

    update(){
        for(let i = this.animations.length - 1; i >= 0; i--){
            this.animations[i].update()
            if(this.animations[i].finished()) this.animations.splice(i, 1)
        }
    }

    show(){
        for(let a of this.animations) a.show()
    }
}