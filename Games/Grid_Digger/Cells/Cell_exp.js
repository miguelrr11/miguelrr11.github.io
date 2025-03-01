// explosive cell

class Cell_exp extends Cell {
    constructor(x, y, material, hp, illuminated, rnd, biome) {
        super(x, y, material, hp, illuminated, rnd);
        this.setBiomeColors(biome);
        this.colRoca = colCellExp
        this.hp = baseHpCellExp;
        this.material = 5
        this.maxHealthCell = baseHpCellExp
    }

    damage(dmg){
        if(this.hp == 0) return
        if(this.hp == baseHpCellExp) playFuseSound()
        if (this.hp > 0) this.hp--;
        this.addAnimationFuse(this.x + cellPixelSize/2, this.y + cellPixelSize/2);
        // if (this.hp === 0){ 
        //     this.material = 0;
        //     this.addAnimationFuse(this.x + cellPixelSize/2, this.y + cellPixelSize/2);
        //     bomb(this.x, this.y, 8);
        // }
    }

    hit(animX, animY) {
        if(this.hp < baseHpCellExp) return
        if(this.hp == baseHpCellExp) playFuseSound()
        if (this.hp > 0) this.hp--;
        this.addAnimationFuse(animX, animY);
        if(this.hp != 0) this.illuminated = true;
        computeLightingGrid(curLightMap)
    }

    addAnimationFuse(animX, animY){
        let anim = { type: 'fuse', explosion: this.hp === 0 };
        anims.addAnimation(
            animX * cellPixelSize + cellPixelSize / 2,
            animY * cellPixelSize + cellPixelSize / 2,
            anim, this.x, this.y
        );
        if(this.hp != 0) this.illuminated = true;
        computeLightingGrid(curLightMap)
    }

    // The show() method is common to both children.
    show() {
        this.showBasic();
        this.showMat();
        if(this.hp == 0){ 
            this.material = 0
            this.illuminated = false
        }
        if(this.hp < baseHpCellExp && this.hp > 0){
            if(frameCount % 13 == 0) this.hp--
            //just died
            if (this.hp === 0){ 
                this.material = 0;
                console.log("explosion")
                this.illuminated = false
                this.addAnimationFuse(this.x, this.y);
                computeLightingGrid(curLightMap)
                bomb(this.x, this.y, 8);
            }
            this.addAnimationFuse(this.x, this.y);
        }
    }

    //en un futuro poner aqui funciones de show() y mas cosas para diferenciar a los biomas mas que simplemente por los colores
}
  