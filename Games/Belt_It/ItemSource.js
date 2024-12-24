class ItemSource{
    constructor(){
        this.cooldown = 0
        this.initialCooldown = 60
    }

    getItem(){
        if(this.cooldown <= 0){
            this.cooldown = this.initialCooldown
            return new RawIron()
        }
        return undefined
    }

    update(){
        if(this.cooldown > 0) this.cooldown--
    }

    show(){
        push()
        fill(255, 0, 0)
        ellipse(tamCell/2, tamCell/2, tamCell/2)
        pop()
    }
}