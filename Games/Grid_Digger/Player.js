class Player{
    constructor(){
        this.pos = createVector(floor(cellsPerRow/2), floor(cellsPerRow/2))
        this.state = 'resting'
    }

    move(dx, dy){

    }

    update(){
        if(this.state == 'resting'){
            if(keyIsDown(LEFT_ARROW)){
                this.move(-1, 0)
            }
            else if(keyIsDown(RIGHT_ARROW)){
                this.move(1, 0)
            }
            else if(keyIsDown(UP_ARROW)){
                this.move(0, -1)
            }
            else if(keyIsDown(DOWN_ARROW)){
                this.move(0, 1)
            }
        }
    }
    show(){
        push()
        rectMode(CENTER)
        translate(this.pos.x * cellPixelSize + cellPixelSize/2, this.pos.y * cellPixelSize + cellPixelSize/2)
        fill(50)
        rect(0, 0, cellPixelSize*0.7, cellPixelSize*0.7)
        pop()
    }
}