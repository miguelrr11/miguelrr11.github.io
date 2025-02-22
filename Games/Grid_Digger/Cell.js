let colSuelo = 50
let colFullIluminated = 225
let wallFullIluminated = 100

let colMat1 = hexToRgb("#90e0ef")
let colMat2 = hexToRgb("#e76f51")
let colMat3 = hexToRgb("#a7c957")

let colors = [colMat1, colMat2, colMat3]

class Cell{
    constructor(x, y, material, hp, illuminated, rnd){
        this.x = x
        this.y = y
        this.material = material
        this.hp = hp != undefined ? hp : maxHealthCell
        this.illuminated = illuminated != undefined ? illuminated : false
        this.rnd = rnd != undefined ? rnd : (Math.random() * 2 -1).toFixed(2)
    }

    convertIntoAir(){
        this.hp = 0
    }

    illuminate(){
        if(this.hp == 0) this.illuminated = true
    }
    
    translateToCenter(){
        let off = this.rnd * 2
        translate(-.5 + off + cellPixelSize/2 + this.x * cellPixelSize, -.5 - off + cellPixelSize/2 + this.y * cellPixelSize)
    }

    showMat(light){
        let off = this.rnd * 2
        let trans = map(light, 0, 1, 0, 255)
        let col = colors[this.material-1]
        let tam = map(this.hp, 0, maxHealthCell, 0, cellPixelSize*0.4)
        push()
        rectMode(CENTER)
        noStroke()
        fill([...col, trans])
        this.translateToCenter()
        rotate(off)
        if(this.material == 1){
            ellipse(0, 0, tam, tam)
        }
        if(this.material == 2){
            square(0, 0, tam)
        }
        if(this.material == 3){
            triangle(tam)
        }
        pop()
    }

    show(lightGrid){
        push()
        let offset = 1
        rectMode(CENTER)
        translate(this.x * cellPixelSize + cellPixelSize/2, this.y * cellPixelSize + cellPixelSize/2)
        noStroke()
        let light = lightGrid[this.x][this.y].light
        let visible = lightGrid[this.x][this.y].visible
        //suelo
        if(this.hp == maxHealthCell){
            fill(map(light, 0, 1, colSuelo, wallFullIluminated))
            // if(light > 0) fill(wallFullIluminated)
            // else fill(colSuelo)
            rect(0, 0, cellPixelSize+offset, cellPixelSize+offset)
        }
        else if(this.hp > 0){
            //suelo
            fill(map(light, 0, 1, colSuelo, colFullIluminated))
            rect(0, 0, cellPixelSize+offset, cellPixelSize+offset)
            //pared rompiendose
            if(visible){
                translate(-.5, -.5)
                fill(wallFullIluminated)
                let tam = map(this.hp, 0, maxHealthCell, 0, cellPixelSize)
                rect(0, 0, tam+offset, tam+offset)
            }
            
        }
        else{
            fill(map(light, 0, 1, colSuelo, colFullIluminated))
            rect(0, 0, cellPixelSize+offset, cellPixelSize+offset)
        }
        


        // if(val != -1){
        //     let light = map(lightingGrid[this.x][this.y], 0, 1, 50, 200)
        //     if(light == 0) light = 50
        //     fill(light)
        //     rect(0, 0, cellPixelSize+offset, cellPixelSize+offset)
        // }
        // else if(val == -1){
        //     fill(255)
        // }
        // else fill(0)
        // if(this.hp == maxHealthCell)  rect(0, 0, cellPixelSize+offset, cellPixelSize+offset)
        // else if(this.hp > 0){ 
        //     translate(-.5, -.5)
        //     let tam = map(this.hp, 0, maxHealthCell, 0, cellPixelSize)
        //     rect(0, 0, tam+offset, tam+offset)
        // }
        pop()

        if(this.hp > 0 && this.material != 0 && visible){
            this.showMat(light)
        }
    }

    showDebug(){
        this.showMat()
    }
}

function triangle(tam){
    beginShape()
    vertex(-tam/2, -tam/2)
    vertex(tam/2, -tam/2)
    vertex(0, tam/2)
    endShape()
}