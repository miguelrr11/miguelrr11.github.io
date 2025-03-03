let imgNexo1, imgNexo2, imgNexo3

let nexoMats = [0, 0, 0]
let nexoLevels = [0, 0, 0]
let capacities = [5, 5, 5, 5, 5, 300, 500, 1000]

class Cell_nexo extends Cell {
    constructor(x, y, material, hp, illuminated, rnd) {
        super(x, y, material, hp, illuminated, rnd);
        this.colSuelo1 = colSueloBioma1;
        this.colSuelo2 = colSueloBioma1_2;
        this.colRoca = colRocaBioma1;
        this.colOscuridad1 = colOscuridad1;
        this.colOscuridad2 = colOscuridad1_2;
        this.material = material

        if(material == 6){ 
            this.upgrade = 1
            this.colRoca = colMat1
        }
        else if(material == 7){ 
            this.upgrade = 2
            this.colRoca = colMat2
        }
        else if(material == 8){ 
            this.upgrade = 3
            this.colRoca = colMat3
        }
        this.und = false
        this.hp = Infinity

        if(this.material == 6) this.id = 0
        else if(this.material == 7) this.id = 1
        else if(this.material == 8) this.id = 2
    }

    hit(animX, animY) {
        //first see how much materials the player has and only accept till de maximum capacity
        if(nexoMats[this.id] == capacities[nexoLevels[this.id]]){
            nexoMats[this.id] = 0
            nexoLevels[this.id]++
            if(this.id == 0) this.createAnimation(22, 11.5, true)
            else if(this.id == 1) this.createAnimation(26, 11.5, true)
            else if(this.id == 2) this.createAnimation(30, 11.5, true)
            player.upgrade(this.id)
        }
        let maxMatsPerHit = 1       //deberia ir aumentando progresivamente
        let mats = player.give(this.id+1, maxMatsPerHit)
        nexoMats[this.id] += mats
        if(mats > 0) this.createAnimation(animX, animY)
        playHittingSound()
    }

    createAnimation(animX, animY, bool = false){
        let type = materialNames[this.id+1];
        let anim = { type: type, explosion: bool};
        anims.addAnimation(
            animX * cellPixelSize + cellPixelSize / 2,
            animY * cellPixelSize + cellPixelSize / 2,
            anim, this.x, this.y
        );

    }


    show(){
        push()
        translate(this.x * cellPixelSize, this.y * cellPixelSize)
        strokeWeight(4)
        let w = cellPixelSize * 3
        let h = cellPixelSize * 2
        let wImg = h - 3
        let colBack = 50

        let nexoCap = capacities[nexoLevels[this.id]]
        let nexoMat = nexoMats[this.id]
        let hMat = mapp(nexoMat, 0, nexoCap, 0, h, true)

        imageMode(CENTER)
        if(this.x == posNexo1.x && this.y == posNexo1.y){
            stroke(colMat1Medium)
            fill(colBack)
            rect(0, 0, w, h)

            fill(colMat1)
            noStroke()
            rect(2, h-hMat, w-4, hMat)

            image(imgNexo1, w/2, h/2, wImg, wImg)
            fill(colBack, 90)
            stroke(colMat1Medium)
            rect(0, 0, w, h)
        }
        else if(this.x == posNexo2.x && this.y == posNexo2.y){
            stroke(colMat2Medium)
            fill(colBack)
            rect(0, 0, w, h)

            fill(colMat2)
            noStroke()
            rect(2, h-hMat, w-4, hMat)

            image(imgNexo2, w/2, h/2, wImg-10, wImg-10)
            fill(colBack, 90)
            rect(0, 0, w, h)
        }
        else if(this.x == posNexo3.x && this.y == posNexo3.y){
            stroke(colMat3Medium)
            fill(colBack)
            rect(0, 0, w, h)

            fill(colMat3)
            noStroke()
            rect(2, h-hMat, w-4, hMat)

            image(imgNexo3, w/2, h/2, wImg, wImg)
            fill(colBack, 90)
            rect(0, 0, w, h)
        }

        rectMode(CORNER)
        pop()
    }
    
}

function loadAllImages(){
    imgNexo1 = loadImage('images/shoe.png')
    imgNexo2 = loadImage('images/pickaxe.png')
    imgNexo3 = loadImage('images/sensor.png')
}
  