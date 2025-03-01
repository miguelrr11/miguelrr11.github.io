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
    }

    show(){
        push()
        translate(this.x * cellPixelSize, this.y * cellPixelSize)
        strokeWeight(4)
        let w = cellPixelSize * 3
        let h = cellPixelSize * 2
        if(this.x == posNexo1.x && this.y == posNexo1.y){
            stroke(colMat1Medium)
            fill(colMat1Dark)
            rect(0, 0, w, h)
        }
        else if(this.x == posNexo2.x && this.y == posNexo2.y){
            stroke(colMat2Medium)
            fill(colMat2Dark)
            rect(0, 0, w, h)
        }
        else if(this.x == posNexo3.x && this.y == posNexo3.y){
            stroke(colMat3Medium)
            fill(colMat3Dark)
            rect(0, 0, w, h)
        }
        pop()
    }
    
}
  