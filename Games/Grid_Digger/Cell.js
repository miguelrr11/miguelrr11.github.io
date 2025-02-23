let maxTam = cellPixelSize
let minTam = cellPixelSize * 0.3

class Cell{
    constructor(x, y, material, hp, illuminated, rnd){
        this.x = x
        this.y = y
        this.material = material != undefined ? material : 0
        this.hp = hp != undefined ? hp : maxHealthCell
        this.illuminated = illuminated != undefined ? illuminated : false
        this.rnd = rnd != undefined ? rnd : (Math.random() * 2 -1).toFixed(2)
    }

    hit(animX, animY){
        if(this.hp > 0) this.hp--
        let anim;
        switch(this.material){
            case 0:
                anim = 'mining'
                break
            case 1:
                anim = 'miningMat1'
                break
            case 2:
                anim = 'miningMat2'
                break
            case 3:
                anim = 'miningMat3'
                break
        }
        anims.addAnimation(animX*cellPixelSize + cellPixelSize/2, animY*cellPixelSize + cellPixelSize/2, anim)
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
        let off = this.rnd * 2
        translate(off + cellPixelSize/2 + this.x * cellPixelSize,  off + cellPixelSize/2 + this.y * cellPixelSize)
    }

    showMat(light){
        let off = this.rnd * 2
        let trans = map(light, 0, 1, 0, 255)
        let col = colors[this.material-1]
        let tam = map(this.hp, 0, maxHealthCell, minTam, cellPixelSize*0.4)
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
        let offset = 0
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
                fill(map(light, 0, 1, colSuelo, wallFullIluminated))
                let tam = map(this.hp, 0, maxHealthCell, minTam, maxTam)
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