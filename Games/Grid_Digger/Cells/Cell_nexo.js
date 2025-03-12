let imgNexo1, imgNexo2, imgNexo3

let nexoMats = [0, 0, 0]
let nexoLevels = [0, 0, 0]
let capacities = [5, 15, 35, 80, 150, 300, 500, 1000]

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
            this.id = 0
            this.colMedium = colMat1Medium
            this.colMat = colMat1
            this.img = imgNexo1
        }
        else if(material == 7){ 
            this.upgrade = 2
            this.colRoca = colMat2
            this.id = 1
            this.colMedium = colMat2Medium
            this.colMat = colMat2
            this.img = imgNexo2
        }
        else if(material == 8){ 
            this.upgrade = 3
            this.colRoca = colMat3
            this.id = 2
            this.colMedium = colMat3Medium
            this.colMat = colMat3
            this.img = imgNexo3
        }
        this.und = false
        this.hp = Infinity
        this.lastPositionProgressBar = createVector(this.x*cellPixelSize, this.y*cellPixelSize)
    }

    transparent(){
        return true
    }

    onPlayerStanding() {
        let max = capacities[nexoLevels[this.id]] - nexoMats[this.id]       
        let mats = player.give(this.id+1, max)
        nexoMats[this.id] += mats
        if(nexoMats[this.id] >= capacities[nexoLevels[this.id]]){
            nexoMats[this.id] = 0
            nexoLevels[this.id]++
            this.createAnimation(this.x*cellPixelSize+cellPixelSize/2, this.y*cellPixelSize+cellPixelSize/2, true)
            player.upgrade(this.id)
        }
        if(mats > 0){ 
            this.createAnimation(this.lastPositionProgressBar.x, this.lastPositionProgressBar.y)
            playHittingSound()
        }
    }

    createAnimation(animX, animY, bool = false){
        let type = materialNames[this.id+1];
        let anim = { type: type, explosion: bool};
        anims.addAnimation(
            animX,
            animY,
            anim, this.x, this.y
        );

    }

    drawProgressbar(material){
        let pos, col, nexoCap, nexoMat
        if(material == 6){
            pos = posNexo1
            col = colMat1
            nexoCap = capacities[nexoLevels[0]]
            nexoMat = nexoMats[0]
        }
        else if(material == 7){
            pos = posNexo2
            col = colMat2
            nexoCap = capacities[nexoLevels[1]]
            nexoMat = nexoMats[1]
        }
        else if(material == 8){
            pos = posNexo3
            col = colMat3
            nexoCap = capacities[nexoLevels[2]]
            nexoMat = nexoMats[2]
        }
        let p1 = nexoCap / 8
        let p2 = p1 + nexoCap / 4
        let p3 = p2 + nexoCap / 4
        let p4 = p3 + nexoCap / 4
        let p5 = p4 + p1
        let w = cellPixelSize * 3
        let h = cellPixelSize * 0.6
        noStroke()
        fill(col)
        rectMode(CORNER)
        translate(0, (-cellPixelSize/2)-cellPixelSize)
        if(nexoMat > 0){
            let w = mapp(nexoMat, 0, p1, 0, cellPixelSize/2+cellPixelSize, true)
            this.lastPositionProgressBar = createVector((this.x*cellPixelSize)+cellPixelSize/2+w, (this.y*cellPixelSize)+cellPixelSize/2-h/2)
            rect(0, 0, w, h)
        }
        if(nexoMat > p1){
            translate(cellPixelSize/2 + cellPixelSize, h)
            let hlocal = mapp(nexoMat, p1, p2, 0, w-h, true)
            this.lastPositionProgressBar = createVector((this.x*cellPixelSize)+cellPixelSize, (this.y*cellPixelSize)-cellPixelSize/2+hlocal)
            rect(0, 0, -h, hlocal)
        }
        if(nexoMat > p2){
            translate(-h, w-h)
            let wlocal = mapp(nexoMat, p2, p3, 0, w-h, true)
            this.lastPositionProgressBar = createVector((this.x*cellPixelSize)+2*cellPixelSize-h-wlocal, (this.y*cellPixelSize)+1.75*cellPixelSize)
            rect(0, 0, -wlocal, -h)
        }
        if(nexoMat > p3){
            translate(-w+h, -h)
            let hlocal = mapp(nexoMat, p3, p4, 0, w-h, true)
            this.lastPositionProgressBar = createVector((this.x*cellPixelSize)-cellPixelSize/2, (this.y*cellPixelSize)+2*cellPixelSize-hlocal)
            rect(0, 0, h, -hlocal)
        }
        if(nexoMat > p4){
            translate(h, -w+h)
            let wlocal = mapp(nexoMat, p4, p5, 0, w-h, true)
            rect(0, 0, wlocal, h)
        }
    }


    show(){
        if(showingMinimap) return
        push()
        translate(this.x * cellPixelSize + cellPixelSize/2, this.y * cellPixelSize + cellPixelSize/2)
        strokeWeight(4)
        rectMode(CENTER)
        let w = cellPixelSize * 3
        let h = cellPixelSize * 1.75
        let wImg = h + 3
        let colBack = 50

        let nexoCap = capacities[nexoLevels[this.id]]
        let nexoMat = nexoMats[this.id]

        imageMode(CENTER)
        strokeWeight(3)
        fill(colBack)
        stroke(this.colMedium)
        rect(0, 0, w, w)
        push()
        this.drawProgressbar(this.material)
        pop()
        strokeWeight(2)
        fill([...this.colMat, 100])
        rect(0, 0, h, h)
        image(this.img, 0, 0, wImg-10, wImg-10)
        

        // if(this.x == posNexo1.x && this.y == posNexo1.y){
        //     strokeWeight(3)
        //     fill(colBack)
        //     stroke(colMat1Medium)
        //     rect(0, 0, w, w)
        //     strokeWeight(2)
        //     fill([...colMat1, 100])
        //     rect(0, 0, h, h)
        //     image(imgNexo1, 0, 0, wImg-10, wImg-10)
        //     this.drawProgressbar(this.material)
        // }
        // else if(this.x == posNexo2.x && this.y == posNexo2.y){
        //     stroke(colMat2Medium)
        //     fill(colBack)
        //     rect(0, 0, w, h)

        //     fill(colMat2)
        //     noStroke()
        //     rect(2, h-hMat, w-4, hMat)

        //     image(imgNexo2, w/2, h/2, wImg-10, wImg-10)
        //     fill(colBack, 90)
        //     rect(0, 0, w, h)
        // }
        // else if(this.x == posNexo3.x && this.y == posNexo3.y){
        //     stroke(colMat3Medium)
        //     fill(colBack)
        //     rect(0, 0, w, h)

        //     fill(colMat3)
        //     noStroke()
        //     rect(2, h-hMat, w-4, hMat)

        //     image(imgNexo3, w/2, h/2, wImg, wImg)
        //     fill(colBack, 90)
        //     rect(0, 0, w, h)
        // }

        rectMode(CORNER)
        pop()
    }
    
}

function loadAllImages(){
    imgNexo1 = loadImage('images/shoe.png')
    imgNexo2 = loadImage('images/pickaxe.png')
    imgNexo3 = loadImage('images/sensor.png')
}
  