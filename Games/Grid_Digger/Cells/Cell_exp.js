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

    hit(animX, animY) {
        if (this.hp > 0) this.hp--;
        this.addAnimationFuse(animX, animY);
        if (this.hp === 0){ 
            this.material = 0;
            this.addAnimationFuse(animX, animY);
            bomb(this.x, this.y, 8);
        }
    }

    addAnimationFuse(animX, animY){
        let anim = { type: 'fuse', explosion: this.hp === 0 };
        anims.addAnimation(
            animX * cellPixelSize + cellPixelSize / 2,
            animY * cellPixelSize + cellPixelSize / 2,
            anim, this.x, this.y
        );
    }

    // The show() method is common to both children.
    show(lightGrid) {
        this.showBasic();
        this.showMat();
        this.showLight(lightGrid);
        if(this.hp < baseHpCellExp && this.hp > 0){
            if(frameCount % 10 == 0) this.hp--
            if (this.hp === 0){ 
                this.material = 0;
                this.addAnimationFuse(this.x, this.y);
                bomb(this.x, this.y, 8);
            }
            this.addAnimationFuse(this.x, this.y);
        }
    }

    //en un futuro poner aqui funciones de show() y mas cosas para diferenciar a los biomas mas que simplemente por los colores
}
  