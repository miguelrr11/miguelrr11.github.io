/*
EN, WN
NE, SE
ES, WS
NW, SW
*/

class Belt{
    constructor(dir){
        this.direction = dir;
        this.items = []
        this.nextBelt = undefined
        this.pos = createVector(0, 0)
        this.itemCapacity = 10
        this.speed = 0.01 * 5
        this.spacing = 0.1
    }

    canAccpetItem(){
        return this.items.length < this.itemCapacity
    }

    addItem(item){
        if(this.items.length < this.itemCapacity) this.items.push(item)
        return this.items.length <= this.itemCapacity
    }

    updateItems(){
        for(let i = this.items.length-1; i >= 0; i--){
            if(this.items[i-1] && this.items[i].pos < this.items[i-1].pos){ 
                this.items[i].pos += this.speed
                if(this.items[i].pos > this.items[i-1].pos - this.spacing) this.items[i].pos = this.items[i-1].pos - this.spacing
            }
            else if(!this.items[i-1]) this.items[i].pos += this.speed
            if(this.items[i].pos > 1){
                if(this.nextBelt && this.nextBelt.canAccpetItem()){
                    this.items[i].pos = 0
                    this.nextBelt.addItem(this.items[i])
                    this.items.splice(i, 1)
                }
                else this.items[i].pos = 1
            }
        }
    }


    showBelt(){
        push()
        fill(40)
        let margin = tamCell / 6
        if(this.direction == 'N' || this.direction == 'S'){
            rect(margin, 0, tamCell - 2 * margin, tamCell)
        }
        else if(this.direction == 'E' || this.direction == 'W'){
            rect(0, margin, tamCell, tamCell - 2 * margin)
        }
        else{
            translate(tamCell/2, tamCell/2)
            switch (this.direction) {
                case 'SE':
                    rotate(TWO_PI)
                    break;
                case 'WN':
                    rotate(TWO_PI)
                    break;
                case 'NE':
                    rotate(-THREE_QUARTERS_PI)
                    break;
                case 'EN':  
                    rotate(THREE_QUARTERS_PI)
                    break;
                case 'ES':
                    rotate(PI)
                    break;
                case 'NW':
                    rotate(PI)
                    break;
                case 'SW':
                    rotate(-HALF_PI)
                    break;
                case 'WS':
                    rotate(HALF_PI)
                    break;
            }
            translate(-tamCell/2, -tamCell/2)
            rect(margin, 0, tamCell - 2*margin, tamCell - margin)
            rect(margin, margin, tamCell - margin, tamCell - 2*margin)
        }
        pop()
        if(this.direction.length == 1) this.showDirection(this.direction)
        else{
            // this.showDirection(this.direction.charAt(0), true)
            // this.showDirection(this.direction.charAt(1), true)
        }

        // if(this == prevBelt){
        //     push()
        //     fill(0, 255, 0)
        //     ellipse(tamCell/2, tamCell/2, 20)
        //     pop()
        // }
        //this.showItems()
    }

    showItems(){
        for(let i = 0; i < this.items.length; i++){
            let item = this.items[i]
            let relTravel = item.pos

            let [posItemX, posItemY] = getPosItem(this.direction, relTravel)
            push()
            translate(posItemX, posItemY)
            item.show()
            pop()
        }
    }

    showDirection(dir, bi = false){
        push()
        fill(150)
        noStroke()
        let length = tamCell/3
        translate(tamCell/2, tamCell/2)
        let auxDir = dir
        switch (auxDir) {
            case 'N':
                if(bi) translate(0, -length)
                rotate(PI)
                break;
            case 'E':
                if(bi) translate(length, 0)
                rotate(3 * PI/2)
                break;
            case 'S':
                if(bi) translate(0, -length)
                rotate(0)
                break;
            case 'W':
                if(bi) translate(length, 0)
                rotate(PI/2)
                break;
        }
        let size = tamCell/12
        
        beginShape(TRIANGLES)
        vertex(-size, -size)
        vertex(size, -size)
        vertex(0, size)
        endShape(CLOSE)
        pop()
    }
}