class Transformer{
    constructor(){

    }

    canAccpetItem(){
        return this.items.length < this.itemCapacity
    }

    addItem(item){
        if(this.items.length < this.itemCapacity) this.items.push(item)
        return this.items.length <= this.itemCapacity
    }

    

}

class Furnace extends Transformer{
    constructor(){
        super()
        this.items = []
        this.cookedItems = []
        this.itemCapacity = 10
        this.cooldown = 0
        this.initialCooldown = 60

        this.input = undefined
        this.output = undefined
    }
    
    //gives processed item
    getItem(){
        if(this.cookedItems.length > 0){
            return this.cookedItems.pop()
        }
        return undefined
    }

    update(){
        if(this.cooldown > 0) this.cooldown--
        if(this.items.length > 0 && this.cooldown <= 0 && this.cookedItems.length < this.itemCapacity){
            this.items.pop()
            this.cookedItems.push(new IronNugget())
            this.cooldown = this.initialCooldown
        }
    }

    show(){
        push()
        noFill()
        stroke(0)
        strokeWeight(5)
        rect(0, 0, tamCell, tamCell)
        pop()
    }

}