let colSuelo = 50
let colFullIluminated = 225
let wallFullIluminated = 100

let colMat1 = "#90e0ef"
let colMat2 = "#e76f51"
let colMat3 = "#a7c957"

class Cell{
    constructor(x, y, material, hp, illuminated){
        this.x = x
        this.y = y
        this.material = material
        this.hp = hp != undefined ? hp : maxHealthCell
        this.illuminated = illuminated != undefined ? illuminated : false
        this.rnd = (Math.random() * 2 -1).toFixed(2)
    }

    convertIntoAir(){
        this.hp = 0
    }

    illuminate(){
        if(this.hp == 0) this.illuminated = true
    }

    showMat(){
        let off = this.rnd * 2
        push()
        //ellipse
        if(this.material == 1){
            translate(-.5 + off, -.5 - off)
            noStroke()
            fill(colMat1)
            let tam = map(this.hp, 0, maxHealthCell, 0, cellPixelSize/2)
            ellipse(this.x * cellPixelSize + cellPixelSize/2, this.y * cellPixelSize + cellPixelSize/2, tam, tam)
        }
        //square
        if(this.material == 2){
            rectMode(CENTER)
            translate(-.5 + off + cellPixelSize/2 + this.x * cellPixelSize, -.5 - off + cellPixelSize/2 + this.y * cellPixelSize)
            rotate(off)
            noStroke()
            fill(colMat2)
            let tam = map(this.hp, 0, maxHealthCell, 0, cellPixelSize*0.4)
            square(0, 0, tam)
        }
        //triangle
        if(this.material == 3){
            rectMode(CENTER)
            translate(-.5 + off + cellPixelSize/2 + this.x * cellPixelSize, -.5 - off + cellPixelSize/2 + this.y * cellPixelSize)
            rotate(off)
            noStroke()
            fill(colMat3)
            let tam = map(this.hp, 0, maxHealthCell, 0, cellPixelSize*0.4)
            beginShape()
            vertex(-tam/2, -tam/2)
            vertex(tam/2, -tam/2)
            vertex(0, tam/2)
            endShape()
        }
        pop()
    }

    show(){
        push()
        let offset = 1
        rectMode(CENTER)
        translate(this.x * cellPixelSize + cellPixelSize/2, this.y * cellPixelSize + cellPixelSize/2)
        noStroke()
        let light = lightingGrid[this.x][this.y].light
        let visible = lightingGrid[this.x][this.y].visible
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
            this.showMat()
        }
    }

    showDebug(){
        this.showMat()
    }
}