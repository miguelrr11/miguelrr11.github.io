class Grid{
    constructor(){
        this.grid = [];         //grid of belts
        this.itemsGrid = []     //grid of item sources and furnaces
        this.init()
    }

    init(){
        for(let i = 0; i < gridSize; i++){
            this.grid[i] = [];
            for(let j = 0; j < gridSize; j++){
                this.grid[i][j] = 0;
            }
        }
        for(let i = 0; i < gridSize; i++){
            this.itemsGrid[i] = [];
            for(let j = 0; j < gridSize; j++){
                this.itemsGrid[i][j] = 0;
            }
        }
        this.itemsGrid[7][7] = new ItemSource()
    }

    createBelt(x, y, dir){
        let i = floor(x / tamCell)
        let j = floor(y / tamCell)
        if(this.itemsGrid[i][j] && this.itemsGrid[i][j].constructor.name == 'Furnace') return
        //if(this.grid[i][j] == 0){
            this.grid[i][j] = new Belt(dir)
            this.grid[i][j].pos = createVector(i, j)
            return this.grid[i][j]
        //}
    }

    deleteBelt(x, y){
        let i = floor(x / tamCell)
        let j = floor(y / tamCell)
        this.grid[i][j] = 0
    }

    getBelt(x, y){
        let i = floor(x / tamCell)
        let j = floor(y / tamCell)
        return this.grid[i][j]
    }

    createFurnace(x, y){
        if(!this.isEmptyCell(x, y)) return
        let i = floor(x / tamCell)
        let j = floor(y / tamCell)
        if(this.itemsGrid) this.itemsGrid[i][j] = new Furnace()
    }

    deleteTransformer(x, y){
        let i = floor(x / tamCell)
        let j = floor(y / tamCell)
        if(this.itemsGrid[i][j] && this.itemsGrid[i][j].constructor.name == "Furnace") this.itemsGrid[i][j] = 0
    }

    isEmptyCell(x, y){
        let i = floor(x / tamCell)
        let j = floor(y / tamCell)
        return this.grid[i][j] == 0 && this.itemsGrid[i][j] == 0
    }

    showConnecections(){
        push()
        stroke(255, 0, 0)
        strokeWeight(1)
        for(let i = 0; i < gridSize; i++){
            for(let j = 0; j < gridSize; j++){
                if(this.grid[i][j] != 0){
                    let belt = this.grid[i][j]
                    let nextBelt = belt.nextBelt
                    stroke(255, 0, 0)
                    if(nextBelt){
                        let x1 = i * tamCell + tamCell / 2
                        let y1 = j * tamCell + tamCell / 2
                        let x2 = nextBelt.pos.x * tamCell + tamCell / 2
                        let y2 = nextBelt.pos.y * tamCell + tamCell / 2
                        line(x1, y1, x2, y2)
                    }

                    push()
                    translate(5, 5)
                    stroke(0, 100, 255)
                    let prevBelt = belt.prevBelt
                    if(prevBelt){
                        let x1 = i * tamCell + tamCell / 2
                        let y1 = j * tamCell + tamCell / 2
                        let x2 = prevBelt.pos.x * tamCell + tamCell / 2
                        let y2 = prevBelt.pos.y * tamCell + tamCell / 2
                        line(x1, y1, x2, y2)
                    }
                    pop()
                }
            }
        }
        pop()
    }

    updateItemSources(){
        for(let i = 0; i < gridSize; i++){
            for(let j = 0; j < gridSize; j++){
                if(this.itemsGrid[i][j] != 0){
                    this.itemsGrid[i][j].update()
                }
            }
        }
    }

    requestItemBelts(){
        for(let i = 0; i < gridSize; i++){
            for(let j = 0; j < gridSize; j++){
                if(this.grid[i][j] != 0 &&  this.itemsGrid[i][j] != 0){
                    let belt = this.grid[i][j]
                    if(!belt.canAccpetItem()) continue
                    let item = this.itemsGrid[i][j].getItem()
                    if(item){ 
                        item.pos = .5
                        belt.addItem(item)
                    }
                }
            }
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
    
    showGrid(){
        //draws horizontal lines and vertical lines
        push()
        stroke(170)
        strokeWeight(1)
        for(let i = 0; i < width; i += tamCell){
            line(i, 0, i, height)
            line(0, i, width, i)
        }
        pop()
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
        
        for(let i = 0; i < gridSize; i++){
            for(let j = 0; j < gridSize; j++){
                push()
                if(this.grid[i][j] == 0){
                    stroke(170)
                    strokeWeight(1)
                }
                else noStroke()
                fill(230)
                rect(i * tamCell, j * tamCell, tamCell, tamCell)
                
                if(this.grid[i][j] != 0){
                    translate(i * tamCell, j * tamCell)
                    this.grid[i][j].showBelt()
                    this.grid[i][j].showItems()
                }
                pop()
            }
        }
    }

    showBeltItems(){
        noStroke()
        for(let i = 0; i < gridSize; i++){
            for(let j = 0; j < gridSize; j++){
                push()
                if(this.grid[i][j] != 0){
                    translate(i * tamCell, j * tamCell)
                    this.grid[i][j].showItems()
                }
                pop()
            }
        }
    }

    showItemSources(){
        noStroke()
        for(let i = 0; i < gridSize; i++){
            for(let j = 0; j < gridSize; j++){
                push()
                if(this.itemsGrid[i][j] != 0){
                    translate(i * tamCell, j * tamCell)
                    this.itemsGrid[i][j].show()
                }
                pop()
            }
        }
    }

}