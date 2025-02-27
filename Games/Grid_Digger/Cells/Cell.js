let maxTam = cellPixelSize;
let minTam = cellPixelSize * 0.3;

class Cell {
    constructor(x, y, material, hp, illuminated, rnd) {
        this.x = x;
        this.y = y;
        this.material = material !== undefined ? material : 0;
        //this.material = 1
        this.hp = hp !== undefined ? hp : maxHealthCell;
        this.illuminated = illuminated !== undefined ? illuminated : false;
        this.rnd = rnd !== undefined ? rnd : (Math.random() * 2 - 1).toFixed(2);
        this.und = this.hp == Infinity ? true : false       //undestructible
        if(this.und) this.material = 4                      //material 4 is the undestructible material
        this.maxHealthCell = this.material == 0 ? maxHealthCell : maxHealthCellMat;

        this.coolDownHit = 0       //just some visual feedback
        this.maxCoolDownHit = 15

        let dec = getTwoDecimals(parseFloat(this.rnd));
        this.rnd1 = dec[0];
        this.rnd2 = dec[1];
        this.noise = noise(this.x/10, this.y/10);
    }

    setBiomeColors(biome){
        switch(biome){
            case 1:
                this.colSuelo1 = colSueloBioma1;
                this.colSuelo2 = colSueloBioma1_2;
                this.colRoca = colRocaBioma1;
                this.colOscuridad1 = colOscuridad1;
                this.colOscuridad2 = colOscuridad1_2;
                break;
            case 2:
                this.colSuelo1 = colSueloBioma2;
                this.colSuelo2 = colSueloBioma2_2;
                this.colRoca = colRocaBioma2;
                this.colOscuridad1 = colOscuridad2;
                this.colOscuridad2 = colOscuridad2_2;
                break;
            case 3: 
                this.colSuelo1 = colSueloBioma3;
                this.colSuelo2 = colSueloBioma3_2;
                this.colRoca = colRocaBioma3;
                this.colOscuridad1 = colOscuridad3;
                this.colOscuridad2 = colOscuridad3_2;
                break;
            case 4:
                this.colSuelo1 = colSueloBioma4;
                this.colSuelo2 = colSueloBioma4_2;
                this.colRoca = colRocaBioma4;
                this.colOscuridad1 = colOscuridad4;
                this.colOscuridad2 = colOscuridad4_2;
                break;
            case 5:
                this.colSuelo1 = colSueloBioma5;
                this.colSuelo2 = colSueloBioma5_2;
                this.colRoca = colRocaBioma5;
                this.colOscuridad1 = colOscuridad5;
                this.colOscuridad2 = colOscuridad5_2;
                break;
        }
    }

    damage(dmg){
        this.hp -= Math.floor(dmg)
        if(this.hp < 0) this.hp = 0
        if(this.hp == 0 && this.material != 0) this.hp = 1
        if (this.hp === 0) this.material = 0;
    }

    hit(animX, animY) {
        if (this.hp > 0){ 
            this.hp--;
            this.coolDownHit = this.maxCoolDownHit
        }
        let type;
        switch (this.material) {
            case 0:
                type = 'mining';
                break;
            case 1:
                type = 'miningMat1';
                break;
            case 2:
                type = 'miningMat2';
                break;
            case 3:
                type = 'miningMat3';
                break;
        }
        let anim = { type: type, explosion: this.hp === 0 };
        anims.addAnimation(
            animX * cellPixelSize + cellPixelSize / 2,
            animY * cellPixelSize + cellPixelSize / 2,
            anim, this.x, this.y
        );
        if (this.hp === 0) this.material = 0;
    }

    isMaterial() {
        return this.material !== 0;
    }

    convertIntoAir() {
        this.hp = 0;
        this.material = 0
        this.und = false
    }

    illuminate() {
        if (this.hp === 0) this.illuminated = true;
    }

    translateToCenterMat() {
        let off = this.rnd * 2;
        translate(
            off + cellPixelSize / 2 + this.x * cellPixelSize,
            off + cellPixelSize / 2 + this.y * cellPixelSize
        );
    }

    showMat() {
        if (this.material === 0 || this.hp === 0) return;
        let off = this.rnd * 2;
        let col = colors[this.material - 1];
        let tam = map(this.hp, 0, this.maxHealthCell, minTam, cellPixelSize * 0.4, true);
        push();
        rectMode(CENTER);
        noStroke();
        fill(col);
        this.translateToCenterMat();
        rotate(off);
        if (this.material === 1) {
           //this.showMaterial1(tam, col, off);
           ellipse(0, 0, tam, tam);
        }
        if (this.material === 2) {
            //this.showMaterial2(tam, col, off);
            square(0, 0, tam);
        }
        if (this.material === 3) {
            //this.showMaterial3(tam, col, off);
            drawTriangle(tam);
        }
        if(this.material === 4){ //undestructible
            rotate(-off)
            translate(-off, -off)
            rect(0, -cellPixelSize*0.25, cellPixelSize, cellPixelSize/5)
            rect(0, cellPixelSize*0.25, cellPixelSize, cellPixelSize/5)
        }
        if(this.material === 5){ //explosive 
            rotate(-off)
            translate(-off, -off)
            rect(0, 0, cellPixelSize/2, cellPixelSize/2)
        }
        pop();
    }

    //not currently used
    showMaterial1(tam, col, off) {
        ellipse(0, 0, tam, tam);
        rotate(-off)
        let modTam = tam * 0.6
        fill(modifyColor(col, this.rnd * 40));
        let movement = frameCount * .025
        let coord = this.rnd * TWO_PI + this.rnd * movement
        let x = modTam * Math.cos(coord);
        let y = modTam * Math.sin(coord);
        ellipse(x, y, modTam, modTam);
    }

    showMaterial2(tam, col, off) {
        square(0, 0, tam);
        rotate(-off)
        let modTam = tam * 0.6
        fill(modifyColor(col, this.rnd * 40));
        let movement = frameCount * .025
        let coord = this.rnd * TWO_PI + this.rnd * movement
        let x = modTam * Math.cos(coord);
        let y = modTam * Math.sin(coord);
        square(x, y, modTam);
    }

    showMaterial3(tam, col, off) {
        drawTriangle(tam);
        rotate(-off)
        let modTam = tam * 0.6
        fill(modifyColor(col, this.rnd * 40));
        let movement = frameCount * .025
        let coord = this.rnd * TWO_PI + this.rnd * movement
        let x = modTam * Math.cos(coord);
        let y = modTam * Math.sin(coord);
        translate(x, y)
        drawTriangle(modTam);
    }

    showBasic() {
        push();
        rectMode(CENTER);
        translate(this.x * cellPixelSize + cellPixelSize / 2, this.y * cellPixelSize + cellPixelSize / 2);
        noStroke();
        let tam = cellPixelSize;
        this.showSuelo();
        if (this.hp > 0 && !this.und) {
            //fill(this.colRoca); // set by the child class
            let col1 = color(this.colRoca)
            let col2 = color(this.colOscuridad2)
            let col = lerpColor(col1, col2, noise(this.x/10, this.y/10));
            fill(col)
            tam = map(this.hp, 0, this.maxHealthCell, minTam, maxTam, true);
            rect(0, 0, tam, tam);

            if(this.coolDownHit > 0){
                fill(255, map(this.coolDownHit, 0, this.maxCoolDownHit, 0, 255))
                rect(0, 0, tam, tam)
            }
        }
        else if(this.und){
            fill(colUnd)
            rect(0, 0, cellPixelSize, cellPixelSize)
        }
        pop();
    }


    showLight(lightGrid) {
        push();
        rectMode(CENTER);
        translate(this.x * cellPixelSize + cellPixelSize / 2, this.y * cellPixelSize + cellPixelSize / 2);
        noStroke();
        let light = lightGrid[this.x][this.y].light;
        let visible = lightGrid[this.x][this.y].visible;
        let sensor = lightGrid[this.x][this.y].sensor;
        let col = color(this.colOscuridad1);
        col.setAlpha(255 - light * 255);
        fill(col);
        if (!sensor && !visible){ 
            let colOsc1 = color(this.colOscuridad1);
            let colOsc2 = color(this.colOscuridad2);
            fill(lerpColor(colOsc1, colOsc2, noise(this.x/10, this.y/10, frameCount * 0.0025)));
        }
        rect(0, 0, cellPixelSize, cellPixelSize);
        pop();
    }

    // The show() method is common to both children.
    show(lightGrid) {
        if(this.coolDownHit > 0) this.coolDownHit--
        this.showBasic();
        this.showMat();
        //this.showLight(lightGrid);
    }



    showDebug() {
        this.showMat();
    }

      
    showSuelo() {
        let c1 = color(this.colSuelo1);
        let c2 = color(this.colSuelo2);
        let c = lerpColor(c1, c2, noise(this.x/4, this.y/4));
        fill(c);
        rect(0, 0, cellPixelSize, cellPixelSize);
        if (this.rnd > 0.85) showGrass();
        if (this.rnd < -0.85) showPebbles(this.rnd);
    }

}

// Global helper functions (common to both biomes)
function drawTriangle(tam) {
    beginShape();
    vertex(-tam / 2, -tam / 2);
    vertex(tam / 2, -tam / 2);
    vertex(0, tam / 2);
    endShape();
}

function showGrass() {
    push();
    translate(-cellPixelSize / 2, -cellPixelSize / 2);
    stroke("#365B64");
    strokeWeight(1.5);
    let p1 = createVector(0.25, 0.5);
    let p2 = createVector(0.35, 0.8);
    let p3 = createVector(0.5, 0.3);
    let p4 = createVector(0.5, 0.7);
    let p5 = createVector(0.67, 0.7);
    let p6 = createVector(0.76, 0.4);
    line(p1.x * cellPixelSize, p1.y * cellPixelSize, p2.x * cellPixelSize, p2.y * cellPixelSize);
    line(p3.x * cellPixelSize, p3.y * cellPixelSize, p4.x * cellPixelSize, p4.y * cellPixelSize);
    line(p5.x * cellPixelSize, p5.y * cellPixelSize, p6.x * cellPixelSize, p6.y * cellPixelSize);
    pop();
}

function showPebbles(rnd) {
    push();
    rotate(rnd * 10);
    translate(-cellPixelSize / 2, -cellPixelSize / 2);
    fill("#2C2D47");
    noStroke();
    let p1 = createVector(0.3, 0.5);
    let p2 = createVector(0.5, 0.75);
    let p3 = createVector(0.75, 0.4);
    ellipse(p1.x * cellPixelSize, p1.y * cellPixelSize, cellPixelSize * 0.16);
    ellipse(p2.x * cellPixelSize, p2.y * cellPixelSize, cellPixelSize * 0.18);
    ellipse(p3.x * cellPixelSize, p3.y * cellPixelSize, cellPixelSize * 0.2);
    pop();
}