let maxTam = cellPixelSize;
let minTam = cellPixelSize * 0.3;
let materialNames = ['mining', 'miningMat1', 'miningMat2', 'miningMat3'];

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
        this.noise4 = noise(this.x/4, this.y/4);
    }

    //what happens when the player is standing on this cell
    onPlayerStanding(){
        return
    }

    //can the player move to this cell?
    transparent(){
        return this.hp == 0
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
        //if(this.hp == 0 && this.material != 0) this.hp = 1
        if (this.hp === 0){
            this.createAnimation(this.x, this.y)
            player.receive(this.material)
            this.material = 0;
            computeLightingGrid(curLightMap)
        }
    }

    createAnimation(animX, animY){
        let type = materialNames[this.material];
        let anim = { type: type, explosion: this.hp === 0, followPlayer: this.hp === 0};
        anims.addAnimation(
            animX * cellPixelSize + cellPixelSize / 2,
            animY * cellPixelSize + cellPixelSize / 2,
            anim, this.x, this.y
        );

    }

    hit(animX, animY) {
        if (this.hp > 0){
            this.hp--;
            if(this.hp == 0){ 
                computeLightingGrid(curLightMap)
                playDiggingSound()
                player.receive(this.material)
            }
            else playHittingSound()
            this.coolDownHit = this.maxCoolDownHit
        }
        this.createAnimation(animX, animY)
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
        if(this.material == 6 || this.material == 7 || this.material == 8) return
        if (this.material === 0 || this.hp === 0) return;
        let off = this.rnd * 2;
        let col = colors[this.material - 1];
        let tam = mapp(this.hp, 0, this.maxHealthCell, minTam, cellPixelSize * 0.4, true);
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

    show() {
        if(this.coolDownHit > 0) this.coolDownHit--
        this.showBasic();
        this.showMat();
    }

    showBasic() {
        let x = this.x * cellPixelSize + cellPixelSize / 2
        let y = this.y * cellPixelSize + cellPixelSize / 2
        let tam = cellPixelSize;
        if(this.hp < this.maxHealthCell) this.showSuelo(x, y)
        if (this.hp > 0 && !this.und) {
            //fill(this.colRoca); // set by the child class
            let col = lerppColor(this.colRoca, this.colOscuridad2, this.noise);
            fill(col)
            tam = mapp(this.hp, 0, this.maxHealthCell, minTam, maxTam, true);
            rect(x, y, tam, tam);

            if(this.coolDownHit > 0){
                fill(255, mapp(this.coolDownHit, 0, this.maxCoolDownHit, 0, 255))
                rect(x, y, tam, tam)
            }

        }
        else if(this.und){
            fill(colUnd)
            rect(x, y, cellPixelSize, cellPixelSize)
        }
    }


    showLight(lightGrid) {
        
        let light = lightGrid[this.x][this.y].light;
        let visible = lightGrid[this.x][this.y].visible;
        let sensor = lightGrid[this.x][this.y].sensor;
        fill([...this.colOscuridad1, 255 - light * 255]);
        if (!sensor && !visible){
            fill(lerppColor(this.colOscuridad1, this.colOscuridad2, noise(this.x/10, this.y/10, frameCount * sclNoiseMovement)));
        }
        // if(!visible){
        //     stroke(255, 50)
        //     strokeWeight(mapp(this.rnd, -1, 1, .1, 3.5))
        // }
        // else noStroke()
        
        rect(this.x * cellPixelSize + cellPixelSize / 2, 
            this.y * cellPixelSize + cellPixelSize / 2, 
            cellPixelSize, cellPixelSize);
        
    }

    

    showDebug() {
        this.showMat();
    }

      
    showSuelo(x, y) {
        let c = lerppColor(this.colSuelo1, this.colSuelo2, this.noise4);
        fill(c);
        rect(x, y, cellPixelSize, cellPixelSize);
        if (this.rnd > 0.85) showGrass(x, y);
        if (this.rnd < -.85) showPebbles(x, y, this.rnd);
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

const p1G = {x:0.25, y:0.5}
const p2G = {x:0.35, y:0.8}
const p3G = {x:0.5, y:0.3}
const p4G = {x:0.5, y:0.7}
const p5G = {x:0.67, y:0.7}
const p6G = {x:0.75, y:0.5}

function showGrass(x, y) {
    push();
    let xG = x - cellPixelSize / 2;
    let yG = y - cellPixelSize / 2;
    stroke("#365B64");
    strokeWeight(2);
    
    line(p1G.x * cellPixelSize + xG, p1G.y * cellPixelSize + yG, p2G.x * cellPixelSize + xG, p2G.y * cellPixelSize + yG);
    line(p3G.x * cellPixelSize + xG, p3G.y * cellPixelSize + yG, p4G.x * cellPixelSize + xG, p4G.y * cellPixelSize + yG);
    line(p5G.x * cellPixelSize + xG, p5G.y * cellPixelSize + yG, p6G.x * cellPixelSize + xG, p6G.y * cellPixelSize + yG);
    pop();
}

const p1P = {x:0.3, y:0.5}
const p2P = {x:0.5, y:0.75}
const p3P = {x:0.75, y:0.4}


function showPebbles(x, y, rnd) {
    push();
    translate(x, y);
    rotate(rnd * 10);
    translate(-cellPixelSize/2, -cellPixelSize/2);
    
    fill("#2C2D47");
    noStroke();
    ellipse(p1P.x * cellPixelSize, p1P.y * cellPixelSize, cellPixelSize * 0.16);
    ellipse(p2P.x * cellPixelSize, p2P.y * cellPixelSize, cellPixelSize * 0.18);
    ellipse(p3P.x * cellPixelSize, p3P.y * cellPixelSize, cellPixelSize * 0.2);
    pop();
}