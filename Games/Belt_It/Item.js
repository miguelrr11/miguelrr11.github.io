class Item{
    constructor(){
        this.pos = 0        //0 to 1
        //this.ransomOffset = createVector(random(-tamCell/8, tamCell/8), random(-tamCell/8, tamCell/8))
        this.ransomOffset = createVector(0, 0)
    }

    show(){
        push()
        translate(this.ransomOffset.x, this.ransomOffset.y)
        fill(255, 0, 0)
        stroke(200)
        strokeWeight(1)
        ellipse(0, 0, 10)
        pop()
    }
}