let colSuelo = 50
let colFullIluminated = 225
let wallFullIluminated = 150

class Cell{
    constructor(x, y, material, isAir){
        this.x = x
        this.y = y
        this.material = material
        this.hp = isAir ? 0 : maxHealthCell
        this.iluminated = false
    }

    convertIntoAir(){
        this.hp = 0
    }

    illuminate(){
        if(this.hp == 0) this.iluminated = true
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
            rect(0, 0, cellPixelSize+offset, cellPixelSize+offset)
        }
        else if(this.hp > 0){
            //suelo
            fill(map(light, 0, 1, colSuelo, colFullIluminated))
            rect(0, 0, cellPixelSize+offset, cellPixelSize+offset)
            //pared rompiendose
            if(visible){
                translate(-.5, -.5)
                fill(colFullIluminated)
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
    }
}