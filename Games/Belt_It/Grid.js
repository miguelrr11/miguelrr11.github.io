class Grid{
    constructor(){
        this.grid = [];
        this.init()
    }

    init(){
        for(let i = 0; i < gridSize; i++){
            this.grid[i] = [];
            for(let j = 0; j < gridSize; j++){
                this.grid[i][j] = 0;
            }
        }
    }

    createBelt(x, y, dir){
        let i = floor(x / tamCell)
        let j = floor(y / tamCell)
        if(this.grid[i][j] == 0){
            this.grid[i][j] = new Belt(dir)
            return this.grid[i][j]
        }
    }

    updateItems(){
        for(let i = 0; i < gridSize; i++){
            for(let j = 0; j < gridSize; j++){
                if(this.grid[i][j] != 0){
                    this.grid[i][j].updateItems()
                }
            }
        }
    }

    showHoveredCell(){
        let i = floor(mouseX / tamCell)
        let j = floor(mouseY / tamCell)
        fill(0, 100)
        rect(i * tamCell, j * tamCell, tamCell)
    }

    showBuildingFrom(){
        push()
        if(buildingFrom){
            stroke(255, 0, 0)
            strokeWeight(3)
            line(buildingFrom.x, buildingFrom.y, mouseX, mouseY)
        }
        pop()
    }

    showBelts(){
        noStroke()
        for(let i = 0; i < gridSize; i++){
            for(let j = 0; j < gridSize; j++){
                push()
                //if(this.grid[i][j] == 0){ 
                    fill(230)
                    rect(i * tamCell, j * tamCell, tamCell, tamCell)
                //}
                if(this.grid[i][j] != 0){
                    translate(i * tamCell, j * tamCell)
                    this.grid[i][j].showBelt()
                }
                pop()
            }
        }
    }

    showItems(){
        noStroke()
        for(let i = 0; i < gridSize; i++){
            for(let j = 0; j < gridSize; j++){
                push()
                //if(this.grid[i][j] == 0){ 
                    //fill(230)
                    //rect(i * tamCell, j * tamCell, tamCell, tamCell)
                //}
                if(this.grid[i][j] != 0){
                    translate(i * tamCell, j * tamCell)
                    this.grid[i][j].showItems()
                }
                pop()
            }
        }
    }

}