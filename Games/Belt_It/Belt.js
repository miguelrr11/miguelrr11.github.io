/*
EN, WN
NE, SE
ES, WS
NW, SW
*/

class Belt{
    constructor(dir){
        this.direction = dir;
        this.items = [new Item()]
        this.nextBelt = undefined
    }

    updateItems(){
        for(let i = 0; i < this.items.length; i++){
            this.items[i].pos += 0.01
            if(this.items[i].pos > 1){
                if(this.nextBelt){
                    this.items[i].pos = 0
                    this.nextBelt.items.push(this.items[i])
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
            this.showDirection()
        }
        else if(this.direction == 'E' || this.direction == 'W'){
            rect(0, margin, tamCell, tamCell - 2 * margin)
            this.showDirection()
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
        //this.showItems()
    }

    showItems(){
        for(let i = 0; i < this.items.length; i++){
            let item = this.items[i]
            let relTravel = item.pos
            let traveled = (item.pos * tamCell)
            let posItemX
            let posItemY
            if(this.direction.charAt(1) == ''){
                switch (this.direction) {
                    case 'N':
                        posItemX = tamCell / 2
                        posItemY = tamCell - traveled
                        break;
                    case 'E':
                        posItemX = traveled
                        posItemY = tamCell / 2
                        break;
                    case 'S':
                        posItemX = tamCell / 2
                        posItemY = traveled
                        break;
                    case 'W':
                        posItemX = tamCell - traveled
                        posItemY = tamCell / 2
                        break;
                }
            }
            else{
                let auxDir = (relTravel) < 0.5 ? this.direction.charAt(0) : this.direction.charAt(1)
                switch (auxDir) {
                    case 'N':
                        posItemX = tamCell / 2
                        posItemY =  tamCell - traveled
                        break;
                    case 'E':
                        posItemX = traveled
                        posItemY = tamCell / 2
                        break;
                    case 'S':
                        posItemX = tamCell / 2
                        posItemY = traveled
                        break;
                    case 'W':
                        posItemX = tamCell - traveled
                        posItemY = tamCell / 2
                        break;
                }
            }
            push()
            translate(posItemX, posItemY)
            item.show()
            pop()
        }
    }

    showDirection(){
        push()
        fill(150)
        noStroke()
        translate(tamCell/2, tamCell/2)
        switch (this.direction) {
            case 'N':
                rotate(PI)
                break;
            case 'E':
                rotate(3 * PI/2)
                break;
            case 'S':
                rotate(0)
                break;
            case 'W':
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