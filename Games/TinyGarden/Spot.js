class Spot{
    constructor(i, j){
        this.i = i  
        this.j = j
        this.bought = false
        this.plant = undefined
    }

    buy(){
        this.bought = true
    }

    update(){

    }


    show(){
        push()
        if(this.bought){
            fill(COL_SPOT)
            stroke(COL_SPOT_BORDER)
        }
        else{
            fill(150)
            stroke(120)
        }
        strokeWeight(8)
        let size = WIDTH / gardenSize
        let off = 8
        rect(this.i * size + off / 2, this.j * size + off / 2, size - off, size - off)
        pop()
    }
}