class Cell{
    constructor(x, y, material, hp){
        this.x = x
        this.y = y
        this.material = material
        this.hp = hp
    }

    convertIntoAir(){
        this.hp = 0
    }

    show(){
        push()
        translate(this.x * cellPixelSize, this.y * cellPixelSize)
        noStroke()
        //lerp from 170 to 220 depending on hp
        fill(lerp(220, 170, this.hp/5))
        rect(0, 0, cellPixelSize+1, cellPixelSize+1)
        pop()
    }
}