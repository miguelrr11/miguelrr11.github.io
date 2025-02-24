let maxTam = cellPixelSize
let minTam = cellPixelSize * 0.3

class Cell{
    constructor(x, y, material, hp, illuminated, rnd, biome){
        this.x = x
        this.y = y
        this.material = material != undefined ? material : 0
        this.hp = hp != undefined ? hp : maxHealthCell
        this.illuminated = illuminated != undefined ? illuminated : false
        this.rnd = rnd != undefined ? rnd : (Math.random() * 2 -1).toFixed(2)
        this.biome = biome != undefined ? biome : 1
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
    
    translateToCenterMat(){
        let off = this.rnd * 2
        translate(off + cellPixelSize/2 + this.x * cellPixelSize,  off + cellPixelSize/2 + this.y * cellPixelSize)
    }

    showMat(){
        if(this.material == 0 || this.hp == 0) return
        let off = this.rnd * 2
        let col = colors[this.material-1]
        let tam = map(this.hp, 0, maxHealthCell, minTam, cellPixelSize*0.4)
        push()
        rectMode(CENTER)
        noStroke()
        fill(col)
        this.translateToCenterMat()
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

    showSuelo(){
        if(this.biome == 1){
            fill(colSueloBioma1)
            rect(0, 0, cellPixelSize, cellPixelSize)
            if(this.rnd > 0.85 && this.hp == 0) showGrass()
            if(this.rnd < -0.85 && this.hp == 0) showPebbles(this.rnd)
        }
        if(this.biome == 2){
            fill(colSueloBioma2)
            rect(0, 0, cellPixelSize, cellPixelSize)
            if(this.rnd > 0.85 && this.hp == 0) showGrass()
            if(this.rnd < -0.85 && this.hp == 0) showPebbles(this.rnd)
        }
        if(this.biome == 3){
            fill(colSueloBioma3)
            rect(0, 0, cellPixelSize, cellPixelSize)
            if(this.rnd > 0.85 && this.hp == 0) showGrass()
            if(this.rnd < -0.85 && this.hp == 0) showPebbles(this.rnd)
        }
        if(this.biome == 4){
            fill(colSueloBioma4)
            rect(0, 0, cellPixelSize, cellPixelSize)
            if(this.rnd > 0.85 && this.hp == 0) showGrass()
            if(this.rnd < -0.85 && this.hp == 0) showPebbles(this.rnd)
        }
        if(this.biome == 5){
            fill(colSueloBioma5)
            rect(0, 0, cellPixelSize, cellPixelSize)
            if(this.rnd > 0.85 && this.hp == 0) showGrass()
            if(this.rnd < -0.85 && this.hp == 0) showPebbles(this.rnd)
        }
    }

    // Draws suelo and rocas
    showBasic(){
        push()
        rectMode(CENTER)
        translate(this.x * cellPixelSize + cellPixelSize/2, this.y * cellPixelSize + cellPixelSize/2)
        noStroke()
        let tam = cellPixelSize
        this.showSuelo()
        if(this.hp > 0){ 
            if(this.biome == 1) fill(colRocaBioma1)
            tam = map(this.hp, 0, maxHealthCell, minTam, maxTam)
            rect(0, 0, tam, tam)
        }
        pop()
    }
    
    showLight(lightGrid){
        push()
        rectMode(CENTER)
        translate(this.x * cellPixelSize + cellPixelSize/2, this.y * cellPixelSize + cellPixelSize/2)
        noStroke()
        let light = lightGrid[this.x][this.y].light
        let visible = lightGrid[this.x][this.y].visible
        let sensor = lightGrid[this.x][this.y].sensor
        let col = color(colOscuridad)
        col.setAlpha(255 - (light * 255))
        fill(col)
        if(!visible) fill(colOscuridad)
        if(sensor && !visible){
            col.setAlpha(200)
            fill(col)
        }
        rect(0, 0, cellPixelSize, cellPixelSize)
        pop()
    }

    show(lightGrid){
        this.showBasic()
        this.showMat()
        this.showLight(lightGrid)
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

function showGrass(){
    push()
    translate(-cellPixelSize/2, -cellPixelSize/2)
    stroke("#365B64")
    strokeWeight(1.5)
    let p1 = createVector(0.25, 0.5)
    let p2 = createVector(0.35, 0.8)
    let p3 = createVector(0.5, 0.3)
    let p4 = createVector(0.5, 0.7)
    let p5 = createVector(0.67, 0.7)
    let p6 = createVector(0.76, 0.4)
    line(p1.x*cellPixelSize, p1.y*cellPixelSize, p2.x*cellPixelSize, p2.y*cellPixelSize)
    line(p3.x*cellPixelSize, p3.y*cellPixelSize, p4.x*cellPixelSize, p4.y*cellPixelSize)
    line(p5.x*cellPixelSize, p5.y*cellPixelSize, p6.x*cellPixelSize, p6.y*cellPixelSize)
    pop()
}

function showPebbles(rnd){
    push()
    rotate(rnd*10)
    translate(-cellPixelSize/2, -cellPixelSize/2)
    fill("#2C2D47")
    noStroke()
    let p1 = createVector(0.3, 0.5)
    let p2 = createVector(0.5, 0.75)
    let p3 = createVector(0.75, 0.4)
    ellipse(p1.x*cellPixelSize, p1.y*cellPixelSize, cellPixelSize*0.16)
    ellipse(p2.x*cellPixelSize, p2.y*cellPixelSize, cellPixelSize*0.18)
    ellipse(p3.x*cellPixelSize, p3.y*cellPixelSize, cellPixelSize*0.2)
    pop()
}