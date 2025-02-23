class Cell{
    constructor(x, y, material, hp, illuminated, rnd){
        this.x = x
        this.y = y
        this.material = 3
        this.hp = hp != undefined ? hp : maxHealthCell
        this.illuminated = illuminated != undefined ? illuminated : false
        this.rnd = rnd != undefined ? rnd : (Math.random() * 2 -1).toFixed(2)
    }

    hit(){
        if(this.hp > 0) this.hp--
        if(this.material == 0) anims.addAnimation(this.x*cellPixelSize + cellPixelSize/2, this.y*cellPixelSize + cellPixelSize/2, 'mining')
        else if(this.material == 1) anims.addAnimation(this.x*cellPixelSize + cellPixelSize/2, this.y*cellPixelSize + cellPixelSize/2, 'miningMat1')
        else if(this.material == 2) anims.addAnimation(this.x*cellPixelSize + cellPixelSize/2, this.y*cellPixelSize + cellPixelSize/2, 'miningMat2')
        else if(this.material == 3) anims.addAnimation(this.x*cellPixelSize + cellPixelSize/2, this.y*cellPixelSize + cellPixelSize/2, 'miningMat3')
        if(this.hp == 0) this.material = 0
    }

    isMaterial(){
        return this.material != 0
    }

    convertIntoAir(){
        this.hp = 0
    }

    illuminate(){
        if(this.hp == 0) this.illuminated = true
    }
    
    translateToCenter(){
        let off = this.rnd * 2 + -.5
        translate(off + cellPixelSize/2 + this.x * cellPixelSize,  off + cellPixelSize/2 + this.y * cellPixelSize)
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
            drawTriangle(tam)
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
        if(this.hp > 0){
            //suelo
            fill(map(light, 0, 1, colSuelo, colFullIluminated))
            rect(0, 0, cellPixelSize+offset, cellPixelSize+offset)
            //pared rompiendose
            if(visible){
                translate(-1, -1)
                fill(map(light, 0, 1, colSuelo, wallFullIluminated))
                let tam = map(this.hp, 0, maxHealthCell, 0, cellPixelSize)
                rect(0, 0, tam+offset, tam+offset)
            }
            
        }
        else{
            fill(map(light, 0, 1, colSuelo, colFullIluminated))
            rect(0, 0, cellPixelSize+offset, cellPixelSize+offset)
        }

        pop()

        if(this.hp > 0 && this.material != 0 && visible){
            this.showMat(light)
        }
    }

    showDebug(){
        this.showMat()
    }
}

function drawTriangle(tam){
    beginShape()
    vertex(-tam/2, -tam/2)
    vertex(tam/2, -tam/2)
    vertex(0, tam/2)
    endShape()
}