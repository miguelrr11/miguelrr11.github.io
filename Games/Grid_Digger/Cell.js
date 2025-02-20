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
        this.hp === 5 ? fill(170) : fill(210)
        if (this.material == 1) fill(255, 0, 0)
        else if(this.material == 2) fill(0, 255, 0)
        else if(this.material == 3) fill(0, 0, 255)
        rect(0, 0, cellPixelSize, cellPixelSize)
        pop()
    }
}